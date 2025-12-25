import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Progress, message } from 'antd';
import LoadingDot from '../../components/LoadingDot';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Confetti from 'react-confetti';
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
            <LoadingDot size="large" />
            <Text style={{ color: 'hsl(var(--primary))' }}>Загружаем карточки...</Text>
          </div>
        </Card>
      </PageContainer>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const knownCount = cardResults.filter(r => r === true).length;
  // totalReviewed should count cards that have been answered (not null)
  const totalReviewed = cardResults.filter(r => r !== null).length;
  const allCardsReviewed = showResults;
  // Progress based on current position, starting from 0% (returns when going back)
  // Show 100% when all cards are reviewed
  const progress = allCardsReviewed ? 100 : Math.round((currentIndex / deck.cards.length) * 100);
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowBack(false);
    }
  };

  const isLastCard = currentIndex === deck.cards.length - 1;
  const allCorrect = allCardsReviewed && knownCount === deck.cards.length;

  return (
    <PageContainer>
      {/* Confetti when all answers are correct */}
      {allCorrect && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Navigation */}
        <div className="mb-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/anki')}
          >
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
          <Progress percent={progress} strokeColor="hsl(222.2, 47.4%, 11.2%)" />
        </Card>

        {/* Card */}
        <div className="flex justify-center">
          <AnkiCard
            key={showResults ? 'results' : `card-${currentIndex}`}
            front={showResults ? deck.cards[deck.cards.length - 1].front : currentCard.front}
            back={showResults 
              ? `Поздравляем!\n\nВы прошли все карточки.\n\nВерно: ${knownCount} из ${deck.cards.length}\n\n${Math.round((knownCount / deck.cards.length) * 100)}%`
              : currentCard.back
            }
            isFlipped={showBack}
            onFlip={showResults ? undefined : handleFlip}
            onSwipeRight={showResults ? undefined : () => handleResult(true)}
            onSwipeLeft={showResults ? undefined : () => handleResult(false)}
          />
        </div>

        {/* Statistics - right under the card */}
        {totalReviewed > 0 && (
          <Card bordered={false}>
            <div className="text-center">
              <Space size="large" className="w-full justify-center" style={{ marginBottom: '8px' }}>
                <Text>
                  Знаю: <strong>{knownCount}</strong>
                </Text>
                <Text>
                  Не знаю: <strong>{totalReviewed - knownCount}</strong>
                </Text>
              </Space>
              <Text>
                Точность: <strong>{accuracyPercent}%</strong>
              </Text>
            </div>
          </Card>
        )}

        {/* Restart button - only show when completed */}
        {allCardsReviewed && (
          <div className="text-center">
            <Button
              size="large"
              onClick={handleRestart}
              className="bg-primary text-primary-foreground border-primary"
            >
              Ещё раз
            </Button>
          </div>
        )}

        {/* Swipe hint - only show when not completed */}
        {!allCardsReviewed && (
          <div className="text-center">
            <Text style={{ fontSize: '16px', color: 'hsl(var(--primary))', fontWeight: 500 }}>
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
                style={{ backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff', border: 'none' }}
              >
                Предыдущая карточка
              </Button>
            </Space>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
}

