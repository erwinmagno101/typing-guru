import '../App.css';
import  axios  from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {wpmResult} from '../slices/typeStatsSlice'
import { changeScreen } from '../slices/screenSlice';
import { useEffect, useState, useRef, useCallback } from 'react';
import { upperCase } from 'lodash';

const MainScreen = () => {
    const [targetIndex, setTargetIndex] = useState(0);
    const [targetRow, setTargetRow] = useState(1)
    const [targetCounter, setTargetCounter] = useState(0)
    const [inputWord, setInputWord] = useState('');
    const [wordCorrect, setWordCorrect] = useState([]);
    const [wordWrong, setWordWrong] = useState([]);
    const [containerMaxWidth, setContainerMaxWidth] = useState('1500px');
    const itemRefs = useRef([]);
    const [rows, setRows] = useState([]);
    const [displayWords, setDisplayWords] = useState([])
    const [moveTriggerTarget, setMoveTriggerTarget] = useState(0);
    const [moveTriggerRow, setMoveTriggerRow] = useState(2);
    const [distanceToMove, setDistanceToMove] = useState(0);
    const [activeMode, setActiveMode] = useState('Timed')
    const [activeLevel, setActiveLevel] = useState('15s')
    const [fetchedWords, setFetchedWords] = useState([]);
    const [loadingWords, setLoadingWords] = useState(false);
    const [errorFetchingWords, setErrorFetchingWords] = useState(null);
    const [wordsToUse, setWordsToUse] = useState([]);

    const [targetLetterIndex, setTargetLetterIndex] = useState(0)
    const [letterCorrect, setLetterCorrect] = useState([])
    const [letterWrong, setLetterWrong] = useState([])
    const [correctLetterContainer, setCorrectLetterContainer] = useState([])
    const [wrongLetterContainer, setWrongLetterContainer] = useState([])

    const [timeIsRunning, setTimeIsRunning] = useState(false)
    const [timer, setTimer] = useState();
    const [remainingTime, setRemainingTime] = useState();
    const [timeLapsed, setTimeLapsed] = useState(0);
    const [wpmCounter, setWpmCounter] = useState(0)
    const [accuracyCounter, setAccuracyCounter] = useState(0)
    const intervalRef = useRef(null);
    const wpmCounterRef = useRef(wpmCounter);
  
    const wpmRes= useSelector((state) => state.wpm.value)
    const dispatch = useDispatch();

    
    useEffect(() => {
        document.addEventListener('keydown', handleInputLogic, true);
        return () => {
            document.removeEventListener('keydown', handleInputLogic, true);
        };
    }, [inputWord, targetIndex, wordsToUse, targetCounter]);

    useEffect(() => {
        handleWordsDisplayed()
    }, [wordsToUse, targetIndex, targetLetterIndex]);

    useEffect(() => {
      setWordsToUse(fetchedWords.sort(() => Math.random() - 0.5))
    }, [fetchedWords, activeMode, activeLevel])


    useEffect(() => {
        let allLevel = document.querySelectorAll('.level-select');
        allLevel.forEach((li, index)=> {
        if(index !== 0){
        }else{
            li.classList.add('mode-active')
            setActiveLevel(li.innerHTML)
        }
        })

    },[activeMode])

    useEffect(() => {
        setDisplayWords([])
        resetStates()
        setDisplay()
      },[activeMode, activeLevel])
  
    useEffect(() => {
        wpmCalculation()
        setDisplay()
    }, [remainingTime, timeLapsed])

    useEffect(() => {
      wpmCounterRef.current = wpmCounter;
    }, [wpmCounter]);
  
    useEffect(() => {
        timerStart()
    },[timeIsRunning])

    const handleWordsDisplayed = () => {
        setDisplay().then((result) => {
            if(result){
            const validRefs = itemRefs.current.filter((ref) => ref !== null);
            if (validRefs.length > 0) {
                const positions = validRefs.map((ref) => ref.offsetTop);
                const rowCounts = [];
                let currentRowCount = 0;

                positions.forEach((position, index) => {
                if (index === 0 || position === positions[index - 1]) {
                    currentRowCount++;
                } else {
                    rowCounts.push(currentRowCount);
                    currentRowCount = 1;
                }
                });

                if (currentRowCount > 0) {
                rowCounts.push(currentRowCount);
                }

                setRows(rowCounts)
            }
            }
    }).catch((err) => {
        console.log(err)
    });
    }

    const handleInputLogic = (e) => {
        const key = e.key;
        const targetWord = wordsToUse[targetIndex];
        if(key.length === 1){
          setInputWord((inputWord + key))
          setTimeIsRunning(true)
        }

        if(targetWord){
          if(key === targetWord[targetLetterIndex]){
            setCorrectLetterContainer((correctLetterContainer) => [...correctLetterContainer, targetLetterIndex])
            setTargetLetterIndex(targetLetterIndex+1)
          }else if(key !== 'Backspace'){
            setWrongLetterContainer((wrongLetterContainer) => [...wrongLetterContainer, targetLetterIndex])
            setTargetLetterIndex(targetLetterIndex+1)
          }
        }

        if(key === 'Backspace'){
          setInputWord(inputWord.slice(0, -1))
          if(correctLetterContainer.includes(targetLetterIndex-1)){
            setCorrectLetterContainer((correctLetterContainer) => {
              const newArray = correctLetterContainer.slice();
              newArray.splice(newArray.indexOf(targetLetterIndex-1), 1);
              return newArray;
            });
          }
          if(wrongLetterContainer.includes(targetLetterIndex-1)){
            setWrongLetterContainer((wrongLetterContainer) => {
              const newArray = wrongLetterContainer.slice();
              newArray.splice(newArray.indexOf(targetLetterIndex-1), 1);
              return newArray;
            });
            console.log('wrong contains')
          }
          setTargetLetterIndex(targetLetterIndex-1)
        }
        if(e.altKey === true && e.key === 'Enter'){
          restart();
        }

        if ((key === ' ' || key === 'Space') && timeIsRunning) {
          if (targetWord === inputWord) {
              setWordCorrect((correct) => [...correct, targetIndex]);
          } else {
              setWordWrong((wrong) => [...wrong, targetIndex]);
          }
          setInputWord('');
          setTargetIndex(targetIndex + 1);
          setTargetCounter(targetCounter + 1);
          setMoveTriggerTarget(rows[moveTriggerRow-1]);
          setTargetLetterIndex(0)
          setLetterCorrect((letterCorrect) => [...letterCorrect, correctLetterContainer])
          setLetterWrong((letterWrong) => [...letterWrong, wrongLetterContainer])
          setCorrectLetterContainer([]);
          setWrongLetterContainer([]);


          if(targetCounter === rows[targetRow-1]){
              setTargetRow(targetRow+1);
              setTargetCounter(1);
      
          }
          if(targetCounter === moveTriggerTarget-1 && targetRow === moveTriggerRow && rows.length - targetRow !== 1){
              setMoveTriggerRow(moveTriggerRow+1) 
              setDistanceToMove(distanceToMove+33.5);
          }

        }
        

    };
    const timerStart = () => {
        if(timeIsRunning){
  
            const updateRemainingTime = () => {
              if(activeMode === 'Timed'){
                setRemainingTime(prev => prev - 1);
              }
              setTimeLapsed(prev => prev + 1);
      
            };
            intervalRef.current = setInterval(updateRemainingTime, 1000);
            handleTimedModeLogic()
            return () => {
              clearInterval(intervalRef.current);
            };
          }
    }
    const wpmCalculation = () => {


        let totalCorrectLetters = 0;

        for(let row = 0 ; row < letterCorrect.length; row++){
          totalCorrectLetters += letterCorrect[row].length
        }

        let totalWrongLetters = 0;

        for(let row = 0 ; row < letterWrong.length; row++){
          totalWrongLetters += letterWrong[row].length
        }

        
        let totalCharactersType = totalCorrectLetters + totalWrongLetters;
        let grossCPM = (totalCharactersType * 60) / timeLapsed;


        let accuracy = totalCorrectLetters / totalCharactersType

        let adjustedCPM = grossCPM * accuracy;
        let averageWPM = adjustedCPM / 5

        if(remainingTime !== 0){
          setAccuracyCounter(Math.round(accuracy * 100))
          setWpmCounter(Math.round(averageWPM));
        }
    }


    useEffect(() => {
      handleWordsModeLogic()
    }, [targetCounter])

    const handleWordsModeLogic = () => {
      if(activeMode === 'Words'&& wordCorrect.length + wordWrong.length === Number(activeLevel)){
        dispatch(wpmResult(wpmCounter))
        dispatch(changeScreen('ResultScreen'))
      }

    }
  
    const handleTimedModeLogic = () => {
      if(activeMode === 'Timed'){
        let timeLimit = Number(activeLevel.replace('s',''))
    
          setRemainingTime(timeLimit)
          let timer =  setTimeout(() => {
              clearInterval(intervalRef.current);
              dispatch(wpmResult(wpmCounterRef.current))
              dispatch(changeScreen('ResultScreen'))
              setRemainingTime(0);
              setTimeLapsed(0)
              setTimeIsRunning(false);
          }, Number(timeLimit * 1000));
          setTimer(timer)
      }

    }
  
    const resetStates = () => {
      setTargetLetterIndex(0)
      setLetterCorrect([])
      setLetterWrong([])
      setCorrectLetterContainer([])
      setWrongLetterContainer([])
      setTargetIndex(0)
      setTargetRow(1)
      setTargetIndex(0)
      setInputWord('')
      setWordCorrect([])
      setWordWrong([])
      setTargetCounter(0)
      setRows([])
      setMoveTriggerTarget(0)
      setMoveTriggerRow(2)
      setDistanceToMove(0)
      setDisplayWords([])
      if(timeIsRunning){
        clearInterval(intervalRef.current);
        clearTimeout(timer)
        setTimeIsRunning(false)
        setRemainingTime(0)
        setTimeLapsed(0);
        setWpmCounter(0)
        setAccuracyCounter(0)
      }
    }

    useEffect(() => {
      fetchWordsFromApi()
    }, [])
  
    const fetchWordsFromApi = async () => {
      setLoadingWords(true);
      setErrorFetchingWords(null);
      if(!loadingWords){
        try{
          const response = await axios.get('https://random-word-api.herokuapp.com/word?number=100')
          setFetchedWords(response.data)
        }catch(err){
          setErrorFetchingWords('Failed to fetch word');
        }finally {
          setLoadingWords(false);
        }     
      }else{
        console.log('Fetching words')
      }
    } 
  
  

    const handleLetterStyle = (targetWordIndex, letterIndex) => {
      if(correctLetterContainer.includes(letterIndex) && targetWordIndex === targetIndex){
        return 'letter-correct'
      }

      if(wrongLetterContainer.includes(letterIndex) && targetWordIndex === targetIndex){
        return 'letter-wrong'
      }

      if(targetWordIndex === targetIndex){
        return 'active-word'
      }

      try{
        if(letterCorrect[targetWordIndex].includes(letterIndex)){
          return 'letter-correct'
        }
        if(letterWrong[targetWordIndex].includes(letterIndex)){
          return 'letter-wrong'
        }


      }catch(err){

      }

      return 'inactive-word'
    }
  
    const setDisplay = async () => {
      let wordsToDisplay = []      
      wordsToUse.map((word, index) => {
        wordsToDisplay.push(
          <li
            ref={(el) => (itemRefs.current[index] = el)}
            key={index}
            className={`word`}
            > 
            {
              word.split('').map((char, letterIndex) => {
                return (
                  <span className={`letter ${handleLetterStyle(index, letterIndex)}`} key={letterIndex}>{char}</span>
                )
              }
              )
            }
          </li>
        )
      })
  
      setDisplayWords(wordsToDisplay);
      return true;
    }
  
  
  
    const handleModeSelectType = (e, mode) => {
  
      if(!e.classList.contains('mode-active')){
        let modes = document.querySelectorAll('.mode-select')
        modes.forEach(li => {
            li.classList.remove('mode-active');
        });
        setActiveMode(mode)
        e.classList.add('mode-active')
  
      }
    }
  
  
    const handleLevelSelect = (e, level) => {
      if(!e.classList.contains('mode-active')){
        let levels = document.querySelectorAll('.level-select')
        levels.forEach(li => {
          li.classList.remove('mode-active')
        });
        setActiveLevel(level);
        e.classList.add('mode-active');
      }
    }
  
    const levelsTimed = [
      '15s',
      '30s',
      '60s',
      '120s',
    ]
  
    const levelsWords = [
      '10',
      '25',
      '50',
      '100',
    ]


    const restart = () => {
      resetStates()
      setWordsToUse(fetchedWords.sort(() => Math.random() - 0.5))
      handleWordsDisplayed()
    }
  
    return (
      <div className='home-body screen-height'>
          <div className='first-section'>
          {
            !timeIsRunning ? 
            <div className='panel-container'>
              <ul className='mode-panel block-style'>
                <li className='mode-select mode-li mode-active' onClick={(e) => handleModeSelectType(e.target, 'Timed')}>Timed</li>
                <li className='mode-select mode-li' onClick={(e) => handleModeSelectType(e.target, 'Words')}>Words</li>
              </ul>
              <ul className='mode-panel'>
                {
                  activeMode === 'Timed' ? 
                      levelsTimed.map((level, index) => {
                        return(
                          <li className='level-select mode-li' key={index} onClick={(e) => handleLevelSelect(e.target, level)}>{level}</li>
                        )
                      })
                  : ''
                }
                {
                  activeMode === 'Words' ? 
                    levelsWords.map((level, index) => {
                      return(
                        <li className='level-select mode-li' key={index} onClick={(e) => handleLevelSelect(e.target, level)}>{level}</li>
                      )
                    })
                  : ''
                }
              </ul>
            </div>
            : 
            <div className='stats-container'>
              <div className='stats-item block-style'>
                <div>{wpmCounter? wpmCounter : 0}</div>
                <div>WPM</div>
              </div>
              <div className='stats-item block-style'>
                {wordWrong.length !== 0 || wordCorrect.length !== 0 ? 
                <div>{accuracyCounter}%</div>
                :
                <div>0%</div>
                }
                <div>ACCURACY</div>
              </div>
              <div className='stats-item block-style'>
                {
                activeMode === 'Timed' ?
                <div>{remainingTime}s</div>
                :''  
                }
                {
                activeMode === 'Words' ?
                <div>{Number(activeLevel) - (wordCorrect.length + wordWrong.length)}</div>
                :''  
                }
                <div>{upperCase(activeMode)}</div>
              </div>
            </div>
          }
          </div>
          <div className='second-section'>
            <div className='progress-container'>
              {
                timeIsRunning ?
                <>
                  <ProgressBar activeMode= {activeMode} activeLevel={activeLevel} wordsTyped={wordCorrect.length + wordWrong.length}/>
                </>
                : ''
              }
            </div>
              <div className='parent-container'>
              {
                displayWords.length !== 0 ? 
                <>
                              <div 
                                className='words-container' 
                                style={{ maxWidth: containerMaxWidth, transform: `translateY(-${distanceToMove}%)`}
                              }>
                {
                  displayWords.map((item, index) => {
                    if(activeMode === 'Words' && index <= Number(activeLevel)-1){
                      return item
                    }
  
                    if(activeMode === 'Timed'){
                      return item
                    }
                  })
                }
              </div>
                </> : ''
              }
            </div>
          </div>
          <div className='third-section'>
            <p>{inputWord}</p>
            <button onClick = {() => {
              restart()
            }}>res</button>
          </div>
      </div>
    );
  };


  const ProgressBar = ({activeMode, activeLevel, wordsTyped}) => {
    if(activeMode === 'Timed'){
      return (
        <div className='progress-bar timed-bar' style={{animationDuration: `${activeLevel}, .5s`}}></div>
      )
    }

    if(activeMode === 'Words'){
      let width = (wordsTyped / Number(activeLevel)) * 100

      return(
        <div className='progress-bar words-bar' style={{animationDuration: '.5s', width: `${width}%`}}></div>
      )
    }
  }


  export default MainScreen;