import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../utils/config';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    credentials: 'include',
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation({
      query: (data: { username?: string; email?: string; password?: string }) => ({
        url: '/users/me',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      invalidatesTags: ['Profile'],
    }),

    requestVerifyToken: builder.mutation({
      query: (email: string) => ({
        url: '/auth/request-verify-token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
    }),

    verifyEmail: builder.mutation({
      query: (token: string) => ({
        url: '/auth/verify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }),
    }),

    uploadAvatar: builder.mutation({
      query: (file: FormData) => ({
        url: '/users/me/upload-icon',
        method: 'POST',
        body: file,
      }),
      invalidatesTags: ['Profile'],
    }),

    getAvatar: builder.query({
      query: () => '/users/me/icon',
      providesTags: ['Profile'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRequestVerifyTokenMutation,
  useVerifyEmailMutation,
  useUploadAvatarMutation,
  useGetAvatarQuery,
} = profileApi;
