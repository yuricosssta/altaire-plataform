// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import organizationReducer from './slices/organizationSlice';
import scriptsReducer from './slices/scriptsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    organizations: organizationReducer,
    scripts: scriptsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;