import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    credentials: 'include',
  }),
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
    }),
    getCurrentUser: builder.query({
      query: () => '/users/me',
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/cookie/logout',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetCurrentUserQuery,
  useLogoutMutation,
} = authApi;