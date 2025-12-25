import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
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
  message,
} from 'antd';
import LoadingDot from '../../components/LoadingDot';
import CustomModal from '../../components/CustomModal';
import {
  SearchOutlined,
  DollarOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useAnalyzeMarketMutation } from '../../services/jobsApi';
import type { AnalysisRequest, MarketAnalysisResponse } from '../../services/jobsApi';
import PageContainer from '../../components/PageContainer';
import { useGetTheoryCoursesQuery } from '../../services/theoryApi';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

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

  // Modal states
  const [coursesModalOpen, setCoursesModalOpen] = useState(false);
  const [generateCourseModalOpen, setGenerateCourseModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  
  // Refs для кастомных выпадающих списков
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [experienceDropdownOpen, setExperienceDropdownOpen] = useState(false);
  
  // Закрытие выпадающих списков при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setAreaDropdownOpen(false);
      }
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target as Node)) {
        setExperienceDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    setSelectedSkill(skill);

    // Если курсы ещё не подгрузились
    const courses = theoryCourses || [];

    const matches = courses.filter((course) => {
      const inTitle = course.title.toLowerCase().includes(skillLower);
      const inTopic = course.topic.toLowerCase().includes(skillLower);
      return inTitle || inTopic;
    });

    // Если есть подходящие курсы – даём выбрать
    if (matches.length > 0) {
      setCoursesModalOpen(true);
      return;
    }

    // Курс не найден – предложить перейти на страницу создания курса
    setGenerateCourseModalOpen(true);
  };

  const handleCourseSelect = (courseId: number) => {
    setCoursesModalOpen(false);
    navigate(`/theory/courses/${courseId}`);
  };

  const handleGenerateCourse = () => {
    setGenerateCourseModalOpen(false);
    navigate(`/theory/create?topic=${encodeURIComponent(selectedSkill)}`);
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
    <PageContainer>
      <Space vertical size="large" style={{ width: '100%' }}>
        {/* Empty div to match Create page layout - matches Button height */}
        <div style={{ height: '36px' }}></div>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Title level={2} style={{ margin: 0, color: '#fff', textAlign: 'center' }}>
              Анализ вакансий
            </Title>
          </div>
        <Paragraph className="text-base text-gray-600 mb-4" style={{ textAlign: 'center' }}>
          Узнайте, какие навыки востребованы на рынке труда, и получите рекомендации по обучению
        </Paragraph>
      </div>

      {/* Search Form */}
      <Card className="mb-6">
        <Space vertical size="middle" className="w-full">
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
              <div className={`custom-select-container mt-2 ${areaDropdownOpen ? 'open' : ''}`} ref={areaDropdownRef}>
                <div
                  className="custom-select-trigger"
                  onClick={() => setAreaDropdownOpen(!areaDropdownOpen)}
                >
                  <span className={area ? '' : 'custom-select-placeholder'}>
                    {area ? AREAS.find(a => a.value === area)?.label || area : 'Выберите регион'}
                  </span>
                  <span className="custom-select-arrow">▼</span>
                </div>
                {area && (
                  <span
                    className="custom-select-clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      setArea(undefined);
                    }}
                  >
                    ×
                  </span>
                )}
                {areaDropdownOpen && (
                  <div className="custom-select-dropdown">
                    {AREAS.map((a) => (
                      <div
                        key={a.value}
                        className={`custom-select-option ${area === a.value ? 'selected' : ''}`}
                        onClick={() => {
                          setArea(a.value);
                          setAreaDropdownOpen(false);
                        }}
                      >
                        {a.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
            <Col span={12}>
              <Text strong>Опыт работы (опционально)</Text>
              <div className={`custom-select-container mt-2 ${experienceDropdownOpen ? 'open' : ''}`} ref={experienceDropdownRef}>
                <div
                  className="custom-select-trigger"
                  onClick={() => setExperienceDropdownOpen(!experienceDropdownOpen)}
                >
                  <span className={experience ? '' : 'custom-select-placeholder'}>
                    {experience ? EXPERIENCE_LEVELS.find(e => e.value === experience)?.label || experience : 'Выберите уровень опыта'}
                  </span>
                  <span className="custom-select-arrow">▼</span>
                </div>
                {experience && (
                  <span
                    className="custom-select-clear"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExperience(undefined);
                    }}
                  >
                    ×
                  </span>
                )}
                {experienceDropdownOpen && (
                  <div className="custom-select-dropdown">
                    {EXPERIENCE_LEVELS.map((e) => (
                      <div
                        key={e.value}
                        className={`custom-select-option ${experience === e.value ? 'selected' : ''}`}
                        onClick={() => {
                          setExperience(e.value);
                          setExperienceDropdownOpen(false);
                        }}
                      >
                        {e.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            showIcon
            icon={<WarningOutlined style={{ color: '#000' }} />}
            className="mb-6"
            style={{ backgroundColor: '#fff', borderColor: '#000', color: '#000' }}
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-12">
            <LoadingDot size="large" />
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
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Найдено вакансий"
                    value={data.total_vacancies}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Средняя зарплата"
                    value={formatSalary(data.salary_stats.average_mid)}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card>
                  <Statistic
                    title="Рекомендуемых курсов"
                    value={data.recommended_courses.length}
                  />
                </Card>
              </Col>
            </Row>

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
              <Card title="Детальная статистика зарплат" className="mb-6">
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

            {/* Recommended Courses */}
            {data.recommended_courses.length > 0 && (
              <Card
                title="Рекомендуемые курсы"
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
          </div>
        )}

        {/* Empty State */}
        {!data && !isLoading && !error && (
          <Card variant="borderless">
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
      </Space>

      {/* Courses Selection Modal */}
      <CustomModal
        title={
          <Space>
            <WarningOutlined style={{ color: '#000' }} />
            <span>Курсы по "{selectedSkill}"</span>
          </Space>
        }
        open={coursesModalOpen}
        onClose={() => setCoursesModalOpen(false)}
        footer={
          <Button
            type="primary"
            onClick={() => setCoursesModalOpen(false)}
            style={{ backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
          >
            Закрыть
          </Button>
        }
        width={500}
      >
        <div style={{ color: '#000' }}>
          <p>Выберите курс, к которому перейти:</p>
          <Space
            vertical
            style={{ marginTop: 8, width: '100%' }}
          >
            {(theoryCourses || [])
              .filter((course) => {
                const skillLower = selectedSkill.toLowerCase().trim();
                const inTitle = course.title.toLowerCase().includes(skillLower);
                const inTopic = course.topic.toLowerCase().includes(skillLower);
                return inTitle || inTopic;
              })
              .map((course) => (
                <Button
                  key={course.id}
                  type="default"
                  block
                  style={{
                    color: '#000',
                    borderColor: '#000',
                    textAlign: 'left',
                  }}
                  onClick={() => handleCourseSelect(course.id)}
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
      </CustomModal>

      {/* Generate Course Confirmation Modal */}
      <CustomModal
        title={
          <Space>
            <WarningOutlined style={{ color: '#000' }} />
            <span>Сгенерировать курс по "{selectedSkill}"?</span>
          </Space>
        }
        open={generateCourseModalOpen}
        onClose={() => setGenerateCourseModalOpen(false)}
        footer={
          <Space>
            <Button
              onClick={() => setGenerateCourseModalOpen(false)}
              style={{ backgroundColor: '#fff', borderColor: '#000', color: '#000' }}
            >
              Нет
            </Button>
            <Button
              type="primary"
              onClick={handleGenerateCourse}
              style={{ backgroundColor: '#000', borderColor: '#000', color: '#fff' }}
            >
              Да
            </Button>
          </Space>
        }
        width={500}
      >
        <Paragraph>
          Курс по навыку "{selectedSkill}" не найден. Хотите создать новый курс с помощью AI?
        </Paragraph>
      </CustomModal>
    </PageContainer>
  );
}

