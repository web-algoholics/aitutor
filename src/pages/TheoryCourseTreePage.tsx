import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Typography, List, Button, Space, Tag, Progress,
  Skeleton, message, Spin, Alert
} from 'antd';
import {
  BookOutlined, PlayCircleOutlined, CheckCircleOutlined,
  LoadingOutlined, ClockCircleOutlined, BulbOutlined, ArrowLeftOutlined
} from '@ant-design/icons';
import {
  useGetTheoryCourseTreeQuery,
  useGenerateNextModuleMutation,
  useRetryModuleGenerationMutation
} from '../services/theoryApi';

const { Title, Text, Paragraph } = Typography;

const TheoryCourseTreePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const courseIdNum = parseInt(courseId!);

  const { data: courseTree, isLoading, error, refetch } = useGetTheoryCourseTreeQuery(courseIdNum);
  const [generateNextModule, { isLoading: isGenerating }] = useGenerateNextModuleMutation();
  const [retryModuleGeneration, { isLoading: isRetrying }] = useRetryModuleGenerationMutation();

  // Refresh data when component mounts (in case we navigated here after course creation)
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Auto-refresh while generation is in progress or for first 2 minutes after page load
  useEffect(() => {
    const shouldAutoRefresh = isGenerationInProgress || !courseTree; // Always refresh if no data yet

    if (shouldAutoRefresh && !isLoading) {
      const interval = setInterval(() => {
        refetch();
      }, 5000); // Refresh every 5 seconds during generation

      // Stop auto-refresh after 2 minutes to avoid unnecessary requests
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 120000); // 2 minutes

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isGenerationInProgress, isLoading, refetch, courseTree]);

  // Calculate generation progress
  const totalLessonsCount = courseTree?.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  const lessonsWithContentCount = courseTree?.modules?.reduce((acc, module) =>
    acc + (module.lessons?.filter(lesson => lesson.has_content).length || 0), 0) || 0;
  const generationProgress = totalLessonsCount > 0 ? Math.round((lessonsWithContentCount / totalLessonsCount) * 100) : 0;
  const isGenerationInProgress = lessonsWithContentCount < totalLessonsCount;

  const handleLessonClick = (lessonId: number, hasContent: boolean) => {
    if (hasContent) {
      navigate(`/theory/lessons/${lessonId}`);
    } else {
      message.info('Теория для этого урока еще генерируется...');
    }
  };

  const handleGenerateNextModule = async () => {
    try {
      await generateNextModule(courseIdNum).unwrap();
      message.success('Генерация следующего модуля начата!');
      refetch();
    } catch (error) {
      message.error('Ошибка при генерации модуля');
    }
  };

  const handleRetryModuleGeneration = async (moduleId: number) => {
    try {
      await retryModuleGeneration(moduleId).unwrap();
      message.success('Повторная генерация уроков начата!');
      refetch();
    } catch (error) {
      message.error('Ошибка при повторной генерации');
    }
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

  if (error || !courseTree) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="Ошибка загрузки курса"
          description="Не удалось загрузить информацию о курсе. Попробуйте обновить страницу."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const { course, modules, lessons } = courseTree;

  // Calculate progress
  const totalLessons = lessons.flat().length;
  const completedLessons = lessons.flat().filter(lesson => lesson.is_completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Check if all current modules are completed
  const currentModulesCompleted = modules.every(module => module.is_completed);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Navigation */}
        <div style={{ marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/theory')}>
            К списку курсов
          </Button>
        </div>

        {/* Course Header */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
            <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <div style={{ flex: 1 }}>
              <Title level={2} style={{ marginBottom: '8px' }}>{course.title}</Title>
              <Paragraph style={{ fontSize: '16px', marginBottom: '12px' }}>
                {course.description}
              </Paragraph>

              {/* Generation Progress */}
              {isGenerationInProgress && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <LoadingOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Генерация контента уроков</Text>
                    <Button size="small" onClick={() => refetch()}>
                      Обновить
                    </Button>
                  </div>
                  <Progress
                    percent={generationProgress}
                    status={generationProgress === 100 ? "success" : "active"}
                    size="small"
                    format={(percent) => `${lessonsWithContentCount}/${totalLessonsCount} уроков`}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Контент генерируется в фоне. Обновите страницу, чтобы увидеть прогресс.
                  </Text>
                </div>
              )}

              <Space>
                <Tag color="blue">{course.difficulty === 'beginner' ? 'Начальный' :
                          course.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}</Tag>
                <Tag icon={<ClockCircleOutlined />}>
                  ~{course.estimated_duration} часов
                </Tag>
                <Tag>{course.modules_count} модулей</Tag>
              </Space>
            </div>
          </div>

          {/* Progress */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text strong>Прогресс курса</Text>
              <Text>{completedLessons}/{totalLessons} уроков</Text>
            </div>
            <Progress percent={progressPercent} status={progressPercent === 100 ? 'success' : 'active'} />
          </div>
        </Card>

        {/* Generate Next Module Button */}
        {currentModulesCompleted && course.modules_count > modules.length && (
          <Alert
            message="Все текущие модули пройдены!"
            description="Хотите сгенерировать следующий модуль курса?"
            type="info"
            showIcon
            action={
              <Button
                type="primary"
                loading={isGenerating}
                onClick={handleGenerateNextModule}
              >
                {isGenerating ? 'Генерирую...' : 'Сгенерировать следующий модуль'}
              </Button>
            }
          />
        )}

        {/* Modules */}
        <Space direction="vertical" size="medium" style={{ width: '100%' }}>
          {modules.map((module, moduleIndex) => {
            const moduleLessons = lessons[moduleIndex] || [];
            const completedModuleLessons = moduleLessons.filter(lesson => lesson.is_completed).length;
            const moduleLessonsWithContent = moduleLessons.filter(lesson => lesson.has_content).length;
            const moduleProgress = moduleLessons.length > 0 ?
              Math.round((completedModuleLessons / moduleLessons.length) * 100) : 0;
            const isModuleGenerating = moduleLessons.length > 0 && moduleLessonsWithContent < moduleLessons.length;

            return (
              <Card
                key={module.id}
                title={
                  <Space>
                    <span>{module.order}. {module.title}</span>
                    {module.is_completed && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    {isModuleGenerating && !module.is_completed && <LoadingOutlined style={{ color: '#1890ff' }} />}
                  </Space>
                }
                extra={
                  <Tag color={moduleProgress === 100 ? 'success' : 'processing'}>
                    {completedModuleLessons}/{moduleLessons.length} уроков
                  </Tag>
                }
              >
                <Paragraph style={{ marginBottom: '16px' }}>
                  {module.description}
                </Paragraph>

                {/* Retry Generation Button */}
                {(() => {
                  const lessonsWithoutContent = moduleLessons.filter(lesson => !lesson.has_content).length;
                  if (lessonsWithoutContent > 0) {
                    return (
                      <Alert
                        message={`Есть ${lessonsWithoutContent} уроков без контента`}
                        description="Возможно, генерация этих уроков не удалась. Попробуйте повторить генерацию."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '16px' }}
                        action={
                          <Button
                            size="small"
                            loading={isRetrying}
                            onClick={() => handleRetryModuleGeneration(module.id)}
                          >
                            Повторить генерацию
                          </Button>
                        }
                      />
                    );
                  }
                  return null;
                })()}

                {/* Learning Objectives */}
                <div style={{ marginBottom: '16px' }}>
                  <Text strong style={{ marginBottom: '8px', display: 'block' }}>
                    <BulbOutlined style={{ marginRight: '8px' }} />
                    Цели обучения:
                  </Text>
                  <ul style={{ paddingLeft: '20px' }}>
                    {module.learning_objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                {/* Lessons */}
                <List
                  size="small"
                  dataSource={moduleLessons}
                  renderItem={(lesson) => (
                    <List.Item
                      actions={[
                        <Button
                          key="start"
                          type={lesson.has_content ? "primary" : "default"}
                          icon={lesson.has_content ? <PlayCircleOutlined /> : <LoadingOutlined />}
                          onClick={() => handleLessonClick(lesson.id, lesson.has_content)}
                          disabled={!lesson.has_content}
                        >
                          {lesson.has_content ? 'Изучить' : 'Генерируется...'}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          lesson.is_completed ?
                            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} /> :
                            lesson.has_content ?
                              <PlayCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} /> :
                              <Spin size="small" />
                        }
                        title={`${lesson.order}. ${lesson.title}`}
                        description={
                          <div>
                            <div>{lesson.description}</div>
                            <div style={{ marginTop: '4px' }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                <ClockCircleOutlined style={{ marginRight: '4px' }} />
                                ~{lesson.estimated_duration} мин чтения
                              </Text>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            );
          })}
        </Space>

        {/* Show generation status if no modules yet */}
        {modules.length === 0 && (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>Создание структуры курса</Title>
              <Paragraph>
                ИИ создает модули и уроки курса. Это займет несколько секунд.
              </Paragraph>
              <Button onClick={() => refetch()} loading={isLoading}>
                Обновить
              </Button>
            </div>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default TheoryCourseTreePage;
