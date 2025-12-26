import React, { useEffect, useRef, useState } from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { CodeOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const steps = [
  {
    number: 1,
    color: 'bg-blue-500',
    title: 'Создайте аккаунт',
    description: 'Зарегистрируйтесь и получите доступ ко всем инструментам платформы'
  },
  {
    number: 2,
    color: 'bg-green-500',
    title: 'Генерируйте курс',
    description: 'Введите тему (например: «React для начинающих») и получите готовый теоретический курс'
  },
  {
    number: 3,
    color: 'bg-purple-500',
    title: 'Проходите уроки и тесты',
    description: 'Изучайте теорию, проходите интерактивные квизы с мгновенной проверкой'
  },
  {
    number: 4,
    color: 'bg-orange-500',
    title: 'Практикуйте и повторяйте',
    description: 'Создавайте Anki-карточки, практикуйтесь в редакторе кода и общайтесь с ИИ-тьютором'
  }
];

const courseExamples = [
  'Python для начинающих',
  'React и современная веб-разработка',
  'Алгоритмы и структуры данных',
  'SQL и работа с базами данных',
  'TypeScript для JavaScript разработчиков',
  'Docker и контейнеризация',
  'Git и системы контроля версий'
];

export default function HowItWorksSection() {
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
    <section ref={sectionRef} className="py-32 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-20 fade-in-up ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0s' }}>
          <Title level={2} className="text-4xl font-bold mb-4">
            Как это работает?
          </Title>
        </div>
        
        <Row gutter={[32, 32]} className="items-stretch">
          <Col xs={24} md={12}>
            <div className="space-y-6 h-full flex flex-col justify-center">
              {steps.map((step) => (
                <div 
                  key={step.number} 
                  className={`flex items-start gap-4 fade-in-up ${isVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${step.number * 0.1}s` }}
                >
                  <div className={`flex-shrink-0 w-12 h-12 ${step.color} text-white rounded-full flex items-center justify-center text-xl font-bold`}>
                    {step.number}
                  </div>
                  <div>
                    <Title level={4}>{step.title}</Title>
                    <Paragraph className="text-gray-600">
                      {step.description}
                    </Paragraph>
                  </div>
                </div>
              ))}
            </div>
          </Col>
          
          <Col xs={24} md={12}>
          <div className={`fade-in-up ${isVisible ? 'visible' : ''} h-full flex flex-col`}
              style={{ animationDelay: '0.5s' }}>
            <Title level={3} className="mb-6 text-center">Примеры тем курса</Title>
            <Card className="flex-1">
              <div className="text-center p-8 h-full flex flex-col">
                <div className="space-y-3 text-left flex-1 flex flex-col justify-center">
                  {courseExamples.map((topic, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-2 fade-in-up ${isVisible ? 'visible' : ''}`}
                      style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
                    >
                      <CheckCircleOutlined className="text-green-500" />
                      <Text>{topic}</Text>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}




