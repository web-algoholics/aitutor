import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Card, Typography, Space, message, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateTheoryCourseMutation } from '../../services/theoryApi';
import { BookOutlined, LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CreateTheoryCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [createCourse, { isLoading }] = useCreateTheoryCourseMutation();
  const [form] = Form.useForm();

  // Если пришли с MarketAnalysis с заранее выбранной технологией,
  // подтягиваем её в поле "Тема курса"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicFromQuery = params.get('topic');
    if (topicFromQuery) {
      form.setFieldsValue({ topic: topicFromQuery });
    }
  }, [location.search, form]);

  const handleSubmit = async (values: any) => {
    try {
      const result = await createCourse({
        topic: values.topic,
        difficulty: values.difficulty || 'intermediate',
      }).unwrap();

      message.success('Курс создан! Структура готова, контент генерируется...');

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
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/theory')}>
            К списку курсов
          </Button>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              Создать AI курс
            </Title>
          </div>
          <Paragraph style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
            ИИ сгенерирует персонализированный курс по вашей теме с подробной теорией и практическими заданиями
          </Paragraph>
        </div>

        <Card bordered={false}>
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
                htmlType="submit"
                size="large"
                loading={isLoading}
                disabled={isLoading}
                style={{ width: '100%', height: '48px', fontSize: '16px', backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff' }}
              >
                {isLoading ? 'Создаю курс...' : 'Создать курс'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card bordered={false}>
          <Title level={5} style={{ marginBottom: '12px' }}>Примеры тем</Title>
          <Space wrap>
            {exampleTopics.map((topic) => (
              <Button
                key={topic}
                onClick={() => form.setFieldsValue({ topic })}
                style={{ backgroundColor: '#2B5797', borderColor: '#2B5797', color: '#fff' }}
              >
                {topic}
              </Button>
            ))}
          </Space>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default CreateTheoryCoursePage;
