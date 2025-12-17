import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Progress, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useGetDeckQuery } from '../../services/ankiApi';
import PageContainer from '../../components/PageContainer';
import AnkiCard from '../../components/AnkiCard';

const { Title, Text } = Typography;

export default function AnkiPracticePage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { data: deck, isLoading } = useGetDeckQuery(parseInt(deckId!));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [cardResults, setCardResults] = useState<(boolean | null)[]>([]); // Track if user knew the answer (null = not answered yet)
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (deck) {
      setCardResults(new Array(deck.cards.length).fill(null));
    }
  }, [deck]);

  if (isLoading || !deck) {
    return (
      <PageContainer>
        <Card bordered={false} className="min-h-[300px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spin size="large" />
            <Text style={{ color: '#000' }}>Загружаем карточки...</Text>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const knownCount = cardResults.filter(r => r === true).length;
  // totalReviewed should count cards that have been answered (not null)
  const totalReviewed = cardResults.filter(r => r !== null).length;
  // Progress based on answered cards (starts from 0)
  const progress = Math.round((totalReviewed / deck.cards.length) * 100);
  // Calculate accuracy percentage and ensure it's a whole number
  const accuracyPercent = totalReviewed > 0 ? Math.round((knownCount / totalReviewed) * 100) : 0;

  const handleFlip = () => {
    setShowBack(!showBack);
  };

  const handleResult = (knewIt: boolean) => {
    const newResults = [...cardResults];
    newResults[currentIndex] = knewIt;
    setCardResults(newResults);
    
    // If it's the last card, show results with flip animation
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(false);
    } else {
      // Last card - return card then flip to show results
      setShowBack(false);
      setTimeout(() => {
        setShowResults(true);
        setTimeout(() => {
          setShowBack(true); // flip to show results
        }, 100);
      }, 350);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowBack(false);
    setCardResults(new Array(deck.cards.length).fill(null));
    setShowResults(false);
  };

  const handleNext = () => {
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowBack(false);
    }
  };

  const isLastCard = currentIndex === deck.cards.length - 1;
  const allCardsReviewed = showResults;

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Navigation */}
        <div className="mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/anki')}>
            К списку колод
          </Button>
        </div>

        {/* Header */}
        <Card bordered={false}>
          <div className="flex items-center justify-between mb-4">
            <Title level={3}>{deck.title}</Title>
            <Text style={{ color: '#000', opacity: 0.5 }}>
              Карточка {currentIndex + 1} из {deck.cards.length}
            </Text>
          </div>
          <Progress percent={progress} strokeColor="#000" />
        </Card>

        {/* Statistics */}
        {totalReviewed > 0 && (
          <Card bordered={false}>
            <Space size="large">
              <Text>
                Знаю: <strong>{knownCount}</strong>
              </Text>
              <Text>
                Не знаю: <strong>{totalReviewed - knownCount}</strong>
              </Text>
              <Text>
                Точность: <strong>{accuracyPercent}%</strong>
              </Text>
            </Space>
          </Card>
        )}

        {/* Card */}
        <div className="flex justify-center">
          <AnkiCard
            front={showResults ? deck.cards[deck.cards.length - 1].front : currentCard.front}
            back={showResults 
              ? `Поздравляем!\n\nВы прошли все карточки.\n\nЗнаю: ${knownCount} из ${deck.cards.length}\n\n${Math.round((knownCount / deck.cards.length) * 100)}%`
              : currentCard.back
            }
            isFlipped={showBack}
            onFlip={showResults ? undefined : handleFlip}
            onSwipeRight={showResults ? undefined : () => handleResult(true)}
            onSwipeLeft={showResults ? undefined : () => handleResult(false)}
          />
        </div>

        {/* Restart button - only show when completed */}
        {allCardsReviewed && (
          <div className="text-center">
            <Button
              size="large"
              onClick={handleRestart}
            >
              Ещё раз
            </Button>
          </div>
        )}

        {/* Swipe hint - only show when not completed */}
        {!allCardsReviewed && (
          <div className="text-center">
            <Text style={{ fontSize: '14px', color: '#000', opacity: 0.5 }}>
              ← Свайп влево — не знаю | Свайп вправо — знаю →
            </Text>
          </div>
        )}

        {/* Navigation buttons - only show when not completed */}
        {!allCardsReviewed && (
          <Card bordered={false}>
            <Space className="w-full justify-between">
              <Button
                disabled={currentIndex === 0}
                onClick={handlePrevious}
              >
                Назад
              </Button>
              
              {showBack && (
                <Button
                  type="default"
                  onClick={handleNext}
                >
                  Следующая карточка
                </Button>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
}

