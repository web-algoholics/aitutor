import React, { useState, ChangeEvent, KeyboardEvent } from 'react';
import { Card, Input, Button, Spin, Typography } from 'antd';
import AuthLayout from '../components/AuthLayout';

const { TextArea } = Input;
const { Title } = Typography;

// Типы для сообщений
interface Message {
  sender: 'user' | 'bot';
  text: string;
}

// Тип для ответа от API
interface BotResponse {
  answer: string;
}

// Функция для общения с backend GigaChat API
async function askBot(question: string): Promise<string> {
  const response = await fetch('http://localhost:8000/api/gigachat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({ question }),
  });

  // Проверяем HTTP‑статус
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Ошибка сервера ${response.status}: ${text.slice(0, 200)}`
    );
  }

  // Гарантируем, что backend вернул именно JSON
  const data: BotResponse = await response.json();
  if (!data || typeof data.answer !== 'string') {
    throw new Error('Некорректный формат ответа backend (нет поля answer)');
  }

  return data.answer;
}

const ChatBotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'bot', text: 'Привет! Я ваш чат-бот. Задайте вопрос.' },
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    setMessages((msgs) => [
      ...msgs,
      { sender: 'user', text: userText },
    ]);
    setInput('');
    setLoading(true);

    try {
      const botReply = await askBot(userText);
      setMessages((msgs) => [
        ...msgs,
        { sender: 'bot', text: botReply },
      ]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      setMessages((msgs) => [
        ...msgs,
        {
          sender: 'bot',
          text: `Ошибка при обращении к серверу: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (!e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AuthLayout title="Чат-бот">
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <Title level={4} className="text-center mb-6">
            GigaChat Bot
          </Title>

          <div className="flex flex-col gap-2 mb-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={
                  msg.sender === 'bot'
                    ? 'self-start px-4 py-2 bg-gray-100 text-gray-700 rounded-2xl max-w-[80%]'
                    : 'self-end px-4 py-2 bg-blue-600 text-white rounded-2xl max-w-[80%]'
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="self-start">
                <Spin tip="Бот думает..." />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <TextArea
              rows={2}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Введите сообщение..."
              disabled={loading}
            />
            <Button
              type="primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              Отправить
            </Button>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default ChatBotPage;