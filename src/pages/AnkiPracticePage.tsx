import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Space, Typography, Progress, message, Spin } from 'antd';
import { ArrowLeftOutlined, EyeOutlined, EyeInvisibleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useGetDeckQuery } from '../services/ankiApi';

const { Title, Text } = Typography;

export default function AnkiPracticePage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { data: deck, isLoading } = useGetDeckQuery(parseInt(deckId!));
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [cardResults, setCardResults] = useState<(boolean | null)[]>([]); // Track if user knew the answer (null = not answered yet)

  useEffect(() => {
    if (deck) {
      setCardResults(new Array(deck.cards.length).fill(null));
    }
  }, [deck]);

  if (isLoading || !deck) {
    return (
      <div className="max-w-4xl mx-auto p-5">
        <Spin size="large" />
      </div>
    );
  }

  const currentCard = deck.cards[currentIndex];
  const progress = ((currentIndex + 1) / deck.cards.length) * 100;
  const knownCount = cardResults.filter(r => r === true).length;
  // totalReviewed should count cards that have been answered (not null)
  const totalReviewed = cardResults.filter(r => r !== null).length;
  // Calculate accuracy percentage and ensure it's a whole number
  const accuracyPercent = totalReviewed > 0 ? Math.round((knownCount / totalReviewed) * 100) : 0;

  const handleFlip = () => {
    setShowBack(!showBack);
  };

  const handleResult = (knewIt: boolean) => {
    const newResults = [...cardResults];
    newResults[currentIndex] = knewIt;
    setCardResults(newResults);
    
    // If it's the last card, keep showing the back side
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowBack(false);
    }
    // For the last card, just update the result and keep showBack true
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
  const allCardsReviewed = currentIndex === deck.cards.length - 1 && showBack;

  return (
    <div className="max-w-4xl mx-auto p-5">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Navigation */}
        <div className="mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/anki')}>
            К списку колод
          </Button>
        </div>

        {/* Header */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <Title level={3}>{deck.title}</Title>
            <Text type="secondary">
              Карточка {currentIndex + 1} из {deck.cards.length}
            </Text>
          </div>
          <Progress percent={progress} status="active" />
        </Card>

        {/* Statistics */}
        {totalReviewed > 0 && (
          <Card>
            <Space size="large">
              <Text>
                Знаю: <strong className="text-green-600">{knownCount}</strong>
              </Text>
              <Text>
                Не знаю: <strong className="text-red-600">{totalReviewed - knownCount}</strong>
              </Text>
              <Text>
                Точность: <strong>{Math.round(accuracyPercent)}%</strong>
              </Text>
            </Space>
          </Card>
        )}

        {/* Card */}
        <Card className="min-h-[400px] flex flex-col">
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center w-full">
              {!showBack ? (
                <div>
                  <Text type="secondary" className="block mb-4 text-sm">Вопрос</Text>
                  <Title level={2} className="mb-0">{currentCard.front}</Title>
                </div>
              ) : (
                <div>
                  <Text type="secondary" className="block mb-4 text-sm">Ответ</Text>
                  <Title level={3} className="mb-0 whitespace-pre-wrap">{currentCard.back}</Title>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-4 mt-auto">
            {!showBack ? (
              <div className="text-center mt-4">
                <Button
                  type="primary"
                  size="large"
                  icon={<EyeOutlined />}
                  onClick={handleFlip}
                >
                  Показать ответ
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <Text type="secondary">Вы знали ответ?</Text>
                </div>
                <Space size="large" className="w-full justify-center">
                  <Button
                    size="large"
                    icon={<CheckOutlined />}
                    className="bg-green-500 border-green-500 hover:bg-green-600 hover:border-green-600"
                    onClick={() => handleResult(true)}
                  >
                    Знаю
                  </Button>
                  <Button
                    size="large"
                    icon={<CloseOutlined />}
                    className="bg-red-500 border-red-500 hover:bg-red-600 hover:border-red-600"
                    onClick={() => handleResult(false)}
                  >
                    Не знаю
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </Card>

        {/* Navigation buttons */}
        <Card>
          <Space className="w-full justify-between">
            <Button
              disabled={currentIndex === 0}
              onClick={handlePrevious}
            >
              Назад
            </Button>
            
            {showBack && !allCardsReviewed && (
              <Button
                type="default"
                onClick={handleNext}
              >
                Следующая карточка
              </Button>
            )}

            {allCardsReviewed && (
              <Button
                type="primary"
                onClick={() => {
                  message.success('Вы прошли все карточки!');
                  navigate('/anki');
                }}
              >
                Завершить
              </Button>
            )}
          </Space>
        </Card>

        {/* Completion Message */}
        {allCardsReviewed && (
          <Card className="bg-green-50 border-green-200">
            <div className="text-center">
              <Title level={4} className="text-green-700">
                🎉 Поздравляем!
              </Title>
              <Text className="text-green-600">
                Вы прошли все карточки в этой колоде.
              </Text>
              <div className="mt-4">
                <Text strong className="block mb-2">Результаты:</Text>
                <Text>Знаю: {knownCount} карточек ({Math.round((knownCount / deck.cards.length) * 100)}%)</Text>
              </div>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
}

