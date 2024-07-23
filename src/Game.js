import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import { loadImage } from './utilities'; // loadImage 함수 임포트
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';

const Game = ({ width, height }) => {
  const stageRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // 로그인한 사용자 정보 가져오기

  const [character, setCharacter] = useState({
    x: 120,
    y: 290,
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
  const [bgImages, setBgImages] = useState([]);
  const [bgIndex, setBgIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastObstacleX, setLastObstacleX] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [timer, setTimer] = useState(60); // 타이머 추가
  const [speed, setSpeed] = useState(5);
  const [userScore, setUserScore] = useState(null);
  const jumpSound = new Audio('/jump.mp3');
  const jellySound = new Audio('/jelly.mp3');
  jellySound.volume = 0.3; // 젤리 소리 볼륨 조절

  const gravity = 0.8;
  const jumpStrength = -12;
  const maxJumpHeight = jumpStrength ** 2 / (2 * gravity);

  const debugMode = true;

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'ArrowUp') && !character.isJumping) {
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true }));
      jumpSound.play();
    }
    if (e.key === 'Enter' && isGameOver) {
      resetGame();
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
  }, [character.isJumping, isGameOver]);

  useEffect(() => {
    loadImage(require('./images/americano.png'))
      .then((image) => {
        setJellyImage(image);
      })
      .catch((err) => {
        console.error('Failed to load jelly image:', err);
      });

    loadImage(require('./images/rubber_cone.png'))
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

    const bgPaths = [
      require('./images/bg_starting_point.png'),
      require('./images/bg_road.png'),
      require('./images/bg_lake.png'),
      require('./images/bg_kaimaru.png'),
      require('./images/bg_mugunghwa.png'),
      require('./images/bg_n1.png'),
    ];

    Promise.all(bgPaths.map(loadImage))
      .then((images) => {
        setBgImages(images);
        setBgImage(images[0]);
      })
      .catch((err) => {
        console.error('Failed to load background images:', err);
      });
  }, []);

  useEffect(() => {
    const newY = height - character.height - 115;
    setCharacter((prev) => ({ ...prev, y: newY }));
  }, [height]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (!isGameOver && !isPaused) {
        setBackgroundX((prev) => prev - speed);

        // 배경이 화면 끝에 도달하면 다음 배경으로 넘어가도록 설정
        if (backgroundX <= -width) {
          setBackgroundX(0);
          setBgIndex((prev) => (prev + 1) % bgImages.length);
        }

        setCharacter((prev) => {
          let newY = prev.y + prev.vy;
          let newVy = prev.vy + gravity;
          let isJumping = true;

          if (newY >= height - 115 - prev.height) {
            newY = height - 115 - prev.height;
            newVy = 0;
            isJumping = false;
          }

          const newFrame = (prev.frame + 1 / 5) % 4;
          return { ...prev, y: newY, vy: newVy, isJumping, frame: newFrame };
        });

        if (Math.random() < 0.03) {
          const jellyY = height - 115 - 32;

          setJellies((prev) => [
            ...prev,
            {
              x: width,
              y: jellyY,
              width: 32,
              height: 32,
            },
          ]);
        }

        if (Math.random() < 0.03) {
          const minGap = 120;
          const maxGap = 200;
          const gap =
            Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;

          if (width - lastObstacleX >= gap) {
            setObstacles((prev) => [
              ...prev,
              {
                x: width,
                y: height - 88 - character.height / 2,
                width: 38,
                height: 38,
              },
            ]);
            setLastObstacleX(width);
          }
        }

        setJellies((prev) =>
          prev
            .map((jelly) => ({ ...jelly, x: jelly.x - speed }))
            .filter((jelly) => jelly.x > -50)
        );

        setObstacles((prev) =>
          prev
            .map((obstacle) => ({ ...obstacle, x: obstacle.x - speed }))
            .filter((obstacle) => {
              if (obstacle.x > -50) {
                setLastObstacleX(obstacle.x);
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
            jellySound.play();
            if ((score + 1) % 10 === 0) {
              setSpeed((prev) => prev + 1);
            }
          }
        });

        obstacles.forEach((obstacle, index) => {
          if (
            character.x < obstacle.x + obstacle.width &&
            character.x + character.width > obstacle.x &&
            character.y < obstacle.y + obstacle.height &&
            character.y + character.height > obstacle.y
          ) {
            setIsGameOver(true);
          }
        });
      }
    }, 30);

    return () => clearInterval(interval);
  }, [
    character,
    jellies,
    obstacles,
    width,
    height,
    lastObstacleX,
    isGameOver,
    isPaused,
    bgImages,
    backgroundX,
    bgIndex,
    speed,
    score,
  ]);

  useEffect(() => {
    const timerInterval = setInterval(() => {
      if (!isGameOver && !isPaused) {
        setTimer((prev) => {
          if (prev <= 0) {
            setIsGameOver(true);
            clearInterval(timerInterval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isGameOver, isPaused]);

  const updateScore = async () => {
    if (user) {
      try {
        const response = await axios.post(
          'http://ec2-3-34-49-232.ap-northeast-2.compute.amazonaws.com:2000/update-score',
          {
            userid: user.userid,
            score,
          }
        );
        setUserScore(response.data.score);
        console.log(response.data.message);
      } catch (error) {
        console.error('Error updating score:', error);
      }
    }
  };
  useEffect(() => {
    if (isGameOver) {
      updateScore();
    }
  }, [isGameOver]);

  const goToScorePage = () => {
    navigate('/score', { state: { currentScore: score } });
  };

  const resetGame = () => {
    setIsGameOver(false);
    setScore(0);
    setJellies([]);
    setObstacles([]);
    setLastObstacleX(0);
    setCharacter({
      x: 120,
      y: height - 115 - character.height,
      vy: 0,
      isJumping: false,
      frame: 0,
      width: 38,
      height: 64,
    });
    setBgIndex(0);
    setBgImage(bgImages[0]);
    setBackgroundX(0);
    setTimer(60); // 타이머 리셋
    setSpeed(5); // 속도 리셋
  };

  const goToHome = () => {
    navigate('/');
  };

  return (
    <div
      className="game"
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {bgImage && (
            <>
              <KonvaImage
                x={backgroundX}
                y={0}
                width={width}
                height={height}
                image={bgImages[bgIndex]}
              />
              <KonvaImage
                x={backgroundX + width}
                y={0}
                width={width}
                height={height}
                image={bgImages[(bgIndex + 1) % bgImages.length]}
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
          <Rect
            x={10}
            y={10}
            width={(width - 20) * (timer / 60)}
            height={20}
            fill="green"
          />
          {/* <Text text={`Time: ${timer}`} fontSize={24} x={10} y={35} /> */}
          <Text
            text={`Score: ${score}`}
            fontSize={24}
            x={10}
            y={60}
            fontFamily="NeoDunggeunmo"
          />
        </Layer>
      </Stage>
      {isGameOver && (
        <div className="game-over">
          <button onClick={resetGame}>다시 하기</button>
          <button onClick={goToHome}>홈으로 가기</button>
          {/* <button>점수 보기</button> */}
          <button onClick={goToScorePage}>점수 보기</button>
        </div>
      )}
    </div>
  );
};

export default Game;
