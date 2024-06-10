import { useEffect, useState, useRef, useCallback } from 'react';
import './App.css';
import { ReactComponent as ProfileIcon } from './icons/profile_logo.svg';
import  axios  from 'axios';

//test push

function App() {
  return (
    <div className='main-container'>
      <Nav />
      <MainApp />
    </div>
  );
}

const Nav = () => {
  return (
    <div className='nav'>
      <div className='logo'>TypeG</div>
      <ul className='nav-ul'>
        <li className='nav-li'>About</li>
        <li className='nav-li'>Credits</li>
        <li className='nav-li'>Leader Board</li>
      </ul>
      <div className='icon-container'>
        <ProfileIcon className='icon' />
      </div>
    </div>
  );
};

const MainApp = () => {
  const [target, setTarget] = useState(0);
  const [targetRow, setTargetRow] = useState(1)
  const [targetCounter, setTargetCounter] = useState(0)
  const [input, setInput] = useState('');
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
  const [wpm, setWpm] = useState(0)
  const intervalRef = useRef(null);


  useEffect(() => {
    let wpmCounter = (60 * correct.length) / timeLapsed;
    if(remainingTime !== 0){
      setWpm(wpmCounter);
    }
  }, [remainingTime, timeLapsed])

  useEffect(() => {

    if(timeIsRunning){

      const updateRemainingTime = () => {
        if(activeMode === 'Timed'){
          setRemainingTime(prev => prev - 1);
        }
        setTimeLapsed(prev => prev + 1);

      };
      intervalRef.current = setInterval(updateRemainingTime, 1000);
  
      if(activeMode === 'Timed'){
        handleTimedLogic()
      }
      if(activeMode === 'Words'){
      }

      return () => {
        clearInterval(intervalRef.current);
      };
    }
  },[timeIsRunning])




  const handleTimedLogic = () => {
    let timeLimit = Number(activeLevel.replace('s',''))
    console.log('time is running')

      setRemainingTime(timeLimit)
      let timer =  setTimeout(() => {
          clearInterval(intervalRef.current);
          setRemainingTime(0);
          setTimeLapsed(0)
          setTimeIsRunning(false);
          console.log('time has finished')
      }, Number(timeLimit * 1000));
      setTimer(timer)
  }

  useEffect(() => {
    setDisplayWords([])
    fetchWordsFromApi()
    resetStates()
  },[activeMode, activeLevel])

  const resetStates = () => {
    setTarget(0)
    setTargetRow(1)
    setTarget(0)
    setInput('')
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
      setWpm(0)
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
    }
  } 


  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      const targetWord = fetchedWords[target];

      if ((key === ' ' || key === 'Space') && timeIsRunning) {
        e.preventDefault();
        if (targetWord === input) {
          setCorrect((correct) => [...correct, target]);
        } else {
          setWrong((wrong) => [...wrong, target]);
        }
        setInput('');
        setTarget(target + 1);
        setTargetCounter(targetCounter + 1);
        setMoveTriggerTarget(rows[moveTriggerRow-1]);


        if(targetCounter === rows[targetRow-1]){
          setTargetRow(targetRow+1);
          setTargetCounter(1);
  
        }
        if(targetCounter === moveTriggerTarget-1 && targetRow === moveTriggerRow && rows.length - targetRow !== 1){
          setMoveTriggerRow(moveTriggerRow+1) 
          handleMoveUp()
        }

      }
      

    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [input, target, fetchedWords, targetCounter]);





  useEffect(() => {
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

  }, [fetchedWords, target]);

  const handleWordStyle = (index) => {
    if (correct.includes(index)) {
      return 'word-correct';
    }
    if (wrong.includes(index)) {
      return 'word-wrong';
    }

    if(fetchedWords[index] === fetchedWords[target]){
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


  const handleMoveUp = () => {
    setDistanceToMove(distanceToMove+33.5);
  }



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
    <div className='home-body'>
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
        : ''
        }
        </div>
        <div className='second-section'>
          <div className='progress-container'>
            {
              timeIsRunning ?
              <>
                <div className='progress-word'>
                  <p>{remainingTime}</p>
                </div>
                <div className='progress-bar'></div>
              </>
              : ''
            }
          </div>
            <div className='parent-container'>
            {
              displayWords.length != 0 ? 
              <>
                            <div className='words-container' style={{ maxWidth: containerMaxWidth, transform: `translateY(-${distanceToMove}%)`}}>
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
          value={input}
          autoFocus={true}
          onChange={(e) => {
            setInput(e.target.value)
            setTimeIsRunning(true)
          }}
        />
        </div>
    </div>
  );
};

export default App;




