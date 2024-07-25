// BackgroundMusic.js
import React, { useEffect } from 'react';

const BackgroundMusic = () => {
  useEffect(() => {
    const audio = new Audio('/MP_가볍게 떠나는 여행.mp3');
    audio.loop = true;
    audio.volume = 0.5;

    const playAudio = () => {
      audio.play().catch((error) => {
        console.error('Error playing the audio:', error);
      });
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);

    return () => {
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
      audio.pause();
    };
  }, []);

  return null;
};

export default BackgroundMusic;
