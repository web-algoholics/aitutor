import React, { useState, useRef, useEffect } from 'react';
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
  const MAX_SWIPE_DISTANCE = 150; // Maximum swipe distance in pixels (limited to container width)


  // Global mouse/touch event handlers for tracking movement outside the card
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!onSwipeLeft && !onSwipeRight) return;
      const diff = e.clientX - startX.current;
      if (Math.abs(diff) > 10) {
        hasMoved.current = true;
      }
      const limitedDiff = Math.max(-MAX_SWIPE_DISTANCE, Math.min(MAX_SWIPE_DISTANCE, diff));
      setDragX(limitedDiff);
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // Get current dragX value from state
      setDragX((currentDragX) => {
        // Actions only trigger on release
        if (currentDragX > SWIPE_THRESHOLD && onSwipeRight) {
          onSwipeRight();
        } else if (currentDragX < -SWIPE_THRESHOLD && onSwipeLeft) {
          onSwipeLeft();
        } else if (!hasMoved.current && onFlip) {
          onFlip();
        }
        return 0;
      });
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!onSwipeLeft && !onSwipeRight) return;
      if (e.touches.length > 0) {
        const diff = e.touches[0].clientX - startX.current;
        if (Math.abs(diff) > 10) {
          hasMoved.current = true;
        }
        const limitedDiff = Math.max(-MAX_SWIPE_DISTANCE, Math.min(MAX_SWIPE_DISTANCE, diff));
        setDragX(limitedDiff);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      // Get current dragX value from state
      setDragX((currentDragX) => {
        // Actions only trigger on release
        if (currentDragX > SWIPE_THRESHOLD && onSwipeRight) {
          onSwipeRight();
        } else if (currentDragX < -SWIPE_THRESHOLD && onSwipeLeft) {
          onSwipeLeft();
        } else if (!hasMoved.current && onFlip) {
          onFlip();
        }
        return 0;
      });
    };

    // Add global event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      // Cleanup: remove global event listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isDragging, onSwipeLeft, onSwipeRight, onFlip]);

  // Mouse events - only for starting drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    // Don't allow dragging if swipe handlers are not provided
    if (!onSwipeLeft && !onSwipeRight) return;
    startX.current = e.clientX;
    setIsDragging(true);
    hasMoved.current = false;
  };

  // Touch events - only for starting drag
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't allow dragging if swipe handlers are not provided
    if (!onSwipeLeft && !onSwipeRight) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
    hasMoved.current = false;
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
      onTouchStart={isInteractive ? handleTouchStart : undefined}
    >
      {/* Swipe indicators */}
      {isSwipingRight && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '20px',
            transform: 'translateY(-50%)',
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
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
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
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
          transition: isDragging ? 'transform 0.05s ease-out' : 'transform 0.3s ease',
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          willChange: isDragging ? 'transform' : 'auto',
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
              border: '2px solid hsl(0, 0%, 15%)',
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
              border: '2px solid hsl(0, 0%, 15%)',
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

