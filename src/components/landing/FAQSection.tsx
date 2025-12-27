import React, { useEffect, useRef, useState } from 'react';
import { Typography, Collapse } from 'antd';

const { Title, Text } = Typography;
const { Panel } = Collapse;

const faqData = [
  {
    key: '1',
    question: 'Как работает ИИ-генерация курсов?',
    answer: 'Наша платформа использует передовые ИИ-технологии для создания персонализированных курсов по программированию. Просто укажите тему и уровень подготовки, и система автоматически сгенерирует структурированный курс с теоретическим материалом, практическими заданиями и тестами.'
  },
  {
    key: '2',
    question: 'Что такое Anki-карточки и как они помогают в обучении?',
    answer: 'Anki-карточки - это система интервального повторения, которая помогает эффективно запоминать информацию. Карточки показываются в оптимальные моменты времени, когда вы наиболее склонны к забыванию материала, что значительно повышает эффективность изучения.'
  },
  {
    key: '3',
    question: 'Доступен ли ИИ-помощник круглосуточно?',
    answer: 'Да, наш ИИ-помощник доступен 24/7. Вы можете задавать вопросы по программированию, просить объяснения сложных концепций, получать помощь с отладкой кода и многое другое в любое время дня и ночи.'
  },
  {
    key: '4',
    question: 'Как отслеживается мой прогресс обучения?',
    answer: 'Платформа автоматически отслеживает ваш прогресс: пройденные курсы, результаты тестов, активность в чате с ИИ-помощником, статистику работы с Anki-карточками. Вы получаете детальные отчеты и рекомендации по улучшению.'
  },
  {
    key: '5',
    question: 'Можно ли использовать платформу на мобильных устройствах?',
    answer: 'Да, наша платформа полностью адаптирована для мобильных устройств. Вы можете изучать курсы, проходить тесты, работать с Anki-карточками и общаться с ИИ-помощником как на смартфоне, так и на планшете.'
  },
  {
    key: '6',
    question: 'Какие языки программирования поддерживаются?',
    answer: 'Мы поддерживаем все основные языки программирования: Python, JavaScript, Java, C++, C#, PHP, Ruby, Go, Swift, Kotlin и многие другие. Также доступны курсы по веб-разработке, мобильной разработке, базам данных и DevOps.'
  }
];

export default function FAQSection() {
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
            Часто задаваемые вопросы
          </Title>
          <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
            Получите ответы на самые популярные вопросы о нашей платформе
          </Text>
        </div>

        <div className={`fade-in-up ${isVisible ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <Collapse
            accordion
            className="bg-white rounded-lg shadow-sm border-0"
          >
            {faqData.map((item, index) => (
              <Panel
                key={item.key}
                header={
                  <div className="flex items-center gap-3 h-16">
                    <div className="w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                    <Text className="text-lg font-medium">{item.question}</Text>
                  </div>
                }
                className="border-b border-gray-100 last:border-b-0"
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <div className="pl-8 pb-4 pt-4">
                  <Text className="text-base leading-relaxed">{item.answer}</Text>
                </div>
              </Panel>
            ))}
          </Collapse>
        </div>
      </div>
    </section>
  );
}
