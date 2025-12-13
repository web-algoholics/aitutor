import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import { profileApi } from '../services/profileApi';
import { coursesApi } from '../services/coursesApi';
import { theoryApi } from '../services/theoryApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [theoryApi.reducerPath]: theoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(profileApi.middleware)
      .concat(coursesApi.middleware)
      .concat(theoryApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
