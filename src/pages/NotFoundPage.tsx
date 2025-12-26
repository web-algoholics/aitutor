import React from 'react';
import { Button, Typography, Card, Space } from 'antd';
import '../app.css';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';

const { Title, Paragraph } = Typography;

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  return (
        <PageContainer style={{ minHeight: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Card className="shadow-lg border border-border bg-card" style={{ maxWidth: 500, width: '100%', textAlign: 'center' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Title level={2} className="text-foreground mb-1" style={{ fontWeight: 700 }}>Страница не найдена :(</Title>
          <Paragraph className="text-gray-500 text-base" style={{ fontSize: 18 }}>
            Увы, такой страницы не существует или она была перемещена.
          </Paragraph>
          <Button type="primary" className="transition-colors text-base font-medium px-6 py-2 rounded" style={{ width: 180, fontFamily: 'inherit', fontWeight: 500, letterSpacing: 0.4 }} onClick={() => navigate('/')}>На Главную</Button>
        </Space>
      </Card>
    </PageContainer>
  );
};

export default NotFoundPage;
