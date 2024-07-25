import React from 'react';
import { useAuth } from './AuthContext';
import './Mypage.css';
import { useNavigate } from 'react-router-dom';
const Mypage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div>Loading...</div>;
  }
  const goBack = () => {
    if (user) {
      navigate('/mainhome');
    } else {
      navigate('/');
    }
  };
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
        {/* <p>돈: {user.money}</p> */}
      </div>
      <img
        onClick={goBack}
        src={require('./images/back_button.png')}
        className="back-button"
      />
    </div>
  );
};

export default Mypage;
