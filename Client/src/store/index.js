import { configureStore } from '@reduxjs/toolkit';
import trainingSessionsReducer from './slices/trainingSessionsSlice';
import tagsReducer from './slices/tagsSlice';
import techniquesReducer from './slices/techniquesSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    trainingSessions: trainingSessionsReducer,
    tags: tagsReducer,
    techniques: techniquesReducer,
    user: userReducer,
  },
});