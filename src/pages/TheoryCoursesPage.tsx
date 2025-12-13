import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Typography, Button, Space, Tag, Progress,
  Skeleton, message, Empty, Alert, Row, Col
} from 'antd';
import {
  BookOutlined, PlusOutlined, PlayCircleOutlined,
  CheckCircleOutlined, ClockCircleOutlined, BulbOutlined
} from '@ant-design/icons';
import { useGetTheoryCoursesQuery } from '../services/theoryApi';

const { Title, Text, Paragraph, Meta } = Typography;

const TheoryCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading, error, refetch } = useGetTheoryCoursesQuery();

  const handleCreateCourse = () => {
    navigate('/theory/create');
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/theory/courses/${courseId}`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          title="Ошибка загрузки курсов"
          description="Не удалось загрузить список курсов. Попробуйте обновить страницу."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={1} style={{ marginBottom: '8px' }}>
              <BookOutlined style={{ marginRight: '16px' }} />
              AI Курсы
            </Title>
            <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: 0 }}>
              Персонализированные курсы, созданные ИИ специально для вас
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateCourse}
            style={{ height: '48px', fontSize: '16px' }}
          >
            Создать курс
          </Button>
        </div>

        {/* Stats */}
        {courses && courses.length > 0 && (
          <Space size="large">
            <Card size="small" style={{ minWidth: '120px' }}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {courses.length}
                </Text>
                <div>
                  <Text type="secondary">Курсов</Text>
                </div>
              </div>
            </Card>
            <Card size="small" style={{ minWidth: '120px' }}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {courses.filter(c => c.is_completed).length}
                </Text>
                <div>
                  <Text type="secondary">Завершено</Text>
                </div>
              </div>
            </Card>
            <Card size="small" style={{ minWidth: '120px' }}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                  {courses.reduce((sum, c) => sum + c.estimated_duration, 0)}
                </Text>
                <div>
                  <Text type="secondary">Часов обучения</Text>
                </div>
              </div>
            </Card>
          </Space>
        )}

        {/* Courses List */}
        {courses && courses.length > 0 ? (
          <Row gutter={[16, 16]}>
            {courses.map((course) => (
              <Col key={course.id} xs={24} sm={12} md={12} lg={8} xl={8}>
                <Card
                  hoverable
                  onClick={() => handleCourseClick(course.id)}
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      key="start"
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course.id);
                      }}
                    >
                      Продолжить
                    </Button>
                  ]}
                >
                  <Card.Meta
                    avatar={<BookOutlined style={{ fontSize: '32px', color: '#1890ff' }} />}
                    title={course.title}
                    description={
                      <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                        <Text>{course.description}</Text>
                        <Space wrap>
                          <Tag color="blue">
                            {course.difficulty === 'beginner' ? 'Начальный' :
                             course.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}
                          </Tag>
                          <Tag icon={<ClockCircleOutlined />}>
                            ~{course.estimated_duration} ч
                          </Tag>
                          <Tag>{course.modules_count} модулей</Tag>
                        </Space>
                        {course.is_completed && (
                          <Tag icon={<CheckCircleOutlined />} color="success">
                            Завершен
                          </Tag>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            image={<BookOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
            description={
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ color: '#666' }}>
                  У вас пока нет AI курсов
                </Title>
                <Paragraph style={{ color: '#999', marginBottom: '24px' }}>
                  Создайте персонализированный курс по интересующей вас теме с помощью ИИ
                </Paragraph>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateCourse}
            >
              Создать первый курс
            </Button>
          </Empty>
        )}

        {/* Info Card */}
        <Alert
          title="Как работают AI курсы?"
          description={
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Персонализация:</strong> Курс создается специально под вашу тему</li>
              <li><strong>Качество контента:</strong> Теория генерируется по принципам Яндекс.Хэндбуков</li>
              <li><strong>Ленивая генерация:</strong> Контент создается по мере прохождения уроков</li>
              <li><strong>Интерактивность:</strong> Примеры кода, тесты и практические задания</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginTop: '32px' }}
        />
      </Space>
    </div>
  );
};

export default TheoryCoursesPage;
