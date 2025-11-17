import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    credentials: 'include',
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    // GET /users/me
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
      invalidatesTags: ['Profile'],
    }),

    // POST /auth/request-verify-token
    requestVerifyToken: builder.mutation({
      query: (email) => ({
        url: '/auth/request-verify-token',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // JSON
        body: JSON.stringify({ email }),                  // { email: "..." }
      }),
    }),

    // POST /auth/verify
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/auth/verify',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }), // { token: "abc123" }
      }),
    }),

    // POST /users/me/upload-icon
    uploadAvatar: builder.mutation({
      query: (file) => ({
        url: '/users/me/upload-icon',
        method: 'POST',
        body: file,
      }),
      invalidatesTags: ['Profile'],
    }),

    // GET /users/me/icon (base64)
    getAvatar: builder.query({
      query: () => '/users/me/icon',
      providesTags: ['Profile'], // Must match invalidatesTags
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