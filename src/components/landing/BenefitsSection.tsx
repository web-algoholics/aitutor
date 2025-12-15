import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const benefits = [
  'Generate courses in seconds',
  'Personalized learning program',
  'Interactive lessons and assignments',
  'AI tutor available 24/7',
  'Adapts to your level',
  'Progress tracking'
];

export default function BenefitsSection() {
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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-20">
          <Title level={2} className="text-4xl font-bold mb-4">
            Platform Benefits
          </Title>
        </div>
        
        <Row gutter={[24, 16]}>
          {benefits.map((benefit, index) => (
            <Col xs={24} sm={12} key={index}>
              <div 
                className={`flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors fade-in-up ${isVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircleOutlined className="text-green-500 text-xl" />
                <Text className="text-lg">{benefit}</Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}




