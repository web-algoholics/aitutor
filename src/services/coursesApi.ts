import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Type definitions
export interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  icon?: string;
  created_at?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  learning_objectives: string | string[];
  key_concepts: string | string[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  code_template: string;
  expected_concepts: string | string[];
}

export interface UserProgress {
  enrollments?: Array<{
    id: number;
    course_id: number;
    is_completed: boolean;
    progress_percentage: number;
    enrolled_at: string;
  }>;
}

export interface UserModuleProgress {
  id: number;
  module_id: number;
  is_completed: boolean;
  last_accessed: string;
}

export interface ChatResponse {
  session_id: number;
  user_message?: string;
  ai_response?: string;
}

// Custom Courses Types
export interface CustomCourse {
  id: number;
  title: string;
  description?: string;
  difficulty: string;
  sources?: string[];
  custom_structure?: any;
  creator_id: number;
  is_completed: boolean;
  created_at: string;
  modules_count: number;
}

export interface CustomModule {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order: number;
  learning_objectives: string[];
  key_concepts: string[];
  is_completed: boolean;
  lessons_count: number;
  has_quiz: boolean;
  has_coding_tasks: boolean;
  theory_content?: string;
}

export interface CustomLesson {
  id: number;
  module_id: number;
  title: string;
  content: string;
  order: number;
  code_examples: any[];
  interactive_elements: any[];
  is_completed: boolean;
}

export interface CustomQuiz {
  id: number;
  module_id: number;
  title: string;
  questions: any[];
  is_completed: boolean;
  score?: number;
}

export interface CustomCodingTask {
  id: number;
  module_id: number;
  title: string;
  description: string;
  difficulty: string;
  code_template: string;
  test_cases: any[];
  hints: string[];
  is_completed: boolean;
}

export interface CreateCustomCourseRequest {
  title: string;
  difficulty?: string;
  description?: string;
  sources?: string[];
  custom_structure?: any;
}

export interface CourseGenerationResponse {
  course_id: number;
  title: string;
  message: string;
  progress: {
    stage: string;
    progress: number;
    message: string;
    current_module?: string;
  };
}

export interface ChatHistory {
  session_id: number;
  messages: Array<{
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
  }>;
}

export interface CodeEvaluation {
  id: number;
  score: number;
  is_correct: boolean;
  feedback: string;
}

export interface HintResponse {
  hint: string;
}

export interface SessionStatus {
  session_id: number;
  module_id: number;
  stage: 'theory' | 'quiz' | 'coding' | 'completed';
  theory_confirmed: boolean;
  quiz_score: number | null;
  coding_complete: boolean;
  completed: boolean;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: string;
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface CodingTask {
  title: string;
  description: string;
  code_template: string;
  expected_concepts: string[];
  success_criteria: string[];
}

export interface InitSessionResponse {
  session_id: number;
  module_id: number;
  stage: string;
  message: string;
}

export interface ConfirmTheoryResponse {
  session_id: number;
  stage: string;
  quiz: QuizData;
}

export interface SubmitQuizResponse {
  session_id: number;
  quiz_result: {
    score: number;
    passed: boolean;
    feedback: string;
  };
  stage: string;
  task: CodingTask;
}

export interface CodeEvaluation {
  passed: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface SubmitCodeResponse {
  session_id: number;
  evaluation: CodeEvaluation;
  stage: string;
  completed: boolean;
}

export const coursesApi = createApi({
  reducerPath: 'coursesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (process.env as any).REACT_APP_API_URL || 'http://localhost:8000',
    credentials: 'include',
  }),
  tagTypes: ['Courses', 'Modules', 'Chat', 'Submissions', 'CustomCourses', 'CustomModules'],
  endpoints: (builder) => ({
    getCourses: builder.query<Course[], void>({
      query: () => ({ url: '/api/courses/' }),
      providesTags: ['Courses'],
    }),
    getCourse: builder.query<Course, number>({
      query: (id) => ({ url: `/api/courses/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Courses', id }],
    }),
    getCourseRoadmap: builder.query<Module[], number>({
      query: (courseId) => ({ url: `/api/courses/${courseId}/modules` }),
      providesTags: (result, error, courseId) =>
        result ? [...result.map((m: any) => ({ type: 'Modules' as const, id: m.id })), { type: 'Modules', id: `course-${courseId}` }] : [{ type: 'Modules', id: `course-${courseId}` }],
    }),
    getModule: builder.query<Module, number>({
      query: (moduleId) => ({ url: `/api/courses/modules/${moduleId}` }),
    }),
    getModuleDetail: builder.query<Module, number>({
      query: (moduleId) => ({ url: `/api/courses/modules/${moduleId}` }),
      providesTags: (result, error, id) => [{ type: 'Modules', id }],
    }),
    getLesson: builder.query<Lesson, number>({
      query: (lessonId) => ({ url: `/api/courses/lessons/${lessonId}` }),
    }),
    startChatSession: builder.mutation<ChatResponse, { moduleId: number; userId: number }>({
      query: ({ moduleId, userId }) => ({ 
        url: `/api/courses/modules/${moduleId}/chat/start`, 
        method: 'POST', 
        params: { user_id: userId } 
      }),
      invalidatesTags: ['Chat'],
    }),
    sendChatMessage: builder.mutation<ChatResponse, { sessionId: number; question: string }>({
      query: ({ sessionId, question }) => ({ 
        url: `/api/courses/chat/${sessionId}/message`, 
        method: 'POST', 
        params: { question } 
      }),
      invalidatesTags: ['Chat'],
    }),
    getChatHistory: builder.query<ChatHistory, number>({
      query: (sessionId) => ({ url: `/api/courses/chat/${sessionId}/history` }),
      providesTags: (result, error, id) => [{ type: 'Chat', id }],
    }),
    submitCode: builder.mutation<CodeEvaluation, { lessonId: number; userId: number; code: string }>({
      query: ({ lessonId, userId, code }) => ({
        url: `/api/courses/lessons/${lessonId}/submit-code`,
        method: 'POST',
        params: { user_id: userId, code },
      }),
      invalidatesTags: ['Submissions'],
    }),
    getCodeHint: builder.mutation<HintResponse, { lessonId: number; currentCode: string }>({
      query: ({ lessonId, currentCode }) => ({
        url: `/api/courses/lessons/${lessonId}/hint`,
        method: 'POST',
        params: { current_code: currentCode },
      }),
    }),
    getUserProgress: builder.query<UserProgress, number>({
      query: (userId) => ({ url: `/api/courses/user/${userId}/progress` }),
    }),
    getUserModuleProgress: builder.query<UserModuleProgress[], number>({
      query: (userId) => ({ url: `/api/courses/user/${userId}/modules/progress` }),
      providesTags: (result, error, userId) =>
        result ? result.map((p: any) => ({ type: 'Modules' as const, id: `progress-${p.module_id}` })) : [],
    }),
    markModuleComplete: builder.mutation<unknown, { userId: number; moduleId: number }>({
      query: ({ userId, moduleId }) => ({ 
        url: `/api/courses/user/${userId}/module/${moduleId}/complete`, 
        method: 'POST' 
      }),
      invalidatesTags: ['Modules', 'Courses'],
    }),
    initSession: builder.mutation<InitSessionResponse, { moduleId: number; userId: number }>({
      query: ({ moduleId, userId }) => ({
        url: `/api/courses/modules/${moduleId}/chat/start`,
        method: 'POST',
        params: { user_id: userId },
      }),
      invalidatesTags: ['Chat'],
    }),
    confirmTheory: builder.mutation<ConfirmTheoryResponse, { sessionId: number }>({
      query: ({ sessionId }) => ({
        url: `/api/courses/chat/${sessionId}/confirm-theory`,
        method: 'POST',
      }),
      invalidatesTags: ['Chat'],
    }),
    submitQuiz: builder.mutation<SubmitQuizResponse, { sessionId: number; answers: Record<number, string> }>({
      query: ({ sessionId, answers }) => ({
        url: `/api/courses/chat/${sessionId}/submit-quiz`,
        method: 'POST',
        body: { answers },
      }),
      invalidatesTags: ['Chat'],
    }),
    submitCode: builder.mutation<SubmitCodeResponse, { sessionId: number; code: string }>({
      query: ({ sessionId, code }) => ({
        url: `/api/courses/chat/${sessionId}/submit-code`,
        method: 'POST',
        params: { code },
      }),
      invalidatesTags: ['Chat', 'Submissions'],
    }),
    getSessionHint: builder.mutation<HintResponse, { sessionId: number; currentCode: string }>({
      query: ({ sessionId, currentCode }) => ({
        url: `/api/courses/chat/${sessionId}/hint`,
        method: 'POST',
        params: { current_code: currentCode },
      }),
    }),
    getSessionStatus: builder.query<SessionStatus, number>({
      query: (sessionId) => ({
        url: `/api/courses/chat/${sessionId}/status`,
      }),
      providesTags: (result, error, id) => [{ type: 'Chat', id }],
    }),

    // Custom Courses
    getCustomCourses: builder.query<CustomCourse[], void>({
      query: () => ({ url: '/api/custom-courses/' }),
      providesTags: ['CustomCourses'],
    }),
    createCustomCourse: builder.mutation<CourseGenerationResponse, CreateCustomCourseRequest>({
      query: (courseData) => ({
        url: '/api/custom-courses/',
        method: 'POST',
        body: courseData,
      }),
      invalidatesTags: ['CustomCourses'],
    }),
    getCustomCourse: builder.query<CustomCourse, number>({
      query: (courseId) => ({ url: `/api/custom-courses/${courseId}` }),
      providesTags: (result, error, id) => [{ type: 'CustomCourses', id }],
    }),
    getCustomCourseModules: builder.query<CustomModule[], number>({
      query: (courseId) => ({ url: `/api/custom-courses/${courseId}/modules` }),
      providesTags: (result, error, courseId) =>
        result ? [...result.map((m: any) => ({ type: 'CustomModules' as const, id: m.id })), { type: 'CustomModules', id: `course-${courseId}` }] : [{ type: 'CustomModules', id: `course-${courseId}` }],
    }),
    getCustomModule: builder.query<CustomModule, number>({
      query: (moduleId) => ({ url: `/api/custom-courses/modules/${moduleId}` }),
      providesTags: (result, error, id) => [{ type: 'CustomModules', id }],
    }),
    getCustomModuleQuiz: builder.query<CustomQuiz, number>({
      query: (moduleId) => ({ url: `/api/custom-courses/modules/${moduleId}/quiz` }),
    }),
    submitCustomQuiz: builder.mutation<any, { quizId: number; answers: any }>({
      query: ({ quizId, answers }) => ({
        url: `/api/custom-courses/quizzes/${quizId}/attempt`,
        method: 'POST',
        body: { answers },
      }),
    }),
    getCustomModuleTasks: builder.query<CustomCodingTask[], number>({
      query: (moduleId) => ({ url: `/api/custom-courses/modules/${moduleId}/coding-tasks` }),
    }),
    submitCustomTask: builder.mutation<any, { taskId: number; code: string }>({
      query: ({ taskId, code }) => ({
        url: `/api/custom-courses/coding-tasks/${taskId}/submit`,
        method: 'POST',
        body: { code },
      }),
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetCourseRoadmapQuery,
  useGetModuleQuery,
  useGetModuleDetailQuery,
  useGetLessonQuery,
  useStartChatSessionMutation,
  useSendChatMessageMutation,
  useGetChatHistoryQuery,
  useSubmitCodeMutation,
  useGetCodeHintMutation,
  useGetUserProgressQuery,
  useGetUserModuleProgressQuery,
  useMarkModuleCompleteMutation,
  useInitSessionMutation,
  useConfirmTheoryMutation,
  useSubmitQuizMutation,
  useGetSessionHintMutation,
  useGetSessionStatusQuery,
  // Custom Courses
  useGetCustomCoursesQuery,
  useCreateCustomCourseMutation,
  useGetCustomCourseQuery,
  useGetCustomCourseModulesQuery,
  useGetCustomModuleQuery,
  useGetCustomModuleQuizQuery,
  useSubmitCustomQuizMutation,
  useGetCustomModuleTasksQuery,
  useSubmitCustomTaskMutation,
} = coursesApi;
