import React, { useState } from 'react';
import { Button, Typography, Space } from 'antd';
import { RocketOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function HeroSection() {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [dotExpanding, setDotExpanding] = useState(false);

  const handleDotClick = () => {
    setDotExpanding(true);
    setTimeout(() => {
      setAnimationStarted(true);
    }, 300); // После завершения анимации расширения
  };

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen flex items-center justify-center px-6 relative">
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
          Your AI education starting point
        </Title>
      )}
      
      <div 
        className={`starting-point-dot ${dotExpanding ? 'expanding' : ''} ${animationStarted ? 'show-content' : ''}`}
        onClick={!animationStarted ? handleDotClick : undefined}
        title={!animationStarted ? "Click to start" : undefined}
      >
        {animationStarted && (
          <div className="max-w-6xl mx-auto text-center z-10 px-6" style={{ position: 'relative', zIndex: 10 }}>
            <Title level={1} className="text-5xl md:text-6xl font-bold mb-6 text-fade-to-white">
              <span className="text-fade-to-white">
              Create courses on any topic
              </span>
              <br />
              <span className="text-fade-to-white">with AI</span>
            </Title>
            <Paragraph className="text-xl text-fade-to-white mb-8 max-w-2xl mx-auto">
              EdGen is a platform for generating personalized learning courses. 
              Simply specify a topic, and our AI will create a complete learning program 
              with lessons, assignments, and projects for you.
            </Paragraph>
            <Space size="large" className="flex-wrap justify-center text-fade-to-white">
              <Link to="/register">
                <Button type="primary" size="large" className="h-12 px-8">
                  Get Started Free
                  <ArrowRightOutlined className="ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="large" className="h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </Space>
          </div>
        )}
      </div>
    </section>
  );
}

