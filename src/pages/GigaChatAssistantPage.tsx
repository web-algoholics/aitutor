import React, { useState } from 'react';
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
      const resp = await fetch('http://localhost:8000/api/chat', {
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

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 20px 48px',
      }}
    >
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 12 }}>
          Чат с AI‑помощницей Май
        </Title>
      </Card>

      <div style={{ height: '700px', width: '600px', margin: '0 auto' }}>
        <Card
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          bodyStyle={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: 16,
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              flex: '1 1 0',
              overflowY: 'auto',
              marginBottom: 16,
              paddingRight: 8,
              minHeight: 0,
              maxHeight: '100%',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <List
              style={{ width: '100%' }}
              dataSource={messages}
              renderItem={(item, index) => (
                <List.Item
                  key={index}
                  style={{
                    border: 'none',
                    justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start',
                    padding: '4px 0',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: 12,
                      backgroundColor: item.role === 'user' ? '#1677ff' : '#f5f5f5',
                      color: item.role === 'user' ? '#fff' : '#000',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.content}
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div style={{ flexShrink: 0 }}>
            <Space.Compact style={{ width: '100%' }} direction="vertical">
              <TextArea
                rows={4}
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
        </Card>
      </div>
    </div>
  );
};

export default GigaChatAssistantPage;
