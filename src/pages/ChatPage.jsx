import React, { useState } from 'react';
import { Card, Input, Button, Spin, Typography } from 'antd';
import AuthLayout from '../components/AuthLayout';

const { TextArea } = Input;
const { Title } = Typography;

// Функция для общения с backend GigaChat API
async function askBot(question) {
  const response = await fetch('/api/gigachat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  });
  const data = await response.json();
  return data.answer;
}

export default function ChatBotPage() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Привет! Я ваш чат-бот. Задайте вопрос.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    setLoading(true);
    try {
      const botReply = await askBot(input); // Отправка запроса на backend
      setMessages((msgs) => [...msgs, { sender: 'bot', text: botReply }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Ошибка: ' + e.message }]);
    }
    setLoading(false);
    setInput('');
  };

  return (
    <AuthLayout title="Чат-бот">
      <div className="flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <Title level={4} className="text-center mb-6">GigaChat Bot</Title>
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
              onChange={(e) => setInput(e.target.value)}
              placeholder="Введите сообщение..."
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
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
}

