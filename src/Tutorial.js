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
  const [textboxEvent1, setTextboxEvent1] = useState(null);
  const [textboxEvent2, setTextboxEvent2] = useState(null);
  const [textboxEvent3, setTextboxEvent3] = useState(null);
  const [textboxEnding1, setTextboxEnding1] = useState(null);
  const [textboxEnding2, setTextboxEnding2] = useState(null);
  const [geeseCrossing, setGeeseCrossing] = useState(null);
  const [gooseImage, setGooseImage] = useState(null);
  const [miumImage, setMiumImage] = useState(null); // 추가된 부분
  const [showTextboxEvent1, setShowTextboxEvent1] = useState(false);
  const [showTextboxEvent2, setShowTextboxEvent2] = useState(false);
  const [showTextboxEvent3, setShowTextboxEvent3] = useState(false);
  const [showTextboxEnding1, setShowTextboxEnding1] = useState(false);
  const [showTextboxEnding2, setShowTextboxEnding2] = useState(false);
  const [showGeeseCrossing, setShowGeeseCrossing] = useState(false);
  const [gooseYPositions, setGooseYPositions] = useState(Array(6).fill(0.86));
  const [miumX, setMiumX] = useState(0); // 추가된 부분

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

  const handleStageMouseDown = () => {
    if (showTextboxEnding1) {
      setShowTextboxEnding1(false);
      setShowTextboxEnding2(true);
    }
  };

  const goToHome = () => {
    navigate('/');
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
      require('./images/bg_black.png'),
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
            setBgImage(images[1]);
            setNextBgImage(images[2]);
            setBgIndex(1);
          }, 1000);
        }, 2500);
      })
      .catch((err) => {
        console.error('Failed to load background images:', err);
      });

    loadImage(require('./images/textbox_event1.png'))
      .then((image) => {
        setTextboxEvent1(image);
      })
      .catch((err) => {
        console.error('Failed to load textbox_event1 image:', err);
      });

    loadImage(require('./images/textbox_event2.png'))
      .then((image) => {
        setTextboxEvent2(image);
      })
      .catch((err) => {
        console.error('Failed to load textbox_event2 image:', err);
      });

    loadImage(require('./images/textbox_event3.png'))
      .then((image) => {
        setTextboxEvent3(image);
      })
      .catch((err) => {
        console.error('Failed to load textbox_event3 image:', err);
      });

    loadImage(require('./images/textbox_ending1.png'))
      .then((image) => {
        setTextboxEnding1(image);
      })
      .catch((err) => {
        console.error('Failed to load textbox_ending1 image:', err);
      });

    loadImage(require('./images/textbox_ending2.png'))
      .then((image) => {
        setTextboxEnding2(image);
      })
      .catch((err) => {
        console.error('Failed to load textbox_ending2 image:', err);
      });

    loadImage(require('./images/geese_crossing.png'))
      .then((image) => {
        setGeeseCrossing(image);
      })
      .catch((err) => {
        console.error('Failed to load geese_crossing image:', err);
      });

    loadImage(require('./images/goose.png'))
      .then((image) => {
        setGooseImage(image);
      })
      .catch((err) => {
        console.error('Failed to load goose image:', err);
      });

    loadImage(require('./images/mium.png'))
      .then((image) => {
        setMiumImage(image);
      })
      .catch((err) => {
        console.error('Failed to load mium image:', err);
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
            setShowTextboxEnding1(true);
            return;
          }

          const pauseBackgrounds = [3, 4, 5];
          if (pauseBackgrounds.includes(bgIndex)) {
            setIsBackgroundPause(true);
            setJellies([]);
            setObstacles([]);

            if (bgIndex === 3) {
              setShowTextboxEvent1(true);
              setShowGeeseCrossing(true);
            }
            if (bgIndex === 4) {
              setShowTextboxEvent2(true);
            }
            if (bgIndex === 5) {
              setShowTextboxEvent3(true);
              setMiumX(0);
            }

            setTimeout(() => {
              setIsBackgroundPause(false);
              setBackgroundX(0);
              setNextBackgroundX(width);
              setBgImage(nextBgImage);
              const newIndex = (bgIndex + 1) % bgImages.length;
              setNextBgImage(bgImages[newIndex]);
              setBgIndex(newIndex);
              setShowTextboxEvent1(false);
              setShowTextboxEvent2(false);
              setShowTextboxEvent3(false);
              setShowGeeseCrossing(false);
            }, 8000);
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

  useEffect(() => {
    const jumpInterval = setInterval(() => {
      setGooseYPositions((prevPositions) =>
        prevPositions.map((pos, i) => {
          const jumpHeight = 10;
          const jumpSpeed = 0.5;
          return pos >= 0.86 ? pos - jumpHeight / height : 0.86;
        })
      );
    }, 1000);

    const fallInterval = setInterval(() => {
      setGooseYPositions((prevPositions) =>
        prevPositions.map((pos) => (pos < 0.86 ? pos + 0.5 / height : 0.86))
      );
    }, 20);

    return () => {
      clearInterval(jumpInterval);
      clearInterval(fallInterval);
    };
  }, [height]);

  useEffect(() => {
    if (showTextboxEvent3) {
      const miumInterval = setInterval(() => {
        setMiumX((prevX) => prevX + width / 500); // 5초 동안 전체 너비를 이동
      }, 10);

      return () => clearInterval(miumInterval);
    }
  }, [showTextboxEvent3, width]);

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
    setBgIndex(1);
    setBgImage(bgImages[1]);
    setNextBgImage(bgImages[2]);
    setBackgroundX(0);
    setNextBackgroundX(width);
    setIsInvincible(false);
    setEnterKeyCount(0);
    setShowTextboxEnding1(false);
    setShowTextboxEnding2(false);
  };

  const renderGooses = () => {
    const gooses = [];
    const gooseSize = 50;
    const margin = 10;
    const numGooses = 6;
    const gooseX = width * 0.7;

    for (let i = 0; i < numGooses; i++) {
      const gooseY =
        height * gooseYPositions[i] - (i >= 3 ? gooseSize + margin : 0);
      const offsetX = i >= 3 ? 10 : 0; // 아래 줄의 거위를 오른쪽으로 10px 옮김
      gooses.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${gooseY}px`,
            left: `${gooseX + (gooseSize + margin) * (i % 3) + offsetX}px`,
            height: `${gooseSize}px`,
            width: `${gooseSize}px`,
            transition: 'top 0.2s',
          }}
        >
          <img
            src={gooseImage.src}
            alt="Goose"
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </div>
      );
    }

    return gooses;
  };

  return (
    <div
      className="game"
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseDown={handleStageMouseDown}
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
      {showTextboxEvent1 && textboxEvent1 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(10% + 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${height / 4}px`,
            width: 'auto',
            zIndex: 15,
          }}
        >
          <img
            src={textboxEvent1.src}
            alt="Textbox Event 1"
            style={{
              height: '100%',
              width: 'auto',
            }}
          />
        </div>
      )}
      {showGeeseCrossing && geeseCrossing && (
        <div
          className="blinking-geese"
          style={{
            position: 'absolute',
            top: 'calc(20% + 160px)',
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${(height / 4) * 0.8}px`,
            width: 'auto',
            zIndex: 14,
            animation: 'blinking 1s infinite',
          }}
        >
          <img
            src={geeseCrossing.src}
            alt="Geese Crossing"
            style={{
              height: '100%',
              width: 'auto',
            }}
          />
        </div>
      )}
      {showGeeseCrossing && gooseImage && renderGooses()}
      {showTextboxEvent2 && textboxEvent2 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(10% + 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${height / 4}px`,
            width: 'auto',
            zIndex: 15,
          }}
        >
          <img
            src={textboxEvent2.src}
            alt="Textbox Event 2"
            style={{
              height: '100%',
              width: 'auto',
            }}
          />
        </div>
      )}
      {showTextboxEvent3 && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 'calc(10% + 40px)',
              left: '50%',
              transform: 'translateX(-50%)',
              height: `${height / 4}px`,
              width: 'auto',
              zIndex: 15,
            }}
          >
            <img
              src={textboxEvent3.src}
              alt="Textbox Event 3"
              style={{
                height: '100%',
                width: 'auto',
              }}
            />
          </div>
          {miumImage && (
            <div
              style={{
                position: 'absolute',
                top: `${height - 115 - character.height * 2.1 + 50}px`,
                left: `${miumX}px`,
                height: `${character.height * 2.1}px`,
                width: 'auto',
                transition: 'left 0.1s linear',
                zIndex: 15,
              }}
            >
              <img
                src={miumImage.src}
                alt="Mium"
                style={{
                  height: '100%',
                  width: 'auto',
                }}
              />
            </div>
          )}
        </>
      )}
      {showTextboxEnding1 && textboxEnding1 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(10% + 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${height / 4}px`,
            width: 'auto',
            zIndex: 15,
          }}
        >
          <img
            src={textboxEnding1.src}
            alt="Textbox Ending 1"
            style={{
              height: '100%',
              width: 'auto',
            }}
          />
        </div>
      )}
      {showTextboxEnding2 && textboxEnding2 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(10% + 40px)',
            left: '50%',
            transform: 'translateX(-50%)',
            height: `${height / 4}px`,
            width: 'auto',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src={textboxEnding2.src}
            alt="Textbox Ending 2"
            style={{
              height: '100%',
              width: 'auto',
            }}
          />
          <div
            style={{
              marginTop: '20px', // 여백 추가
              fontFamily: 'NeoDunggeunmo', // 폰트 설정
              fontSize: '20px',
              color: 'black',
              cursor: 'pointer',
            }}
            onClick={goToHome}
          >
            홈화면으로 돌아가기
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorial;
