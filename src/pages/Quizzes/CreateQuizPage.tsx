import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Space, message } from 'antd';
import LoadingDot from '../../components/LoadingDot';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useCreateQuizMutation } from '../../services/quizzesApi';
import { useGetLessonContentQuery } from '../../services/theoryApi';
import PageContainer from '../../components/PageContainer';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const CreateQuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('lessonId');
  const [createQuiz, { isLoading }] = useCreateQuizMutation();
  const [form] = Form.useForm();

  // Load lesson content if lessonId is provided
  const { data: lessonContent, isLoading: lessonLoading } = useGetLessonContentQuery(
    Number(lessonId!),
    { skip: !lessonId }
  );

  useEffect(() => {
    if (lessonContent) {
      form.setFieldsValue({
        theory_content: lessonContent.content,
      });
    }
  }, [lessonContent, form]);

  const handleSubmit = async (values: { theory_content: string }) => {
    try {
      const result = await createQuiz({
        theory_content: values.theory_content,
      }).unwrap();

      message.success('Квиз успешно создан!');
      navigate(`/quizzes/${result.id}`);
    } catch (error: any) {
      message.error(error?.data?.detail || 'Ошибка при создании квиза');
    }
  };

  const handleBack = () => {
    if (lessonId) {
      navigate(`/theory/lessons/${lessonId}`);
    } else {
      navigate('/quizzes');
    }
  };

  if (lessonId && lessonLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingDot size="large" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            {lessonId ? 'К уроку' : 'К списку квизов'}
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
              Создать квиз
            </Title>
          </div>
          <Paragraph style={{ fontSize: '16px', color: '#666', textAlign: 'center' }}>
            ИИ создаст квиз с вопросами на основе вашей теории
          </Paragraph>
        </div>

        <Card bordered={false}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              theory_content: lessonContent?.content || '',
            }}
          >
            <Form.Item
              label="Теория урока"
              name="theory_content"
              rules={[{ required: true, message: 'Введите теорию урока' }]}
              extra={
                lessonContent 
                  ? 'Теория загружена из урока. Название квиза и количество вопросов будут определены автоматически.' 
                  : 'Вставьте теорию урока. Название квиза и количество вопросов будут определены автоматически на основе содержимого.'
              }
            >
              <TextArea
                rows={15}
                placeholder="Вставьте теорию урока, на основе которой будет создан квиз..."
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={isLoading}
                disabled={isLoading}
                block
              >
                {isLoading ? 'Создаю квиз...' : 'Создать квиз'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </PageContainer>
  );
};

export default CreateQuizPage;



