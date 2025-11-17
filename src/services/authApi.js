import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    credentials: 'include',
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
    }),
    login: builder.mutation({
      query: ({ email, password }) => {
        const body = new URLSearchParams();
        body.append('username', email);     // ← email → username
        body.append('password', password);

        return {
          url: '/auth/cookie/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // ← KEY!
          },
          body: body.toString(), // ← "username=john%40example.com&password=..."
        };
      },
      invalidatesTags: ['Profile'],
    }),
    getCurrentUser: builder.query({
      query: () => '/users/me',
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/cookie/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'], // ← This clears getProfile & getAvatar
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;