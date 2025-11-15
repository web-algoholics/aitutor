import React from 'react';

const App = (props) => {
  const modules = props.modules || [
    {
      id: 1,
      title: 'Introduction to Programming',
      moduleInfo: 'Module 1 • 8 lessons',
      description: 'Learn the fundamentals of programming, variables, data types, and control structures.',
      theoryTopics: 12,
      exercises: 24,
      hours: 6,
      status: 'completed',
      icon: '📖'
    },
    {
      id: 2,
      title: 'Data Structures',
      moduleInfo: 'Module 2 • 10 lessons',
      description: 'Master arrays, lists, stacks, queues, and other essential data structures for efficient programming.',
      theoryTopics: 15,
      exercises: 30,
      hours: 8,
      status: 'in-progress',
      progress: 65,
      icon: '🗄️'
    },
    {
      id: 3,
      title: 'Algorithms',
      moduleInfo: 'Module 3 • 12 lessons',
      description: 'Explore sorting, searching, and optimization algorithms to solve complex problems efficiently.',
      theoryTopics: 18,
      exercises: 35,
      hours: 10,
      status: 'locked',
      icon: '🌳'
    },
    {
      id: 4,
      title: 'Object-Oriented Programming',
      moduleInfo: 'Module 4 • 9 lessons',
      description: 'Understand classes, objects, inheritance, polymorphism, and encapsulation principles.',
      theoryTopics: 14,
      exercises: 28,
      hours: 7,
      status: 'locked',
      icon: '📦'
    },
    {
      id: 5,
      title: 'Database Fundamentals',
      moduleInfo: 'Module 5 • 11 lessons',
      description: 'Learn SQL, database design, normalization, and how to work with relational databases.',
      theoryTopics: 16,
      exercises: 32,
      hours: 9,
      status: 'locked',
      icon: '🗃️'
    },
    {
      id: 6,
      title: 'Web Development Basics',
      moduleInfo: 'Module 6 • 13 lessons',
      description: 'Introduction to HTML, CSS, JavaScript, and building your first interactive web applications.',
      theoryTopics: 20,
      exercises: 40,
      hours: 12,
      status: 'locked',
      icon: '🌐'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-gray-800 text-white text-xs rounded-full">Completed</span>;
      case 'in-progress':
        return <span className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full">In Progress</span>;
      case 'locked':
        return <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">Locked</span>;
      default:
        return null;
    }
  };

  const getCircleStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-gray-800 text-white';
      case 'in-progress':
        return 'bg-gray-700 text-white';
      case 'locked':
        return 'bg-white border-2 border-gray-300 text-gray-400';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <nav className="flex items-center gap-8">
            <a href="#" className="text-gray-900 text-sm font-medium">Roadmap</a>
            <a href="#" className="text-gray-600 text-sm">My Progress</a>
            <a href="#" className="text-gray-600 text-sm">Resources</a>
          </nav>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-xl">
              🔔
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-xl">
              ⚙️
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📖</span>
            <h1 className="text-3xl font-bold text-gray-900">Learning Roadmap</h1>
          </div>
          <p className="text-gray-600 text-sm mb-4">Track your progress through structured learning paths</p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-gray-300"></div>
              <span className="text-gray-600">Not Started</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-700"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-800"></div>
              <span className="text-gray-600">Completed</span>
            </div>
          </div>
        </div>

        <div className="relative">
          {modules.map((module, index) => (
            <div key={module.id} className="flex gap-6 mb-6">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getCircleStyle(module.status)}`}>
                  {module.id}
                </div>
                {index < modules.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                )}
              </div>
              <div className={`flex-1 bg-white rounded-xl p-6 ${module.status === 'in-progress' ? 'border-2 border-gray-800' : 'border border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                      {module.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-xs text-gray-500">{module.moduleInfo}</p>
                    </div>
                  </div>
                  {getStatusBadge(module.status)}
                </div>
                <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                <div className="flex items-center gap-6 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span>📖</span>
                    <span>{module.theoryTopics} Theory Topics</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📝</span>
                    <span>{module.exercises} Exercises</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>⏱️</span>
                    <span>~{module.hours} hours</span>
                  </div>
                </div>
                {module.status === 'in-progress' && module.progress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>65% completed • 13 of 20 lessons done</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${module.progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-gray-800 rounded flex items-center justify-center text-sm">
              📖
            </div>
            <span>© 2025 Learning Platform</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">Help Center</a>
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;