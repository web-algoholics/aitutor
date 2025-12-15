import React from 'react';
import { Card, Button, Spin, message, Steps, Space, Tag, Progress, Empty, Badge } from 'antd';
import { CheckCircleOutlined, LockOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCourseQuery, useGetCourseRoadmapQuery, useGetUserProgressQuery, useGetUserModuleProgressQuery, type Course, type Module } from '../services/coursesApi';
import { useGetCurrentUserQuery } from '../services/authApi';

// Helper function to ensure array
const ensureArray = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return Array.isArray(value) ? value : [value];
};

export default function CourseRoadmapPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const { data: course, isLoading: courseLoading, isError: courseError } = useGetCourseQuery(Number(courseId), { skip: !courseId });
  const { data: modules = [], isLoading: modulesLoading } = useGetCourseRoadmapQuery(Number(courseId), { skip: !courseId });
  const { data: currentUser } = useGetCurrentUserQuery(undefined);
  const userId = currentUser?.id;
  const { data: progressData } = useGetUserProgressQuery(userId ?? 0, { skip: !userId });
  const { data: moduleProgressData = [] } = useGetUserModuleProgressQuery(userId ?? 0, { skip: !userId });

  const handleStartModule = (moduleId: number) => {
    navigate(`/courses/${courseId}/modules/${moduleId}/chat`);
  };

  const getModuleProgress = (moduleId: number) => {
    return moduleProgressData.find(progress => progress.module_id === moduleId);
  };

  if (courseLoading || modulesLoading) return <Spin size="large" className="flex items-center justify-center min-h-screen" />;
  if (courseError || !course) return <Empty description="Курс не найден" />;

  const sortedModules = [...(modules as Module[])].sort((a, b) => a.order - b.order);
  const courseProgress = progressData?.enrollments?.[0];
  const completedCount = moduleProgressData.filter(progress => progress.is_completed).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {contextHolder}

      {/* Course Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="font-semibold mb-2">Прогресс курса:</p>
          <Progress
            percent={Math.max(0, sortedModules.length > 0 ? (completedCount / sortedModules.length) * 100 : 0)}
            status={courseProgress?.is_completed ? 'success' : 'active'}
          />
          <p className="text-sm text-gray-600 mt-2">
            {completedCount} из {sortedModules.length} модулей пройдено
          </p>
        </div>
      </div>

      {/* Modules Timeline */}
      <div className="space-y-4">
        {sortedModules.map((module, idx) => {
          const moduleProgress = getModuleProgress(module.id);
          const isCompleted = moduleProgress?.is_completed || false;

          return (
            <Card
              key={module.id}
              className={`cursor-pointer transition-all ${
                isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-lg'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}>
                    {isCompleted ? <CheckCircleOutlined /> : idx + 1}
                  </div>
                </div>

                {/* Module Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    {isCompleted && (
                      <Tag color="green" icon={<CheckCircleOutlined />}>Завершено</Tag>
                    )}
                  </div>

                  <p className="text-gray-600 mb-3">{module.description}</p>

                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Цели обучения:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {ensureArray(module.learning_objectives).slice(0, 2).map((obj, i) => (
                        <li key={i}>• {obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Ключевые концепции:</p>
                    <Space size="small" wrap>
                      {ensureArray(module.key_concepts).map((concept, i) => (
                        <Tag key={i}>{concept}</Tag>
                      ))}
                    </Space>
                  </div>

                  <Button
                    type={isCompleted ? 'default' : 'primary'}
                    size="large"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handleStartModule(module.id)}
                  >
                    {isCompleted ? 'Повторить' : 'Начать модуль'}
                  </Button>
                </div>

                {/* Progress Indicator */}
                {isCompleted && (
                  <div className="flex-shrink-0 text-right">
                    <CheckCircleOutlined className="text-3xl text-green-500" />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
