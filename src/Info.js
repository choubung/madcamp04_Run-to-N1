import React from 'react';
import './Info.css';

const Info = () => {
  const creators = [
    {
      name: '이수연',
      github: 'https://github.com/choubung',
      image: require('./images/profile_suyeon.png'),
    },
    {
      name: '김은서',
      github: 'https://github.com/rladmstj',
      image: require('./images/profile_eunseo.png'),
    },
  ];

  return (
    <div className="info">
      <h1>크레딧</h1>
      <div className="creators">
        {creators.map((creator, index) => (
          <div className="credit-item" key={index}>
            <img
              src={creator.image}
              alt={`${creator.name} 이미지`}
              className="dot-image"
            />
            <p>{creator.name}</p>
            <p>
              GitHub:{' '}
              <a
                href={creator.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                {creator.github}
              </a>
            </p>
          </div>
        ))}
      </div>
      <div className="quote">
        <p>난 가끔 그리울 것 같아 어리석었던</p>
        <p>
          그래서 더 달리고 달렸던 날들 - <em>Youth, 기현</em>
        </p>
      </div>
    </div>
  );
};

export default Info;
