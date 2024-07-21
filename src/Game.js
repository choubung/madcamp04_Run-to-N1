import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import { loadImage } from './utilities'; // loadImage 함수 임포트

const Game = ({ width, height }) => {
  const stageRef = useRef(null);
  const [character, setCharacter] = useState({
    x: 120, // 기존 위치에서 70px 오른쪽으로 이동
    y: 290, // 기존 위치에서 75px 아래로 이동 (70px + 5px)
    vy: 0,
    isJumping: false,
    frame: 0,
    width: 38,
    height: 64,
  });
  const [jellies, setJellies] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [backgroundX, setBackgroundX] = useState(0);
  const [jellyImage, setJellyImage] = useState(null);
  const [obstacleImage, setObstacleImage] = useState(null);
  const [characterImages, setCharacterImages] = useState([]);
  const [bgImage, setBgImage] = useState(null);
  const [lastObstacleX, setLastObstacleX] = useState(0); // 마지막 장애물의 X 위치

  const gravity = 0.8;
  const jumpStrength = -12;

  // 디버그 모드를 위한 설정
  const debugMode = true; // 디버그 모드를 켜려면 true로 설정, 끄려면 false로 설정

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'ArrowUp') && !character.isJumping) {
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true }));
    }
  };

  const handleMouseDown = () => {
    if (!character.isJumping) {
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true }));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [character.isJumping]);

  useEffect(() => {
    loadImage(require('./images/americano.png'))
      .then((image) => {
        setJellyImage(image);
      })
      .catch((err) => {
        console.error('Failed to load jelly image:', err);
      });

    loadImage(require('./images/banana.png'))
      .then((image) => {
        setObstacleImage(image);
      })
      .catch((err) => {
        console.error('Failed to load obstacle image:', err);
      });

    Promise.all([
      loadImage(require('./images/runner_0.png')),
      loadImage(require('./images/runner_1.png')),
      loadImage(require('./images/runner_2.png')),
      loadImage(require('./images/runner_3.png')),
    ])
      .then((images) => {
        setCharacterImages(images);
      })
      .catch((err) => {
        console.error('Failed to load character images:', err);
      });

    loadImage(require('./images/bg_starting_point.png'))
      .then((image) => {
        setBgImage(image);
      })
      .catch((err) => {
        console.error('Failed to load background image:', err);
      });
  }, []);

  useEffect(() => {
    const newY = height - character.height - 115; // 기존 위치에서 75px 아래로 이동 (70px + 5px)
    setCharacter((prev) => ({ ...prev, y: newY }));
  }, [height]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundX((prev) => (prev - 5) % width);

      setCharacter((prev) => {
        let newY = prev.y + prev.vy;
        let newVy = prev.vy + gravity;
        let isJumping = true;

        if (newY >= height - 115 - prev.height) {
          // 기존 위치에서 75px 아래로 이동 (70px + 5px)
          newY = height - 115 - prev.height; // 기존 위치에서 75px 아래로 이동 (70px + 5px)
          newVy = 0;
          isJumping = false;
        }

        const newFrame = (prev.frame + 1 / 5) % 4;
        return { ...prev, y: newY, vy: newVy, isJumping, frame: newFrame };
      });

      if (Math.random() < 0.05) {
        setJellies((prev) => [
          ...prev,
          {
            x: width,
            y: Math.random() * (height - 100) + 50,
            width: 32,
            height: 32,
          },
        ]);
      }

      // 장애물 생성
      if (Math.random() < 0.03) {
        const minGap = 140; // 최소 간격
        const maxGap = 200; // 최대 간격
        const gap = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;

        if (width - lastObstacleX >= gap) {
          setObstacles((prev) => [
            ...prev,
            {
              x: width,
              y: height - 88 - character.height / 2, // 기존 위치에서 추가로 3px 더 위로 이동
              width: 38,
              height: 38,
            },
          ]);
          setLastObstacleX(width); // 마지막 장애물의 X 위치 업데이트
        }
      }

      setJellies((prev) =>
        prev
          .map((jelly) => ({ ...jelly, x: jelly.x - 5 }))
          .filter((jelly) => jelly.x > -50)
      );

      setObstacles((prev) =>
        prev
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - 5 }))
          .filter((obstacle) => {
            if (obstacle.x > -50) {
              setLastObstacleX(obstacle.x); // 장애물의 현재 X 위치 업데이트
              return true;
            } else {
              return false;
            }
          })
      );

      jellies.forEach((jelly, index) => {
        if (
          character.x < jelly.x + jelly.width &&
          character.x + character.width > jelly.x &&
          character.y < jelly.y + jelly.height &&
          character.y + character.height > jelly.y
        ) {
          setJellies((prev) => prev.filter((_, i) => i !== index));
          setScore((prev) => prev + 1);
        }
      });

      obstacles.forEach((obstacle, index) => {
        if (
          character.x < obstacle.x + obstacle.width &&
          character.x + character.width > obstacle.x &&
          character.y < obstacle.y + obstacle.height &&
          character.y + character.height > obstacle.y
        ) {
          alert('Game Over!');
          setScore(0);
          setJellies([]);
          setObstacles([]);
          setCharacter({
            x: 120, // 기존 위치에서 70px 오른쪽으로 이동
            y: height - 115 - character.height, // 기존 위치에서 75px 아래로 이동 (70px + 5px)
            vy: 0,
            isJumping: false,
            frame: 0,
            width: 38,
            height: 64,
          });
          setLastObstacleX(0); // 마지막 장애물의 X 위치 초기화
        }
      });
    }, 30);

    return () => clearInterval(interval);
  }, [character, jellies, obstacles, width, height, lastObstacleX]);

  return (
    <div>
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          <Text text="Cookie Run" fontSize={24} x={10} y={10} />
          <Text text={`Score: ${score}`} fontSize={24} x={10} y={40} />

          {bgImage && (
            <>
              <KonvaImage
                x={backgroundX}
                y={0}
                width={width}
                height={height}
                image={bgImage}
              />
              <KonvaImage
                x={backgroundX + width}
                y={0}
                width={width}
                height={height}
                image={bgImage}
              />
            </>
          )}

          {characterImages.length > 0 && (
            <>
              <KonvaImage
                x={character.x}
                y={character.y}
                width={character.width}
                height={character.height}
                image={characterImages[Math.floor(character.frame)]}
                scaleX={1.5}
                scaleY={1.5}
              />
              {debugMode && (
                <Rect
                  x={character.x}
                  y={character.y}
                  width={character.width}
                  height={character.height}
                  stroke="red"
                  strokeWidth={2}
                />
              )}
            </>
          )}

          {jellies.map(
            (jelly, index) =>
              jellyImage && (
                <>
                  <KonvaImage
                    key={index}
                    x={jelly.x}
                    y={jelly.y}
                    width={jelly.width}
                    height={jelly.height}
                    image={jellyImage}
                  />
                  {debugMode && (
                    <Rect
                      x={jelly.x}
                      y={jelly.y}
                      width={jelly.width}
                      height={jelly.height}
                      stroke="blue"
                      strokeWidth={2}
                    />
                  )}
                </>
              )
          )}

          {obstacles.map(
            (obstacle, index) =>
              obstacleImage && (
                <>
                  <KonvaImage
                    key={index}
                    x={obstacle.x}
                    y={obstacle.y}
                    width={obstacle.width}
                    height={obstacle.height}
                    image={obstacleImage}
                  />
                  {debugMode && (
                    <Rect
                      x={obstacle.x}
                      y={obstacle.y}
                      width={obstacle.width}
                      height={obstacle.height}
                      stroke="green"
                      strokeWidth={2}
                    />
                  )}
                </>
              )
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Game;
