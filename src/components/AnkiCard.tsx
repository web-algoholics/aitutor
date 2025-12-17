import React, { useState, useRef } from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

interface AnkiCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export default function AnkiCard({ front, back, isFlipped, onFlip, onSwipeLeft, onSwipeRight }: AnkiCardProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const hasMoved = useRef(false);

  const SWIPE_THRESHOLD = 100;

  const handleStart = (clientX: number) => {
    startX.current = clientX;
    setIsDragging(true);
    hasMoved.current = false;
  };

  const handleMove = (clientX: number) => {
    if (!isDragging) return;
    const diff = clientX - startX.current;
    if (Math.abs(diff) > 10) {
      hasMoved.current = true;
    }
    setDragX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > SWIPE_THRESHOLD && onSwipeRight) {
      onSwipeRight();
    } else if (dragX < -SWIPE_THRESHOLD && onSwipeLeft) {
      onSwipeLeft();
    } else if (!hasMoved.current && onFlip) {
      onFlip();
    }

    setDragX(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Calculate visual feedback
  const rotation = dragX * 0.03;
  const opacity = Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1);
  const isSwipingRight = dragX > 30;
  const isSwipingLeft = dragX < -30;
  const isInteractive = onFlip || onSwipeLeft || onSwipeRight;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '450px',
        height: '400px',
        cursor: isInteractive ? 'grab' : 'default',
        margin: '0 auto',
        position: 'relative',
        userSelect: 'none',
      }}
      onMouseDown={isInteractive ? handleMouseDown : undefined}
      onMouseMove={isInteractive ? handleMouseMove : undefined}
      onMouseUp={isInteractive ? handleMouseUp : undefined}
      onMouseLeave={isInteractive ? handleMouseLeave : undefined}
      onTouchStart={isInteractive ? handleTouchStart : undefined}
      onTouchMove={isInteractive ? handleTouchMove : undefined}
      onTouchEnd={isInteractive ? handleTouchEnd : undefined}
    >
      {/* Swipe indicators */}
      {isSwipingRight && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            transform: 'translateY(-50%)',
            backgroundColor: '#000',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            opacity: opacity,
            zIndex: 10,
            fontWeight: 500,
          }}
        >
          Знаю →
        </div>
      )}
      {isSwipingLeft && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            backgroundColor: '#000',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            opacity: opacity,
            zIndex: 10,
            fontWeight: 500,
          }}
        >
          ← Не знаю
        </div>
      )}

      {/* Drag container - moves horizontally */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: isDragging ? 'none' : 'transform 0.3s ease',
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
        }}
      >
        {/* Flip container - handles rotation */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front side */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              border: '2px solid #666666',
              borderRadius: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ textAlign: 'center', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Text style={{ display: 'block', marginBottom: '16px', fontSize: '14px', color: '#000' }}>
                Вопрос
              </Text>
              <Title level={2} style={{ margin: 0 }}>{front}</Title>
            </div>
            <Text style={{ fontSize: '12px', color: '#000', opacity: 0.5 }}>
              Нажмите, чтобы показать ответ
            </Text>
          </div>

          {/* Back side */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px',
              border: '2px solid #666666',
              borderRadius: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'rotateY(180deg)',
            }}
          >
            <div style={{ textAlign: 'center', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Text style={{ display: 'block', marginBottom: '16px', fontSize: '14px', color: '#000' }}>
                Ответ
              </Text>
              <Title level={3} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{back}</Title>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

