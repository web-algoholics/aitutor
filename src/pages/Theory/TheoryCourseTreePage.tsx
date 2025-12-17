import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Card, Typography, List, Button, Space, Tag, Progress,
  Skeleton, message, Spin, Alert
} from 'antd';
import {
  BookOutlined, PlayCircleOutlined, CheckCircleOutlined,
  LoadingOutlined, ClockCircleOutlined, BulbOutlined, ArrowLeftOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import {
  useGetTheoryCourseTreeQuery,
  useGenerateNextModuleMutation,
  useGenerateLessonContentMutation
} from '../../services/theoryApi';
import { useCreateDeckFromCourseMutation } from '../../services/ankiApi';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;

const TheoryCourseTreePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const courseIdNum = parseInt(courseId!);

  // Check if we have course data from navigation state (just created)
  const initialCourseTree = location.state?.courseTree;

  const { data: courseTree, isLoading, error, refetch } = useGetTheoryCourseTreeQuery(courseIdNum, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    pollingInterval: (!courseTree || isGenerationInProgress) ? 3000 : undefined, // Poll every 3 seconds initially or during generation
  });

  // Use loaded data from server, or initial data if available and no server data yet
  const currentCourseTree = courseTree || initialCourseTree;
  const [generateNextModule, { isLoading: isGenerating }] = useGenerateNextModuleMutation();
  const [generateLessonContent] = useGenerateLessonContentMutation();
  const [createDeckFromCourse, { isLoading: isCreatingDeck }] = useCreateDeckFromCourseMutation();

  // Refresh data when component mounts (in case we navigated here after course creation)
  useEffect(() => {
    console.log('🔄 Component mounted, refreshing course tree...');
    // Force immediate refetch
    setTimeout(() => refetch(), 100);
    setTimeout(() => refetch(), 500);
    setTimeout(() => refetch(), 1000);
  }, [refetch]);

  // Auto-generate content for lessons without content
  useEffect(() => {
    if (!currentCourseTree) return;

    const lessonsWithoutContent = currentCourseTree.lessons?.flat().filter(lesson => !lesson.has_content) || [];

    if (lessonsWithoutContent.length === 0) return;

    // Generate content for one lesson at a time, with delay between generations
    const generateNextLesson = async () => {
      const lesson = lessonsWithoutContent[0]; // Take first lesson
      if (!lesson) return;

      try {
        console.log(`🎯 Auto-generating content for lesson: ${lesson.title}`);
        await generateLessonContent(lesson.id).unwrap();
        console.log(`✅ Generated content for lesson: ${lesson.title}`);

        // Refresh data after successful generation
        setTimeout(() => refetch(), 500);
      } catch (error) {
        console.error(`❌ Failed to generate content for lesson ${lesson.id}:`, error);
        // Continue with next lesson even if this one failed
      }
    };

    // Start generation immediately for first lesson
    generateNextLesson();

    // Set up interval for subsequent generations (every 15 seconds to avoid overload)
    const interval = setInterval(() => {
      const currentLessonsWithoutContent = currentCourseTree.lessons?.flat().filter(lesson => !lesson.has_content) || [];
      if (currentLessonsWithoutContent.length > 0) {
        generateNextLesson();
      } else {
        clearInterval(interval);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [currentCourseTree, generateLessonContent, refetch]);

  // Auto-refresh to show updated status
  useEffect(() => {
    if (!currentCourseTree) return;

    const lessonsWithoutContent = currentCourseTree.lessons?.flat().filter(lesson => !lesson.has_content) || [];

    if (lessonsWithoutContent.length > 0 && !isLoading) {
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing to show generation progress...');
        refetch();
      }, 2000); // Refresh every 2 seconds to show progress

      // Stop auto-refresh after 10 minutes
      const timeout = setTimeout(() => {
        clearInterval(interval);
      }, 600000); // 10 minutes

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentCourseTree, isLoading, refetch]);

  console.log('📈 Generation progress calculation:', {
    currentCourseTree: currentCourseTree ? {
      modulesCount: currentCourseTree.modules?.length,
      lessonsCount: currentCourseTree.lessons?.flat().length,
      lessonsWithContent: currentCourseTree.lessons?.flat().filter(l => l.has_content).length
    } : null,
  });

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

  const handleCreateAnkiDeck = async () => {
    try {
      const result = await createDeckFromCourse({ course_id: courseIdNum }).unwrap();
      message.success('Колода Anki успешно создана!');
      navigate(`/anki/decks/${result.id}/practice`);
    } catch (error: any) {
      message.error(error?.data?.detail || 'Ошибка при создании колоды. Убедитесь, что все уроки имеют сгенерированный контент.');
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </PageContainer>
    );
  }

  if (error && !initialCourseTree) {
    return (
      <PageContainer>
        <Alert
          message="Ошибка загрузки курса"
          description="Не удалось загрузить информацию о курсе. Попробуйте обновить страницу."
          type="error"
          showIcon
        />
      </PageContainer>
    );
  }

  const { course, modules, lessons } = currentCourseTree;

  // Calculate generation progress
  // lessons is an array of arrays, where each inner array corresponds to a module
  const allLessons = lessons.flat();
  const totalLessonsCount = allLessons.length;
  const lessonsWithContentCount = allLessons.filter(lesson => lesson.has_content).length;
  const generationProgress = totalLessonsCount > 0 ? Math.round((lessonsWithContentCount / totalLessonsCount) * 100) : 0;
  const isGenerationInProgress = lessonsWithContentCount < totalLessonsCount;

  console.log('📊 Course tree data:', {
    courseId: courseIdNum,
    totalLessonsCount,
    lessonsWithContentCount,
    generationProgress,
    isGenerationInProgress
  });

  // Calculate progress
  const totalLessons = allLessons.length;
  const completedLessons = allLessons.filter(lesson => lesson.is_completed).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Check if all current modules are completed
  const currentModulesCompleted = modules.every(module => module.is_completed);

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Navigation */}
        <div className="mb-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/theory')}>
            К списку курсов
          </Button>
        </div>

        {/* Course Header */}
        <Card>
          <div className="flex items-start gap-5">
            <BookOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
            <div className="flex-1">
              <Title level={2} className="mb-2">{course.title}</Title>
              <Paragraph className="text-base mb-3">
                {course.description}
              </Paragraph>

              {/* Generation Progress */}
              {isGenerationInProgress && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
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
                  <Text type="secondary" className="text-xs">
                    Уроки еще генерируются.
                  </Text>
                </div>
              )}

              <Space wrap>
                <Tag color="blue">{course.difficulty === 'beginner' ? 'Начальный' :
                          course.difficulty === 'intermediate' ? 'Средний' : 'Продвинутый'}</Tag>
                <Tag icon={<ClockCircleOutlined />}>
                  ~{course.estimated_duration} часов
                </Tag>
                <Tag>{course.modules_count} модулей</Tag>
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  loading={isCreatingDeck}
                  onClick={handleCreateAnkiDeck}
                  disabled={lessonsWithContentCount === 0}
                >
                  Создать колоду Anki
                </Button>
              </Space>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="flex justify-between mb-2">
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
        <Space direction="vertical" size="large" className="w-full">
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
                <Paragraph className="mb-4">
                  {module.description}
                </Paragraph>

                {/* Auto-generation status */}
                {(() => {
                  const lessonsWithoutContent = moduleLessons.filter(lesson => !lesson.has_content).length;
                  if (lessonsWithoutContent > 0) {
                    return (
                      <Alert
                        message={`Автоматическая генерация контента`}
                        description="Уроки генерируются"
                        type="info"
                        showIcon
                        className="mb-4"
                      />
                    );
                  }
                  return null;
                })()}

                {/* Learning Objectives */}
                <div className="mb-4">
                  <Text strong className="mb-2 block">
                    <BulbOutlined style={{ marginRight: '8px' }} />
                    Цели обучения:
                  </Text>
                  <ul className="pl-5">
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
                          type={lesson.has_content && lesson.is_completed ? "default" : lesson.has_content ? "primary" : "default"}
                          style={lesson.is_completed ? { borderColor: '#52c41a', color: '#52c41a' } : {}}
                          icon={lesson.has_content ? <PlayCircleOutlined /> : <LoadingOutlined />}
                          onClick={() => handleLessonClick(lesson.id, lesson.has_content)}
                          disabled={!lesson.has_content}
                        >
                          {lesson.has_content
                            ? (lesson.is_completed ? 'Изучить заново' : 'Изучить')
                            : 'Генерируется...'
                          }
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
                        description={lesson.description}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            );
          })}
        </Space>

        {/* Show loading status if no modules yet (fallback for edge cases) */}
        {(!currentCourseTree || modules.length === 0) && (
          <Card>
            <div className="text-center p-10">
              <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} className="mb-4" />
              <Title level={4}>Загрузка структуры курса</Title>
              <Paragraph>
                Загружаем модули и уроки курса...
              </Paragraph>
              <Text type="secondary" className="block mt-2">
                Автоматическое обновление...
              </Text>
            </div>
          </Card>
        )}
      </Space>
    </PageContainer>
  );
};

export default TheoryCourseTreePage;
