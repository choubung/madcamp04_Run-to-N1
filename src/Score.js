// Score.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Score.css';
import { useNavigate } from 'react-router-dom';
const Score = () => {
  const [users, setUsers] = useState([]);
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentScore = state?.currentScore || 0;
  const goBack = () => {
    if (user) {
      navigate('/mainhome');
    } else {
      navigate('/');
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          'http://ec2-3-34-49-232.ap-northeast-2.compute.amazonaws.com:2000/users'
        );
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const sortedUsers = users.sort((a, b) => b.score - a.score);
  const topUsers = sortedUsers.slice(0, 6);
  const isCurrentUserInTop = topUsers.some(
    (u) => u.userid === user.userid && u.score === currentScore
  );

  return (
    <div className="score">
      <h1>Score Ranking</h1>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {topUsers.map((u, index) => (
            <tr
              key={u.userid}
              className={
                u.userid === user.userid && u.score === currentScore
                  ? 'highlight'
                  : ''
              }
            >
              <td>{index + 1}</td>
              <td>{u.name}</td>
              <td>{u.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Your Current Score: {currentScore}</h2>
      <img
        onClick={goBack}
        src={require('./images/back_button.png')}
        className="back-button"
      />
    </div>
  );
};

export default Score;
