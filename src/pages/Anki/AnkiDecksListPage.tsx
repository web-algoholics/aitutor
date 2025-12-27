import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Empty } from 'antd';
import LoadingDot from '../../components/LoadingDot';
import StatsCard from '../../components/StatsCard';
import { PlusOutlined, FileTextOutlined, EyeOutlined, PlayCircleOutlined, BookOutlined } from '@ant-design/icons';
import { Row, Col } from 'antd';
import { useGetDecksQuery } from '../../services/ankiApi';
import PageContainer from '../../components/PageContainer';
import SectionHeader from '../../components/SectionHeader';

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
  const isFromCourse = deck.source_type && deck.source_id;

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
      >
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
              justifyContent: 'space-between',
              padding: '32px',
              border: '2px solid hsl(0, 0%, 15%)',
              borderRadius: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onFlip(e);
            }}
          >
            {/* Course indicator in top left corner */}
            {isFromCourse && (
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOutlined style={{ fontSize: '16px', color: 'hsl(var(--primary))' }} />
                <Text style={{ fontSize: '14px', color: 'hsl(var(--primary))', fontWeight: 500 }}>
                  Из курса
                </Text>
              </div>
            )}
            {/* Card count in top right corner */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileTextOutlined style={{ fontSize: '16px', color: 'hsl(var(--primary))' }} />
              <Text style={{ fontSize: '14px', color: 'hsl(var(--primary))', fontWeight: 500 }}>
                {deck.cards_count}
              </Text>
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <Text style={{ margin: 0, color: '#000', textAlign: 'center', fontSize: '20px', fontWeight: 400, display: 'block' }}>
                {deck.title}
              </Text>
            </div>

            {/* Start button */}
            <div style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={(e) => {
                  onPractice();
                }}
                block
              >
                Начать
              </Button>
            </div>
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
              border: '2px solid hsl(0, 0%, 15%)',
              borderRadius: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              transform: 'rotateY(180deg)',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onFlip(e);
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
          <LoadingDot size="large" />
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
        <SectionHeader
          title="Колоды Anki"
          description="Карточки для запоминания и повторения материала"
          buttonText="Создать колоду"
          buttonIcon={<PlusOutlined />}
          onButtonClick={() => navigate('/anki/create')}
        />

        {/* Statistics */}
        {decks && decks.length > 0 && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <StatsCard
                title={totalDecks}
                subtitle="Всего колод"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatsCard
                title={totalCards}
                subtitle="Всего карточек"
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <StatsCard
                title={<EyeOutlined style={{ fontSize: '24px' }} />}
                subtitle="Нажми — посмотри описание"
              />
            </Col>
          </Row>
        )}

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
            />
          </Card>
        )}
      </Space>

    </PageContainer>
  );
}

