import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import Signup from './Signup';
import Game from './Game';
import Tutorial from './Tutorial';
import Mypage from './Mypage';
import MainHome from './MainHome';
import Info from './Info';
import { AuthProvider } from './AuthContext';
import Score from './Score'; // 추가
import './App.css';
import BackgroundMusic from './BackgroundMusic'; // 배경 음악 컴포넌트 임포트

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
    //           width: ${gameDimensions.width}px,
    //           height: ${gameDimensions.height}px,
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
          <BackgroundMusic /> {/* 배경 음악 컴포넌트 추가 */}
          <div className="game-container">
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route
                path="/login"
                element={
                  <Login
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route
                path="/signup"
                element={
                  <Signup
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route
                path="/game"
                element={
                  <Game
                    className="game-area"
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route
                path="/tutorial"
                element={
                  <Tutorial
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route
                path="/mainhome"
                element={
                  <MainHome
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route
                path="/mypage"
                element={
                  <Mypage
                    width={gameDimensions.width}
                    height={gameDimensions.height}
                  />
                }
              />
              <Route path="/info" element={<Info />} />
              <Route path="/score" element={<Score />} /> {/* 추가 */}
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
