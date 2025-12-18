import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Space,
  Spin,
  Statistic,
  Row,
  Col,
  Tag,
  List,
  Typography,
  Alert,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  DollarOutlined,
  TrophyOutlined,
  BookOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useAnalyzeMarketMutation } from '../../services/jobsApi';
import type { MarketAnalysisResponse } from '../../services/jobsApi';
import PageContainer from '../../components/PageContainer';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AREAS = [
  { value: '1', label: 'Москва' },
  { value: '2', label: 'Санкт-Петербург' },
  { value: '113', label: 'Россия' },
];

const EXPERIENCE_LEVELS = [
  { value: 'noExperience', label: 'Без опыта' },
  { value: 'between1And3', label: '1-3 года' },
  { value: 'between3And6', label: '3-6 лет' },
  { value: 'moreThan6', label: 'Более 6 лет' },
];

export default function MarketAnalysis() {
  const [query, setQuery] = useState('Python разработчик');
  const [area, setArea] = useState<string | undefined>(undefined);
  const [experience, setExperience] = useState<string | undefined>(undefined);
  const [analyze, { data, isLoading, error }] = useAnalyzeMarketMutation();

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    
    await analyze({
      query: query.trim(),
      area,
      experience,
      limit: 100,
    });
  };

  const formatSalary = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
  };

  const renderSkillList = (skills: MarketAnalysisResponse['technologies'], title: string) => {
    if (!skills || skills.length === 0) return null;

    return (
      <Card title={title} className="mb-4" bordered={false}>
        <List
          dataSource={skills}
          renderItem={(item) => (
            <List.Item>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {item.skill}
                  </Tag>
                  <Text type="secondary">
                    {item.demand_count} вакансий ({item.percentage}%)
                  </Text>
                </div>
                {item.average_salary && (
                  <Text strong style={{ color: '#52c41a' }}>
                    {formatSalary(item.average_salary)}
                  </Text>
                )}
              </div>
            </List.Item>
          )}
        />
      </Card>
    );
  };

  return (
    <PageContainer>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
            Анализ рынка вакансий
          </Title>
        </div>
        <Paragraph className="text-gray-600 mb-6" style={{ textAlign: 'center' }}>
          Узнайте, какие навыки востребованы на рынке труда, и получите рекомендации по обучению
        </Paragraph>
      </div>

      {/* Search Form */}
      <Card className="mb-6" bordered={false}>
        <Space direction="vertical" size="middle" className="w-full">
          <div>
            <Text strong>Поисковый запрос</Text>
            <Input
              size="large"
              placeholder="Например: Python разработчик, Frontend разработчик"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onPressEnter={handleAnalyze}
              prefix={<SearchOutlined />}
            />
          </div>

          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Регион (опционально)</Text>
              <Select
                size="large"
                className="w-full mt-2"
                placeholder="Выберите регион"
                allowClear
                value={area}
                onChange={setArea}
              >
                {AREAS.map((a) => (
                  <Option key={a.value} value={a.value}>
                    {a.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col span={12}>
              <Text strong>Опыт работы (опционально)</Text>
              <Select
                size="large"
                className="w-full mt-2"
                placeholder="Выберите уровень опыта"
                allowClear
                value={experience}
                onChange={setExperience}
              >
                {EXPERIENCE_LEVELS.map((e) => (
                  <Option key={e.value} value={e.value}>
                    {e.label}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          <Button
            type="primary"
            size="large"
            onClick={handleAnalyze}
            loading={isLoading}
            block
          >
            Анализировать рынок
          </Button>
        </Space>
      </Card>

        {/* Error */}
        {error && (
          <Alert
            message="Ошибка анализа"
            description="Не удалось проанализировать вакансии. Попробуйте позже."
            type="error"
            showIcon
            className="mb-6"
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <Spin size="large" />
            <div className="mt-4">
              <Text>Анализируем вакансии с hh.ru...</Text>
            </div>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <div>
            {/* Summary Stats */}
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Найдено вакансий"
                    value={data.total_vacancies}
                    prefix={<SearchOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Средняя зарплата"
                    value={formatSalary(data.salary_stats.average_mid)}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false}>
                  <Statistic
                    title="Рекомендуемых курсов"
                    value={data.recommended_courses.length}
                    prefix={<BookOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* Recommended Courses */}
            {data.recommended_courses.length > 0 && (
              <Card
                title={
                  <span>
                    <BookOutlined className="mr-2" />
                    Рекомендуемые курсы
                  </span>
                }
                className="mb-6"
                bordered={false}
              >
                <Space wrap>
                  {data.recommended_courses.map((course) => (
                    <Tag key={course} color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                      {course}
                    </Tag>
                  ))}
                </Space>
                <Paragraph className="mt-4 text-gray-600">
                  Эти курсы помогут вам получить навыки, наиболее востребованные на рынке труда
                </Paragraph>
              </Card>
            )}

            {/* Skill Gaps */}
            {data.skill_gaps.length > 0 && (
              <Alert
                message="Пробелы в навыках"
                description={
                  <div>
                    <Text>Рассмотрите изучение этих навыков для повышения конкурентоспособности:</Text>
                    <div className="mt-2">
                      {data.skill_gaps.map((gap) => (
                        <Tag key={gap} color="orange" className="mb-2">
                          {gap}
                        </Tag>
                      ))}
                    </div>
                  </div>
                }
                type="warning"
                icon={<WarningOutlined />}
                className="mb-6"
              />
            )}

            {/* Technologies */}
            {renderSkillList(data.technologies, 'Популярные технологии')}

            {/* Frameworks */}
            {renderSkillList(data.frameworks, 'Фреймворки и библиотеки')}

            {/* Databases */}
            {renderSkillList(data.databases, 'Базы данных')}

            {/* Tools */}
            {renderSkillList(data.tools, 'Инструменты')}

            {/* Experience Distribution */}
            {Object.keys(data.experience_distribution).length > 0 && (
              <Card title="Распределение по опыту работы" className="mb-6" bordered={false}>
                <Row gutter={16}>
                  {Object.entries(data.experience_distribution).map(([exp, count]) => (
                    <Col span={6} key={exp}>
                      <Statistic title={exp} value={count} />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Salary Details */}
            {data.salary_stats && (
              <Card title="Детальная статистика зарплат" bordered={false}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic
                      title="Минимальная"
                      value={formatSalary(data.salary_stats.min_from)}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Средняя"
                      value={formatSalary(data.salary_stats.average_mid)}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="Максимальная"
                      value={formatSalary(data.salary_stats.max_to)}
                    />
                  </Col>
                </Row>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!data && !isLoading && !error && (
          <Card bordered={false}>
            <div className="text-center py-12">
              <SearchOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
              <Title level={4} className="mt-4 text-gray-400">
                Введите запрос для анализа рынка вакансий
              </Title>
              <Text type="secondary">
                Мы проанализируем актуальные вакансии и покажем, какие навыки наиболее востребованы
              </Text>
            </div>
          </Card>
        )}
    </PageContainer>
  );
}

