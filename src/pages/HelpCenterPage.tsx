import React from 'react';
import { Typography, Card, Row, Col, Space, Button, Tag, Divider } from 'antd';
import { QuestionCircleOutlined, CustomerServiceOutlined, SafetyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import maiHelperGif from '../video_ai/mai-helper.gif';

const { Title, Paragraph, Text } = Typography;

const HelpCenterPage: React.FC = () => {
  const gifSrc = '/video_ai/mai-helper.gif';
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <Card
        style={{ marginBottom: 24, overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 0, alignItems: 'stretch' }}>
          <div style={{ padding: '28px 32px' }}>
            <Tag color="purple" style={{ marginBottom: 12 }}>Help Center</Tag>
            <Title level={2} style={{ marginBottom: 12 }}>
              Нужна помощь? Твой AI-помощник на связи
            </Title>
            <Paragraph style={{ fontSize: 16, color: '#555' }}>
              Задавай вопросы про платформу, курсы и прогресс. Май ответит и подскажет следующий шаг.
            </Paragraph>
            <Space size="middle" wrap>
              <Button type="primary" icon={<CustomerServiceOutlined />} size="large">
                Задать вопрос
              </Button>
              <Button icon={<SafetyOutlined />} size="large">
                Безопасность и приватность
              </Button>
            </Space>
            <Divider />
            <Space direction="vertical" size={6}>
              <Text type="secondary">Популярные темы:</Text>
              <Space wrap>
                <Tag color="blue">Как начать курс</Tag>
                <Tag color="green">Оплата и подписка</Tag>
                <Tag color="gold">Стрик и мотивация</Tag>
                <Tag color="magenta">Генерация уроков</Tag>
              </Space>
            </Space>
          </div>

          <div style={{ position: 'relative', minHeight: 320, background: '#0d0d15', overflow: 'hidden' }}>
            <img
              src={maiHelperGif}
              alt="AI helper Mai"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            
          </div>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title={<Space><QuestionCircleOutlined />FAQ</Space>}>
            <Space direction="vertical" size="small">
              <Text strong>Как задать вопрос?</Text>
              <Paragraph style={{ marginBottom: 12 }}>Нажми «Задать вопрос», напиши свою проблему — Май ответит и предложит шаги.</Paragraph>

              <Text strong>Как работает стрик?</Text>
              <Paragraph style={{ marginBottom: 12 }}>Стрик растёт, когда ты завершил урок в день X и повторил на следующий. Пропуск дня сбрасывает стрик.</Paragraph>

              <Text strong>Где посмотреть прогресс по курсам?</Text>
              <Paragraph style={{ marginBottom: 0 }}>Открой AI Курсы → выбери курс → смотри дерево модулей и уроков.</Paragraph>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title={<Space><CustomerServiceOutlined />Связаться</Space>}>
            <Space direction="vertical">
              <Space direction="vertical" size={2}>
                <Text strong>Email поддержки</Text>
                <Text type="secondary">support@aitutor.local</Text>
              </Space>
              <Space direction="vertical" size={2}>
                <Text strong>Чат с Май</Text>
                <Text type="secondary">Доступен 24/7 внутри приложения</Text>
              </Space>
              <Space direction="vertical" size={2}>
                <Text strong>Баг-репорты</Text>
                <Text type="secondary">Описывай шаги, скрин и время — мы поправим быстрее</Text>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HelpCenterPage;

