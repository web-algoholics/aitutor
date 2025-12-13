import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCreateTheoryCourseMutation } from '../services/theoryApi';
import { BookOutlined, LoadingOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CreateTheoryCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [createCourse, { isLoading }] = useCreateTheoryCourseMutation();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const result = await createCourse({
        topic: values.topic,
        difficulty: values.difficulty || 'intermediate',
      }).unwrap();

      message.success('Курс создан! Структура готова, контент генерируется в фоне...');

      // Navigate immediately with course data - structure is already created
      navigate(`/theory/courses/${result.course.id}`, {
        state: { courseTree: result }
      });
    } catch (error) {
      message.error('Ошибка при создании курса');
      console.error('Create course error:', error);
    }
  };

  const exampleTopics = [
    'Основы Python',
    'Машинное обучение',
    'Веб-разработка с React',
    'Алгоритмы и структуры данных',
    'Базы данных SQL',
    'DevOps практики',
    'Кибербезопасность',
    'Мобильная разработка',
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={2}>Создать AI курс</Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            ИИ сгенерирует персонализированный курс по вашей теме с подробной теорией и практическими заданиями
          </Paragraph>
        </div>

        <Card title="Настройки курса" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ difficulty: 'intermediate' }}
          >
            <Form.Item
              label="Тема курса"
              name="topic"
              rules={[{ required: true, message: 'Пожалуйста, введите тему курса' }]}
            >
              <Input
                placeholder="Например: основы Python, машинное обучение, веб-разработка"
                size="large"
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item label="Уровень сложности" name="difficulty">
              <Select size="large">
                <Option value="beginner">Начальный (для новичков)</Option>
                <Option value="intermediate">Средний (базовые знания требуются)</Option>
                <Option value="advanced">Продвинутый (опыт требуется)</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                disabled={isLoading}
                style={{ width: '100%', height: '48px', fontSize: '16px' }}
              >
                {isLoading ? (
                  <>
                    <Spin indicator={<LoadingOutlined />} style={{ marginRight: '8px' }} />
                    Создаю курс...
                  </>
                ) : (
                  'Создать курс'
                )}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="Примеры тем" size="small">
          <Text>Популярные темы для изучения:</Text>
          <div style={{ marginTop: '12px' }}>
            <Space wrap>
              {exampleTopics.map((topic) => (
                <Button
                  key={topic}
                  type="dashed"
                  onClick={() => form.setFieldsValue({ topic })}
                >
                  {topic}
                </Button>
              ))}
            </Space>
          </div>
        </Card>

        <Card title="Как это работает?" size="small">
          <Space direction="vertical">
            <Text>1. <strong>Ввод темы:</strong> Укажите интересующую вас тему обучения</Text>
            <Text>2. <strong>AI планирование:</strong> ИИ создаст структуру курса из 5-10 модулей</Text>
            <Text>3. <strong>Ленивая генерация:</strong> Теория генерируется по мере прохождения уроков</Text>
            <Text>4. <strong>Качественный контент:</strong> Подробные объяснения с примерами кода</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default CreateTheoryCoursePage;
