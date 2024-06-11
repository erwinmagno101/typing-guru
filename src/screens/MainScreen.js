import '../App.css';
import  axios  from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {wpmResult} from '../slices/typeStatsSlice'
import { changeScreen } from '../slices/screenSlice';
import { useEffect, useState, useRef, useCallback } from 'react';

const MainScreen = () => {
    const [targetIndex, setTargetIndex] = useState(0);
    const [targetRow, setTargetRow] = useState(1)
    const [targetCounter, setTargetCounter] = useState(0)
    const [inputWord, setInputWord] = useState('');
    const [correct, setCorrect] = useState([]);
    const [wrong, setWrong] = useState([]);
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
  
    const [timeIsRunning, setTimeIsRunning] = useState(false)
    const [timer, setTimer] = useState();
    const [remainingTime, setRemainingTime] = useState();
    const [timeLapsed, setTimeLapsed] = useState(0);
    const [wpmCounter, setWpmCounter] = useState(0)
    const intervalRef = useRef(null);
    const wpmCounterRef = useRef(wpmCounter);
  
    const wpmRes= useSelector((state) => state.wpm.value)
    const dispatch = useDispatch();
    
    useEffect(() => {
        document.addEventListener('keydown', handleInputLogic, true);
        return () => {
            document.removeEventListener('keydown', handleInputLogic, true);
        };

    }, [inputWord, targetIndex, fetchedWords, targetCounter]);


    useEffect(() => {
        handleWordsDisplayed()
    }, [fetchedWords, targetIndex]);


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
        fetchWordsFromApi()
        resetStates()
      },[activeMode, activeLevel])
  
    useEffect(() => {
        wpmCalculation()
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
        const targetWord = fetchedWords[targetIndex];

        if ((key === ' ' || key === 'Space') && timeIsRunning) {
        e.preventDefault();
        if (targetWord === inputWord) {
            setCorrect((correct) => [...correct, targetIndex]);
        } else {
            setWrong((wrong) => [...wrong, targetIndex]);
        }
        setInputWord('');
        setTargetIndex(targetIndex + 1);
        setTargetCounter(targetCounter + 1);
        setMoveTriggerTarget(rows[moveTriggerRow-1]);


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
        let wpmCounter = (60 * correct.length) / timeLapsed;
        if(remainingTime !== 0){
          setWpmCounter(wpmCounter);
        }
    }


    useEffect(() => {
      handleWordsModeLogic()
    }, [targetCounter])

    const handleWordsModeLogic = () => {
      if(activeMode === 'Words'&& correct.length + wrong.length === Number(activeLevel)){
        dispatch(wpmResult(wpmCounter))
        dispatch(changeScreen('ResultScreen'))
        console.log('yes')
      }

    }
  
    const handleTimedModeLogic = () => {
      if(activeMode === 'Timed'){
        let timeLimit = Number(activeLevel.replace('s',''))
        console.log('time is running')
    
          setRemainingTime(timeLimit)
          let timer =  setTimeout(() => {
              clearInterval(intervalRef.current);
              dispatch(wpmResult(wpmCounterRef.current))
              dispatch(changeScreen('ResultScreen'))
              setRemainingTime(0);
              setTimeLapsed(0)
              setTimeIsRunning(false);
              console.log('time has finished')
          }, Number(timeLimit * 1000));
          setTimer(timer)
      }

    }
  
    const resetStates = () => {
      setTargetIndex(0)
      setTargetRow(1)
      setTargetIndex(0)
      setInputWord('')
      setCorrect([])
      setWrong([])
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
        console.log('timer has stoped')
      }
    }
  
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
  
  
    const handleWordStyle = (index) => {
      if (correct.includes(index)) {
        return 'word-correct';
      }
      if (wrong.includes(index)) {
        return 'word-wrong';
      }
  
      if(fetchedWords[index] === fetchedWords[targetIndex]){
        return 'active-word';
      }
  
      return 'inactive-word';
    };
  
  
  
  
    const setDisplay = async () => {
      let wordsToDisplay = []
  
      fetchedWords.map((word, index) => {
        wordsToDisplay.push(
          <li
            ref={(el) => (itemRefs.current[index] = el)}
            key={index}
            className={`word ${handleWordStyle(index)}`}
            > 
            {word}
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
              <div className='stats-item block-style'>100</div>
              <div className='stats-item block-style'>50</div>
              <div className='stats-item block-style'>10</div>
            </div>
          }
          </div>
          <div className='second-section'>
            <div className='progress-container'>
              {
                timeIsRunning ?
                <>
                  <ProgressBar activeMode= {activeMode} activeLevel={activeLevel} wordsTyped={correct.length + wrong.length}/>
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
          <input
            type='textbox'
            className='text-input'
            value={inputWord}
            autoFocus={true}
            onChange={(e) => {
              setInputWord(e.target.value)
              setTimeIsRunning(true)
            }}
          />
  
            <p>{wpmRes}</p>
            <button onClick = {() => {resetStates()}}>res</button>
            {/* <p>{console.log(wpmCounter)}</p> */}
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