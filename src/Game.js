import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect } from 'react-konva';
import { loadImage } from './utilities'; // loadImage 함수 임포트

const Game = ({ width, height }) => {
  const stageRef = useRef(null);
  const [character, setCharacter] = useState({
    x: 300,
    y: 250,
    vy: 0,
    isJumping: false,
    frame: 0,
  });
  const [jellies, setJellies] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [backgroundX, setBackgroundX] = useState(0);
  const [jellyImage, setJellyImage] = useState(null);
  const [obstacleImage, setObstacleImage] = useState(null);
  const [characterImages, setCharacterImages] = useState([]);
  const [bgImage, setBgImage] = useState(null);

  const gravity = 0.5;
  const jumpStrength = -10;

  const characterHeight = 80;
  const obstacleHeight = 40;

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
    const newY = height - 200 - characterHeight;
    setCharacter((prev) => ({ ...prev, y: newY }));
  }, [height]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundX((prev) => (prev - 5) % width);

      setCharacter((prev) => {
        let newY = prev.y + prev.vy;
        let newVy = prev.vy + gravity;
        let isJumping = true;

        if (newY >= height - 200 - characterHeight) {
          newY = height - 200 - characterHeight;
          newVy = 0;
          isJumping = false;
        }

        const newFrame = (prev.frame + 1 / 5) % 4;
        return { ...prev, y: newY, vy: newVy, isJumping, frame: newFrame };
      });

      if (Math.random() < 0.05) {
        setJellies((prev) => [
          ...prev,
          { x: width, y: Math.random() * 200 + 50 },
        ]);
      }

      if (Math.random() < 0.03) {
        setObstacles((prev) => [
          ...prev,
          {
            x: width,
            y: height - 200 - obstacleHeight,
          },
        ]);
      }

      setJellies((prev) =>
        prev
          .map((jelly) => ({ ...jelly, x: jelly.x - 5 }))
          .filter((jelly) => jelly.x > -50)
      );

      setObstacles((prev) =>
        prev
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - 5 }))
          .filter((obstacle) => obstacle.x > -50)
      );

      jellies.forEach((jelly, index) => {
        if (
          character.x < jelly.x + 10 &&
          character.x + 100 > jelly.x &&
          character.y < jelly.y + 10 &&
          character.y + 100 > jelly.y
        ) {
          setJellies((prev) => prev.filter((_, i) => i !== index));
          setScore((prev) => prev + 1);
        }
      });

      obstacles.forEach((obstacle, index) => {
        if (
          character.x < obstacle.x + 20 &&
          character.x + 100 > obstacle.x &&
          character.y < obstacle.y + 20 &&
          character.y + 100 > obstacle.y
        ) {
          alert('Game Over!');
          setScore(0);
          setJellies([]);
          setObstacles([]);
          setCharacter({
            x: 50,
            y: height - 200 - characterHeight,
            vy: 0,
            isJumping: false,
            frame: 0,
          });
        }
      });
    }, 30);

    return () => clearInterval(interval);
  }, [character, jellies, obstacles, width, height]);

  return (
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
              width={80}
              height={80}
              image={characterImages[Math.floor(character.frame)]}
              scaleX={1.5}
              scaleY={1.5}
            />
            {debugMode && (
              <Rect
                x={character.x}
                y={character.y}
                width={100}
                height={100}
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
                  width={30}
                  height={30}
                  image={jellyImage}
                />
                {debugMode && (
                  <Rect
                    x={jelly.x}
                    y={jelly.y}
                    width={30}
                    height={30}
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
                  width={40}
                  height={40}
                  image={obstacleImage}
                />
                {debugMode && (
                  <Rect
                    x={obstacle.x}
                    y={obstacle.y}
                    width={40}
                    height={40}
                    stroke="green"
                    strokeWidth={2}
                  />
                )}
              </>
            )
        )}
      </Layer>
    </Stage>
  );
};

export default Game;
