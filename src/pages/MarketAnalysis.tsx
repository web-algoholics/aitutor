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
  InputNumber,
  Slider,
  Modal,
  message,
} from 'antd';
import {
  SearchOutlined,
  DollarOutlined,
  TrophyOutlined,
  BookOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useAnalyzeMarketMutation } from '../services/jobsApi';
import type { MarketAnalysisResponse, AnalysisRequest } from '../services/jobsApi';
import { useGetTheoryCoursesQuery } from '../services/theoryApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Список городов / регионов для фильтрации (значение уходит как часть запроса или area-код HH)
const AREAS = [
  { value: 'Москва', label: 'Москва' },
  { value: 'Санкт-Петербург', label: 'Санкт-Петербург' },
  { value: 'Россия', label: 'Россия (вся страна)' },
  { value: 'Екатеринбург', label: 'Екатеринбург' },
  { value: 'Новосибирск', label: 'Новосибирск' },
  { value: 'Казань', label: 'Казань' },
  { value: 'Нижний Новгород', label: 'Нижний Новгород' },
  { value: 'Воронеж', label: 'Воронеж' },
  { value: 'Самара', label: 'Самара' },
  { value: 'Уфа', label: 'Уфа' },
  { value: 'Краснодар', label: 'Краснодар' },
  { value: 'Челябинск', label: 'Челябинск' },
  { value: 'Омск', label: 'Омск' },
  { value: 'Ростов-на-Дону', label: 'Ростов-на-Дону' },
  { value: 'Пермь', label: 'Пермь' },
  { value: 'Волгоград', label: 'Волгоград' },
  { value: 'Красноярск', label: 'Красноярск' },
  { value: 'Тюмень', label: 'Тюмень' },
  { value: 'Саратов', label: 'Саратов' },
  { value: 'Ярославль', label: 'Ярославль' },
  { value: 'Минск', label: 'Минск' },
];

const EXPERIENCE_LEVELS = [
  { value: 'noExperience', label: 'Без опыта' },
  { value: 'between1And3', label: '1-3 года' },
  { value: 'between3And6', label: '3-6 лет' },
  { value: 'moreThan6', label: 'Более 6 лет' },
];

const EMPLOYMENTS = [
  { value: 'full', label: 'Полная занятость' },
  { value: 'part', label: 'Частичная занятость' },
  { value: 'project', label: 'Проектная работа' },
  { value: 'volunteer', label: 'Волонтёрство' },
  { value: 'probation', label: 'Стажировка' },
];

const SCHEDULES = [
  { value: 'fullDay', label: 'Полный день' },
  { value: 'shift', label: 'Сменный график' },
  { value: 'flexible', label: 'Гибкий график' },
  { value: 'remote', label: 'Удалённая работа' },
  { value: 'flyInFlyOut', label: 'Вахтовый метод' },
];

export default function MarketAnalysis() {
  const [query, setQuery] = useState('Python разработчик');
  const [area, setArea] = useState<string | undefined>(undefined);
  const [experience, setExperience] = useState<string | undefined>(undefined);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [limit, setLimit] = useState<number>(100);
  const [employment, setEmployment] = useState<string | undefined>(undefined);
  const [schedule, setSchedule] = useState<string | undefined>(undefined);
  const [dateFrom, setDateFrom] = useState<string | undefined>(undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(undefined);
  const [techMinPercent, setTechMinPercent] = useState<number>(0);
  const [analyze, { data, isLoading, error }] = useAnalyzeMarketMutation();

  // Theory courses / generation
  const { data: theoryCourses } = useGetTheoryCoursesQuery();
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!query.trim()) return;

    const payload: AnalysisRequest = {
      query: query.trim(),
      limit,
    };

    if (area) payload.area = area;
    if (experience) payload.experience = experience;
    if (employment) payload.employment = employment;
    if (schedule) payload.schedule = schedule;
    if (dateFrom) payload.date_from = dateFrom;
    if (dateTo) payload.date_to = dateTo;

    await analyze(payload);
  };

  const formatSalary = (amount?: number) => {
    if (!amount) return '—';
    return new Intl.NumberFormat('ru-RU').format(Math.round(amount)) + ' ₽';
  };

  const handleSkillClick = async (skill: string) => {
    const skillLower = skill.toLowerCase().trim();

    // Если курсы ещё не подгрузились
    const courses = theoryCourses || [];

    const matches = courses.filter((course) => {
      const inTitle = course.title.toLowerCase().includes(skillLower);
      const inTopic = course.topic.toLowerCase().includes(skillLower);
      return inTitle || inTopic;
    });

    // Если есть подходящие курсы – даём выбрать
    if (matches.length > 0) {
      Modal.info({
        title: `Курсы по "${skill}"`,
        icon: <WarningOutlined style={{ color: '#000' }} />,
        content: (
          <div style={{ color: '#000' }}>
            <p>Выберите курс, к которому перейти:</p>
            <Space
              direction="vertical"
              style={{ marginTop: 8, width: '100%' }}
            >
              {matches.map((course) => (
                <Button
                  key={course.id}
                  type="default"
                  block
                  style={{
                    color: '#000',
                    borderColor: '#000',
                    textAlign: 'left',
                  }}
                  onClick={() => {
                    Modal.destroyAll();
                    navigate(`/theory/courses/${course.id}`);
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {course.title}
                  </span>
                </Button>
              ))}
            </Space>
          </div>
        ),
        okText: 'Закрыть',
        okButtonProps: {
          style: { backgroundColor: '#000', borderColor: '#000', color: '#fff' },
        },
      });
      return;
    }

    // Курс не найден – предложить перейти на страницу создания курса
    Modal.confirm({
      title: `Сгенерировать курс по "${skill}"?`,
      okText: 'Да',
      cancelText: 'Нет',
      icon: <WarningOutlined style={{ color: '#000' }} />,
      okButtonProps: {
        style: { backgroundColor: '#000', borderColor: '#000', color: '#fff' },
      },
      cancelButtonProps: {
        style: { backgroundColor: '#fff', borderColor: '#000', color: '#000' },
      },
      onOk: () => {
        Modal.destroyAll();
        // Переходим на страницу создания курса с предзаполненной темой
        navigate(`/theory/create?topic=${encodeURIComponent(skill)}`);
      },
    });
  };

  const renderSkillList = (
    skills: MarketAnalysisResponse['technologies'],
    title: string,
    minPercent?: number
  ) => {
    if (!skills || skills.length === 0) return null;

    const filtered = typeof minPercent === 'number'
      ? skills.filter((s) => s.percentage >= minPercent)
      : skills;

    if (filtered.length === 0) {
      return null;
    }

    return (
      <Card title={title} className="mb-4">
        <List
          dataSource={filtered}
          renderItem={(item) => (
            <List.Item>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <Tag
                    color="blue"
                    style={{ fontSize: '14px', padding: '4px 12px', cursor: 'pointer' }}
                    onClick={() => handleSkillClick(item.skill)}
                  >
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Title level={2} className="mb-6">
          Анализ рынка вакансий
        </Title>
        <Paragraph className="text-gray-600 mb-6">
          Узнайте, какие навыки востребованы на рынке труда, и получите рекомендации по обучению
        </Paragraph>

        {/* Search Form */}
        <Card className="mb-6">
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
              <Col span={8}>
                <Text strong>Регион (опционально)</Text>
                <Select
                  size="large"
                  className="w-full mt-2"
                  placeholder="Выберите регион"
                  allowClear
                  value={area}
                  onChange={setArea}
                  showSearch
                  optionFilterProp="children"
                >
                  {AREAS.map((a) => (
                    <Option key={a.value} value={a.value}>
                      {a.label}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col span={8}>
                <Text strong>Опыт</Text>
                <Select
                  size="large"
                  className="w-full mt-2"
                  placeholder="Уровень опыта"
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
              <Col span={8}>
                <Text strong>Количество вакансий для анализа</Text>
                <InputNumber
                  min={1}
                  max={1000}
                  size="large"
                  className="w-full mt-2"
                  value={limit}
                  onChange={(value) => setLimit(value || 1)}
                />
              </Col>
            </Row>

            {/* Переключатель расширенных фильтров */}
            <Button
              type="default"
              onClick={() => setShowAdvanced((prev) => !prev)}
              style={{ borderColor: '#000', color: '#000' }}
            >
              {showAdvanced ? 'Скрыть расширенные фильтры' : 'Показать расширенные фильтры'}
            </Button>

            {showAdvanced && (
              <>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Формат занятости</Text>
                    <Select
                      size="large"
                      className="w-full mt-2"
                      placeholder="Выберите формат занятости"
                      allowClear
                      value={employment}
                      onChange={(value) => {
                        if (value === 'any') {
                          setEmployment(undefined);
                        } else {
                          setEmployment(value);
                        }
                      }}
                    >
                      <Option value="any">Любой формат</Option>
                      {EMPLOYMENTS.map((e) => (
                        <Option key={e.value} value={e.value}>
                          {e.label}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                  <Col span={12}>
                    <Text strong>График работы</Text>
                    <Select
                      size="large"
                      className="w-full mt-2"
                      placeholder="Выберите график работы"
                      allowClear
                      value={schedule}
                      onChange={(value) => {
                        if (value === 'any') {
                          setSchedule(undefined);
                        } else {
                          setSchedule(value);
                        }
                      }}
                    >
                      <Option value="any">Любой график</Option>
                      {SCHEDULES.map((s) => (
                        <Option key={s.value} value={s.value}>
                          {s.label}
                        </Option>
                      ))}
                    </Select>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Text strong>Дата публикации с</Text>
                    <Input
                      type="date"
                      size="large"
                      className="w-full mt-2"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value || undefined)}
                    />
                  </Col>
                  <Col span={12}>
                    <Text strong>Дата публикации по</Text>
                    <Input
                      type="date"
                      size="large"
                      className="w-full mt-2"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value || undefined)}
                    />
                  </Col>
                </Row>

              </>
            )}

            <Button
              type="primary"
              size="large"
              icon={<SearchOutlined />}
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
            showIcon
            icon={<WarningOutlined style={{ color: '#000' }} />}
            className="mb-6"
            style={{ backgroundColor: '#fff', borderColor: '#000', color: '#000' }}
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
            {/* No data case */}
            {data.total_vacancies === 0 && (
              <Card className="mb-6" style={{ backgroundColor: '#fff', borderColor: '#000' }}>
                <div className="text-center py-6">
                  <Title level={4} className="mb-2">
                    По данному запросу вакансий не найдено
                  </Title>
                  <Text>
                    Попробуйте изменить запрос, регион или ослабить фильтры.
                  </Text>
                </div>
              </Card>
            )}

            {/* Summary Stats */}
            <Row gutter={16} className="mb-6">
              <Col span={12}>
                <Card>
                  <Statistic
                    title="Средняя зарплата"
                    value={formatSalary(data.salary_stats.average_mid)}
                    prefix={<DollarOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
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
              >
                <Space wrap>
                  {data.recommended_courses.map((course) => (
                    <Tag
                      key={course}
                      color="green"
                      style={{ fontSize: '14px', padding: '4px 12px', cursor: 'pointer' }}
                      onClick={() => handleSkillClick(course)}
                    >
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
                        <Tag
                          key={gap}
                          color="orange"
                          className="mb-2"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSkillClick(gap)}
                        >
                          {gap}
                        </Tag>
                      ))}
                    </div>
                  </div>
                }
                showIcon
                icon={<WarningOutlined style={{ color: '#000' }} />}
                className="mb-6"
                style={{ backgroundColor: '#fff', borderColor: '#000', color: '#000' }}
              />
            )}

            {/* Technology filter controls */}
            <Card className="mb-6">
              <Text strong>Фильтр по технологиям</Text>
              <Paragraph type="secondary" className="mt-1 mb-3">
                Показывать только те технологии, которые встречаются не реже указанного процента вакансий.
              </Paragraph>
              <Row align="middle" gutter={16}>
                <Col span={18}>
                  <Slider
                    min={0}
                    max={20}
                    step={1}
                    value={techMinPercent}
                    onChange={(value) => setTechMinPercent(value as number)}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Минимальный процент"
                    value={`${techMinPercent} %`}
                  />
                </Col>
              </Row>
            </Card>

            {/* Technologies */}
            {renderSkillList(data.technologies, 'Популярные технологии', techMinPercent)}

            {/* Frameworks */}
            {renderSkillList(data.frameworks, 'Фреймворки и библиотеки')}

            {/* Databases */}
            {renderSkillList(data.databases, 'Базы данных')}

            {/* Tools */}
            {renderSkillList(data.tools, 'Инструменты')}

            {/* Experience Distribution */}
            {Object.keys(data.experience_distribution).length > 0 && (
              <Card title="Распределение по опыту работы" className="mb-6">
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
              <Card title="Детальная статистика зарплат">
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
          <Card>
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
      </div>
    </div>
  );
}

