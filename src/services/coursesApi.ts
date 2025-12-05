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

export interface ChatResponse {
  session_id: number;
  user_message?: string;
  ai_response?: string;
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
  tagTypes: ['Courses', 'Modules', 'Chat', 'Submissions'],
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
  useMarkModuleCompleteMutation,
  useInitSessionMutation,
  useConfirmTheoryMutation,
  useSubmitQuizMutation,
  useGetSessionHintMutation,
  useGetSessionStatusQuery,
} = coursesApi;
