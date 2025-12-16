import React, { useState, useEffect, ReactNode, useImperativeHandle, forwardRef } from 'react';

interface ExpandingCircleProps {
  children?: ReactNode;
  autoStart?: boolean;
  delay?: number;
  className?: string;
  onAnimationStart?: () => void;
}

export interface ExpandingCircleRef {
  collapse: () => void;
}

const ExpandingCircle = forwardRef<ExpandingCircleRef, ExpandingCircleProps>(({ 
  children, 
  autoStart = true, 
  delay = 1000,
  className = '',
  onAnimationStart
}, ref) => {
  const [animationStarted, setAnimationStarted] = useState(false);
  const [dotExpanding, setDotExpanding] = useState(false);
  const [collapsing, setCollapsing] = useState(false);

  const startAnimation = () => {
    if (!dotExpanding && !animationStarted && !collapsing) {
      setDotExpanding(true);
      setTimeout(() => {
        setAnimationStarted(true);
        if (onAnimationStart) {
          onAnimationStart();
        }
      }, 300); // После завершения анимации расширения
    }
  };

  const collapse = () => {
    if (animationStarted && !collapsing) {
      setCollapsing(true);
      setTimeout(() => {
        setAnimationStarted(false);
        setDotExpanding(false);
        setCollapsing(false);
      }, 300);
    }
  };

  useImperativeHandle(ref, () => ({
    collapse
  }));

  useEffect(() => {
    if (autoStart) {
      // Автоматический запуск анимации с задержкой
      const timer = setTimeout(() => {
        startAnimation();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [autoStart, delay]);

  return (
    <div 
      className={`starting-point-dot ${dotExpanding ? 'expanding' : ''} ${animationStarted ? 'show-content' : ''} ${collapsing ? 'collapsing' : ''} ${className}`}
      style={{ cursor: 'default' }}
    >
      {(animationStarted || collapsing) && children}
    </div>
  );
});

ExpandingCircle.displayName = 'ExpandingCircle';

export default ExpandingCircle;

