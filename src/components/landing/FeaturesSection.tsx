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
    title: 'ИИ-генерация курсов',
    description: 'Создавайте персонализированные теоретические курсы по программированию и IT за секунды'
  },
  {
    icon: <BookOutlined className="text-4xl text-green-500" />,
    title: 'Интерактивные квизы',
    description: 'Проходите автоматически генерируемые тесты с мгновенной проверкой и объяснениями'
  },
  {
    icon: <CodeOutlined className="text-4xl text-purple-500" />,
    title: 'Anki-карточки',
    description: 'Закрепляйте знания с помощью системы интервального повторения'
  },
  {
    icon: <UserOutlined className="text-4xl text-orange-500" />,
    title: 'ИИ-помощник 24/7',
    description: 'Общайтесь с персональным ИИ-помощником, задавайте вопросы и получайте мгновенные ответы'
  },
  {
    icon: <GlobalOutlined className="text-4xl text-red-500" />,
    title: 'Анализ IT-рынка',
    description: 'Изучайте актуальные вакансии, зарплаты и требования работодателей в IT-сфере'
  },
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
            Полный набор инструментов для IT-обучения
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            От генерации курсов до практики - все необходимое для эффективного изучения программирования
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card
                hoverable
                className={`text-center shadow-sm hover:shadow-lg transition-shadow fade-in-up ${isVisible ? 'visible' : ''} h-[280px] flex flex-col`}
                bordered={false}
                style={{ animationDelay: `${(index + 1) * 0.1}s`, cursor: 'default' }}
              >
                <div className="mb-4 flex justify-center flex-shrink-0">{feature.icon}</div>
                <div className="flex flex-col justify-between flex-1">
                  <Title level={4} className="mb-3">{feature.title}</Title>
                  <Paragraph className="text-gray-600">{feature.description}</Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}




