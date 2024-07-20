import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home">
      <h1>Welcome to Pixel Runner</h1>
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
      </div>
    </div>
  );
};

export default Home;
