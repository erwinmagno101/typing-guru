import { ReactComponent as ProfileIcon } from './icons/profile_logo.svg';
import './App.css';


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

export default Nav;