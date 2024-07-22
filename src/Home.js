import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div
      className="home"
      style={{
        position: 'relative',
        width: `1014px`,
        height: `596px`,
      }}
    >
      <h1>Welcome to Pixel Runner</h1>
      <div className="character"></div> {/* 캐릭터 애니메이션 추가 */}
      <div className="menu">
        <Link to="/login">
          <button>Login</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
        <Link to="/tutorial">
          <button>Tutorial</button>
        </Link>
        <Link to="/info">
          <img
            src={require('./images/question.png')}
            alt="Info"
            className="info-button"
          />
        </Link>
      </div>
    </div>
  );
};

export default Home;
