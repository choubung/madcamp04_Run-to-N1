import React, { useState, useEffect } from 'react';

const TypingEffect = ({ text, speed, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[index]);
      index++;
      if (index === text.length) {
        clearInterval(interval);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <div style={{ color: 'white', fontSize: '24px', whiteSpace: 'pre-line' }}>
      {displayedText}
    </div>
  );
};

export default TypingEffect;
