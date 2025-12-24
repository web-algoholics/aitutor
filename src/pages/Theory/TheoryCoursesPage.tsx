import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Card, Typography, Button, Space, Tag, Progress,
  Skeleton, message, Empty, Alert, Row, Col,
} from 'antd';
import LoadingDot from '../../components/LoadingDot';
import {
  BookOutlined, PlusOutlined, PlayCircleOutlined,
  CheckCircleOutlined, AppstoreOutlined
} from '@ant-design/icons';
import { useGetTheoryCoursesQuery } from '../../services/theoryApi';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;

const TheoryCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading, error, refetch } = useGetTheoryCoursesQuery();
  const { theme } = useTheme();

  const handleCreateCourse = () => {
    navigate('/theory/create');
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/theory/courses/${courseId}`);
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
        <Alert
          title="Ошибка загрузки курсов"
          description="Не удалось загрузить список курсов. Попробуйте обновить страницу."
          type="error"
          showIcon
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Empty div to match Create page layout - matches Button height */}
        <div style={{ height: '36px' }}></div>
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
              AI Курсы
            </Title>
          </div>
          <Paragraph className="text-base text-gray-600 mb-4" style={{ textAlign: 'center' }}>
            Персонализированные курсы, созданные ИИ специально для вас
          </Paragraph>
          <Button
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateCourse}
            style={{ backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff' }}
          >
            Создать курс
          </Button>
        </div>

        {/* Stats */}
        {courses && courses.length > 0 && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{courses.length}</Title>
                <Text type="secondary">Курсов</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{courses.filter(c => c.is_completed).length}</Title>
                <Text type="secondary">Завершено</Text>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card bordered={false} className="text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Title level={3} className="mb-2">{courses.reduce((sum, c) => sum + c.estimated_duration, 0)}</Title>
                <Text type="secondary">Часов обучения</Text>
              </Card>
            </Col>
          </Row>
        )}

        {/* Courses List */}
        {courses && courses.length > 0 ? (
          <Row gutter={[16, 16]} style={{ display: 'flex' }}>
            {courses.map((course) => (
              <Col xs={24} sm={12} lg={8} key={course.id} style={{ display: 'flex' }}>
                <div
                  style={{
                    width: '100%',
                    border: '2px solid #666666',
                    borderRadius: '12px',
                    backgroundColor: theme === 'dark' ? '#1f1f1f' : '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '32px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    position: 'relative',
                  }}
                  onClick={() => handleCourseClick(course.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Module count in top right corner */}
                  <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AppstoreOutlined style={{ fontSize: '18px', color: '#2B5797' }} />
                    <Text style={{ fontSize: '16px', color: '#2B5797', fontWeight: 500 }}>
                      {course.modules_count}
                    </Text>
                  </div>

                  <div className="flex flex-col h-full" style={{ alignItems: 'center' }}>
                    {/* Large icon */}
                    <div style={{ marginBottom: '16px' }}>
                      {course.is_completed ? (
                        <CheckCircleOutlined style={{ fontSize: '64px', color: '#2B5797' }} />
                      ) : (
                        <BookOutlined style={{ fontSize: '64px', color: '#2B5797' }} />
                      )}
                    </div>
                    
                    <div style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', width: '100%' }}>
                      <Text style={{ margin: 0, textAlign: 'center', color: theme === 'dark' ? '#fafafa' : '#000', fontSize: '20px', fontWeight: 400, display: 'block' }}>
                        {course.title}
                      </Text>
                    </div>
                    
                    <div style={{ width: '100%', marginTop: 'auto' }}>
                      <Button
                        type={course.is_completed ? "default" : "primary"}
                        icon={<PlayCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course.id);
                        }}
                        block
                      >
                        {course.is_completed ? 'Посмотреть' : 'Продолжить'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        ) : (
          <Card bordered={false}>
            <Empty
              description="У вас пока нет курсов"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button 
                icon={<PlusOutlined />} 
                onClick={handleCreateCourse}
                style={{ backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff' }}
              >
                Создать первый курс
              </Button>
            </Empty>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
};

export default TheoryCoursesPage;
