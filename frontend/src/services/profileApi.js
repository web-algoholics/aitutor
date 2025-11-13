import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const profileApi = createApi({
  reducerPath: 'profileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8000',
    credentials: 'include',
  }),
  tagTypes: ['Profile'],
  endpoints: (builder) => ({
    // GET /users/me
    getProfile: builder.query({
      query: () => '/users/me',
      providesTags: ['Profile'],
    }),

    // PATCH /users/me
    updateProfile: builder.mutation({
      query: (data) => {
        const body = new URLSearchParams();
        Object.entries(data).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') body.append(k, v);
        });
        return {
          url: '/users/me',
          method: 'PATCH',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        };
      },
      invalidatesTags: ['Profile'],
    }),

    // POST /auth/request-verify-token
    requestVerifyToken: builder.mutation({
      query: (email) => {
        const body = new URLSearchParams();
        body.append('email', email);
        return {
          url: '/auth/request-verify-token',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: body.toString(),
        };
      },
    }),

    // POST /auth/verify
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/auth/verify',
        method: 'POST',
        body: new URLSearchParams({ token }).toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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