import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface CreateDeckFromCourseRequest {
  course_id: number;
}

export interface CreateDeckFromMaterialRequest {
  title: string;
  description?: string;
  material_content: string;
}

export interface AnkiCardResponse {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  order: number;
  created_at: string;
}

export interface AnkiDeckResponse {
  id: number;
  title: string;
  description?: string;
  source_type: string;
  source_id?: number;
  creator_id: number;
  created_at: string;
  cards: AnkiCardResponse[];
  cards_count: number;
}

export interface AnkiDeckSummaryResponse {
  id: number;
  title: string;
  description?: string;
  source_type: string;
  source_id?: number;
  creator_id: number;
  created_at: string;
  cards_count: number;
}

import { getApiUrl } from '../utils/config';

// API definition
export const ankiApi = createApi({
  reducerPath: 'ankiApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    credentials: 'include',
  }),
  tagTypes: ['AnkiDecks', 'AnkiDeck'],
  endpoints: (builder) => ({
    // Get all decks for current user
    getDecks: builder.query<AnkiDeckSummaryResponse[], void>({
      query: () => '/api/anki/decks',
      providesTags: ['AnkiDecks'],
    }),

    // Create deck from course
    createDeckFromCourse: builder.mutation<AnkiDeckResponse, CreateDeckFromCourseRequest>({
      query: (request) => ({
        url: '/api/anki/decks/from-course',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['AnkiDecks'],
    }),

    // Create deck from material
    createDeckFromMaterial: builder.mutation<AnkiDeckResponse, CreateDeckFromMaterialRequest>({
      query: (request) => ({
        url: '/api/anki/decks/from-material',
        method: 'POST',
        body: request,
      }),
      invalidatesTags: ['AnkiDecks'],
    }),

    // Get a specific deck with cards
    getDeck: builder.query<AnkiDeckResponse, number>({
      query: (deckId) => `/api/anki/decks/${deckId}`,
      providesTags: (result, error, deckId) => [{ type: 'AnkiDeck', id: deckId }],
    }),

    // Delete a deck
    deleteDeck: builder.mutation<void, number>({
      query: (deckId) => ({
        url: `/api/anki/decks/${deckId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AnkiDecks'],
    }),
  }),
});

// Export hooks
export const {
  useGetDecksQuery,
  useCreateDeckFromCourseMutation,
  useCreateDeckFromMaterialMutation,
  useGetDeckQuery,
  useDeleteDeckMutation,
} = ankiApi;

