import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Game from './Game';
import Tutorial from './Tutorial';
import Mypage from './Mypage';
import MainHome from './MainHome';
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/game" element={<Game />} />
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/mainhome" element={<MainHome />} />
            <Route path="/mypage" element={<Mypage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
