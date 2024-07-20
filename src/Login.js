import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Login = () => {
  const [userid, setUserid] = useState('');
  const [userpassword, setUserpassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://ec2-3-34-49-232.ap-northeast-2.compute.amazonaws.com:2000/login',
        {
          userid,
          userpassword,
        }
      );
      if (response.data.message === 'Login successful') {
        alert('Login successful!');
        login(response.data.user); // Assuming the server responds with user details
        navigate('/mainhome');
      } else {
        alert('Login failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('There was an error logging in!', error);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
