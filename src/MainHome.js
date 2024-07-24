import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MainHome.css';
import { useAuth } from './AuthContext';

const MainHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  return (
    <div className="mainhome">
      <h1>Welcome to Pixel Runner</h1>
      <div className="character"></div> {/* 캐릭터 애니메이션 추가 */}
      <div className="menu">
        <Link to="/tutorial">
          <button>Tutorial</button>
        </Link>
        <Link to="/game">
          <button>Game Start</button>
        </Link>
        <Link to="/mypage">
          <button>My Page</button>
        </Link>
        <Link to="/info">
          <img
            src={require('./images/question.png')}
            alt="Info"
            className="info-button"
          />
        </Link>
      </div>
      <button className="menu-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default MainHome;
