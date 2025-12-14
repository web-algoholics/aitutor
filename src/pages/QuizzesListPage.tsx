import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Spin,
  Row,
  Col,
} from 'antd';
import {
  FormOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useGetQuizzesQuery, type QuizSummaryResponse } from '../services/quizzesApi';
const { Title, Text, Paragraph } = Typography;

const QuizzesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: quizzes, isLoading, error } = useGetQuizzesQuery();

  const handleCreateQuiz = () => {
    navigate('/quizzes/create');
  };

  const handleQuizClick = (quizId: number) => {
    navigate(`/quizzes/${quizId}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-5">
        <Card>
          <Empty
            description="Ошибка загрузки квизов"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  const completedQuizzes = quizzes?.filter(q => q.is_completed) || [];
  const totalQuizzes = quizzes?.length || 0;

  return (
    <div className="max-w-6xl mx-auto p-5">
      <Space direction="vertical" size="large" className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={1} className="mb-2">
              <FormOutlined style={{ marginRight: '16px' }} />
              Мои квизы
            </Title>
            <Paragraph className="text-base text-gray-600 mb-0">
              Созданные и пройденные квизы для проверки знаний
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<FormOutlined />}
            onClick={handleCreateQuiz}
            className="h-12 text-base"
          >
            Создать квиз
          </Button>
        </div>

        {/* Stats */}
        {totalQuizzes > 0 && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Card className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {totalQuizzes}
                </div>
                <Text type="secondary">Всего квизов</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {completedQuizzes.length}
                </div>
                <Text type="secondary">Пройдено</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {totalQuizzes - completedQuizzes.length}
                </div>
                <Text type="secondary">Не начато</Text>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quizzes List */}
        {!quizzes || quizzes.length === 0 ? (
          <Card>
            <Empty
              description="У вас пока нет квизов"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button type="primary" icon={<FormOutlined />} onClick={handleCreateQuiz}>
                Создать первый квиз
              </Button>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]} style={{ display: 'flex' }}>
            {quizzes.map((quiz) => (
              <Col xs={24} sm={12} lg={8} key={quiz.id} style={{ display: 'flex' }}>
                <Card
                  hoverable
                  className="w-full shadow-sm hover:shadow-md transition-shadow flex flex-col"
                  actions={[
                    <div key="start" className="text-center py-2">
                      <Button
                        type={quiz.is_completed ? "default" : "primary"}
                        icon={<PlayCircleOutlined />}
                        onClick={() => handleQuizClick(quiz.id)}
                      >
                        {quiz.is_completed ? 'Перепройти' : 'Пройти квиз'}
                      </Button>
                    </div>,
                  ]}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-3">
                      <FileTextOutlined className="text-2xl text-blue-500 mr-2 flex-shrink-0" />
                      <Tag
                        color={quiz.is_completed ? 'success' : 'default'}
                        icon={quiz.is_completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                        className="flex-shrink-0"
                      >
                        {quiz.is_completed ? 'Пройден' : 'Не начат'}
                      </Tag>
                    </div>
                    
                    <Title level={4} className="mb-4 flex-grow" style={{ minHeight: '64px' }} ellipsis={{ rows: 2 }}>
                      {quiz.title}
                    </Title>
                    
                    <div className="mt-auto pt-2">
                      <Space direction="vertical" size="small" className="w-full">
                        <Text type="secondary" className="text-sm">
                          <FileTextOutlined /> {quiz.questions_count} вопросов
                        </Text>
                        <Text type="secondary" className="text-sm">
                          <ClockCircleOutlined /> {formatDate(quiz.created_at)}
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </div>
  );
};

export default QuizzesListPage;

