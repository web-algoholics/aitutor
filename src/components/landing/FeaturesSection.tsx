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
    title: 'AI Course Generation',
    description: 'Create personalized courses on any topic in minutes with the power of artificial intelligence'
  },
  {
    icon: <BookOutlined className="text-4xl text-green-500" />,
    title: 'Structured Learning',
    description: 'Get well-structured learning programs with lessons, assignments, and projects'
  },
  {
    icon: <CodeOutlined className="text-4xl text-purple-500" />,
    title: 'Practical Exercises',
    description: 'Reinforce your knowledge through hands-on exercises and real-world projects'
  },
  {
    icon: <UserOutlined className="text-4xl text-orange-500" />,
    title: 'Personal Tutor',
    description: 'Chat with an AI tutor that will help you learn and answer your questions'
  },
  {
    icon: <GlobalOutlined className="text-4xl text-red-500" />,
    title: 'Any Topic',
    description: 'Learn programming, languages, sciences, and any other topics of your choice'
  },
  {
    icon: <CheckCircleOutlined className="text-4xl text-teal-500" />,
    title: 'Progress Tracking',
    description: 'Track your learning progress and achieve your goals'
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
            Why Choose EdGen?
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful tools for creating and taking learning courses
          </Paragraph>
        </div>
        
        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card 
                hoverable
                className={`h-full text-center shadow-sm hover:shadow-lg transition-shadow fade-in-up ${isVisible ? 'visible' : ''}`}
                bordered={false}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
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




