import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  Tag,
  Empty,
  Row,
  Col,
} from 'antd';
import LoadingDot from '../../components/LoadingDot';
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
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
          <LoadingDot size="large" />
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
        {/* Empty div to match Create page layout - matches Button height */}
        <div style={{ height: '36px' }}></div>
        {/* Header */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
              Мои квизы
            </Title>
          </div>
          <Paragraph className="text-base text-gray-600 mb-4" style={{ textAlign: 'center' }}>
            Созданные и пройденные квизы для проверки знаний
          </Paragraph>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateQuiz}
          >
            Создать квиз
          </Button>
        </div>

        {/* Stats */}
        {totalQuizzes > 0 && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Card className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{totalQuizzes}</Title>
                <Text type="secondary">Всего квизов</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{completedQuizzes.length}</Title>
                <Text type="secondary">Пройдено</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
              <Button 
                icon={<PlusOutlined />} 
                onClick={handleCreateQuiz}
type="primary"
              >
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
                    border: '2px solid hsl(0, 0%, 15%)',
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
                    <FileTextOutlined style={{ fontSize: '18px', color: 'hsl(var(--primary))' }} />
                    <Text style={{ fontSize: '16px', color: 'hsl(var(--primary))', fontWeight: 500 }}>
                      {quiz.questions_count}
                    </Text>
                  </div>

                  <div className="flex flex-col h-full" style={{ alignItems: 'center' }}>
                    {/* Large icon */}
                    <div style={{ marginBottom: '16px' }}>
                      {quiz.is_completed ? (
                        <CheckCircleOutlined style={{ fontSize: '64px', color: 'hsl(var(--primary))' }} />
                      ) : (
                        <QuestionCircleOutlined style={{ fontSize: '64px', color: 'hsl(var(--primary))' }} />
                      )}
                    </div>
                    
                    <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', width: '100%' }}>
                      <Text style={{ margin: 0, textAlign: 'center', color: '#000', fontSize: '20px', fontWeight: 400, display: 'block' }}>
                        {quiz.title}
                      </Text>
                    </div>
                    
                    <div style={{ width: '100%', marginTop: 'auto' }}>
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

