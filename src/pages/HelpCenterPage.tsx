import React, { useState, useRef } from 'react';
import { Typography, Card, Row, Col, Space, Button, Tag, Divider } from 'antd';
import CustomModal from '../components/CustomModal';
import { QuestionCircleOutlined, CustomerServiceOutlined, SafetyOutlined, PlayCircleOutlined, LockOutlined, SecurityScanOutlined, EyeOutlined, DatabaseOutlined } from '@ant-design/icons';
import maiHelperGif from '../video_ai/mai-helper.gif';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const HelpCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const gifContainerRef = useRef<HTMLDivElement>(null);
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
              <Button
                type="primary"
                icon={<CustomerServiceOutlined />}
                size="large"
                onClick={() => navigate('/help/chat')}
              >
                Задать вопрос
              </Button>
              <Button 
                icon={<SafetyOutlined />} 
                size="large"
                onClick={() => setIsSecurityModalOpen(true)}
              >
                Безопасность и приватность
              </Button>
            </Space>
            <Divider />
            <Space direction="vertical" size={6}>
              <Text type="secondary">Популярные темы:</Text>
              <Space wrap>
                <Tag color="blue">Как начать курс</Tag>
                <Tag color="green">Оплата и подписка</Tag>
                <Tag color="magenta">Генерация уроков</Tag>
              </Space>
            </Space>
          </div>

          <div className="gif-loading-container" ref={gifContainerRef}>
            <img
              src={maiHelperGif}
              alt="AI helper Mai"
              onLoad={() => {
                gifContainerRef.current?.classList.add('loaded');
                // Also add loaded class to the img element
                const img = gifContainerRef.current?.querySelector('img');
                img?.classList.add('loaded');
              }}
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

      <CustomModal
        title={
          <Space>
            <SafetyOutlined style={{ color: '#1677ff' }} />
            <span>Безопасность и приватность</span>
          </Space>
        }
        open={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        footer={
          <Button type="primary" onClick={() => setIsSecurityModalOpen(false)}>
            Понятно
          </Button>
        }
        width={800}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>
              <LockOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              Защита данных
            </Title>
            <Paragraph>
              Мы используем современные методы шифрования для защиты твоих данных. 
              Все пароли хранятся в зашифрованном виде, а передача данных происходит через защищённое HTTPS-соединение.
            </Paragraph>
            <ul style={{ marginLeft: 20, color: '#666' }}>
              <li>Шифрование данных при передаче (TLS/SSL)</li>
              <li>Хеширование паролей с использованием bcrypt</li>
              <li>Регулярные проверки безопасности системы</li>
              <li>Резервное копирование данных</li>
            </ul>
          </div>

          <Divider />

          <div>
            <Title level={4}>
              <EyeOutlined style={{ marginRight: 8, color: '#1677ff' }} />
              Приватность
            </Title>
            <Paragraph>
              Мы уважаем твою приватность и не передаём твои данные третьим лицам без твоего согласия.
            </Paragraph>
            <ul style={{ marginLeft: 20, color: '#666' }}>
              <li>Твои данные используются только для работы платформы</li>
              <li>Мы не продаём и не передаём данные рекламным компаниям</li>
              <li>Ты можешь в любой момент запросить удаление своих данных</li>
              <li>Прогресс обучения виден только тебе</li>
            </ul>
          </div>

          <Divider />

          <div>
            <Title level={4}>
              <DatabaseOutlined style={{ marginRight: 8, color: '#722ed1' }} />
              Хранение данных
            </Title>
            <Paragraph>
              Твои данные хранятся на защищённых серверах с регулярным резервным копированием.
            </Paragraph>
            <ul style={{ marginLeft: 20, color: '#666' }}>
              <li>Данные хранятся в зашифрованном виде</li>
              <li>Регулярные резервные копии для защиты от потери данных</li>
              <li>Соблюдение требований защиты персональных данных</li>
              <li>Ограниченный доступ к данным только для авторизованного персонала</li>
            </ul>
          </div>

          <Divider />

          <div>
            <Title level={4}>
              <SecurityScanOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
              Безопасность аккаунта
            </Title>
            <Paragraph>
              Защити свой аккаунт, следуя простым правилам:
            </Paragraph>
            <ul style={{ marginLeft: 20, color: '#666' }}>
              <li>Используй надёжный пароль (минимум 8 символов, буквы и цифры)</li>
              <li>Не передавай свой пароль другим людям</li>
              <li>Выходи из аккаунта на общих компьютерах</li>
              <li>Сообщи нам, если заметил подозрительную активность</li>
            </ul>
          </div>

          <Divider />

          <div>
            <Title level={4}>AI и твои данные</Title>
            <Paragraph>
              При использовании AI-помощника Май и генерации курсов:
            </Paragraph>
            <ul style={{ marginLeft: 20, color: '#666' }}>
              <li>Твои сообщения обрабатываются для предоставления ответов</li>
              <li>Мы не используем твои данные для обучения моделей без твоего согласия</li>
              <li>История чата хранится только для улучшения качества ответов</li>
              <li>Ты можешь удалить историю чата в любой момент</li>
            </ul>
          </div>

          <Divider />

          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Если у тебя есть вопросы о безопасности или приватности, 
              напиши нам на <Text strong>support@aitutor.local</Text> или задай вопрос Май в чате.
            </Text>
          </div>
        </Space>
      </CustomModal>
    </div>
  );
};

export default HelpCenterPage;