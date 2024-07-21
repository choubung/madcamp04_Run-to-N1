import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Game from './Game';
import Tutorial from './Tutorial';
import Mypage from './Mypage';
import MainHome from './MainHome';
import { AuthProvider } from './AuthContext';
import './App.css';

const App = () => {
  const gameDimensions = {
    width: 1014,
    height: 596,
  };

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (
        windowWidth < gameDimensions.width ||
        windowHeight < gameDimensions.height
      ) {
        //  alert('The browser window is too small for this game.');
        window.resizeTo(gameDimensions.width, gameDimensions.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // <AuthProvider>
    //   <Router>
    //     <div className="App">
    //       <Routes>
    //         <Route path="/" element={<Home />} />
    //         <Route path="/login" element={<Login />} />
    //         <Route path="/signup" element={<Signup />} />
    //         <Route path="/game" element={<Game />} />
    //         <Route path="/tutorial" element={<Tutorial />} />
    //         <Route path="/mainhome" element={<MainHome />} />
    //         <Route path="/mypage" element={<Mypage />} />
    //       </Routes>
    //       <div
    //         className="game-area"
    //         style={{
    //           width: `${gameDimensions.width}px`,
    //           height: `${gameDimensions.height}px`,
    //         }}
    //       >
    //         <Game width={gameDimensions.width} height={gameDimensions.height} />
    //       </div>
    //     </div>
    //   </Router>
    // </AuthProvider>

    <AuthProvider>
      <Router>
        <div className="App">
          <div className="game-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/game"
                element={
                  <Game
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route path="/tutorial" element={<Tutorial />} />
              <Route path="/mainhome" element={<MainHome />} />
              <Route path="/mypage" element={<Mypage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
