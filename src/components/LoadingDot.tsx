import React from 'react';
import './LoadingDot.css';

interface LoadingDotProps {
  size?: 'small' | 'default' | 'large';
}

const LoadingDot: React.FC<LoadingDotProps> = ({ size = 'default' }) => {
  const sizeClass = size === 'small' ? 'loading-dot-small' : size === 'large' ? 'loading-dot-large' : 'loading-dot-default';

  return (
    <div className={`loading-dot-container ${sizeClass}`}>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
      <div className="loading-dot"></div>
    </div>
  );
};

export default LoadingDot;

