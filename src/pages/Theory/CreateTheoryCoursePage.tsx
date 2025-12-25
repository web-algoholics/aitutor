import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Typography, Space, message, Spin } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCreateTheoryCourseMutation } from '../../services/theoryApi';
import { BookOutlined, LoadingOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;

const CreateTheoryCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [createCourse, { isLoading }] = useCreateTheoryCourseMutation();
  const [form] = Form.useForm();

  // State for custom dropdown
  const [difficulty, setDifficulty] = useState<string>('intermediate');
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  // Если пришли с MarketAnalysis с заранее выбранной технологией,
  // подтягиваем её в поле "Тема курса"
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicFromQuery = params.get('topic');
    if (topicFromQuery) {
      form.setFieldsValue({ topic: topicFromQuery });
    }
  }, [location.search, form]);

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (difficultyDropdownRef.current && !difficultyDropdownRef.current.contains(event.target as Node)) {
        setDifficultyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const result = await createCourse({
        topic: values.topic,
        difficulty: difficulty,
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

  const difficultyOptions = [
    { value: 'beginner', label: 'Начальный (для новичков)' },
    { value: 'intermediate', label: 'Средний (базовые знания требуются)' },
    { value: 'advanced', label: 'Продвинутый (опыт требуется)' },
  ];

  return (
    <PageContainer>
      <Space vertical size="large" style={{ width: '100%' }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/theory')}>
            К списку курсов
          </Button>
        </div>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              Создать AI курс
            </Title>
          </div>
          <Paragraph style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
            ИИ сгенерирует персонализированный курс по вашей теме с подробной теорией и практическими заданиями
          </Paragraph>
        </div>

        <Card bordered={true}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
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

            <div style={{ marginBottom: '24px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'rgba(0, 0, 0, 0.85)' }}>
                Уровень сложности
              </div>
              <div className={`custom-select-container ${difficultyDropdownOpen ? 'open' : ''}`} ref={difficultyDropdownRef}>
                <div
                  className="custom-select-trigger"
                  onClick={() => setDifficultyDropdownOpen(!difficultyDropdownOpen)}
                  style={{ fontSize: '16px', height: '40px' }}
                >
                  <span className={difficulty ? '' : 'custom-select-placeholder'}>
                    {difficulty ? difficultyOptions.find(d => d.value === difficulty)?.label || difficulty : 'Выберите уровень сложности'}
                  </span>
                  <span className="custom-select-arrow">▼</span>
                </div>
                {difficultyDropdownOpen && (
                  <div className="custom-select-dropdown">
                    {difficultyOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`custom-select-option ${difficulty === option.value ? 'selected' : ''}`}
                        onClick={() => {
                          setDifficulty(option.value);
                          setDifficultyDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                disabled={isLoading}
                block
              >
                {isLoading ? 'Создаю курс...' : 'Создать курс'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card bordered={true}>
          <Title level={5} style={{ marginBottom: '12px' }}>Примеры тем</Title>
          <Space wrap>
            {exampleTopics.map((topic) => (
              <Button
                key={topic}
                onClick={() => form.setFieldsValue({ topic })}
                type="default"
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