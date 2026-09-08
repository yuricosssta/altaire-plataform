// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import userReducer from './slices/userSlice';
import organizationReducer from './slices/organizationSlice';
import resourcesReducer from './slices/resourcesSlice';
import planningReducer from './slices/planningSlice';
import scriptsReducer from './slices/scriptsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    user: userReducer,
    organizations: organizationReducer,
    resources: resourcesReducer,
    planning: planningReducer,
    scripts: scriptsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;