import React from 'react';
import './Info.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Info = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const creators = [
    {
      name: '이수연',
      github: 'https://github.com/choubung',
      //소속 쓸까 말까
      image: require('./images/profile_suyeon.png'),
    },
    {
      name: '김은서',
      github: 'https://github.com/rladmstj',
      image: require('./images/profile_eunseo.png'),
    },
  ];
  const goBack = () => {
    if (user) {
      navigate('/mainhome');
    } else {
      navigate('/');
    }
  };

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

      <img
        onClick={goBack}
        src={require('./images/back_button.png')}
        className="back-button"
      />
    </div>
  );
};

export default Info;
