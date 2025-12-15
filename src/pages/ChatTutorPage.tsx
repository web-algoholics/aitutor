import React, { useEffect, useState } from 'react';
import { Button, Card, Spin, message, Space, Empty, Collapse, Radio, Typography, Divider } from 'antd';
import { CheckCircleOutlined, BookOutlined, FileTextOutlined, CodeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/python/python';

// Custom styles for CodeMirror
const codemirrorStyles = `
  .codemirror-container .CodeMirror {
    height: 500px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    border-radius: 6px;
  }

  .codemirror-container .CodeMirror-focused {
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }

  .codemirror-container .CodeMirror-gutters {
    background-color: #2d3748;
    border-right: 1px solid #4a5568;
    color: #a0aec0;
  }

  .codemirror-container .CodeMirror-linenumber {
    color: #a0aec0;
  }

  .codemirror-container .CodeMirror-cursor {
    border-left: 2px solid #ffffff;
  }

  .codemirror-container .CodeMirror-selected {
    background-color: rgba(66, 153, 225, 0.3);
  }

  .codemirror-container .CodeMirror-focused .CodeMirror-selected {
    background-color: rgba(66, 153, 225, 0.5);
  }

  /* Syntax highlighting for Python */
  .codemirror-container .cm-keyword { color: #c792ea; }
  .codemirror-container .cm-atom { color: #f78c6c; }
  .codemirror-container .cm-number { color: #f78c6c; }
  .codemirror-container .cm-def { color: #82aaff; }
  .codemirror-container .cm-variable,
  .codemirror-container .cm-punctuation,
  .codemirror-container .cm-property,
  .codemirror-container .cm-operator { color: #ffffff; }
  .codemirror-container .cm-variable-2 { color: #eeffff; }
  .codemirror-container .cm-variable-3,
  .codemirror-container .cm-type { color: #ffcb6b; }
  .codemirror-container .cm-comment { color: #546e7a; }
  .codemirror-container .cm-string { color: #c3e88d; }
  .codemirror-container .cm-string-2 { color: #f07178; }
  .codemirror-container .cm-meta { color: #ffcb6b; }
  .codemirror-container .cm-qualifier { color: #decb6b; }
  .codemirror-container .cm-builtin { color: #ffcb6b; }
  .codemirror-container .cm-bracket { color: #a6e22e; }
  .codemirror-container .cm-tag { color: #f07178; }
  .codemirror-container .cm-attribute { color: #c792ea; }
  .codemirror-container .cm-hr { color: #ffffff; }
  .codemirror-container .cm-link { color: #80cbc4; }
`;

// Inject CodeMirror styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = codemirrorStyles;
  document.head.appendChild(style);
}



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

// Enhanced code editor with syntax highlighting

// Fast CodeMirror Editor component (primary choice)
const CodeMirrorEditor = React.memo(({ value, onChange }: {
  value: string;
  onChange: (value: string | undefined) => void;
}) => {
  const [editorValue, setEditorValue] = useState(value);

  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (editor: any, data: any, newValue: string) => {
    setEditorValue(newValue);
    onChange(newValue);
  };

  return (
    <CodeMirror
      value={editorValue}
      onBeforeChange={handleChange}
      options={{
        mode: 'python',
        theme: 'material',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        tabSize: 4,
        smartIndent: true,
        electricChars: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        foldGutter: true,
        readOnly: false,
        scrollbarStyle: 'native',
        viewportMargin: Infinity,
        extraKeys: {
          'Ctrl-Space': 'autocomplete',
          'Ctrl-/': 'toggleComment',
          'Cmd-/': 'toggleComment',
        },
      }}
      onChange={(editor, data, value) => {
        // Additional change handler if needed
      }}
    />
  );
});

// Simple and fast CodeMirror Editor
const CodeMirrorEditorComponent = React.memo(({ value, onChange }: {
  value: string;
  onChange: (value: string | undefined) => void;
}) => {
  return (
    <div className="codemirror-container">
      <CodeMirrorEditor
        value={value}
        onChange={onChange}
      />
    </div>
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
                    <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm" {...props} />
                  ) : (
                    <code className="block bg-gray-100 text-gray-800 p-3 rounded border-l-4 border-blue-400 overflow-x-auto font-mono text-sm mb-3" {...props} />
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
        <div className="mb-8 space-y-6">
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

          {/* Code Editor - Full Width */}
          <Card title="✏️ Редактор кода - введите ваше решение" className="flex flex-col">
            <div className="flex-grow border rounded-lg overflow-hidden bg-gray-900 min-h-[500px]">
              <CodeMirrorEditorComponent
                  value={code}
                  onChange={(value) => setCode(value || '')}
                />
              </div>

              <Space className="mt-4 w-full justify-between">
                <Space>
                  <Button type="primary" size="large" onClick={handleSubmitCode} loading={codeLoading}>
                  🚀 Отправить решение
                  </Button>
                  <Button onClick={handleGetHint} loading={hintLoading}>
                    💡 Подсказка
                  </Button>
                </Space>
              </Space>
            </Card>
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
