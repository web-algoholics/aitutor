import { configureStore } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';
import { profileApi } from '../services/profileApi';
import { coursesApi } from '../services/coursesApi';
import { theoryApi } from '../services/theoryApi';
import { quizzesApi } from '../services/quizzesApi';

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [coursesApi.reducerPath]: coursesApi.reducer,
    [theoryApi.reducerPath]: theoryApi.reducer,
    [quizzesApi.reducerPath]: quizzesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(profileApi.middleware)
      .concat(coursesApi.middleware)
      .concat(theoryApi.middleware)
      .concat(quizzesApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
