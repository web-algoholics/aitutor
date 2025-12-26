import React, { useState, useEffect, useRef } from 'react';
import { Card, Typography, List, Input, Button, Space, message } from 'antd';


const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const GigaChatAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const lastBotRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: input.trim() },
    ];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Используем динамический API URL из конфига
      // Для этого импортируем getApiUrl
      const { getApiUrl } = await import('../utils/config');
      const resp = await fetch(`${getApiUrl()}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!resp.ok) {
        const error = await resp.json().catch(() => ({}));
        throw new Error(error.detail || `Ошибка чата (${resp.status})`);
      }

      const data = await resp.json();
      const reply: ChatMessage = {
        role: 'assistant',
        content: data.reply || 'Ответ пустой',
      };
      setMessages(prev => [...prev, reply]);
    } catch (e: any) {
      console.error(e);
      message.error(e.message || 'Не удалось получить ответ от Май');
      setMessages(prev => prev.slice(0, -1)); // откат последнего user-сообщения, если нужно
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const container = chatScrollRef.current;
    const target = lastBotRef.current;
    if (!container || !target) return;
  
    setTimeout(() => {

      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
  
      const top = container.scrollTop + (targetTop - containerTop);
  
      container.scrollTo({ top, behavior: 'smooth' });
    }, 0);
  }, [messages]);
  
  
  return (
    <div
      style={{
        width: 960,
        minHeight: 600,
        maxWidth: '100%',
        margin: '0 auto',
        padding: '32px 0 48px',
      }}
    >
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 12 }}>
          Чат с AI‑помощницей Май
        </Title>
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Чат работает на базе AI-модели GigaChat. Все ваши сообщения обрабатываются безопасно на наших серверах.
        </Paragraph>
      </Card>

      <Card>
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '50vh',
    }}
  >
    <div
    ref={chatScrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: 16,
        paddingRight: 8,
      }}
    >
    <List
      locale={{ emptyText: 'Пока нет сообщений' }}
      dataSource={messages}
      renderItem={(item, index) => {
        const lastAssistantIndex = messages.map(m => m.role).lastIndexOf('assistant');
        const isLastBot = item.role === 'assistant' && index === lastAssistantIndex;

    return (
      <List.Item
        key={index}
        style={{
          border: 'none',
          justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
        }}
      >
        <div
          ref={isLastBot ? lastBotRef : null}
          style={{
            maxWidth: '70%',
            padding: '8px 12px',
            borderRadius: 12,
            backgroundColor: item.role === 'user' ? '#000' : '#f5f5f5',
            color: item.role === 'user' ? '#fff' : '#000',
            whiteSpace: 'pre-wrap',
          }}
        >
          {item.content}
        </div>
      </List.Item>
    );
  }}
/>

    </div>

    <div style={{ flex: '0 0 auto' }}>
      <Space.Compact style={{ width: '100%' }} direction="vertical">
        <TextArea
          autoSize={{ minRows: 2, maxRows: 4 }} 
          style={{
            minHeight: 56,  
            resize: 'none', 
          }}
          placeholder="Напиши вопрос Май..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <Button type="primary" onClick={handleSend} loading={loading}>
            Задать вопрос
          </Button>
        </div>
      </Space.Compact>
    </div>
  </div>
</Card>

    </div>
  );
};

export default GigaChatAssistantPage;
