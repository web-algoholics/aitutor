import React, { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { 
  BookOutlined, 
  CodeOutlined, 
  CheckCircleOutlined,
  ThunderboltOutlined,
  UserOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const features = [
  {
    icon: <ThunderboltOutlined className="text-4xl text-blue-500" />,
    title: 'Генерация курса с ИИ',
    description: 'Создавайте персонализированные курсы по любой теме за минуты с помощью искусственного интеллекта'
  },
  {
    icon: <BookOutlined className="text-4xl text-green-500" />,
    title: 'Структурированное обучение',
    description: 'Получайте продуманную программу обучения с уроками, заданиями и проектами'
  },
  {
    icon: <CodeOutlined className="text-4xl text-purple-500" />,
    title: 'Практика',
    description: 'Закрепляйте знания на практических заданиях и проектах из реального мира'
  },
  {
    icon: <UserOutlined className="text-4xl text-orange-500" />,
    title: 'Персональный тьютор',
    description: 'Общайтесь с ИИ‑тьютором: он поможет учиться и ответит на ваши вопросы'
  },
  {
    icon: <GlobalOutlined className="text-4xl text-red-500" />,
    title: 'Любая тема',
    description: 'Изучайте программирование, языки, науки и любые другие темы по вашему выбору'
  },
  {
    icon: <CheckCircleOutlined className="text-4xl text-teal-500" />,
    title: 'Прогресс',
    description: 'Отслеживайте прогресс обучения и достигайте своих целей'
  }
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-20 fade-in-up ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0s' }}>
          <Title level={2} className="text-4xl font-bold mb-4">
            Почему выбирают EdGen?
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Мощные инструменты для создания и прохождения учебных курсов
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card 
                hoverable
                className={`h-full text-center shadow-sm hover:shadow-lg transition-shadow fade-in-up ${isVisible ? 'visible' : ''}`}
                bordered={false}
                style={{ animationDelay: `${(index + 1) * 0.1}s`, cursor: 'default' }}
              >
                <div className="mb-4">{feature.icon}</div>
                <Title level={4} className="mb-3">{feature.title}</Title>
                <Paragraph className="text-gray-600">{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}




