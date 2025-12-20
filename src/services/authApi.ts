import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiUrl } from '../utils/config';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiUrl(),
    credentials: 'include',
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload: { username: string; email: string; password: string }) => ({
        url: '/auth/register',
        method: 'POST',
        body: payload,
      }),
    }),
    login: builder.mutation({
      query: ({ email, password }: { email: string; password: string }) => {
        const body = new URLSearchParams();
        body.append('username', email);
        body.append('password', password);

        return {
          url: '/auth/cookie/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        };
      },
      invalidatesTags: ['Profile'],
    }),
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/cookie/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Profile'],
    }),
    forgotPassword: builder.mutation({
      query: (email: string) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }: { token: string; password: string }) => ({
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
