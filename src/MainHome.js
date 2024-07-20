import React from 'react';
import { Link } from 'react-router-dom';

const MainHome = () => {
  return (
    <div className="mainhome">
      <h1>Welcome to Pixel Runner</h1>
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
      </div>
    </div>
  );
};

export default MainHome;
