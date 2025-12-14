import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Card, Typography, Button, Space, Spin, Alert, message,
  Tag, Divider, Progress
} from 'antd';
import {
  ArrowLeftOutlined, ClockCircleOutlined, BulbOutlined,
  CheckCircleOutlined, LoadingOutlined, FormOutlined
} from '@ant-design/icons';
import {
  useGetLessonContentQuery,
  useGenerateLessonContentMutation,
  useGetTheoryCourseTreeQuery,
  useMarkLessonCompletedMutation
} from '../services/theoryApi';

const { Title, Text, Paragraph } = Typography;

const TheoryLessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const lessonIdNum = parseInt(lessonId!);

  const { data: content, isLoading: contentLoading, error: contentError, refetch } = useGetLessonContentQuery(lessonIdNum);
  const [generateContent, { isLoading: generating }] = useGenerateLessonContentMutation();
  const [markCompleted, { isLoading: markingCompleted }] = useMarkLessonCompletedMutation();

  // Optimistic update state for lesson completion
  const [optimisticallyCompleted, setOptimisticallyCompleted] = useState(false);

  // Get course tree to show navigation context
  const [courseId, setCourseId] = useState<number | null>(null);
  const { data: courseTree } = useGetTheoryCourseTreeQuery(courseId!, { skip: !courseId });

  useEffect(() => {
    if (content) {
      // Extract course ID from content (we'll need to get it from the lesson)
      // For now, we'll navigate back to course tree
      // Reset optimistic state when content is loaded/refreshed
      setOptimisticallyCompleted(false);
    }
  }, [content]);

  const handleGenerateContent = async () => {
    try {
      await generateContent(lessonIdNum).unwrap();
      message.success('Генерация теории начата!');
      refetch();
    } catch (error) {
      message.error('Ошибка при генерации теории');
    }
  };

  const handleBackToCourse = () => {
    if (content?.course_id) {
      navigate(`/theory/courses/${content.course_id}`);
    } else {
      navigate('/theory');
    }
  };

  const handleMarkCompleted = async () => {
    // Optimistic update - immediately show as completed
    setOptimisticallyCompleted(true);

    try {
      await markCompleted(lessonIdNum).unwrap();
      message.success('Урок отмечен как пройденный! 🎉');
      // Navigate back to course tree to show updated status
      if (content?.course_id) {
        navigate(`/theory/courses/${content.course_id}`);
      } else {
        navigate('/theory');
      }
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticallyCompleted(false);
      message.error('Не удалось отметить урок как пройденный');
      console.error('Error marking lesson as completed:', error);
    }
  };

  const handleCreateQuiz = () => {
    navigate(`/quizzes/create?lessonId=${lessonIdNum}`);
  };

  if (contentLoading || generating) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text>Загрузка...</Text>
          <Progress percent={75} status="active" showInfo={false} style={{ width: '200px' }} />
        </Space>
      </div>
    );
  }

  if (contentError || !content) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
        <Alert
          message="Теория не найдена"
          description="Теория для этого урока еще не была сгенерирована."
          type="info"
          showIcon
          action={
            <Button onClick={handleGenerateContent} loading={generating}>
              Сгенерировать теорию
            </Button>
          }
        />
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToCourse}>
            Вернуться к курсу
          </Button>
        </div>
      </div>
    );
  }



  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackToCourse}>
            К курсу
          </Button>
          <Divider type="vertical" />
          <Space>
            <Tag icon={<ClockCircleOutlined />}>
              ~{content.reading_time} мин чтения
            </Tag>
            {content.is_generated && (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Сгенерировано ИИ
              </Tag>
            )}
          </Space>
        </div>

        {/* Lesson Content */}
        <Card>
          <div style={{
            lineHeight: '1.8',
            fontSize: '16px'
          }}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <Typography.Title level={1}>{children}</Typography.Title>,
                h2: ({ children }) => <Typography.Title level={2}>{children}</Typography.Title>,
                h3: ({ children }) => <Typography.Title level={3}>{children}</Typography.Title>,
                h4: ({ children }) => <Typography.Title level={4}>{children}</Typography.Title>,
                h5: ({ children }) => <Typography.Title level={5}>{children}</Typography.Title>,
                h6: ({ children }) => <Typography.Title level={5}>{children}</Typography.Title>,
                p: ({ children }) => <Typography.Paragraph>{children}</Typography.Paragraph>,
                code: ({ node, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !className?.includes('language-');
                  return !isInline && match ? (
                    <pre style={{
                      backgroundColor: '#f6f8fa',
                      padding: '16px',
                      borderRadius: '6px',
                      overflow: 'auto',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '14px'
                    }}>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  ) : (
                    <code style={{
                      backgroundColor: '#f3f4f6',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                      fontSize: '13px'
                    }} {...props}>
                      {children}
                    </code>
                  );
                },
                ul: ({ children }) => <ul style={{ paddingLeft: '20px' }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ paddingLeft: '20px' }}>{children}</ol>,
                blockquote: ({ children }) => (
                  <div style={{
                    borderLeft: '4px solid #d1d5db',
                    paddingLeft: '16px',
                    margin: '16px 0',
                    color: '#6b7280'
                  }}>
                    {children}
                  </div>
                ),
              }}
            >
              {content.content}
            </ReactMarkdown>
          </div>
        </Card>

        {/* Footer */}
        <Card size="small" className="bg-gray-50">
          <div className="text-center">
            <Space direction="vertical" align="center">
              <Space>
                <Button onClick={handleBackToCourse}>
                  Вернуться к курсу
                </Button>
                <Button
                  icon={<FormOutlined />}
                  onClick={handleCreateQuiz}
                >
                  Создать квиз
                </Button>
                <Button
                  type={(content.lesson_is_completed || optimisticallyCompleted) ? "default" : "primary"}
                  icon={(content.lesson_is_completed || optimisticallyCompleted) ? <CheckCircleOutlined /> : undefined}
                  onClick={handleMarkCompleted}
                  loading={markingCompleted}
                  disabled={content.lesson_is_completed || optimisticallyCompleted}
                >
                  {(content.lesson_is_completed || optimisticallyCompleted) ? "Пройдено" : "Отметить как пройденное"}
                </Button>
              </Space>
            </Space>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default TheoryLessonPage;
