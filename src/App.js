import React, { useEffect, useState } from 'react';
import Game from './Game'; // Game 컴포넌트 임포트
import './App.css'; // CSS 파일 임포트

const App = () => {
  const [gameDimensions, setGameDimensions] = useState({
    width: 510,
    height: 300,
  });

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let newWidth = windowWidth * 0.8; // 초기 너비는 윈도우 너비의 80%
      let newHeight = newWidth / 1.7; // 비율에 맞춘 높이

      if (newHeight > windowHeight * 0.8) {
        newHeight = windowHeight * 0.8; // 초기 높이는 윈도우 높이의 80%
        newWidth = newHeight * 1.7; // 비율에 맞춘 너비
      }

      // 최소 크기 제한
      if (newWidth < 510) {
        newWidth = 510;
        newHeight = 300;
      }

      setGameDimensions({
        width: newWidth,
        height: newHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="game-container">
      <div
        className="game-area"
        style={{
          width: `${gameDimensions.width}px`,
          height: `${gameDimensions.height}px`,
        }}
      >
        <Game width={gameDimensions.width} height={gameDimensions.height} />
      </div>
    </div>
  );
};

export default App;
