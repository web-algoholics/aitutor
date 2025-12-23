import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  message,
  Form,
  Input,
  Radio,
  Checkbox,
  Divider,
  Alert,
  Progress,
  InputNumber,
} from 'antd';
import LoadingDot from '../../components/LoadingDot';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  useCreateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizMutation,
  type QuizResponse,
  type QuizResultResponse,
  type AnswerResponse,
  type QuestionResponse,
} from '../../services/quizzesApi';
import { useGetLessonContentQuery } from '../../services/theoryApi';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type QuizState = 'create' | 'taking' | 'results';

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lessonId');
  const [quizState, setQuizState] = useState<QuizState>(() => {
    // Initialize state based on URL param to avoid showing 'create' form briefly
    return quizId ? 'taking' : 'create';
  });
  const [createdQuizId, setCreatedQuizId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [answersForm] = Form.useForm();

  // Load lesson content if lessonId is provided
  const { data: lessonContent, isLoading: lessonLoading } = useGetLessonContentQuery(
    Number(lessonId!),
    { skip: !lessonId }
  );

  // Create quiz mutation
  const [createQuiz, { isLoading: creatingQuiz }] = useCreateQuizMutation();

  // Get quiz data (for taking or viewing results)
  const currentQuizId = quizId ? Number(quizId) : createdQuizId;
  const { data: quiz, isLoading: quizLoading, refetch: refetchQuiz } = useGetQuizQuery(
    { quizId: currentQuizId!, includeAnswers: quizState === 'results' },
    { skip: !currentQuizId }
  );

  // Submit quiz mutation
  const [submitQuiz, { isLoading: submittingQuiz }] = useSubmitQuizMutation();
  const [quizResult, setQuizResult] = useState<QuizResultResponse | null>(null);

  useEffect(() => {
    if (quizId) {
      // If quizId is in URL, we're taking an existing quiz
      setQuizState('taking');
      setCreatedQuizId(Number(quizId));
    } else {
      // No quizId means we're creating a new quiz
      setQuizState('create');
      if (lessonContent && form) {
        // Pre-fill theory content from lesson
        form.setFieldsValue({
          theory_content: lessonContent.content,
        });
      }
    }
  }, [quizId, lessonContent, form]);

  const handleCreateQuiz = async (values: {
    theory_content: string;
  }) => {
    try {
      const result = await createQuiz({
        theory_content: values.theory_content,
      }).unwrap();
      
      message.success('Квиз успешно создан!');
      setCreatedQuizId(result.id);
      setQuizState('taking');
      // Update URL without navigation
      window.history.replaceState({}, '', `/quizzes/${result.id}`);
    } catch (error: any) {
      message.error(error?.data?.detail || 'Ошибка при создании квиза');
    }
  };

  const handleSubmitQuiz = async (values: { [key: string]: any }) => {
    if (!currentQuizId || !quiz) return;

    try {
      // Convert form values to API format
      const answers = quiz.questions.map((question) => {
        const answerValue = values[`question_${question.id}`];
        const answerIds = Array.isArray(answerValue) ? answerValue : [answerValue];
        return {
          question_id: question.id,
          answer_ids: answerIds.filter((id: any) => id !== undefined),
        };
      });

      const result = await submitQuiz({
        quiz_id: currentQuizId,
        answers,
      }).unwrap();

      setQuizResult(result);
      setQuizState('results');
      // Refetch quiz with answers to show explanations
      refetchQuiz();
    } catch (error: any) {
      message.error(error?.data?.detail || 'Ошибка при отправке квиза');
    }
  };

  const handleStartQuiz = () => {
    if (currentQuizId) {
      setQuizState('taking');
      setQuizResult(null);
      answersForm.resetFields();
    }
  };

  const handleRetakeQuiz = () => {
    setQuizState('taking');
    setQuizResult(null);
    answersForm.resetFields();
  };

  const handleBack = () => {
    if (lessonId) {
      // If we came from a lesson, go back to that lesson
      navigate(`/theory/lessons/${lessonId}`);
    } else {
      // Otherwise, go to quizzes list
      navigate('/quizzes');
    }
  };

  // Render create quiz form
  if (quizState === 'create') {
    // Show loading while lesson content is being fetched
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
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center gap-4 mb-2">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Назад
            </Button>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
                  <PlusOutlined /> Создать квиз
                </Title>
              </div>
            </div>
          </div>

          <Card bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleCreateQuiz}
              initialValues={{
                theory_content: lessonContent?.content || '',
              }}
            >
              <Form.Item
                name="theory_content"
                label={<span className="text-base font-medium">Теория урока</span>}
                rules={[{ required: true, message: 'Введите теорию урока' }]}
                extra={
                  <span className="text-gray-500 text-sm">
                    {lessonContent 
                      ? 'Теория загружена из урока. Название квиза и количество вопросов будут определены автоматически.' 
                      : 'Вставьте теорию урока. Название квиза и количество вопросов будут определены автоматически на основе содержимого.'}
                  </span>
                }
              >
                <TextArea
                  rows={15}
                  placeholder="Вставьте теорию урока, на основе которой будет создан квиз..."
                  className="text-base"
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Button
                  htmlType="submit"
                  size="large"
                  loading={creatingQuiz}
                  icon={<PlayCircleOutlined />}
                  block
                  style={{ height: '48px', backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
                >
                  {creatingQuiz ? 'Создание квиза...' : 'Создать квиз'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </PageContainer>
    );
  }

  // Loading state
  if (quizLoading || !quiz) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingDot size="large" />
        </div>
      </PageContainer>
    );
  }

  // Render quiz taking form
  if (quizState === 'taking') {
    return (
      <PageContainer>
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center justify-between">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Назад
            </Button>
            <Text type="secondary" className="text-base">
              Вопросов: {quiz.questions.length}
            </Text>
          </div>

          <Card bordered={false} className="shadow-md">
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Title level={2} className="mb-0">{quiz.title}</Title>
              </div>

              <Divider className="my-4" />

              <Form form={answersForm} layout="vertical" onFinish={handleSubmitQuiz}>
                {quiz.questions.map((question, index) => (
                  <Card key={question.id} bordered={false} className="mb-6 shadow-sm">
                    <Form.Item
                      name={`question_${question.id}`}
                      rules={[{ required: true, message: 'Выберите ответ' }]}
                      className="mb-0"
                    >
                      <Space direction="vertical" size="middle" className="w-full">
                        <Text strong className="text-lg block mb-3">
                          {index + 1}. {question.question_text}
                        </Text>
                        {question.question_type === 'single_choice' ? (
                          <Radio.Group className="w-full">
                            <Space direction="vertical" className="w-full" size="middle">
                              {question.answers.map((answer) => (
                                <Radio key={answer.id} value={answer.id} className="w-full py-2 text-base">
                                  {answer.answer_text}
                                </Radio>
                              ))}
                            </Space>
                          </Radio.Group>
                        ) : (
                          <Checkbox.Group className="w-full">
                            <Space direction="vertical" className="w-full" size="middle">
                              {question.answers.map((answer) => (
                                <Checkbox key={answer.id} value={answer.id} className="w-full py-2 text-base">
                                  {answer.answer_text}
                                </Checkbox>
                              ))}
                            </Space>
                          </Checkbox.Group>
                        )}
                      </Space>
                    </Form.Item>
                  </Card>
                ))}

                <Form.Item className="mt-6 mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={submittingQuiz}
                    block
                    icon={<CheckCircleOutlined />}
                    className="h-12 text-base font-medium"
                  >
                    {submittingQuiz ? 'Проверка ответов...' : 'Завершить квиз'}
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Space>
      </PageContainer>
    );
  }

  // Render quiz results
  if (quizState === 'results' && quizResult && quiz) {
    const correctCount = quizResult.correct_answers;
    const totalCount = quizResult.total_questions;
    const score = quizResult.score_percentage;
    const isPassed = quizResult.is_passed;

    // Create a map of question results for easy lookup
    const questionResultsMap = new Map(
      quizResult.answers.map((answer) => [answer.question_id, answer])
    );

    return (
      <PageContainer>
        <Space direction="vertical" size="large" className="w-full">
          {/* Empty div to match Create page layout - matches Button height */}
          <div style={{ height: '36px' }}></div>
          <Card bordered={false}>
            <Space direction="vertical" size="large" className="w-full" align="center">
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
                  Результаты квиза
                </Title>
              </div>
              <TrophyOutlined style={{ fontSize: 64, color: '#000' }} />
              <Text className="text-2xl font-bold" style={{ color: '#000' }}>
                {score.toFixed(1)}%
              </Text>
              <Progress
                type="circle"
                percent={score}
                strokeColor="#000"
                format={(percent) => `${correctCount}/${totalCount}`}
              />
            </Space>
          </Card>

          <Card bordered={false}>
            <Title level={3}>Детали ответов</Title>
            <Divider />
            <Space direction="vertical" size="large" className="w-full">
              {quiz.questions.map((question, index) => {
                const result = questionResultsMap.get(question.id);
                const isCorrect = result?.is_correct ?? false;
                const selectedAnswerIds = result?.selected_answer_ids ?? [];
                const correctAnswerIds = result?.correct_answer_ids ?? [];

                return (
                  <Card
                    key={question.id}
                    bordered={false}
                    className={isCorrect ? 'border-green-500' : 'border-red-500'}
                  >
                    <Space direction="vertical" size="middle" className="w-full">
                      <div className="flex items-start justify-between">
                        <Text strong className="text-lg">
                          {index + 1}. {question.question_text}
                        </Text>
                        {isCorrect ? (
                          <CheckCircleOutlined style={{ fontSize: '24px', color: '#000' }} />
                        ) : (
                          <CloseCircleOutlined style={{ fontSize: '24px', color: '#000' }} />
                        )}
                      </div>

                      {!isCorrect && (
                        <div>
                          <Text type="secondary">Ваш ответ: </Text>
                          {selectedAnswerIds.length > 0 ? (
                            <Text>
                              {question.answers
                                .filter((a) => selectedAnswerIds.includes(a.id))
                                .map((a) => a.answer_text)
                                .join(', ')}
                            </Text>
                          ) : (
                            <Text type="danger">Ответ не выбран</Text>
                          )}
                        </div>
                      )}
                      {isCorrect && selectedAnswerIds.length > 0 && (
                        <div>
                          <Text type="secondary">Ваш ответ: </Text>
                          <Text strong style={{ fontWeight: 600, fontSize: '16px' }}>
                            {question.answers
                              .filter((a) => selectedAnswerIds.includes(a.id))
                              .map((a) => a.answer_text)
                              .join(', ')}
                          </Text>
                        </div>
                      )}

                      {question.explanation && (
                        <div className="mt-2 p-3 bg-gray-100 rounded" style={{ border: '1px solid #d9d9d9' }}>
                          <Text style={{ color: '#666' }}>{question.explanation}</Text>
                        </div>
                      )}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </Card>

          <Card bordered={false}>
            <Space direction="vertical" size="middle" className="w-full">
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                block
                size="large"
              >
                Назад
              </Button>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleRetakeQuiz}
                block
                size="large"
              >
                Пройти квиз заново
              </Button>
            </Space>
          </Card>
        </Space>
      </PageContainer>
    );
  }

  return null;
};

export default QuizPage;

