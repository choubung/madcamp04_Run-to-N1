import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import { loadImage } from './utilities'; // loadImage 함수 임포트
import { useNavigate } from 'react-router-dom';
import './App.css'; // CSS 파일 임포트

const Tutorial = ({ width, height }) => {
  const stageRef = useRef(null);
  const navigate = useNavigate();
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
  const [nextBackgroundX, setNextBackgroundX] = useState(width);
  const [nextBgImage, setNextBgImage] = useState(null);
  const [isBackgroundPause, setIsBackgroundPause] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  const [enterKeyCount, setEnterKeyCount] = useState(0);
  const [lastEnterKeyTime, setLastEnterKeyTime] = useState(0);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [outroImage, setOutroImage] = useState(null);

  const gravity = 0.8;
  const jumpStrength = -12;
  const maxJumpHeight = jumpStrength ** 2 / (2 * gravity);

  const debugMode = false;

  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'ArrowUp') && !character.isJumping) {
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true }));
    }
    if (e.key === 'Enter') {
      const now = Date.now();
      if (now - lastEnterKeyTime <= 500) {
        setEnterKeyCount((prev) => prev + 1);
      } else {
        setEnterKeyCount(1);
      }
      setLastEnterKeyTime(now);

      if (enterKeyCount + 1 === 3) {
        setIsInvincible((prev) => !prev);
        setEnterKeyCount(0);
      }

      if (isGameOver) {
        resetGame();
      }
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
  }, [character.isJumping, isGameOver, enterKeyCount, lastEnterKeyTime]);

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
      require('./images/bg_black.png'), // 추가된 부분
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
        setNextBgImage(images[1]);
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(() => {
            setIsStarting(false);
            setBgImage(images[1]); // 첫 번째 실제 배경 이미지로 변경
            setNextBgImage(images[2]);
            setBgIndex(1);
          }, 1000); // fade-out 애니메이션 시간과 일치시키기
        }, 2500);
      })
      .catch((err) => {
        console.error('Failed to load background images:', err);
      });

    loadImage(require('./images/outro.png'))
      .then((image) => {
        setOutroImage(image);
      })
      .catch((err) => {
        console.error('Failed to load outro image:', err);
      });
  }, []);

  useEffect(() => {
    const newY = height - character.height - 115;
    setCharacter((prev) => ({ ...prev, y: newY }));
  }, [height]);

  useEffect(() => {
    let interval = setInterval(() => {
      if (
        !isGameOver &&
        !isPaused &&
        !isBackgroundPause &&
        !isStarting &&
        !isGameCompleted
      ) {
        setBackgroundX((prev) => prev - 5);
        setNextBackgroundX((prev) => prev - 5);
        if (nextBackgroundX <= 0) {
          if (bgIndex === bgImages.length - 1) {
            setIsGameCompleted(true);
            setJellies([]);
            setObstacles([]);
            return;
          }

          // 특정 배경일 때 멈추기
          const pauseBackgrounds = [3, 4, 5]; // bg_lake, bg_kaimaru, bg_mugunghwa의 인덱스
          if (pauseBackgrounds.includes(bgIndex)) {
            setIsBackgroundPause(true);
            setJellies([]);
            setObstacles([]);
            setTimeout(() => {
              setIsBackgroundPause(false);
              setBackgroundX(0);
              setNextBackgroundX(width);
              setBgImage(nextBgImage);
              const newIndex = (bgIndex + 1) % bgImages.length;
              setNextBgImage(bgImages[newIndex]);
              setBgIndex(newIndex);
            }, 8000); // 8초 동안 멈춤
            return;
          }

          setBackgroundX(0);
          setNextBackgroundX(width);
          setBgImage(nextBgImage);
          const newIndex = (bgIndex + 1) % bgImages.length;
          setNextBgImage(bgImages[newIndex]);
          setBgIndex(newIndex);
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
          const minY = height - 88 - character.height / 2 - 32;
          const maxY = height - 115 - character.height - maxJumpHeight - 32;
          const jellyY = Math.random() * (maxY - minY) + minY;

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
            .map((jelly) => ({ ...jelly, x: jelly.x - 5 }))
            .filter((jelly) => jelly.x > -50)
        );

        setObstacles((prev) =>
          prev
            .map((obstacle) => ({ ...obstacle, x: obstacle.x - 5 }))
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
          }
        });

        obstacles.forEach((obstacle, index) => {
          if (
            !isInvincible &&
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
    nextBgImage,
    nextBackgroundX,
    bgIndex,
    isBackgroundPause,
    isStarting,
    isInvincible,
    isGameCompleted,
  ]);

  const resetGame = () => {
    setIsGameOver(false);
    setIsGameCompleted(false);
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
    setBgIndex(1); // 시작 화면을 건너뛰기 위해 인덱스를 1로 설정
    setBgImage(bgImages[1]);
    setNextBgImage(bgImages[2]);
    setBackgroundX(0);
    setNextBackgroundX(width);
    setIsInvincible(false); // 무적 모드 해제
    setEnterKeyCount(0); // 엔터 키 입력 카운트 초기화
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
      {isStarting && (
        <div
          className={`fade-out ${fadeOut ? 'fade-out' : ''}`}
          style={{
            position: 'absolute',
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: 'black',
            zIndex: 10,
          }}
        ></div>
      )}
      <Stage width={width} height={height} ref={stageRef}>
        <Layer>
          {!isStarting && (
            <Text text="Cookie Run" fontSize={24} x={10} y={10} />
          )}
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
                x={nextBackgroundX}
                y={0}
                width={width}
                height={height}
                image={nextBgImage}
              />
            </>
          )}

          {!isStarting && characterImages.length > 0 && (
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

          {!isStarting &&
            jellies.map(
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

          {!isStarting &&
            obstacles.map(
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
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          fontSize: '24px',
          color: 'black',
        }}
      >
        SCORE {score}
      </div>
      {isGameOver && (
        <div className="game-over">
          <button onClick={resetGame}>다시 하기</button>
          <button onClick={goToHome}>홈으로 가기</button>
          <button>점수 보기</button>
        </div>
      )}
      {isInvincible && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: '24px',
            color: 'red',
          }}
        >
          무적 모드
        </div>
      )}
      {isGameCompleted && outroImage && (
        <div
          className="game-completed"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${width}px`,
            height: `${height}px`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 20,
          }}
        >
          <img
            src={outroImage.src}
            alt="Outro"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '50px',
              textAlign: 'center',
            }}
          >
            <button
              onClick={goToHome}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                fontFamily: 'NeoDunggeunmo, sans-serif',
                padding: 0,
              }}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;
