import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Space, message, Spin, Steps, Alert, Tag, Empty, Drawer } from 'antd';
import { SendOutlined, CheckOutlined, BulbOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import {
  useGetLessonQuery,
  useSubmitCodeMutation,
  useGetCodeHintMutation,
  Lesson,
  CodeEvaluation
} from '../services/coursesApi';
import { useGetCurrentUserQuery } from '../services/authApi';

export default function CodeEditorPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [code, setCode] = useState('');
  const [evaluation, setEvaluation] = useState<CodeEvaluation | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [showHintDrawer, setShowHintDrawer] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  // API Hooks
  const { data: lesson, isLoading: lessonLoading } = useGetLessonQuery(Number(lessonId), { skip: !lessonId });
  const { data: currentUser } = useGetCurrentUserQuery(undefined);
  const [submitCodeMutation] = useSubmitCodeMutation();
  const [getCodeHintMutation] = useGetCodeHintMutation();

  useEffect(() => {
    if (lesson?.code_template) {
      setCode(lesson.code_template);
    }
  }, [lesson]);

  const handleSubmitCode = async () => {
    if (!lesson || !currentUser) return;

    setSubmitting(true);
    try {
      const result = await submitCodeMutation({
        lessonId: Number(lessonId),
        userId: currentUser.id,
        code
      }).unwrap();

      setEvaluation(result);

      if (result.is_correct) {
        messageApi.success('Отлично! Код пройдет проверку! 🎉');
      } else {
        messageApi.info('Есть чем улучшить. Проверь обратную связь.');
      }
    } catch (error) {
      messageApi.error('Ошибка при проверке кода');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetHint = async () => {
    setHintLoading(true);
    try {
      const result = await getCodeHintMutation({
        lessonId: Number(lessonId),
        currentCode: code
      }).unwrap();

      setHint(result.hint);
      setShowHintDrawer(true);
    } catch (error) {
      messageApi.error('Ошибка при получении подсказки');
      console.error(error);
    } finally {
      setHintLoading(false);
    }
  };

  const resetCode = () => {
    if (lesson) {
      setCode(lesson.code_template);
      setEvaluation(null);
      messageApi.info('Код сброшен');
    }
  };

  if (lessonLoading) return <Spin size="large" className="flex items-center justify-center min-h-screen" />;
  if (!lesson) return <Empty description="Урок не найден" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {contextHolder}

      <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
      <p className="text-gray-600 mb-6">{lesson.content}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="space-y-4">
          <Card title="Код" className="shadow-sm">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Ключевые концепции:</p>
              <div className="space-y-1">
                {Array.isArray(lesson.expected_concepts) 
                  ? lesson.expected_concepts.map((concept, i) => (
                      <Tag key={i}>{concept}</Tag>
                    ))
                  : typeof lesson.expected_concepts === 'string' && lesson.expected_concepts
                  ? JSON.parse(lesson.expected_concepts).map((concept: string, i: number) => (
                      <Tag key={i}>{concept}</Tag>
                    ))
                  : null
                }
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 border border-gray-300 rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Напиши свой код здесь..."
            />

            <div className="flex gap-2 mt-4 flex-wrap">
              <Button
                type="primary"
                onClick={handleSubmitCode}
                loading={submitting}
                disabled={submitting}
                size="large"
              >
                Проверить
              </Button>
              <Button
                onClick={handleGetHint}
                loading={hintLoading}
                disabled={hintLoading}
                size="large"
                icon={<BulbOutlined />}
              >
                Подсказка
              </Button>
              <Button
                onClick={resetCode}
                danger
                size="large"
                icon={<DeleteOutlined />}
              >
                Сброс
              </Button>
            </div>
          </Card>
        </div>

        {/* Feedback Panel */}
        <div className="space-y-4">
          {evaluation ? (
            <>
              <Card
                title={evaluation.is_correct ? "✅ Отлично!" : "📋 Результаты проверки"}
                className={`shadow-sm ${evaluation.is_correct ? 'border-green-200' : 'border-yellow-200'}`}
              >
                <div className="space-y-4">
                  {/* Score */}
                  <div>
                    <p className="font-semibold mb-2">Оценка: {evaluation.score}/100</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          evaluation.score >= 80
                            ? 'bg-green-500'
                            : evaluation.score >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${evaluation.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Feedback */}
                  <Alert
                    message={evaluation.feedback}
                    type={evaluation.is_correct ? 'success' : 'info'}
                    showIcon
                  />
                </div>
              </Card>
            </>
          ) : (
            <Card className="shadow-sm">
              <Empty
                description="Отправь код на проверку"
                style={{ marginTop: 60, marginBottom: 60 }}
              />
            </Card>
          )}

          {/* Tips Card */}
          <Card title="💡 Советы" size="small" className="shadow-sm">
            <ul className="text-sm space-y-2 text-gray-600">
              <li>• Начни с понимания задачи</li>
              <li>• Используй все ключевые концепции</li>
              <li>• Тестируй свой код мысленно</li>
              <li>• Если не знаешь - попроси подсказку!</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Hint Drawer */}
      <Drawer
        title="💡 Подсказка"
        placement="right"
        onClose={() => setShowHintDrawer(false)}
        open={showHintDrawer}
        width={400}
      >
        {hint && (
          <div className="space-y-4">
            <Alert
              message={hint}
              type="info"
              showIcon
            />
            <p className="text-sm text-gray-600">
              Это направляющая подсказка. Думай над тем, что она предполагает, и попробуй снова!
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
