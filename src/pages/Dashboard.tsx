import React, { useState, useEffect } from 'react';
import { Card, Button, Progress, Dropdown, Modal, Form, Select, message, Empty, Space, Spin } from 'antd';
import { MoreOutlined, PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import type { FormInstance } from 'antd';
import type { MenuProps } from 'antd';

interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
}

interface Course {
  id: number;
  name: string;
  path: string;
  hours: number;
  projects: number;
  progress: number;
  description: string;
  lessons: Lesson[];
}

const LANGUAGE_COURSES: Course[] = [
  {
    id: 1,
    name: 'Python',
    path: '/courses/python',
    hours: 87,
    projects: 12,
    progress: 85,
    description: 'Master Python from basics to advanced programming',
    lessons: [
      { id: 1, title: 'Introduction to Python', duration: '45 min', completed: true },
      { id: 2, title: 'Variables and Data Types', duration: '60 min', completed: true },
      { id: 3, title: 'Control Structures', duration: '90 min', completed: false },
      { id: 4, title: 'Functions and Modules', duration: '120 min', completed: false },
      { id: 5, title: 'Object-Oriented Programming', duration: '180 min', completed: false }
    ]
  },
  {
    id: 2,
    name: 'JavaScript',
    path: '/courses/javascript',
    hours: 92,
    projects: 18,
    progress: 92,
    description: 'Complete JavaScript and Web Development',
    lessons: [
      { id: 1, title: 'JS Basics', duration: '30 min', completed: true },
      { id: 2, title: 'DOM Manipulation', duration: '60 min', completed: true },
      { id: 3, title: 'Async & Promises', duration: '120 min', completed: false }
    ]
  },
  {
    id: 3,
    name: 'React',
    path: '/courses/react',
    hours: 45,
    projects: 8,
    progress: 60,
    description: 'React from basics to advanced patterns',
    lessons: [
      { id: 1, title: 'React Basics', duration: '90 min', completed: true },
      { id: 2, title: 'Hooks', duration: '120 min', completed: true },
      { id: 3, title: 'State Management', duration: '150 min', completed: false }
    ]
  },
  {
    id: 4,
    name: 'TypeScript',
    path: '/courses/typescript',
    hours: 34,
    projects: 6,
    progress: 40,
    description: 'TypeScript for JavaScript developers',
    lessons: []
  },
  {
    id: 5,
    name: 'Go',
    path: '/courses/go',
    hours: 28,
    projects: 5,
    progress: 25,
    description: 'Go programming language essentials',
    lessons: []
  },
  {
    id: 6,
    name: 'Rust',
    path: '/courses/rust',
    hours: 52,
    projects: 9,
    progress: 55,
    description: 'Rust systems programming',
    lessons: []
  },
  {
    id: 7,
    name: 'Java',
    path: '/courses/java',
    hours: 76,
    projects: 14,
    progress: 70,
    description: 'Java for enterprise applications',
    lessons: []
  },
  {
    id: 8,
    name: 'SQL',
    path: '/courses/sql',
    hours: 42,
    projects: 8,
    progress: 50,
    description: 'Database design and SQL queries',
    lessons: []
  }
];

interface AddCourseFormValues {
  courseId: number;
}

export function Dashboard() {
  const [enrolledLanguages, setEnrolledLanguages] = useState<Course[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm<AddCourseFormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setTimeout(() => {
      setEnrolledLanguages([LANGUAGE_COURSES[0], LANGUAGE_COURSES[1], LANGUAGE_COURSES[2]]);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleAddLanguage = (values: AddCourseFormValues) => {
    const selectedCourse = LANGUAGE_COURSES.find(c => c.id === parseInt(values.courseId.toString()));
    if (!selectedCourse) {
      messageApi.error('Course not found');
      return;
    }
    if (enrolledLanguages.some(l => l.id === selectedCourse.id)) {
      messageApi.warning(`Already enrolled in ${selectedCourse.name}`);
      return;
    }
    setEnrolledLanguages([...enrolledLanguages, selectedCourse]);
    messageApi.success(`Successfully enrolled in ${selectedCourse.name}`);
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleDeleteLanguage = (id: number) => {
    Modal.confirm({
      title: 'Remove Course',
      content: 'Are you sure you want to remove this course from your learning path?',
      okText: 'Remove',
      cancelText: 'Cancel',
      okButtonProps: { danger: true },
      onOk() {
        const course = enrolledLanguages.find(l => l.id === id);
        setEnrolledLanguages(enrolledLanguages.filter(l => l.id !== id));
        messageApi.success(`${course?.name} removed from your courses`);
      }
    });
  };

  const totalLanguages = enrolledLanguages.length;
  const inProgressLanguages = enrolledLanguages.filter(l => l.progress < 100).length;
  const completedLanguages = enrolledLanguages.filter(l => l.progress === 100).length;
  const totalHours = enrolledLanguages.reduce((sum, l) => sum + l.hours, 0);
  const averageProgress = totalLanguages > 0
    ? Math.round(enrolledLanguages.reduce((sum, l) => sum + l.progress, 0) / totalLanguages)
    : 0;

  const availableCourses = LANGUAGE_COURSES.filter(
    course => !enrolledLanguages.some(l => l.id === course.id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {contextHolder}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">My Learning Journey</h1>
            <p className="text-sm text-gray-600 mt-1">Track your progress through programming languages</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalVisible(true)}
            disabled={availableCourses.length === 0}
          >
            Add Course
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalLanguages}</p>
            </div>
          </Card>

          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{inProgressLanguages}</p>
            </div>
          </Card>

          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{completedLanguages}</p>
            </div>
          </Card>

          <Card className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col">
              <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Hours Learned</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalHours}h</p>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        {enrolledLanguages.length > 0 && (
          <Card className="border border-gray-200 rounded-lg shadow-sm mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                <p className="text-sm text-gray-600 mt-1">Average completion across all courses</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
            </div>
            <Progress percent={averageProgress} strokeColor="#1890ff" className="mt-4" />
          </Card>
        )}

        {/* Courses List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Courses</h2>
          {enrolledLanguages.length === 0 ? (
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <Empty
                description="No courses yet"
                style={{ paddingTop: 40, paddingBottom: 40 }}
              >
                <Button type="primary" onClick={() => setIsModalVisible(true)}>
                  Start Your First Course
                </Button>
              </Empty>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrolledLanguages.map((course) => (
                <Card
                  key={course.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  hoverable
                >
                  <Link to={course.path} className="block no-underline">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900">{course.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {course.hours} hours • {course.projects} projects
                        </p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Progress</span>
                            <span className="text-xs font-medium text-gray-900">{course.progress}%</span>
                          </div>
                          <Progress percent={course.progress} strokeColor="#1890ff" size="small" />
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.preventDefault()}
                      >
                        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-900">
                          {course.progress}%
                        </span>
                        <Dropdown
                          menu={{
                            items: [
                              {
                                key: 'delete',
                                label: 'Remove',
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: () => handleDeleteLanguage(course.id)
                              }
                            ] as MenuProps['items']
                          }}
                          trigger={['click']}
                        >
                          <Button
                            type="text"
                            icon={<MoreOutlined />}
                            className="text-gray-400 hover:text-gray-600"
                          />
                        </Dropdown>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      <Modal
        title="Add Course"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText="Enroll"
        cancelText="Cancel"
        width={600}
        centered
      >
        <Form<AddCourseFormValues>
          form={form}
          layout="vertical"
          onFinish={handleAddLanguage}
        >
          <Form.Item
            label="Select Course"
            name="courseId"
            rules={[{ required: true, message: 'Please select a course' }]}
          >
            <Select
              placeholder="Choose a programming language"
              disabled={availableCourses.length === 0}
              optionLabelProp="label"
              maxTagTextLength={30}
            >
              {availableCourses.map(course => (
                <Select.Option 
                  key={course.id} 
                  value={course.id}
                  label={`${course.name} (${course.hours}h)`}
                >
                  {course.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {availableCourses.length === 0 && (
            <p className="text-sm text-gray-500 text-center">
              You have enrolled in all available courses!
            </p>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export function CoursePage() {
  const { language } = useParams<{ language: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  const course = LANGUAGE_COURSES.find(c => c.path === `/courses/${language}`);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Empty description="Course not found" />
      </div>
    );
  }

  const completedLessons = course.lessons.filter(l => l.completed).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {contextHolder}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button type="text" icon={<ArrowLeftOutlined />} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">{course.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
          </div>
        </div>

        {/* Course Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Hours</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{course.hours}h</p>
          </Card>

          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Projects</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{course.projects}</p>
          </Card>

          <Card className="border border-gray-200 rounded-lg shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">Progress</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{course.progress}%</p>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="border border-gray-200 rounded-lg shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-2xl font-bold text-gray-900">{course.progress}%</span>
          </div>
          <Progress percent={course.progress} strokeColor="#1890ff" />
          <p className="text-xs text-gray-600 mt-3">
            {completedLessons} of {course.lessons.length} lessons completed
          </p>
        </Card>

        {/* Lessons */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessons</h2>
          {course.lessons.length === 0 ? (
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <Empty description="No lessons available yet" />
            </Card>
          ) : (
            <div className="space-y-3">
              {course.lessons.map((lesson) => (
                <Card
                  key={lesson.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          lesson.completed
                            ? 'bg-gray-800 border-gray-800'
                            : 'border-gray-300'
                        }`}
                      >
                        {lesson.completed && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{lesson.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                      </div>
                    </div>
                    <Button
                      type={lesson.completed ? 'default' : 'primary'}
                      onClick={() => {
                        messageApi.info(
                          lesson.completed
                            ? 'Lesson already completed'
                            : 'Starting lesson...'
                        );
                      }}
                    >
                      {lesson.completed ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Additional Resources */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <p className="font-medium text-gray-900">Documentation</p>
              <p className="text-xs text-gray-600 mt-2">
                Official documentation and API reference
              </p>
            </Card>

            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <p className="font-medium text-gray-900">Community</p>
              <p className="text-xs text-gray-600 mt-2">
                Join the community forum and get help
              </p>
            </Card>

            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <p className="font-medium text-gray-900">Projects</p>
              <p className="text-xs text-gray-600 mt-2">
                Practice with real-world projects
              </p>
            </Card>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <Link to="/dashboard">
            <Button size="large" className="w-full sm:w-auto">
              <ArrowLeftOutlined /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
