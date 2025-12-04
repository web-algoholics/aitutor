import React, { useEffect, useState, useRef } from 'react';
import { Input, Button, Card, Spin, message, Space, Empty, Avatar } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, CheckOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetModuleDetailQuery,
  useStartChatSessionMutation,
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
  useMarkModuleCompleteMutation,
  Module,
  ChatHistory
} from '../services/coursesApi';
import { useGetCurrentUserQuery } from '../services/authApi';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export default function ChatTutorPage() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API Hooks
  const { data: module, isLoading: moduleLoading } = useGetModuleDetailQuery(Number(moduleId), { skip: !moduleId });
  const { data: currentUser } = useGetCurrentUserQuery(undefined);
  const [startChatSession] = useStartChatSessionMutation();
  const [sendChatMessage] = useSendChatMessageMutation();
  const { data: chatHistory } = useGetChatHistoryQuery(sessionId ?? 0, { skip: !sessionId });
  const [markModuleComplete] = useMarkModuleCompleteMutation();

  useEffect(() => {
    if (moduleId && currentUser?.id) {
      initializeChatSession();
    }
  }, [moduleId, currentUser?.id]);

  // Update messages from chat history
  useEffect(() => {
    if (chatHistory?.messages) {
      const historyMessages = chatHistory.messages.map((msg: any) => ({
        role: (msg.role === 'assistant' ? 'ai' : 'user') as 'user' | 'ai',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(historyMessages);
    }
  }, [chatHistory]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChatSession = async () => {
    try {
      const result = await startChatSession({
        moduleId: Number(moduleId),
        userId: currentUser!.id
      }).unwrap();

      setSessionId(result.session_id);

      // Add initial AI greeting
      const greeting = `Привет! 👋 Я твой персональный AI-преподаватель. Сегодня мы изучаем "${module?.title}". 

Что ты уже знаешь об этой теме? Можешь также спросить что-нибудь, и я помогу тебе разобраться!`;
      
      setMessages([{
        role: 'ai',
        content: greeting,
        timestamp: new Date()
      }]);
    } catch (error) {
      messageApi.error('Ошибка при инициализации чата');
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;

    const userMessage = input;
    setInput('');
    setSending(true);

    try {
      // Add user message to chat optimistically
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }]);

      // Send to AI
      const response = await sendChatMessage({
        sessionId,
        question: userMessage
      }).unwrap();

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'ai',
        content: response.ai_response,
        timestamp: new Date()
      }]);
    } catch (error) {
      messageApi.error('Ошибка при отправке сообщения');
      console.error(error);
      // Remove last user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleCompleteModule = async () => {
    try {
      await markModuleComplete({
        userId: currentUser!.id,
        moduleId: Number(moduleId)
      }).unwrap();

      messageApi.success('Модуль завершен! 🎉');
      setTimeout(() => {
        navigate(`/courses/${courseId}/roadmap`);
      }, 1500);
    } catch (error) {
      messageApi.error('Ошибка при завершении модуля');
    }
  };

  if (moduleLoading) return <Spin size="large" className="flex items-center justify-center min-h-screen" />;
  if (!module) return <Empty description="Модуль не найден" />;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {contextHolder}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{module.title}</h2>
            <p className="text-sm text-gray-600">{module.description}</p>
          </div>
          <Button onClick={() => navigate(`/courses/${courseId}/roadmap`)}>
            ← Назад
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Empty description="Начни разговор с AI преподавателем" />
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <Avatar
                    size={32}
                    icon={<RobotOutlined />}
                    className="bg-blue-500 flex-shrink-0"
                  />
                )}

                <div
                  className={`max-w-2xl p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <Avatar
                    size={32}
                    icon={<UserOutlined />}
                    className="bg-green-500 flex-shrink-0"
                  />
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <Input
              placeholder="Задай вопрос преподавателю..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={sendMessage}
              disabled={sending}
              size="large"
            />
            <Button
              type="primary"
              size="large"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={sending}
              disabled={!input.trim() || sending}
            >
              Отправить
            </Button>
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              type="dashed"
              block
              icon={<CheckOutlined />}
              onClick={handleCompleteModule}
            >
              Завершить модуль
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
