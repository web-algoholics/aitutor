import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Button, Card, Spin, message, Space, Empty, Collapse, Radio, Typography, Divider } from 'antd';
import { CheckCircleOutlined, BookOutlined, FileTextOutlined, CodeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';

// Lazy load Monaco Editor for better performance
const MonacoEditor = lazy(() => import('@monaco-editor/react'));
import {
  useGetModuleDetailQuery,
  useInitSessionMutation,
  useConfirmTheoryMutation,
  useSubmitQuizMutation,
  useSubmitCodeMutation,
  useGetSessionHintMutation,
  coursesApi,
  SessionStatus,
  QuizQuestion,
  CodingTask,
} from '../services/coursesApi';
import { useGetCurrentUserQuery } from '../services/authApi';

const { Title, Paragraph, Text } = Typography;

// Fallback simple code editor component
const SimpleCodeEditor = React.memo(({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-full p-4 font-mono text-sm bg-gray-900 text-green-400 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
    placeholder="Введите ваш код здесь..."
    style={{ minHeight: '500px', fontFamily: 'Consolas, Monaco, "Courier New", monospace' }}
  />
));

// Memoized Monaco Editor component with fallback
const MemoizedMonacoEditor = React.memo(({ value, onChange, language = 'python' }: {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}) => {
  const [useSimpleEditor, setUseSimpleEditor] = useState(false);
  const [editorLoading, setEditorLoading] = useState(true);

  // Auto-switch to simple editor after 10 seconds if Monaco hasn't loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorLoading) {
        console.warn('Monaco Editor taking too long to load, switching to simple editor');
        setUseSimpleEditor(true);
        setEditorLoading(false);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [editorLoading]);

  if (useSimpleEditor) {
    return (
      <div className="relative">
        <div className="absolute top-2 right-2 text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
          Простой редактор
        </div>
        <SimpleCodeEditor
          value={value}
          onChange={(newValue) => onChange(newValue)}
        />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full bg-gray-50 rounded">
        <Spin size="large" tip="Загрузка редактора..." />
      </div>
    }>
      <MonacoEditor
        height="500px"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-light"
        loading={editorLoading ? <Spin size="large" tip="Инициализация..." /> : null}
        onMount={() => setEditorLoading(false)}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          tabSize: 4,
          insertSpaces: true,
          scrollBeyondLastLine: false,
          automaticLayout: false, // Disabled for better performance
          renderLineHighlight: 'line',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontLigatures: true,
          smoothScrolling: true,
          cursorBlinking: 'blink',
          contextmenu: true,
          mouseWheelZoom: false,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true
          },
          parameterHints: {
            enabled: true
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: 'currentDocument',
          // Additional performance optimizations
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderWhitespace: 'selection',
          rulers: [],
          overviewRulerLanes: 0,
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14
          }
        }}
      />
    </Suspense>
  );
});

export default function ChatTutorPage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  // State management
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [theoryText, setTheoryText] = useState('');
  const [quizData, setQuizData] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [codingTask, setCodingTask] = useState<CodingTask | null>(null);
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);

  // RTK Query hooks
  const { data: module, isLoading: moduleLoading } = useGetModuleDetailQuery(Number(moduleId), { skip: !moduleId });
  const { data: currentUser } = useGetCurrentUserQuery(undefined);

  const [initSession, { isLoading: initLoading }] = useInitSessionMutation();
  const [confirmTheory, { isLoading: confirmLoading }] = useConfirmTheoryMutation();
  const [submitQuiz, { isLoading: quizLoading }] = useSubmitQuizMutation();
  const [submitCode, { isLoading: codeLoading }] = useSubmitCodeMutation();
  const [getHint, { isLoading: hintLoading }] = useGetSessionHintMutation();

  const loading = initLoading || confirmLoading || quizLoading || codeLoading || hintLoading;

  // Configure Monaco Editor when coding stage is reached
  useEffect(() => {
    if (status?.stage === 'coding' && typeof window !== 'undefined') {
      // Configure Monaco to work in SES environment by avoiding require()
      try {
        // Set up Monaco environment with inline workers to avoid loading issues
        window.MonacoEnvironment = {
          getWorkerUrl: function (workerId, label) {
            // Use inline worker to avoid external loading issues
            return `data:text/javascript;charset=utf-8,${encodeURIComponent(`
              self.MonacoEnvironment = {
                baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/'
              };
              importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/base/worker/workerMain.js');
            `)}`;
          }
        };

        // Monaco environment configured for SES compatibility
      } catch (error) {
        console.warn('Monaco configuration warning:', error);
      }
    }
  }, [status?.stage]);

  // Initialize session
  useEffect(() => {
    if (moduleId && currentUser?.id) {
      handleInitializeSession();
    }
  }, [moduleId, currentUser?.id]);

  const handleInitializeSession = async () => {
    try {
      const response = await initSession({
        moduleId: Number(moduleId),
        userId: currentUser!.id,
      }).unwrap();

      setTheoryText(response.message);
      setStatus({
        session_id: response.session_id,
        module_id: response.session_id,
        stage: 'theory',
        theory_confirmed: false,
        quiz_score: null,
        coding_complete: false,
        completed: false,
      });
    } catch (error: any) {
      console.error('Init error:', error);
      messageApi.error(error?.data?.detail || 'Ошибка при инициализации сессии');
    }
  };

  const handleConfirmTheory = async () => {
    if (!status) return;
    try {
      const response = await confirmTheory({
        sessionId: status.session_id,
      }).unwrap();

      setStatus(prev => prev ? { ...prev, stage: 'quiz', theory_confirmed: true } : null);
      setQuizData(response.quiz);
      messageApi.success('Отлично! Переходим к тесту');
    } catch (error: any) {
      console.error('Confirm theory error:', error);
      messageApi.error(error?.data?.detail || 'Ошибка при переходе к тесту');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!status || !quizData) return;
    try {
      const response = await submitQuiz({
        sessionId: status.session_id,
        answers: quizAnswers,
      }).unwrap();

      setStatus(prev => prev ? { ...prev, stage: 'coding', quiz_score: response.quiz_result.score } : null);
      setCodingTask(response.task);
      setCode(response.task.code_template);
      messageApi.success(`Тест пройден! Результат: ${response.quiz_result.score}%`);
    } catch (error: any) {
      console.error('Submit quiz error:', error);
      messageApi.error(error?.data?.detail || 'Ошибка при проверке теста');
    }
  };

  const handleSubmitCode = async () => {
    if (!status || !code) return;
    try {
      const response = await submitCode({
        sessionId: status.session_id,
        code,
      }).unwrap();

      setEvaluation(response.evaluation);
      setStatus(prev => prev ? { ...prev, stage: response.stage as any, completed: response.completed } : null);

      if (response.evaluation.passed) {
        messageApi.success('Отлично! Код прошел проверку! 🎉');
        // Invalidate roadmap data to refresh progress
        dispatch(coursesApi.util.invalidateTags([{ type: 'Modules', id: `course-${courseId}` }]));
        setTimeout(() => {
          navigate(`/courses/${courseId}/roadmap`);
        }, 2000);
      } else {
        messageApi.error('Код требует исправлений');
      }
    } catch (error: any) {
      console.error('Submit code error:', error);
      messageApi.error(error?.data?.detail || 'Ошибка при проверке кода');
    }
  };

  const handleGetHint = async () => {
    if (!status) return;
    try {
      const response = await getHint({
        sessionId: status.session_id,
        currentCode: code,
      }).unwrap();

      messageApi.info(response.hint);
    } catch (error: any) {
      console.error('Get hint error:', error);
      messageApi.error(error?.data?.detail || 'Ошибка при получении подсказки');
    }
  };

  if (moduleLoading || initLoading) {
    return <Spin size="large" className="flex items-center justify-center min-h-screen" />;
  }

  if (!module) {
    return <Empty description="Модуль не найден" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {contextHolder}

      {/* Module Header */}
      <Card className="mb-8">
        <Title level={2}>{module.title}</Title>
        <Paragraph>{module.description}</Paragraph>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <Space size="large">
            <div className="flex items-center gap-2">
              <BookOutlined className={status?.theory_confirmed ? 'text-green-500' : 'text-gray-400'} style={{ fontSize: 20 }} />
              <Text>Теория</Text>
            </div>
            <div className="flex items-center gap-2">
              <FileTextOutlined className={status?.stage === 'quiz' || status?.quiz_score ? 'text-green-500' : 'text-gray-400'} style={{ fontSize: 20 }} />
              <Text>Тест</Text>
            </div>
            <div className="flex items-center gap-2">
              <CodeOutlined className={status?.coding_complete ? 'text-green-500' : 'text-gray-400'} style={{ fontSize: 20 }} />
              <Text>Код</Text>
            </div>
            {status?.completed && (
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-500" style={{ fontSize: 20 }} />
                <Text className="text-green-500">Завершено</Text>
              </div>
            )}
          </Space>
        </div>
      </Card>

      {/* STAGE 1: THEORY */}
      {status?.stage === 'theory' && (
        <Card className="mb-8">
          <Title level={4}>📚 Теория</Title>
          <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-3 mb-1" {...props} />,
                p: ({node, ...props}) => <p className="mb-3 leading-relaxed" {...props} />,
                code: ({node, inline, ...props}: any) =>
                  inline ? (
                    <code className="bg-gray-200 px-2 py-1 rounded text-red-600 font-mono text-sm" {...props} />
                  ) : (
                    <code className="block bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-3" {...props} />
                  ),
                pre: ({node, ...props}) => <pre className="mb-3 overflow-x-auto" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-3" {...props} />,
                table: ({node, ...props}) => <table className="border-collapse border border-gray-300 mb-3 w-full" {...props} />,
                th: ({node, ...props}) => <th className="border border-gray-300 p-2 bg-gray-200" {...props} />,
                td: ({node, ...props}) => <td className="border border-gray-300 p-2" {...props} />,
                a: ({node, ...props}) => <a className="text-blue-600 underline" {...props} />,
              }}
            >
              {theoryText}
            </ReactMarkdown>
          </div>
          <Button type="primary" size="large" onClick={handleConfirmTheory} loading={confirmLoading}>
            Я прочитал теорию → К тесту
          </Button>
        </Card>
      )}

      {/* STAGE 2: QUIZ */}
      {status?.stage === 'quiz' && quizData && (
        <Card className="mb-8">
          <Title level={4}>📝 Проверка знаний</Title>
          <Space direction="vertical" className="w-full" size="large">
            {quizData.questions.map((question) => (
              <div key={question.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 p-4 rounded">
                <Paragraph className="font-semibold text-base mb-3">{question.question}</Paragraph>
                <Radio.Group
                  value={quizAnswers[question.id]}
                  onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                  className="flex flex-col gap-2"
                >
                  {question.options.map((option, idx) => (
                    <Radio key={idx} value={String.fromCharCode(97 + idx)}>
                      <span className="text-base">{option}</span>
                    </Radio>
                  ))}
                </Radio.Group>
              </div>
            ))}
          </Space>
          <Divider />
          <Button
            type="primary"
            size="large"
            onClick={handleSubmitQuiz}
            disabled={Object.keys(quizAnswers).length < quizData.questions.length}
            loading={quizLoading}
          >
            Отправить ответы
          </Button>
        </Card>
      )}

      {/* STAGE 3: CODING TASK */}
      {status?.stage === 'coding' && codingTask && (
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Description */}
            <Card>
              <Title level={4}>💻 Практическое задание</Title>

              <div className="mb-6">
                <Title level={5}>{codingTask.title}</Title>
                <Paragraph className="whitespace-pre-wrap">{codingTask.description}</Paragraph>

                <Collapse
                  items={[
                    {
                      key: 'criteria',
                      label: '✓ Критерии успеха',
                      children: (
                        <ul className="list-disc pl-5 space-y-1">
                          {codingTask.success_criteria.map((criterion, idx) => (
                            <li key={idx} className="text-sm">{criterion}</li>
                          ))}
                        </ul>
                      ),
                    },
                    {
                      key: 'concepts',
                      label: '🎯 Концепции',
                      children: (
                        <ul className="list-disc pl-5 space-y-1">
                          {(Array.isArray(codingTask.expected_concepts) 
                            ? codingTask.expected_concepts 
                            : typeof codingTask.expected_concepts === 'string' 
                              ? JSON.parse(codingTask.expected_concepts) 
                              : []
                          ).map((concept: string, idx: number) => (
                            <li key={idx} className="text-sm">{concept}</li>
                          ))}
                        </ul>
                      ),
                    },
                  ]}
                />
              </div>

              {evaluation && (
                <Card className={`border-l-4 ${evaluation.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <Title level={5}>{evaluation.passed ? '✅ Отлично!' : '⚠️ Требует доработки'}</Title>
                  <Paragraph><strong>Результат:</strong> {evaluation.score}/100</Paragraph>
                  <Paragraph><strong>Отзыв:</strong> {evaluation.feedback}</Paragraph>

                  {evaluation.strengths && evaluation.strengths.length > 0 && (
                    <div className="mt-3">
                      <Text strong>✅ Что получилось:</Text>
                      <ul className="list-disc pl-5 mt-2 text-sm">
                        {evaluation.strengths.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evaluation.improvements && evaluation.improvements.length > 0 && (
                    <div className="mt-3">
                      <Text strong>💡 Что улучшить:</Text>
                      <ul className="list-disc pl-5 mt-2 text-sm">
                        {evaluation.improvements.map((item: string, idx: number) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </Card>

            {/* Code Editor */}
            <Card title="Редактор кода" className="flex flex-col">
              <div className="flex-grow border rounded-lg overflow-hidden bg-white min-h-[500px]">
                <MemoizedMonacoEditor
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  language="python"
                />
              </div>

              <Space className="mt-4 w-full justify-between">
                <Space>
                  <Button type="primary" size="large" onClick={handleSubmitCode} loading={codeLoading}>
                    Отправить решение
                  </Button>
                  <Button onClick={handleGetHint} loading={hintLoading}>
                    💡 Подсказка
                  </Button>
                </Space>
              </Space>
            </Card>
          </div>
        </div>
      )}

      {/* STAGE 4: COMPLETED */}
      {status?.completed && (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-300">
          <div className="text-center py-12">
            <CheckCircleOutlined style={{ fontSize: 80, color: '#22c55e', marginBottom: 24 }} />
            <Title level={3}>Модуль завершен! 🎉</Title>
            <Paragraph className="text-lg">Отлично поработал! Ты освоил этот модуль.</Paragraph>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(`/courses/${courseId}/roadmap`)}
            >
              Вернуться к дорожной карте
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
