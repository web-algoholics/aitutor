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
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useGetQuizzesQuery, type QuizSummaryResponse } from '../../services/quizzesApi';
import PageContainer from '../../components/PageContainer';
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
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
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
      </PageContainer>
    );
  }

  const completedQuizzes = quizzes?.filter(q => q.is_completed) || [];
  const totalQuizzes = quizzes?.length || 0;

  return (
    <PageContainer>
      <Space direction="vertical" size="large" className="w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Title level={2} className="mb-2">
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
              <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{totalQuizzes}</Title>
                <Text type="secondary">Всего квизов</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{completedQuizzes.length}</Title>
                <Text type="secondary">Пройдено</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{totalQuizzes - completedQuizzes.length}</Title>
                <Text type="secondary">Не начато</Text>
              </Card>
            </Col>
          </Row>
        )}

        {/* Quizzes List */}
        {!quizzes || quizzes.length === 0 ? (
          <Card bordered={false}>
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
                <div
                  style={{
                    width: '100%',
                    border: '2px solid #666666',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '32px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                  }}
                  onClick={() => handleQuizClick(quiz.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Question count in top right corner */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileTextOutlined style={{ fontSize: '18px', color: '#000' }} />
                    <Text style={{ fontSize: '16px', color: '#000', fontWeight: 500 }}>
                      {quiz.questions_count}
                    </Text>
                  </div>

                  <div className="flex flex-col h-full" style={{ alignItems: 'center', justifyContent: 'center' }}>
                    {/* Large icon */}
                    <div style={{ marginBottom: '16px' }}>
                      {quiz.is_completed ? (
                        <ExclamationCircleOutlined style={{ fontSize: '64px', color: '#000' }} />
                      ) : (
                        <QuestionCircleOutlined style={{ fontSize: '64px', color: '#000' }} />
                      )}
                    </div>
                    
                    <Title level={3} style={{ margin: 0, textAlign: 'center', color: '#000' }} ellipsis={{ rows: 2 }}>
                      {quiz.title}
                    </Title>
                    
                    <div className="mt-4" style={{ width: '100%' }}>
                      <Button
                        type={quiz.is_completed ? "default" : "primary"}
                        icon={<PlayCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuizClick(quiz.id);
                        }}
                        block
                      >
                        {quiz.is_completed ? 'Перепройти' : 'Пройти квиз'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Space>
    </PageContainer>
  );
};

export default QuizzesListPage;

