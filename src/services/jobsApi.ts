import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface SkillRecommendation {
  skill: string;
  demand_count: number;
  percentage: number;
  average_salary?: number;
  trend: 'growing' | 'declining' | 'stable';
}

export interface MarketAnalysisResponse {
  query: string;
  total_vacancies: number;
  technologies: SkillRecommendation[];
  frameworks: SkillRecommendation[];
  databases: SkillRecommendation[];
  tools: SkillRecommendation[];
  salary_stats: {
    average_from?: number;
    average_to?: number;
    average_mid?: number;
    min_from?: number;
    max_from?: number;
    min_to?: number;
    max_to?: number;
  };
  experience_distribution: Record<string, number>;
  recommended_courses: string[];
  skill_gaps: string[];
  top_skills?: {
    skill: string;
    demand_count: number;
    percentage: number;
    course_url?: string;
  }[];
  skill_combinations?: {
    skills: string[];
    count: number;
    percentage: number;
  }[];
}

export interface AnalysisRequest {
  query: string;
  area?: string;
  experience?: string;
  limit?: number;

  // Расширенные фильтры HH API
  only_with_salary?: boolean;
  employment?: string;
  schedule?: string;
  date_from?: string;
  date_to?: string;
}

import { getApiUrl } from '../utils/config';

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    credentials: 'include',
  }),
  tagTypes: ['MarketAnalysis'],
  endpoints: (builder) => ({
    analyzeMarket: builder.mutation<MarketAnalysisResponse, AnalysisRequest>({
      query: (data) => ({
        url: '/jobs/analyze',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      invalidatesTags: ['MarketAnalysis'],
    }),

    getPopularSkills: builder.query<{ skills: SkillRecommendation[] }, { limit?: number }>({
      query: ({ limit = 10 }) => ({
        url: `/jobs/skills/popular?limit=${limit}`,
      }),
      providesTags: ['MarketAnalysis'],
    }),

    getMarketTrends: builder.query<any, string>({
      query: (language) => ({
        url: `/jobs/trends/${language}`,
      }),
      providesTags: ['MarketAnalysis'],
    }),
  }),
});

export const {
  useAnalyzeMarketMutation,
  useGetPopularSkillsQuery,
  useGetMarketTrendsQuery,
} = jobsApi;

