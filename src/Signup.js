import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Signup.css';
const Signup = () => {
  const [userid, setUserid] = useState('');
  const [userpassword, setUserpassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://ec2-3-34-49-232.ap-northeast-2.compute.amazonaws.com:2000/signup',
        {
          userid,
          userpassword,
          name,
        }
      );
      if (response.data.message === 'User registered successfully') {
        alert('Signup successful!');
        login(response.data.user); // Assuming the server responds with user details
        navigate('/mainhome');
      } else {
        // alert('Signup failed: ' + response.data.message);
        alert('중복아이디입니다');
      }
    } catch (error) {
      alert('중복아이디입니다');
      console.error('There was an error signing up!', error);
    }
  };

  return (
    <div className="signup">
      <h2>Sign Up</h2>
      <div className="character"></div> {/* 캐릭터 애니메이션 추가 */}
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="User ID"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={userpassword}
            onChange={(e) => setUserpassword(e.target.value)}
          />
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
