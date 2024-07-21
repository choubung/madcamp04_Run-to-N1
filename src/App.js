import React, { useEffect } from 'react';
import Game from './Game'; // Game 컴포넌트 임포트
import './App.css'; // CSS 파일 임포트

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
        alert('The browser window is too small for this game.');
        window.resizeTo(gameDimensions.width, gameDimensions.height);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className="game-area"
      style={{
        width: `${gameDimensions.width}px`,
        height: `${gameDimensions.height}px`,
      }}
    >
      <Game width={gameDimensions.width} height={gameDimensions.height} />
    </div>
  );
};

export default App;
