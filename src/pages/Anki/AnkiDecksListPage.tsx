import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Empty, Spin } from 'antd';
import { PlusOutlined, FileTextOutlined, ArrowUpOutlined, EyeOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import { useGetDecksQuery } from '../../services/ankiApi';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

interface DeckCardProps {
  deck: any;
  isFlipped: boolean;
  onFlip: (e: React.MouseEvent) => void;
  onPractice: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, isFlipped, onFlip, onPractice }) => {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const hasMoved = useRef(false);
  const SWIPE_UP_THRESHOLD = 100;

  const handleSwipeStart = (clientY: number) => {
    startY.current = clientY;
    setIsDragging(true);
    hasMoved.current = false;
  };

  const handleSwipeMove = (clientY: number) => {
    if (!isDragging) return;
    const diff = startY.current - clientY; // Negative for upward swipe
    if (Math.abs(diff) > 5) {
      hasMoved.current = true;
    }
    setDragY(diff);
  };

  const handleSwipeEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragY > SWIPE_UP_THRESHOLD && !isFlipped) {
      // Swipe up detected - go to practice
      onPractice();
    }

    setDragY(0);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSwipeStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleSwipeMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleSwipeEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleSwipeEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleSwipeStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSwipeMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  return (
    <div className="deck-card-wrapper" style={{ width: '100%' }}>
      <div
        className="deck-card-container"
        style={{
          width: '100%',
          aspectRatio: '1',
          position: 'relative',
          marginBottom: '16px',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Deck effect layers - only show when not flipped */}
        {!isFlipped && (
          <div
            className="deck-card-layer deck-card-back-2"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              border: '2px solid #666666',
              borderRadius: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              transform: 'translate(4px, 4px)',
              transition: 'transform 0.3s ease',
              zIndex: 1,
            }}
          />
        )}
        {/* Flip container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s ease',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            zIndex: 3,
            willChange: 'transform',
          }}
        >
          {/* Front side - Title with card count */}
          <div
            className="deck-card-front"
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
              transition: isDragging ? 'none' : 'transform 0.3s ease, box-shadow 0.3s ease',
              transform: `translateY(${-dragY * 0.2}px)`,
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!hasMoved.current) {
                onFlip(e);
              }
            }}
          >
            {/* Card count in top right corner */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileTextOutlined style={{ fontSize: '18px', color: '#000' }} />
              <Text style={{ fontSize: '16px', color: '#000', fontWeight: 500 }}>
                {deck.cards_count}
              </Text>
            </div>
            
            <Text style={{ margin: 0, color: '#000', textAlign: 'center', fontSize: '20px', fontWeight: 400, display: 'block' }}>
              {deck.title}
            </Text>
          </div>

          {/* Back side - Description only */}
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
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!hasMoved.current) {
                onFlip(e);
              }
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center' }}>
              {deck.description ? (
                <Text style={{ display: 'block', color: '#000', opacity: 0.7, textAlign: 'center' }}>
                  {deck.description.length > 200 ? `${deck.description.slice(0, 200)}...` : deck.description}
                </Text>
              ) : (
                <Text style={{ display: 'block', color: '#000', opacity: 0.5, textAlign: 'center', fontStyle: 'italic' }}>
                  Описание отсутствует
                </Text>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AnkiDecksListPage() {
  const navigate = useNavigate();
  const { data: decks, isLoading } = useGetDecksQuery();
  const [flippedDecks, setFlippedDecks] = useState<Set<number>>(new Set());

  const handlePracticeClick = (deckId: number) => {
    navigate(`/anki/decks/${deckId}/practice`);
  };

  const handleCardFlip = (deckId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedDecks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deckId)) {
        newSet.delete(deckId);
      } else {
        newSet.add(deckId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  const totalDecks = decks?.length || 0;
  const totalCards = decks?.reduce((sum, deck) => sum + deck.cards_count, 0) || 0;

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
              Колоды Anki
            </Title>
          </div>
          <Paragraph className="text-base text-gray-600 mb-4" style={{ textAlign: 'center' }}>
            Карточки для запоминания и повторения материала
          </Paragraph>
          <Button
            icon={<PlusOutlined />}
            size="large"
            onClick={() => navigate('/anki/create')}
            style={{ backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
          >
            Создать колоду
          </Button>
        </div>

        {/* Statistics */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Title level={3} className="mb-2">{totalDecks}</Title>
              <Text type="secondary">Всего колод</Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Title level={3} className="mb-2">
                <ArrowUpOutlined style={{ fontSize: '24px' }} />
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                Свайпай вверх — перейди к карточкам
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Title level={3} className="mb-2">
                <EyeOutlined style={{ fontSize: '24px' }} />
              </Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>
                Нажми — посмотри описание
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Decks List */}
        {decks && decks.length > 0 ? (
          <Row gutter={[16, 16]} style={{ display: 'flex' }}>
            {decks.map((deck) => {
              const isFlipped = flippedDecks.has(deck.id);
              return (
                <Col xs={24} sm={12} md={8} key={deck.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <DeckCard
                    deck={deck}
                    isFlipped={isFlipped}
                    onFlip={(e) => handleCardFlip(deck.id, e)}
                    onPractice={() => handlePracticeClick(deck.id)}
                  />
                </Col>
              );
            })}
          </Row>
        ) : (
          <Card bordered={false}>
            <Empty
              description="У вас пока нет колод"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                icon={<PlusOutlined />}
                onClick={() => navigate('/anki/create')}
                style={{ backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
              >
                Создать первую колоду
              </Button>
            </Empty>
          </Card>
        )}
      </Space>

    </PageContainer>
  );
}

