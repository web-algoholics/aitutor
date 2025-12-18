import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface CreateTheoryCourseRequest {
  topic: string;
  difficulty?: string;
}

export interface TheoryCourseResponse {
  id: number;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  estimated_duration: number;
  creator_id: number;
  modules_count: number;
  is_completed: boolean;
  created_at: string;
}

export interface TheoryModuleResponse {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order: number;
  learning_objectives: string[];
  key_concepts: string[];
  lessons_count: number;
  is_completed: boolean;
  created_at: string;
}

export interface TheoryLessonResponse {
  id: number;
  module_id: number;
  title: string;
  description: string;
  order: number;
  estimated_duration: number;
  learning_objectives: string[];
  key_concepts: string[];
  has_content: boolean;
  is_completed: boolean;
  created_at: string;
}

export interface TheoryContentResponse {
  id: number;
  lesson_id: number;
  course_id: number;
  content: string;
  reading_time: number;
  is_generated: boolean;
  lesson_is_completed: boolean;
  generated_at?: string;
  created_at: string;
}

export interface TheoryCourseTreeResponse {
  course: TheoryCourseResponse;
  modules: TheoryModuleResponse[];
  lessons: TheoryLessonResponse[][];
}

// API definition
export const theoryApi = createApi({
  reducerPath: 'theoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: (process.env as any).REACT_APP_API_URL || 'http://localhost:8000',
    credentials: 'include',
  }),
  tagTypes: ['TheoryCourses', 'TheoryModules', 'TheoryLessons', 'TheoryContent'],
  endpoints: (builder) => ({
    // Get all user theory courses
    getTheoryCourses: builder.query<TheoryCourseResponse[], void>({
      query: () => '/api/theory/courses',
      providesTags: ['TheoryCourses'],
    }),

    // Create new theory course
    createTheoryCourse: builder.mutation<TheoryCourseTreeResponse, CreateTheoryCourseRequest>({
      query: (course) => ({
        url: '/api/theory/courses',
        method: 'POST',
        body: course,
      }),
      invalidatesTags: ['TheoryCourses', 'TheoryModules', 'TheoryLessons'],
      onQueryStarted: async (course, { dispatch, queryFulfilled }) => {
        try {
          const { data: newCourse } = await queryFulfilled;
          // Invalidate specific course cache to force refresh
          dispatch(theoryApi.util.invalidateTags([
            { type: 'TheoryCourses', id: newCourse.id },
            { type: 'TheoryModules', id: `course-${newCourse.id}` },
            { type: 'TheoryLessons', id: `course-${newCourse.id}` },
          ]));
        } catch {
          // Ignore errors in invalidation
        }
      },
    }),

    // Get course tree (course + modules + lessons)
    getTheoryCourseTree: builder.query<TheoryCourseTreeResponse, number>({
      query: (courseId) => `/api/theory/courses/${courseId}`,
      providesTags: (result, error, courseId) => [
        { type: 'TheoryCourses', id: courseId },
        { type: 'TheoryModules', id: `course-${courseId}` },
        { type: 'TheoryLessons', id: `course-${courseId}` },
      ],
    }),

    // Get specific module
    getTheoryModule: builder.query<TheoryModuleResponse, { courseId: number; moduleId: number }>({
      query: ({ courseId, moduleId }) => `/api/theory/courses/${courseId}/modules/${moduleId}`,
      providesTags: (result, error, { moduleId }) => [{ type: 'TheoryModules', id: moduleId }],
    }),

    // Generate content for a lesson
    generateLessonContent: builder.mutation<{ message: string; lesson_id: number }, number>({
      query: (lessonId) => ({
        url: `/api/theory/lessons/${lessonId}/generate-content`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, lessonId) => [
        { type: 'TheoryLessons', id: lessonId },
        { type: 'TheoryContent', id: lessonId },
        // Invalidate entire course tree to refresh lesson status
        { type: 'TheoryCourses', id: 'ALL' }, // This will invalidate all course queries
      ],
    }),

    // Get lesson content
    getLessonContent: builder.query<TheoryContentResponse, number>({
      query: (lessonId) => `/api/theory/lessons/${lessonId}/content`,
      providesTags: (result, error, lessonId) => [{ type: 'TheoryContent', id: lessonId }],
    }),

    // Generate next module content
    generateNextModule: builder.mutation<{ message: string }, number>({
      query: (courseId) => ({
        url: `/api/theory/courses/${courseId}/generate-next-module`,
        method: 'POST',
      }),
      invalidatesTags: ['TheoryCourses', 'TheoryModules', 'TheoryLessons', 'TheoryContent'],
    }),

    // Retry failed lesson generation for a module
    retryModuleGeneration: builder.mutation<{ message: string }, number>({
      query: (moduleId) => ({
        url: `/api/theory/modules/${moduleId}/retry-generation`,
        method: 'POST',
      }),
      invalidatesTags: ['TheoryCourses', 'TheoryModules', 'TheoryLessons', 'TheoryContent'],
    }),

    // Mark lesson as completed
    markLessonCompleted: builder.mutation<{ message: string; is_completed: boolean }, number>({
      query: (lessonId) => ({
        url: `/api/theory/lessons/${lessonId}/mark-completed`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, lessonId) => [
        { type: 'TheoryLessons', id: lessonId },
        // Invalidate entire course tree to refresh lesson/module/course completion status
        { type: 'TheoryCourses', id: 'ALL' },
      ],
      // Also invalidate streak when lesson is completed
      onQueryStarted: async (lessonId, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          // Invalidate streak query to refresh it
          dispatch(theoryApi.util.invalidateTags(['TheoryCourses']));
        } catch {
          // Ignore errors
        }
      },
    }),

    // Get study streak
    getStudyStreak: builder.query<{ current_streak: number; last_study_date: string | null }, void>({
      query: () => '/api/theory/streak',
      providesTags: ['TheoryCourses'],
    }),
  }),
});

// Export hooks
export const {
  useGetTheoryCoursesQuery,
  useCreateTheoryCourseMutation,
  useGetTheoryCourseTreeQuery,
  useGetTheoryModuleQuery,
  useGenerateLessonContentMutation,
  useGetLessonContentQuery,
  useGenerateNextModuleMutation,
  useRetryModuleGenerationMutation,
  useMarkLessonCompletedMutation,
  useGetStudyStreakQuery,
} = theoryApi;
