import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import { loadImage } from './utilities'; // loadImage 함수 임포트

// Game 컴포넌트 정의
const Tutorial = () => {
  const stageRef = useRef(null); // Stage를 참조하기 위한 useRef 훅 사용
  const [character, setCharacter] = useState({
    x: 300,
    y: 250,
    vy: 0,
    isJumping: false,
    frame: 0, // 애니메이션 프레임 추가
  }); // 캐릭터 상태 정의
  const [jellies, setJellies] = useState([]); // 젤리 상태 정의
  const [obstacles, setObstacles] = useState([]); // 장애물 상태 정의
  const [score, setScore] = useState(0); // 점수 상태 정의
  const [backgroundX, setBackgroundX] = useState(0); // 배경의 X 위치 상태 정의
  const [jellyImage, setJellyImage] = useState(null); // 젤리 이미지 상태 추가
  const [obstacleImage, setObstacleImage] = useState(null); // 장애물 이미지 상태 추가
  const [characterImages, setCharacterImages] = useState([]); // 캐릭터 이미지 배열 추가
  const [bgImage, setBgImage] = useState(null); // 배경 이미지 상태 추가

  const gravity = 0.5; // 중력 상수
  const jumpStrength = -10; // 점프 강도 상수

  const characterHeight = 80; // 캐릭터의 높이
  const obstacleHeight = 40; // 장애물의 높이

  // 키 다운 이벤트 핸들러 정의
  const handleKeyDown = (e) => {
    if ((e.key === ' ' || e.key === 'ArrowUp') && !character.isJumping) {
      // 스페이스바 또는 윗방향 화살표 누르고 캐릭터가 점프 중이 아닐 때
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true })); // 캐릭터 점프
    }
  };

  // 마우스 클릭 이벤트 핸들러 정의
  const handleMouseDown = () => {
    if (!character.isJumping) {
      setCharacter((prev) => ({ ...prev, vy: jumpStrength, isJumping: true }));
    }
  };

  // 키 다운 이벤트 리스너 및 마우스 다운 이벤트 리스너 설정 및 해제
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [character.isJumping]);

  // 이미지 로드
  useEffect(() => {
    // 젤리 이미지 로드
    loadImage(require('./images/americano.png')) // 이미지 경로를 require로 설정
      .then((image) => {
        setJellyImage(image);
      })
      .catch((err) => {
        console.error('Failed to load jelly image:', err);
      });

    // 장애물 이미지 로드
    loadImage(require('./images/banana.png')) // 이미지 경로를 require로 설정
      .then((image) => {
        setObstacleImage(image);
      })
      .catch((err) => {
        console.error('Failed to load obstacle image:', err);
      });

    // 캐릭터 이미지 로드
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

    // 배경 이미지 로드
    loadImage(require('./images/bg_starting_point.png'))
      .then((image) => {
        setBgImage(image);
      })
      .catch((err) => {
        console.error('Failed to load background image:', err);
      });
  }, []);

  // 컴포넌트 마운트 시 캐릭터의 y 좌표를 바닥에서 200px 떨어진 곳으로 설정
  useEffect(() => {
    const newY = window.innerHeight - 200 - characterHeight;
    setCharacter((prev) => ({ ...prev, y: newY }));
  }, []);

  // 게임 루프 설정
  useEffect(() => {
    const interval = setInterval(() => {
      // 배경 스크롤
      setBackgroundX((prev) => (prev - 5) % window.innerWidth);

      // 중력 적용
      setCharacter((prev) => {
        let newY = prev.y + prev.vy;
        let newVy = prev.vy + gravity;
        let isJumping = true;

        if (newY >= window.innerHeight - 200 - characterHeight) {
          // 캐릭터가 땅에 닿았을 때
          newY = window.innerHeight - 200 - characterHeight;
          newVy = 0;
          isJumping = false;
        }

        // 애니메이션 프레임 업데이트 속도 조절 (6fps로 업데이트)
        const newFrame = (prev.frame + 1 / 5) % 4;
        return { ...prev, y: newY, vy: newVy, isJumping, frame: newFrame };
      });

      // 젤리 생성
      if (Math.random() < 0.05) {
        setJellies((prev) => [
          ...prev,
          { x: window.innerWidth, y: Math.random() * 200 + 50 },
        ]);
      }

      // 장애물 생성
      if (Math.random() < 0.02) {
        // 장애물 생성 확률을 0.02로 줄임
        setObstacles((prev) => [
          ...prev,
          {
            x: window.innerWidth,
            y: window.innerHeight - 200 - obstacleHeight,
          },
        ]); // 장애물 위치를 캐릭터 아랫면과 맞춤
      }

      // 젤리 이동
      setJellies((prev) =>
        prev
          .map((jelly) => ({ ...jelly, x: jelly.x - 5 }))
          .filter((jelly) => jelly.x > -50)
      );

      // 장애물 이동
      setObstacles((prev) =>
        prev
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - 5 }))
          .filter((obstacle) => obstacle.x > -50)
      );

      // 젤리와의 충돌 감지
      jellies.forEach((jelly, index) => {
        if (
          character.x < jelly.x + 10 &&
          character.x + 100 > jelly.x && // 캐릭터 크기에 맞게 충돌 영역 수정
          character.y < jelly.y + 10 &&
          character.y + 100 > jelly.y // 캐릭터 크기에 맞게 충돌 영역 수정
        ) {
          setJellies((prev) => prev.filter((_, i) => i !== index));
          setScore((prev) => prev + 1);
        }
      });

      // 장애물과의 충돌 감지
      obstacles.forEach((obstacle, index) => {
        if (
          character.x < obstacle.x + 20 &&
          character.x + 100 > obstacle.x && // 캐릭터 크기에 맞게 충돌 영역 수정
          character.y < obstacle.y + 20 &&
          character.y + 100 > obstacle.y // 캐릭터 크기에 맞게 충돌 영역 수정
        ) {
          alert('Game Over!');
          setScore(0);
          setJellies([]);
          setObstacles([]);
          setCharacter({
            x: 50,
            y: window.innerHeight - 200 - characterHeight,
            vy: 0,
            isJumping: false,
            frame: 0,
          });
        }
      });
    }, 30); // 30ms마다 게임 루프 실행

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 정리
  }, [character, jellies, obstacles]);

  // JSX 반환
  return (
    <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
      <Layer>
        <Text text="Cookie Run" fontSize={24} x={10} y={10} />
        <Text text={`Score: ${score}`} fontSize={24} x={10} y={40} />

        {bgImage && (
          <>
            <KonvaImage
              x={backgroundX}
              y={0}
              width={window.innerWidth}
              height={window.innerHeight}
              image={bgImage}
            />
            <KonvaImage
              x={backgroundX + window.innerWidth}
              y={0}
              width={window.innerWidth}
              height={window.innerHeight}
              image={bgImage}
            />
          </>
        )}

        {characterImages.length > 0 && (
          <KonvaImage
            x={character.x}
            y={character.y}
            width={80} // 캐릭터 크기를 2배로 키움
            height={80} // 캐릭터 크기를 2배로 키움
            image={characterImages[Math.floor(character.frame)]}
            scaleX={1.5}
            scaleY={1.5}
          />
        )}

        {jellies.map(
          (jelly, index) =>
            jellyImage && (
              <KonvaImage
                key={index}
                x={jelly.x}
                y={jelly.y}
                width={30}
                height={30}
                image={jellyImage}
              />
            )
        )}

        {obstacles.map(
          (obstacle, index) =>
            obstacleImage && (
              <KonvaImage
                key={index}
                x={obstacle.x}
                y={obstacle.y}
                width={40}
                height={40}
                image={obstacleImage}
              />
            )
        )}
      </Layer>
    </Stage>
  );
};

export default Tutorial;
