import React from 'react';
import { Card, Button, Empty, Space, Tag, Progress, message } from 'antd';
import LoadingDot from '../components/LoadingDot';
import { BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useGetCoursesQuery, type Course } from '../services/coursesApi';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { data: courses = [], isLoading, isError } = useGetCoursesQuery();

  const handleStartCourse = async (courseId: number) => {
    try {
      navigate(`/courses/${courseId}/roadmap`);
    } catch (error) {
      messageApi.error('Ошибка при открытии курса');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'green';
      case 'intermediate':
        return 'orange';
      case 'advanced':
        return 'red';
      default:
        return 'blue';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Начинающий';
      case 'intermediate':
        return 'Средний';
      case 'advanced':
        return 'Продвинутый';
      default:
        return difficulty;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingDot size="large" /></div>;

  if (isError) {
    messageApi.error('Ошибка при загрузке курсов');
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {contextHolder}
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Курсы программирования</h1>
        <p className="text-gray-600">Выберите курс и начните обучение</p>
      </div>

      {courses.length === 0 ? (
        <Empty description="Курсы не найдены" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              hoverable
              className="shadow-sm hover:shadow-lg transition-shadow"
              cover={
                course.icon ? (
                  <img alt={course.title} src={course.icon} className="h-48 object-cover" />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <BookOutlined className="text-white text-6xl" />
                  </div>
                )
              }
            >
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <Tag color={getDifficultyColor(course.difficulty)}>
                    {getDifficultyLabel(course.difficulty)}
                  </Tag>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={() => handleStartCourse(course.id)}
                >
                  Начать обучение
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
