import React from 'react';
import { useAuth } from './AuthContext';
import './Mypage.css';

const Mypage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mypage">
      <h1>Mypage</h1>
      <div className="user-info">
        <img
          src={require('./images/runner_0.png')}
          alt="Character"
          className="character-image"
        />
        <p>닉네임: {user.name}</p>
        <p>최고 점수: {user.score}</p>
        <p>돈: {user.money}</p>
      </div>
    </div>
  );
};

export default Mypage;
