import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface CreateQuizRequest {
  theory_content: string;
}

export interface AnswerResponse {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
  created_at: string;
}

export interface QuestionResponse {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: string;
  order: number;
  explanation?: string;
  created_at: string;
  answers: AnswerResponse[];
}

export interface QuizResponse {
  id: number;
  title: string;
  description?: string;
  theory_content: string;
  creator_id: number;
  is_completed: boolean;
  created_at: string;
  questions: QuestionResponse[];
}

export interface QuizSummaryResponse {
  id: number;
  title: string;
  description?: string;
  creator_id: number;
  is_completed: boolean;
  created_at: string;
  questions_count: number;
}

export interface SubmitQuizAnswerRequest {
  question_id: number;
  answer_ids: number[];
}

export interface SubmitQuizRequest {
  quiz_id: number;
  answers: SubmitQuizAnswerRequest[];
}

export interface QuizResultResponse {
  quiz_id: number;
  total_questions: number;
  correct_answers: number;
  score_percentage: number;
  is_passed: boolean;
  answers: Array<{
    question_id: number;
    is_correct: boolean;
    selected_answer_ids: number[];
    correct_answer_ids: number[];
  }>;
}

import { getApiUrl } from '../utils/config';

// API definition
export const quizzesApi = createApi({
  reducerPath: 'quizzesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    credentials: 'include',
  }),
  tagTypes: ['Quizzes', 'Quiz'],
  endpoints: (builder) => ({
    // Get all quizzes for current user
    getQuizzes: builder.query<QuizSummaryResponse[], void>({
      query: () => '/api/quizzes',
      providesTags: ['Quizzes'],
    }),

    // Create a new quiz
    createQuiz: builder.mutation<QuizResponse, CreateQuizRequest>({
      query: (quiz) => ({
        url: '/api/quizzes',
        method: 'POST',
        body: quiz,
      }),
      invalidatesTags: ['Quizzes'],
    }),

    // Get a specific quiz (without answers by default)
    getQuiz: builder.query<QuizResponse, { quizId: number; includeAnswers?: boolean }>({
      query: ({ quizId, includeAnswers = false }) => ({
        url: `/api/quizzes/${quizId}`,
        params: includeAnswers ? { include_answers: true } : {},
      }),
      providesTags: (result, error, { quizId }) => [{ type: 'Quiz', id: quizId }],
    }),

    // Submit quiz answers
    submitQuiz: builder.mutation<QuizResultResponse, SubmitQuizRequest>({
      query: ({ quiz_id, answers }) => ({
        url: `/api/quizzes/${quiz_id}/submit`,
        method: 'POST',
        body: { quiz_id, answers },
      }),
      invalidatesTags: (result, error, { quiz_id }) => [
        { type: 'Quiz', id: quiz_id },
        'Quizzes',
      ],
    }),
  }),
});

// Export hooks
export const {
  useGetQuizzesQuery,
  useCreateQuizMutation,
  useGetQuizQuery,
  useSubmitQuizMutation,
} = quizzesApi;

