import React, { useEffect, useState } from 'react';
import { Button, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import Logo from '../Logo';

const { Title, Paragraph } = Typography;

export default function HeroSection() {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [dotExpanding, setDotExpanding] = useState(false);
  const [collapsing, setCollapsing] = useState(false);
  const [logoVisible, setLogoVisible] = useState(true);
  const [logoFadeIn, setLogoFadeIn] = useState(false);
  const [logoWhite, setLogoWhite] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    setCollapsing(true);
    setLogoVisible(false);
    setTimeout(() => navigate(path), 320); // даём завершиться анимации сужения (0.3s)
  };

  useEffect(() => {
    setLogoFadeIn(true); // fade-up on initial appearance

    const START_DELAY = 1000;      // задержка перед автозапуском круга
    const EXPAND_DURATION = 300;  // длительность расширения точки
    const CONTENT_ANIMATION_TOTAL = 900; // дождаться появления текста внутри круга
    const COLOR_START_DELAY = 80; // чтобы цвет менялся на глазах после появления

    let startTimer: ReturnType<typeof setTimeout> | undefined;
    let expandTimer: ReturnType<typeof setTimeout> | undefined;
    let logoReturnTimer: ReturnType<typeof setTimeout> | undefined;
    let colorTimer: ReturnType<typeof setTimeout> | undefined;

    // Автостарт анимации круга с задержкой
    startTimer = setTimeout(() => {
      // прячем логотип на время раскрытия круга
      setLogoVisible(false);
      setLogoWhite(false);
      setDotExpanding(true);

      // завершение расширения точки -> показать контент
      expandTimer = setTimeout(() => {
        setAnimationStarted(true);

        // логотип появляется после того, как проявится текст внутри круга
        logoReturnTimer = setTimeout(() => {
          setLogoVisible(true);
          colorTimer = setTimeout(() => setLogoWhite(true), COLOR_START_DELAY);
        }, CONTENT_ANIMATION_TOTAL);
      }, EXPAND_DURATION);
    }, START_DELAY);

    return () => {
      if (startTimer) clearTimeout(startTimer);
      if (expandTimer) clearTimeout(expandTimer);
      if (logoReturnTimer) clearTimeout(logoReturnTimer);
      if (colorTimer) clearTimeout(colorTimer);
    };
  }, []);

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center justify-center px-6 relative">
      <div
        style={{
          position: 'absolute',
          top: 'calc(50% - 176px)',
          left: 0,
          right: 0,
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: animationStarted ? 30 : 9,
          opacity: logoVisible ? 1 : 0,
          transition: `${logoVisible ? 'opacity 1.2s ease' : 'opacity 0.25s ease'}, transform 0.6s ease, z-index 0s linear 0.3s`,
        }}
      >
        <div className={`fade-in-up ${logoFadeIn ? 'visible' : ''}`}>
          <Logo
            to={undefined}
            className="text-4xl md:text-5xl"
            genColor={logoWhite ? '#ffffff' : '#000'}
            dotColor={logoWhite ? '#ffffff' : '#000'}
            style={{
              textShadow: logoWhite ? '0 0 14px rgba(0,0,0,0.25)' : 'none',
              transition: 'text-shadow 1.2s ease',
              pointerEvents: 'none',
              cursor: 'default',
            }}
          />
        </div>
      </div>

      {!animationStarted && (
        <Title 
          level={1} 
          className="text-6xl md:text-7xl font-bold text-gray-900 z-10 absolute title-fade-in"
          style={{ 
            top: '50%', 
            left: '50%', 
            width: '100%',
            textAlign: 'center',
            margin: 0,
            padding: 0
          }}
        >
          Точка старта в обучении с ИИ
        </Title>
      )}
      
      <div 
        className={`starting-point-dot ${dotExpanding ? 'expanding' : ''} ${animationStarted ? 'show-content' : ''} ${collapsing ? 'collapsing' : ''}`}
        style={{ pointerEvents: animationStarted ? 'auto' : 'none' }}
      >
        {animationStarted && !collapsing && (
          <div className="max-w-6xl mx-auto text-center z-10 px-6" style={{ position: 'relative', zIndex: 10 }}>
            <Title level={1} className="text-4xl md:text-5xl font-bold mb-6 text-fade-to-white">
              <span className="text-fade-to-white text-3xl">
              Полное обучение с ИИ
              </span>
              <br />
              <span className="text-fade-to-white text-3xl">от теории до практики</span>
            </Title>
            <Paragraph className="text-xl text-fade-to-white mb-8 max-w-2xl mx-auto">
              AI Tutor - комплексная платформа для обучения программированию и IT.
              Создавайте персонализированные курсы с помощью ИИ, проходите интерактивные тесты,
              практикуйтесь с Anki-карточками и общайтесь с персональным ИИ-тьютором.
            </Paragraph>
            <Space size="large" className="flex-wrap justify-center text-fade-to-white">
              <Button
                type="default"
                size="large"
                className="h-12 px-8 min-w-[160px]"
                onClick={() => handleNavigate('/register')}
              >
                Начать бесплатно
              </Button>
              <Button
                type="default"
                size="large"
                className="h-12 px-8 min-w-[160px]"
                onClick={() => handleNavigate('/login')}
              >
                Войти
              </Button>
            </Space>
          </div>
        )}
      </div>
    </section>
  );
}

