
const { useState, useEffect, createContext, useContext } = React;


const INITIAL_DATA = {
  courses: [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      description: "Основы JavaScript для начинающих",
      level: "beginner",
      progress: 0,
      duration: "40 часов",
      modules: 12,
      enrolled: false,
      category: "Frontend",
      recommended: true
    },
    {
      id: 2,
      title: "React для начинающих",
      description: "Создание современных веб-приложений",
      level: "intermediate",
      progress: 0,
      duration: "35 часов",
      modules: 10,
      enrolled: false,
      category: "Frontend"
    },
    {
      id: 3,
      title: "TypeScript Advanced",
      description: "Продвинутые паттерны TypeScript",
      level: "advanced",
      progress: 0,
      duration: "25 часов",
      modules: 8,
      enrolled: false,
      category: "Frontend"
    },
    {
      id: 4,
      title: "Node.js Backend Development",
      description: "Разработка серверных приложений",
      level: "intermediate",
      progress: 0,
      duration: "50 часов",
      modules: 15,
      enrolled: false,
      category: "Backend"
    },
    {
      id: 5,
      title: "SQL и Базы Данных",
      description: "Работа с реляционными БД",
      level: "beginner",
      progress: 0,
      duration: "30 часов",
      modules: 10,
      enrolled: false,
      category: "Backend"
    },
    {
      id: 6,
      title: "Web Design Basics",
      description: "HTML, CSS, адаптивный дизайн",
      level: "beginner",
      progress: 0,
      duration: "28 часов",
      modules: 9,
      enrolled: false,
      category: "Frontend"
    }
  ],
  roadmaps: [
    {
      id: "frontend",
      name: "Frontend Developer",
      description: "Путь фронтенд-разработчика",
      icon: "🎨",
      locked: true,
      steps: [
        {
          name: "HTML/CSS Основы",
          status: "locked",
          courses: ["HTML5", "CSS3 Flexbox/Grid"]
        },
        {
          name: "JavaScript",
          status: "locked",
          courses: ["JS Fundamentals"]
        },
        {
          name: "React",
          status: "locked",
          courses: ["React Basics", "React Hooks"]
        },
        {
          name: "TypeScript",
          status: "locked",
          courses: ["TypeScript Introduction"]
        },
        {
          name: "State Management",
          status: "locked",
          courses: ["Redux", "Context API"]
        },
        {
          name: "Next.js",
          status: "locked",
          courses: ["Next.js Fundamentals"]
        }
      ]
    },
    {
      id: "backend",
      name: "Backend Developer",
      description: "Путь бэкенд-разработчика",
      icon: "⚙️",
      locked: true,
      steps: [
        {
          name: "Node.js",
          status: "locked",
          courses: ["Node.js Basics"]
        },
        {
          name: "Express.js",
          status: "locked",
          courses: ["Express Framework"]
        },
        {
          name: "Databases",
          status: "locked",
          courses: ["SQL", "MongoDB"]
        },
        {
          name: "REST API",
          status: "locked",
          courses: ["API Design"]
        },
        {
          name: "Authentication",
          status: "locked",
          courses: ["JWT", "OAuth"]
        }
      ]
    },
    {
      id: "fullstack",
      name: "Full-Stack Developer",
      description: "Комплексное развитие",
      icon: "🚀",
      locked: true,
      steps: [
        {
          name: "Frontend Основы",
          status: "locked",
          courses: ["HTML/CSS/JS"]
        },
        {
          name: "Frontend Фреймворки",
          status: "locked",
          courses: ["React", "Vue"]
        },
        {
          name: "Backend Разработка",
          status: "locked",
          courses: ["Node.js", "Express"]
        },
        {
          name: "Базы Данных",
          status: "locked",
          courses: ["SQL", "NoSQL"]
        },
        {
          name: "DevOps Основы",
          status: "locked",
          courses: ["Docker", "CI/CD"]
        }
      ]
    },
    {
      id: "mobile",
      name: "Mobile Developer",
      description: "Мобильная разработка",
      icon: "📱",
      locked: true,
      steps: [
        {
          name: "React Native",
          status: "locked",
          courses: ["React Native Basics"]
        },
        {
          name: "Flutter",
          status: "locked",
          courses: ["Flutter Fundamentals"]
        },
        {
          name: "State Management",
          status: "locked",
          courses: ["Redux", "MobX"]
        }
      ]
    }
  ]
};

// ============================================
// GIGACHAT API SERVICE
// ============================================

/**
 * GigaChat API Service
 * NOTE: Replace with actual credentials and endpoints
 */
const GigaChatService = {
  // IMPORTANT: Add your GigaChat credentials here
  CLIENT_ID: 'YOUR_CLIENT_ID',
  CLIENT_SECRET: 'YOUR_CLIENT_SECRET',
  API_URL: 'https://gigachat.devices.sberbank.ru/api/v1',
  accessToken: null,

  /**
   * Authenticate with GigaChat API
   */
  async authenticate() {
    // TODO: Implement OAuth2 authentication
    // const response = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Basic ${btoa(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`)}`,
    //     'RqUID': crypto.randomUUID(),
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   },
    //   body: 'scope=GIGACHAT_API_PERS'
    // });
    // const data = await response.json();
    // this.accessToken = data.access_token;
    
    // Mock implementation
    return new Promise(resolve => {
      setTimeout(() => {
        this.accessToken = 'mock_token_' + Date.now();
        resolve(this.accessToken);
      }, 500);
    });
  },

  /**
   * Send message to GigaChat
   */
  async sendMessage(message, context = []) {
    // TODO: Replace with actual API call
    // if (!this.accessToken) {
    //   await this.authenticate();
    // }
    // 
    // const response = await fetch(`${this.API_URL}/chat/completions`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.accessToken}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     model: 'GigaChat',
    //     messages: [...context, { role: 'user', content: message }],
    //     temperature: 0.7,
    //     max_tokens: 2000
    //   })
    // });
    // const data = await response.json();
    // return data.choices[0].message.content;

    // Mock implementation with realistic responses
    return new Promise(resolve => {
      setTimeout(() => {
        const responses = {
          'recommendations': `На основе вашего прогресса в React (70%) и TypeScript (5%), я рекомендую:\n\n1. **Углубить знания TypeScript** - это критически важно для современной разработки. Сфокусируйтесь на типизации React-компонентов.\n\n2. **State Management** - изучите Redux или Zustand для управления состоянием в крупных приложениях.\n\n3. **Testing** - освойте Jest и React Testing Library для написания тестов.\n\n4. **Next.js** - после укрепления базы в React, это логичный следующий шаг для full-stack разработки.\n\nСоветую уделять обучению 1-2 часа ежедневно. Ваш текущий streak в 7 дней - отличный результат! 🔥`,
          'resume': `Анализ вашего резюме:\n\n**Сильные стороны:**\n✅ Хорошая структура\n✅ Четкое описание опыта\n\n**Рекомендации по улучшению:**\n\n1. **Добавьте метрики** - вместо "разработал приложение" напишите "разработал приложение, которое используют 10,000+ пользователей"\n\n2. **Технический стек** - выделите ключевые технологии отдельным блоком (React, TypeScript, Node.js)\n\n3. **Проекты** - добавьте 2-3 значимых проекта с ссылками на GitHub\n\n4. **Достижения** - включите конкретные результаты: ускорение загрузки на X%, сокращение багов на Y%\n\n5. **Soft skills** - добавьте раздел о командной работе, если есть опыт code review или менторства`,
          'cover': `Вот структура профессионального сопроводительного письма:\n\n**Заголовок:**\nВаше имя\nКонтакты\nДата\n\n**Обращение:**\nУважаемая команда [Название компании],\n\n**Введение:**\nПишу вам по поводу вакансии [Позиция]. С большим интересом узнал о возможности присоединиться к вашей команде.\n\n**Основная часть:**\n- Опыт работы с React и современным frontend стеком\n- Участие в разработке [конкретный проект]\n- Результаты: [метрики, достижения]\n\n**Почему эта компания:**\n- Интерес к продукту/технологиям компании\n- Совпадение ценностей\n\n**Заключение:**\nБуду рад обсудить, как мой опыт может принести пользу вашей команде.\n\nС уважением,\n[Ваше имя]`,
          'interview': `Давайте проведем техническое интервью! Вот вопросы разного уровня:\n\n**Вопрос 1 (базовый):**\nОбъясните разницу между let, const и var в JavaScript.\n\n**Вопрос 2 (средний):**\nЧто такое замыкания (closures) и приведите практический пример их использования?\n\n**Вопрос 3 (средний):**\nВ чем разница между useEffect и useLayoutEffect в React?\n\n**Вопрос 4 (продвинутый):**\nКак бы вы оптимизировали React-приложение с большим списком элементов (10,000+)?\n\n**Вопрос 5 (продвинутый):**\nОпишите, как работает Event Loop в JavaScript.\n\nОтветьте на любой из вопросов, и я дам подробный feedback!`
        };

        let response = '';
        if (message.includes('рекомендуй') || message.includes('что изучить')) {
          response = responses.recommendations;
        } else if (message.includes('резюме') || message.includes('CV')) {
          response = responses.resume;
        } else if (message.includes('письмо') || message.includes('cover letter')) {
          response = responses.cover;
        } else if (message.includes('интервью') || message.includes('вопрос')) {
          response = responses.interview;
        } else {
          response = `Спасибо за ваш вопрос! Я - AI HR Tutor, специализируюсь на:\n\n🎯 Рекомендациях по обучению\n📝 Анализе резюме\n✉️ Составлении сопроводительных писем\n💼 Подготовке к интервью\n\nИспользуйте кнопки быстрого доступа выше или просто опишите, чем могу помочь!`;
        }

        resolve(response);
      }, 1000 + Math.random() * 1000);
    });
  },

  /**
   * Get learning recommendations based on user progress
   */
  async getRecommendations(userData) {
    const context = `Пользователь: ${userData.name}. Завершено курсов: ${userData.totalCoursesCompleted}. Текущий streak: ${userData.currentStreak} дней.`;
    return this.sendMessage('Порекомендуй что мне изучить дальше для карьерного роста', [{ role: 'system', content: context }]);
  },

  /**
   * Analyze resume text
   */
  async analyzeResume(resumeText) {
    return this.sendMessage(`Проанализируй резюме: ${resumeText}`);
  },

  /**
   * Generate cover letter
   */
  async generateCoverLetter(resumeData, jobDescription) {
    return this.sendMessage(`Помоги составить сопроводительное письмо. Резюме: ${resumeData}. Вакансия: ${jobDescription}`);
  }
};

// ============================================
// APP CONTEXT
// ============================================

const AppContext = createContext();

const AppProvider = ({ children }) => {
  // Load initial state from localStorage
  const loadInitialState = () => {
    try {
      const savedUser = localStorage.getItem('aitutor_user');
      const savedCourses = localStorage.getItem('aitutor_courses');
      const savedAppMode = localStorage.getItem('aitutor_appMode');
      
      return {
        user: savedUser ? JSON.parse(savedUser) : null,
        courses: savedCourses ? JSON.parse(savedCourses) : INITIAL_DATA.courses,
        appMode: savedAppMode || 'landing'
      };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return {
        user: null,
        courses: INITIAL_DATA.courses,
        appMode: 'landing'
      };
    }
  };

  const initialState = loadInitialState();
  
  const [appMode, setAppMode] = useState(initialState.appMode);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState(initialState.user);
  const [courses, setCourses] = useState(initialState.courses);
  const [roadmaps] = useState(INITIAL_DATA.roadmaps);
  const [chatMessages, setChatMessages] = useState([]);

  // Save to localStorage when user or courses change
  useEffect(() => {
    if (user) {
      localStorage.setItem('aitutor_user', JSON.stringify(user));
    }
    localStorage.setItem('aitutor_courses', JSON.stringify(courses));
    localStorage.setItem('aitutor_appMode', appMode);
  }, [user, courses, appMode]);

  const updateCourseProgress = (courseId, newProgress) => {
    setCourses(prev => {
      const updated = prev.map(course => {
        if (course.id === courseId) {
          const newCourse = { ...course, progress: Math.min(100, Math.max(0, newProgress)) };
          
          // If course completed (reached 100%)
          if (newCourse.progress === 100 && !course.completed) {
            newCourse.completed = true;
            // Update user stats
            setUser(prevUser => {
              if (!prevUser) return prevUser;
              const newUser = { 
                ...prevUser,
                totalCoursesCompleted: prevUser.totalCoursesCompleted + 1
              };
              return newUser;
            });
          }
          
          return newCourse;
        }
        return course;
      });
      return updated;
    });
  };

  const enrollCourse = (courseId) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, enrolled: true } : course
    ));
    
    // Update streak if this is the first course enrolled today
    updateStreak();
  };

  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActiveDate = localStorage.getItem('aitutor_lastActiveDate');
    
    if (lastActiveDate === today) {
      // Already updated today
      return;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    setUser(prevUser => {
      if (!prevUser) return prevUser;
      
      let newStreak = prevUser.currentStreak;
      
      if (lastActiveDate === yesterdayString) {
        // Continued streak
        newStreak = prevUser.currentStreak + 1;
      } else if (!lastActiveDate) {
        // First time
        newStreak = 1;
      } else {
        // Streak broken
        newStreak = 1;
      }
      
      const newUser = {
        ...prevUser,
        currentStreak: newStreak,
        bestStreak: Math.max(prevUser.bestStreak, newStreak)
      };
      
      localStorage.setItem('aitutor_lastActiveDate', today);
      return newUser;
    });
  };

  const addChatMessage = (message) => {
    setChatMessages(prev => [...prev, message]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const registerUser = (name, email) => {
    // Create completely fresh user with zero progress
    const newUser = {
      name: name,
      email: email || '',
      currentStreak: 0,
      bestStreak: 0,
      totalCoursesCompleted: 0,
      totalHoursLearned: 0,
      achievements: []
    };
    
    // Reset all courses to zero progress
    setCourses(INITIAL_DATA.courses.map(course => ({
      ...course,
      progress: 0,
      enrolled: false,
      completed: false
    })));
    
    // Clear chat history
    setChatMessages([]);
    
    setUser(newUser);
    setAppMode('app');
    
    // Initialize streak tracking
    localStorage.setItem('aitutor_lastActiveDate', new Date().toDateString());
  };

  const logout = () => {
    setAppMode('landing');
    setCurrentPage('dashboard');
    setChatMessages([]);
    // Note: We keep user data in localStorage for next login
  };

  return (
    <AppContext.Provider value={{
      appMode,
      setAppMode,
      currentPage,
      setCurrentPage,
      user,
      courses,
      roadmaps,
      chatMessages,
      addChatMessage,
      clearChat,
      updateCourseProgress,
      enrollCourse,
      registerUser,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => useContext(AppContext);

// ============================================
// COMPONENTS
// ============================================

// Landing Page Component
const LandingPage = () => {
  const { setAppMode } = useApp();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-logo">🎓 AI Tutor Platform</div>
          <button className="btn btn-primary" onClick={() => setAppMode('register')}>
            Начать
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-container">
          <div className="hero-content">
            <h1 className="hero-title">Обучение программированию с AI помощником</h1>
            <p className="hero-subtitle">
              Курсы, дорожные карты и персональный AI наставник, который поможет с резюме и интервью
            </p>
            <div className="hero-buttons">
              <button className="btn btn-large btn-primary" onClick={() => setAppMode('register')}>
                🚀 Начать бесплатно
              </button>
              <button className="btn btn-large btn-outline" onClick={() => scrollToSection('features')}>
                📹 Узнать больше
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <h2 className="section-title-landing">Всё что нужно для карьеры в IT</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3 className="feature-title">Структурированные курсы</h3>
              <p className="feature-desc">От основ до продвинутого уровня - всё что нужно разработчику</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3 className="feature-title">Дорожные карты</h3>
              <p className="feature-desc">Четкий путь разработчика: Frontend, Backend, Full-Stack</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Отслеживание прогресса</h3>
              <p className="feature-desc">Видишь свой прогресс в реальном времени</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3 className="feature-title">Streak система</h3>
              <p className="feature-desc">Мотивация учиться каждый день</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI HR-Тьютор</h3>
              <p className="feature-desc">Помощь с резюме, письмами и интервью</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Персональные консультации</h3>
              <p className="feature-desc">Чат с ИИ для любых вопросов про карьеру</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Tutor Features */}
      <section className="ai-features-section">
        <div className="landing-container">
          <div className="ai-features-content">
            <div className="ai-features-text">
              <h2 className="section-title-landing">Наш AI ассистент на базе GigaChat поможет вам:</h2>
              <ul className="ai-features-list">
                <li>✅ Выбрать что учить дальше</li>
                <li>✅ Улучшить резюме</li>
                <li>✅ Написать сопроводительное письмо</li>
                <li>✅ Подготовиться к собеседованию</li>
                <li>✅ Ответить на любые вопросы про карьеру</li>
              </ul>
            </div>
            <div className="ai-features-visual">
              <div className="ai-chat-preview">
                <div className="ai-message">👋 Привет! Готов помочь тебе с карьерой в IT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="landing-container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Студентов</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Курсов</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">10</div>
              <div className="stat-label">Направлений</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.9/5</div>
              <div className="stat-label">Рейтинг</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="landing-container">
          <h2 className="section-title-landing">Начни обучение бесплатно</h2>
          <div className="pricing-card">
            <div className="pricing-badge">✨ Бесплатный план</div>
            <ul className="pricing-features">
              <li>• Все курсы</li>
              <li>• Все дорожные карты</li>
              <li>• AI консультации</li>
              <li>• Отслеживание прогресса</li>
              <li>• Streak система</li>
            </ul>
            <button className="btn btn-large btn-primary" onClick={() => setAppMode('register')}>
              Начать сейчас
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <h2 className="cta-title">Готов начать обучение?</h2>
          <p className="cta-subtitle">Присоединяйся к тысячам студентов, которые уже развивают карьеру в IT</p>
          <button className="btn btn-large btn-primary" onClick={() => setAppMode('register')}>
            Присоединиться сейчас
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-logo">🎓 AI Tutor Platform</div>
            <div className="footer-links">
              <a href="#" target="_blank">About</a>
              <a href="#" target="_blank">Terms</a>
              <a href="#" target="_blank">Privacy</a>
              <a href="#" target="_blank">Contact</a>
            </div>
          </div>
          <div className="footer-copy">
            © 2025 AI Tutor Platform. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Registration Page Component
const RegisterPage = () => {
  const { setAppMode, registerUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }
    registerUser(name.trim(), email.trim());
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-logo">🎓</div>
            <h1 className="register-title">Добро пожаловать!</h1>
            <p className="register-subtitle">Начни свой путь в программировании</p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Ваше имя *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Например: Иван"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email (опционально)</label>
              <input
                type="email"
                className="form-control"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn btn-primary btn-full-width">
              Войти в приложение
            </button>
          </form>

          <div className="register-footer">
            <button className="link-button" onClick={() => setAppMode('landing')}>
              ← Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Navigation
const Sidebar = () => {
  const { currentPage, setCurrentPage, user, logout } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'roadmaps', label: 'Roadmaps', icon: '🗺️' },
    { id: 'courses', label: 'Courses', icon: '📚' },
    { id: 'progress', label: 'Progress', icon: '📊' },
    { id: 'streak', label: 'Streak', icon: '🔥' },
    { id: 'ai-tutor', label: 'AI Tutor', icon: '💬' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span>🎓</span>
        <span>AI Tutor</span>
      </div>
      {navItems.map(item => (
        <div
          key={item.id}
          className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
          onClick={() => setCurrentPage(item.id)}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-24)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ marginBottom: 'var(--space-12)', padding: 'var(--space-12)', background: 'var(--color-secondary)', borderRadius: 'var(--radius-base)' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Пользователь</div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', marginTop: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>{user?.name || 'Гость'}</div>
        </div>
        <button className="btn btn-secondary" onClick={logout} style={{ width: '100%', justifyContent: 'center', padding: 'var(--space-8) var(--space-12)', fontSize: 'var(--font-size-sm)' }}>
          Выход
        </button>
      </div>
    </div>
  );
};

// Streak Page
const StreakPage = () => {
  const { user, setCurrentPage } = useApp();
  const isNewUser = user?.currentStreak === 0 && user?.totalCoursesCompleted === 0;

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">🔥 Твой Streak</h1>
        <p className="section-subtitle">
          {isNewUser ? 'Начни сегодня и создай свой первый streak!' : 'Учись каждый день и поддерживай свою серию!'}
        </p>
      </div>

      <div className="streak-display">
        <div className="streak-icon">🔥</div>
        <div className="streak-number">{user?.currentStreak || 0}</div>
        <div className="streak-label">
          {isNewUser ? '0 дней подряд... но это может измениться прямо сегодня!' : 'дней подряд обучения'}
        </div>
        {!isNewUser && (
          <div style={{ marginTop: 'var(--space-16)', fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)' }}>
            Лучший streak: {user?.bestStreak || 0} дней 🏆
          </div>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-32)' }}>
        <h2 style={{ marginBottom: 'var(--space-16)', fontSize: 'var(--font-size-2xl)', fontWeight: 'var(--font-weight-semibold)' }}>
          {isNewUser ? 'Начни своё обучение!' : 'Продолжай в том же духе!'}
        </h2>
        <div className="card">
          {isNewUser ? (
            <>
              <p style={{ lineHeight: '1.8', fontSize: '16px', marginBottom: '16px' }}>
                🎯 <strong>Streak система</strong> — это твоя мотивация учиться каждый день!
              </p>
              <p style={{ lineHeight: '1.8', marginBottom: '12px' }}>
                Как это работает:
              </p>
              <ul style={{ paddingLeft: 'var(--space-20)', marginTop: 'var(--space-8)', lineHeight: '1.8' }}>
                <li>Занимайся хотя бы 10 минут каждый день</li>
                <li>Твой streak будет расти день за днём</li>
                <li>Пропустишь день — streak обнулится</li>
                <li>Получай достижения за длинные streaks!</li>
              </ul>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '24px', width: '100%' }}
                onClick={() => setCurrentPage('courses')}
              >
                🚀 Начать первый день
              </button>
            </>
          ) : (
            <>
              <p style={{ lineHeight: '1.8' }}>
                Ежедневное обучение - ключ к успеху. Продолжай заниматься каждый день, чтобы:
              </p>
              <ul style={{ paddingLeft: 'var(--space-20)', marginTop: 'var(--space-16)', lineHeight: '1.8' }}>
                <li>Сформировать привычку регулярного обучения</li>
                <li>Быстрее достигать своих целей</li>
                <li>Получать больше достижений</li>
                <li>Видеть реальный прогресс</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Page
const Dashboard = () => {
  const { user, courses, setCurrentPage } = useApp();

  const activeCourses = courses.filter(c => c.enrolled && c.progress > 0 && c.progress < 100);
  const enrolledCourses = courses.filter(c => c.enrolled);
  const averageProgress = enrolledCourses.length > 0 ? Math.round(
    enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length
  ) : 0;
  
  const isNewUser = user?.currentStreak === 0 && user?.totalCoursesCompleted === 0;

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">
          {isNewUser ? `Добро пожаловать, ${user?.name || 'Гость'}! 👋` : `Привет, ${user?.name || 'Гость'}! 👋`}
        </h1>
        <p className="section-subtitle">
          {isNewUser 
            ? 'Ты только начал свой путь программиста. Начни с первого курса!' 
            : 'Продолжай в том же духе! У тебя отличный прогресс.'}
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Текущий Streak</div>
          <div className="stat-value">🔥 {user?.currentStreak || 0}</div>
          <div className="stat-label">дней подряд</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Активные курсы</div>
          <div className="stat-value">{activeCourses.length}</div>
          <div className="stat-label">в процессе</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Средний прогресс</div>
          <div className="stat-value">{averageProgress || 0}%</div>
          <div className="stat-label">завершено</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Всего часов</div>
          <div className="stat-value">{user?.totalHoursLearned || 0}</div>
          <div className="stat-label">обучения</div>
        </div>
      </div>

      {isNewUser ? (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>🚀 Начни своё обучение</h2>
          <div className="card">
            <p style={{ marginBottom: '12px', fontSize: '16px', lineHeight: '1.8' }}>
              Добро пожаловать! 🎉 Начни с <strong>JavaScript Fundamentals</strong> — это даст тебе прочный фундамент для карьеры в программировании.
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '16px' }}
              onClick={() => setCurrentPage('courses')}
            >
              📚 Выбрать первый курс
            </button>
          </div>
          
          <div className="card" style={{ marginTop: '16px', background: 'var(--color-bg-1)', border: '1px solid var(--color-card-border)' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>💡 Совет</div>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              Ты на начале пути. Первый курс даст тебе фундамент. Учись каждый день хотя бы по 30 минут, и ты увидишь реальный прогресс уже через неделю!
            </p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ marginTop: '32px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>🎯 Сегодняшние цели</h2>
            <div className="card">
              <p style={{ marginBottom: '12px', color: 'var(--color-text-secondary)' }}>Рекомендуем сегодня:</p>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                {activeCourses.length > 0 ? (
                  activeCourses.slice(0, 3).map(course => (
                    <li key={course.id}>Продолжить курс "{course.title}" (осталось {100 - course.progress}%)</li>
                  ))
                ) : (
                  <li>Начать новый курс и получить первые знания</li>
                )}
              </ul>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '16px' }}
                onClick={() => setCurrentPage('ai-tutor')}
              >
                🤖 Спросить AI Tutor
              </button>
            </div>
          </div>

          {activeCourses.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>📚 Активные курсы</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeCourses.map(course => (
                  <div key={course.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setCurrentPage('courses')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{course.title}</h3>
                      <span className={`badge badge-${course.level}`}>{course.level}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                      {course.progress}% завершено
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Roadmaps Page
const Roadmaps = () => {
  const { roadmaps, user } = useApp();
  const isNewUser = user?.currentStreak === 0 && user?.totalCoursesCompleted === 0;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✅';
      case 'in-progress': return '🔄';
      case 'locked': return '🔒';
      default: return '⭕';
    }
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">🗺️ Дорожные карты</h1>
        <p className="section-subtitle">
          {isNewUser 
            ? 'Все roadmaps заблокированы — надо начать с курсов' 
            : 'Выбери свой путь развития в IT'}
        </p>
      </div>

      {isNewUser && (
        <div className="card" style={{ marginBottom: '24px', background: 'var(--color-bg-2)', border: '1px solid var(--color-card-border)' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>🔒 Дорожные карты заблокированы</div>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--color-text-secondary)' }}>
            Завершите первый курс, чтобы разблокировать roadmap и увидеть чёткий путь развития карьеры в IT.
          </p>
        </div>
      )}

      <div className="roadmap-list">
        {roadmaps.map(roadmap => (
          <div 
            key={roadmap.id} 
            className="roadmap-card" 
            style={{ 
              opacity: roadmap.locked ? 0.6 : 1,
              filter: roadmap.locked ? 'grayscale(0.5)' : 'none'
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <h2 className="roadmap-title">
                <span style={{ marginRight: '8px' }}>{roadmap.icon}</span>
                {roadmap.name}
                {roadmap.locked && <span style={{ marginLeft: '8px', fontSize: '16px' }}>🔒</span>}
              </h2>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
                {roadmap.locked ? 'Заблокировано — начни с курсов' : roadmap.description}
              </p>
            </div>

            <div className="roadmap-steps">
              {roadmap.steps.map((step, index) => (
                <div key={index} className={`roadmap-step ${step.status}`}>
                  <div className="step-icon">
                    {getStatusIcon(step.status)}
                  </div>
                  <div className="step-content">
                    <div className="step-name">{step.name}</div>
                    <div className="step-courses">
                      {step.courses.join(' • ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Courses Page
const Courses = () => {
  const { courses, enrollCourse } = useApp();
  const [levelFilter, setLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredCourses = courses.filter(course => {
    if (levelFilter !== 'all' && course.level !== levelFilter) return false;
    if (categoryFilter !== 'all' && course.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">📚 Курсы программирования</h1>
        <p className="section-subtitle">Изучай новые технологии и развивай навыки</p>
      </div>

      <div className="filters">
        <select className="filter-select" value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
          <option value="all">Все уровни</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">Все категории</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
        </select>
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <div 
            key={course.id} 
            className="course-card"
            style={{
              border: course.recommended ? '2px solid var(--color-primary)' : undefined,
              position: 'relative'
            }}
          >
            {course.recommended && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '16px',
                background: 'var(--color-primary)',
                color: 'var(--color-btn-primary-text)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                ⭐ Рекомендуем для начинающих
              </div>
            )}
            <div className="course-header">
              <div>
                <h3 className="course-title">{course.title}</h3>
                <span className={`badge badge-${course.level}`}>{course.level}</span>
              </div>
            </div>
            <p className="course-description">{course.description}</p>
            
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${course.progress}%` }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Прогресс: {course.progress}%
            </div>

            <div className="course-meta">
              <span>📖 {course.modules} модулей</span>
              <span>⏱️ {course.duration}</span>
            </div>

            <button 
              className={`btn ${course.enrolled ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ marginTop: '12px', width: '100%' }}
              onClick={() => {
                if (!course.enrolled) {
                  enrollCourse(course.id);
                }
                // TODO: Navigate to course content page
              }}
            >
              {course.enrolled ? (course.progress > 0 ? 'Продолжить' : 'Начать курс') : 'Начать курс'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Progress Page
const Progress = () => {
  const { user, courses, setCurrentPage } = useApp();
  const isNewUser = user?.currentStreak === 0 && user?.totalCoursesCompleted === 0;

  const totalCourses = courses.filter(c => c.enrolled).length;
  const completedCourses = courses.filter(c => c.enrolled && c.progress === 100).length;
  const totalProgress = totalCourses > 0 ? Math.round(
    courses.filter(c => c.enrolled).reduce((acc, c) => acc + c.progress, 0) / totalCourses
  ) : 0;

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">📈 Твой прогресс</h1>
        <p className="section-subtitle">
          {isNewUser ? 'Начни обучение, чтобы видеть свой прогресс' : 'Отслеживай свои достижения и статистику'}
        </p>
      </div>

      {isNewUser && (
        <div className="card" style={{ marginBottom: '32px', background: 'var(--color-bg-3)', border: '1px solid var(--color-card-border)', textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>Твой прогресс пока пуст</h2>
          <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
            Начни первый курс, и здесь появится твоя статистика, достижения и прогресс обучения!
          </p>
          <button className="btn btn-primary btn-large" onClick={() => setCurrentPage('courses')}>
            🚀 Начать обучение
          </button>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <div className="streak-display">
          <div className="streak-icon">🔥</div>
          <div className="streak-number">{user?.currentStreak || 0}</div>
          <div className="streak-label">
            {isNewUser ? 'Начни сегодня и создай первый streak!' : 'дней подряд обучения'}
          </div>
          {!isNewUser && (
            <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Лучший streak: {user?.bestStreak || 0} дней 🏆
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="stat-label">Общий прогресс</div>
          <div className="stat-value">{totalProgress}%</div>
          <div className="progress-bar-container" style={{ marginTop: '12px' }}>
            <div className="progress-bar-fill" style={{ width: `${totalProgress}%` }} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Завершено курсов</div>
          <div className="stat-value">{completedCourses}/{totalCourses}</div>
          <div className="stat-label">из записанных</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Часов обучения</div>
          <div className="stat-value">{user?.totalHoursLearned || 0}</div>
          <div className="stat-label">всего</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Достижения</div>
          <div className="stat-value">{user?.achievements?.length || 0}</div>
          <div className="stat-label">получено</div>
        </div>
      </div>

      {!isNewUser && (
        <>
          {user?.achievements && user.achievements.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>🏆 Достижения</h2>
              <div className="achievement-grid">
                {user.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-icon">{achievement.icon}</div>
                    <div className="achievement-name">{achievement.name}</div>
                    <div className="achievement-description">{achievement.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {courses.filter(c => c.enrolled).length > 0 && (
            <div>
              <h2 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>📊 Прогресс по курсам</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {courses.filter(c => c.enrolled).map(course => (
                  <div key={course.id} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{course.title}</h3>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-primary)' }}>
                        {course.progress}%
                      </span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${course.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// AI Tutor Chat Page
const AITutor = () => {
  const { chatMessages, addChatMessage, clearChat, user, logout } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    addChatMessage({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response
      const response = await GigaChatService.sendMessage(message);
      
      // Add AI response
      addChatMessage({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });
    } catch (error) {
      addChatMessage({
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date()
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    const messages = {
      'recommendations': 'Что мне изучить дальше на основе моего прогресса?',
      'resume': 'Помоги проанализировать мое резюме',
      'cover': 'Помоги составить сопроводительное письмо',
      'interview': 'Подготовь меня к техническому интервью',
      'general': 'Привет! Чем можешь помочь?'
    };
    sendMessage(messages[action]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h1 className="section-title">🤖 AI HR Tutor</h1>
        <p className="section-subtitle">Твой персональный помощник в карьерном развитии</p>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <div>
            <div className="chat-title">Чат с AI Tutor</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Получи персональные рекомендации и помощь
            </div>
          </div>
          {chatMessages.length > 0 && (
            <button className="btn btn-secondary" onClick={clearChat} style={{ padding: '8px 16px', fontSize: '12px' }}>
              Очистить чат
            </button>
          )}
        </div>

        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => handleQuickAction('recommendations')}>
            🎯 Что изучить дальше?
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('resume')}>
            📝 Проверить резюме
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('cover')}>
            ✉️ Сопроводительное письмо
          </button>
          <button className="quick-action-btn" onClick={() => handleQuickAction('interview')}>
            💼 Подготовка к интервью
          </button>
        </div>

        <div className="chat-messages">
          {chatMessages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
              <h3 style={{ marginBottom: '8px' }}>Привет, {user?.name || 'Гость'}!</h3>
              <p>Я твой AI HR Tutor. Помогу с выбором курсов, анализом резюме и подготовкой к интервью.</p>
              <p style={{ marginTop: '8px' }}>Используй кнопки выше или просто задай вопрос!</p>
            </div>
          )}

          {chatMessages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? (user?.name?.[0] || 'U') : '🤖'}
              </div>
              <div className="message-content">
                {message.content.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <textarea
            className="chat-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Напиши сообщение..."
            rows="2"
          />
          <button 
            className="btn btn-primary" 
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isTyping}
          >
            Отправить
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { appMode, currentPage } = useApp();

  if (appMode === 'landing') {
    return <LandingPage />;
  }

  if (appMode === 'register') {
    return <RegisterPage />;
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'roadmaps': return <Roadmaps />;
      case 'courses': return <Courses />;
      case 'progress': return <Progress />;
      case 'streak': return <StreakPage />;
      case 'ai-tutor': return <AITutor />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
};

// ============================================
// RENDER APP
// ============================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AppProvider>
    <App />
  </AppProvider>
);