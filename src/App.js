
import './App.css';
import Nav from './Nav'
import MainScreen from './screens/MainScreen'
import { useSelector } from 'react-redux';
import ResultScreen from './screens/ResultScreen';
import { useEffect, useState} from 'react';
//test push

function App() {

  const [displayScreen, setDisplayScreen] = useState();

  const activeScreen = useSelector((state) => state.screen.value)

  useEffect(() => {
    hadnleScreens();
  },[activeScreen])


  const hadnleScreens = () => {
    if(activeScreen === 'MainScreen'){
      setDisplayScreen(<MainScreen />)
    }

    if(activeScreen === 'ResultScreen'){
      setDisplayScreen(<ResultScreen/>)
    } 
  }


  return (
    <div className='main-container'>
      <Nav />
      {displayScreen}
    </div>
  );
}



export default App;




