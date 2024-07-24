import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import { loadImage } from './utilities'; // loadImage 함수 임포트
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from './AuthContext';
import './Game.css';

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
    isSliding: false, // 슬라이딩 상태 추가
  });

  const [slidingImage, setSlidingImage] = useState(null);
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
  const [hearts, setHearts] = useState(3); // 하트 추가
  const [heartImage, setHeartImage] = useState(null); // 하트 이미지 상태 추가
  const [invincible, setInvincible] = useState(false); // 무적 모드 상태 추가
  const jumpSoundRef = useRef(null);
  const jellySoundRef = useRef(null);
  const backgroundMusicRef = useRef(null);
  const [slidingObstacleImage, setSlidingObstacleImage] = useState(null);
  const debugMode = false;

  const baseGravity = 0.8;
  const baseJumpStrength = -10; // 점프 강도를 조정하여 최고 높이 낮춤

  const minJellyGap = 50; // 젤리 간격 조정
  const maxJellyGap = 150;

  const [gravity, setGravity] = useState(baseGravity);
  const [jumpStrength, setJumpStrength] = useState(baseJumpStrength);

  // 슬라이딩 상태 변경에 따른 캐릭터 크기와 y 좌표 조정
  useEffect(() => {
    if (character.isSliding) {
      setCharacter((prev) => ({
        ...prev,
        height: 32,
        y: height - 115 - 32,
        width: 64, // 슬라이딩 시 캐릭터 넓이 변경
      }));
    } else {
      setCharacter((prev) => ({
        ...prev,
        height: 64,
        y: height - 115 - 64,
        width: 38, // 슬라이딩 아닐 때 캐릭터 넓이 원래대로
      }));
    }
  }, [character.isSliding, height]);

  useEffect(() => {
    loadImage(require('./images/slide.png')) // 슬라이딩 이미지 로드
      .then((image) => {
        setSlidingImage(image);
      })
      .catch((err) => {
        console.error('Failed to load sliding image:', err);
      });

    loadImage(require('./images/bird.png')) // 슬라이딩 장애물 이미지 로드
      .then((image) => {
        setSlidingObstacleImage(image);
      })
      .catch((err) => {
        console.error('Failed to load sliding obstacle image:', err);
      });

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

    loadImage(require('./images/heart.png'))
      .then((image) => {
        setHeartImage(image);
      })
      .catch((err) => {
        console.error('Failed to load heart image:', err);
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
    jumpSoundRef.current = new Audio('/jump.mp3');
    jellySoundRef.current = new Audio('/jelly.mp3');
    backgroundMusicRef.current = new Audio('/background.mp3');

    const jumpSound = jumpSoundRef.current;
    const jellySound = jellySoundRef.current;
    const backgroundMusic = backgroundMusicRef.current;

    jumpSound.volume = 1.0;
    jellySound.volume = 0.3; // 젤리 소리 볼륨 조절
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    backgroundMusic
      .play()
      .catch((error) =>
        console.error('Failed to play background music:', error)
      );

    return () => {
      jumpSound.pause();
      jellySound.pause();
      backgroundMusic.pause();
    };
  }, []);

  const playSound = (sound) => {
    sound.currentTime = 0; // 오디오 재생을 처음부터 시작
    sound
      .play()
      .catch((error) => console.error('Failed to play sound:', error));
  };

  const handleKeyDown = useCallback(
    (e) => {
      if ((e.key === ' ' || e.key === 'ArrowUp') && !character.isJumping) {
        setCharacter((prev) => ({
          ...prev,
          vy: jumpStrength,
          isJumping: true,
        }));
        playSound(jumpSoundRef.current); // 오디오 재생
      }
      if (e.key === 'ArrowDown' && !character.isJumping) {
        setCharacter((prev) => ({ ...prev, isSliding: true }));
      }
      if (e.key === 'Enter' && isGameOver) {
        resetGame();
      }
    },
    [character.isJumping, isGameOver, jumpStrength]
  );

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      setCharacter((prev) => ({ ...prev, isSliding: false }));
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    if (!character.isJumping) {
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true }));
      playSound(jumpSoundRef.current); // 오디오 재생
    }
  }, [character.isJumping, jumpStrength]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown]);

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

        // 젤리 배치
        if (Math.random() < 0.02) {
          const gap =
            Math.floor(Math.random() * (maxJellyGap - minJellyGap + 1)) +
            minJellyGap;
          const jellyX = width + gap;
          const jellyY = height - 115 - 32; // 일정하게 땅 위에 젤리 배치

          setJellies((prev) => [
            ...prev,
            {
              x: jellyX,
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
            const isUpperObstacle = Math.random() < 0.5; // 50% 확률로 위 장애물 생성
            const obstacleY = isUpperObstacle
              ? height - 250 // 위 장애물 높이 조정
              : height - 88 - character.height / 2;

            setObstacles((prev) => [
              ...prev,
              {
                x: width,
                y: obstacleY,
                width: isUpperObstacle ? 78 : 38, // 위 장애물 크기 키우기
                height: isUpperObstacle ? 78 : 38, // 위 장애물 크기 키우기
                isUpperObstacle,
              },
            ]);
            setLastObstacleX(width);

            // 장애물 위나 아래에 젤리 배치
            const jellyY = isUpperObstacle ? obstacleY + 50 : obstacleY - 50;

            setJellies((prev) => [
              ...prev,
              {
                x: width + 30,
                y: jellyY,
                width: 32,
                height: 32,
              },
            ]);
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
            playSound(jellySoundRef.current); // 오디오 재생
            if ((score + 1) % 10 === 0) {
              setSpeed((prev) => prev + 1);
            }
          }
        });

        obstacles.forEach((obstacle, index) => {
          if (
            !invincible &&
            character.x < obstacle.x + obstacle.width &&
            character.x + character.width > obstacle.x &&
            character.y < obstacle.y + obstacle.height &&
            character.y + character.height > obstacle.y
          ) {
            setHearts((prev) => prev - 1); // 장애물에 닿으면 하트 감소
            if (hearts <= 1) {
              setIsGameOver(true);
            }
            setInvincible(true);
            setTimeout(() => setInvincible(false), 1000); // 1초간 무적 모드
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
    hearts, // 하트 상태 추가
    invincible,
    gravity,
  ]);

  useEffect(() => {
    // 속도가 증가할 때마다 중력과 점프 강도를 더 크게 조정
    const gravityMultiplier = 1 + (speed - 5) * 0.2; // 증가 비율을 더 크게 설정
    setGravity(baseGravity * gravityMultiplier);
    setJumpStrength(baseJumpStrength * gravityMultiplier);
  }, [speed]);

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
    setHearts(3); // 하트 리셋
    setSpeed(5); // 속도 리셋
    setGravity(baseGravity); // 중력 리셋
    setJumpStrength(baseJumpStrength); // 점프 강도 리셋
  };

  const goToHome = () => {
    navigate('/mainhome');
  };

  return (
    <div className="game">
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
                image={
                  character.isSliding
                    ? slidingImage
                    : characterImages[Math.floor(character.frame)]
                }
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
                    image={
                      obstacle.isUpperObstacle
                        ? slidingObstacleImage
                        : obstacleImage
                    }
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
          {[...Array(hearts)].map((_, index) => (
            <KonvaImage
              key={index}
              x={10 + index * 30}
              y={10}
              width={25}
              height={25}
              image={heartImage}
            />
          ))}
          <Text
            className="scoretext"
            text={`Score: ${score}`}
            fontSize={24}
            x={width - 150}
            y={10}
            fontFamily="NeoDunggeunmo"
          />
        </Layer>
      </Stage>
      {isGameOver && (
        <div className="game-over">
          <button onClick={resetGame}>다시 하기</button>
          <button onClick={goToHome}>홈으로 가기</button>
          <button onClick={goToScorePage}>점수 보기</button>
        </div>
      )}
    </div>
  );
};

export default Game;
