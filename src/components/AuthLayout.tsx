import React, { ReactNode, useCallback, useMemo, useRef, createContext, useContext } from 'react';
import { Typography, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ExpandingCircle, { ExpandingCircleRef } from './ExpandingCircle';
import ThemeToggle from './ThemeToggle';

const { Title } = Typography;

interface CircleAnimationValue {
  collapse: () => void;
}

const CircleAnimationContext = createContext<CircleAnimationValue>({
  collapse: () => {},
});

export const useCircleAnimation = () => useContext(CircleAnimationContext);

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  animationDelay?: number;
}

export default function AuthLayout({ children, title, animationDelay = 1000 }: AuthLayoutProps) {
  const navigate = useNavigate();
  const circleRef = useRef<ExpandingCircleRef>(null);

  const collapse = useCallback(() => {
    circleRef.current?.collapse();
  }, []);

  const contextValue = useMemo(() => ({ collapse }), [collapse]);

  return (
    <CircleAnimationContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2 sm:p-4 relative">
        <ThemeToggle zIndex={1001} />
        <ExpandingCircle
          ref={circleRef}
          autoStart={true}
          delay={animationDelay}
        >
          <div 
            className="max-w-md mx-auto text-center z-10 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-12" 
            style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '100%' }}
          >
            {title && (
              <Title 
                level={2} 
                className="text-fade-to-white mb-4 sm:mb-6 md:mb-8"
                style={{ 
                  color: '#ffffff',
                  fontSize: 'clamp(1.125rem, 4vw, 2rem)',
                  marginBottom: 'clamp(0.75rem, 2vw, 2rem)',
                  paddingLeft: '0.5rem',
                  paddingRight: '0.5rem'
                }}
              >
                {title}
              </Title>
            )}
            <div 
              className="text-fade-to-white" 
              style={{ 
                color: '#ffffff',
                fontSize: 'clamp(0.8125rem, 2vw, 1rem)',
                width: '100%'
              }}
            >
              {children}
            </div>
            <div 
              style={{ 
                marginTop: 'clamp(1rem, 3vw, 2rem)',
                display: 'flex',
                justifyContent: 'center',
                zIndex: 20,
                paddingTop: '0.5rem'
              }}
            >
              <Button
                type="text"
                icon={<ArrowLeftOutlined style={{ fontSize: 'clamp(16px, 2vw, 18px)' }} />}
                onClick={() => {
                  collapse();
                  setTimeout(() => navigate(-1), 320);
                }}
                className="text-fade-to-white"
                style={{ 
                  color: '#ffffff', 
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  padding: 'clamp(4px, 1vw, 8px) clamp(8px, 2vw, 16px)'
                }}
                size="middle"
              >
                Назад
              </Button>
            </div>
          </div>
        </ExpandingCircle>
      </div>
    </CircleAnimationContext.Provider>
  );
}
