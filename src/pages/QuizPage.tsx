import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Button,
  Space,
  Spin,
  message,
  Form,
  Input,
  Radio,
  Checkbox,
  Divider,
  Alert,
  Progress,
  Tag,
  InputNumber,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  FormOutlined,
} from '@ant-design/icons';
import {
  useCreateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizMutation,
  type QuizResponse,
  type QuizResultResponse,
  type AnswerResponse,
  type QuestionResponse,
} from '../services/quizzesApi';
import { useGetLessonContentQuery } from '../services/theoryApi';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

type QuizState = 'create' | 'taking' | 'results';

const QuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = searchParams.get('lessonId');
  const [quizState, setQuizState] = useState<QuizState>('create');
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
    } else if (lessonContent && form) {
      // Pre-fill theory content from lesson
      form.setFieldsValue({
        theory_content: lessonContent.content,
      });
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
      message.success('Квиз завершен!');
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
      navigate(`/theory/lessons/${lessonId}`);
    } else {
      navigate('/theory');
    }
  };

  // Render create quiz form
  if (quizState === 'create') {
    // Show loading while lesson content is being fetched
    if (lessonId && lessonLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center gap-4 mb-2">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Назад
            </Button>
            <Title level={2} className="mb-0">
              <FormOutlined /> Создать квиз
            </Title>
          </div>

          <Card className="shadow-md">
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
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={creatingQuiz}
                  icon={<PlayCircleOutlined />}
                  block
                  className="h-12 text-base font-medium"
                >
                  {creatingQuiz ? 'Создание квиза...' : 'Создать квиз'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </div>
    );
  }

  // Loading state
  if (quizLoading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // Render quiz taking form
  if (quizState === 'taking') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center justify-between">
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
              Назад
            </Button>
            <Text type="secondary" className="text-base">
              Вопросов: {quiz.questions.length}
            </Text>
          </div>

          <Card className="shadow-md">
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Title level={2} className="mb-0">{quiz.title}</Title>
              </div>

              <Divider className="my-4" />

              <Form form={answersForm} layout="vertical" onFinish={handleSubmitQuiz}>
                {quiz.questions.map((question, index) => (
                  <Card key={question.id} className="mb-6 shadow-sm">
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
      </div>
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Space direction="vertical" size="large" className="w-full">
          <Card>
            <Space direction="vertical" size="large" className="w-full" align="center">
              <TrophyOutlined style={{ fontSize: 64, color: isPassed ? '#52c41a' : '#ff4d4f' }} />
              <Title level={2}>Результаты квиза</Title>
              <Text className="text-2xl font-bold" style={{ color: isPassed ? '#52c41a' : '#ff4d4f' }}>
                {score.toFixed(1)}%
              </Text>
              <Progress
                type="circle"
                percent={score}
                status={isPassed ? 'success' : 'exception'}
                format={(percent) => `${correctCount}/${totalCount}`}
              />
              <Alert
                message={isPassed ? 'Поздравляем! Вы прошли квиз!' : 'Квиз не пройден. Попробуйте еще раз.'}
                type={isPassed ? 'success' : 'error'}
                icon={isPassed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                showIcon
              />
            </Space>
          </Card>

          <Card>
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
                    className={isCorrect ? 'border-green-500' : 'border-red-500'}
                  >
                    <Space direction="vertical" size="middle" className="w-full">
                      <div className="flex items-start justify-between">
                        <Text strong className="text-lg">
                          {index + 1}. {question.question_text}
                        </Text>
                        {isCorrect ? (
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            Правильно
                          </Tag>
                        ) : (
                          <Tag color="error" icon={<CloseCircleOutlined />}>
                            Неправильно
                          </Tag>
                        )}
                      </div>

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

                      {!isCorrect && (
                        <div>
                          <Text type="secondary">Правильный ответ: </Text>
                          <Text strong style={{ color: '#52c41a' }}>
                            {question.answers
                              .filter((a) => correctAnswerIds.includes(a.id))
                              .map((a) => a.answer_text)
                              .join(', ')}
                          </Text>
                        </div>
                      )}

                      {question.explanation && (
                        <Alert
                          message={question.explanation}
                          type="info"
                          showIcon
                          className="mt-2"
                        />
                      )}
                    </Space>
                  </Card>
                );
              })}
            </Space>
          </Card>

          <Card>
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
      </div>
    );
  }

  return null;
};

export default QuizPage;

