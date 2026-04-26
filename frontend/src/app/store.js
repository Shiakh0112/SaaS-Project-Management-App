import { configureStore } from '@reduxjs/toolkit';
import { setStore } from './storeRegistry';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import teamReducer from './slices/teamSlice';
import notificationReducer from './slices/notificationSlice';
import boardReducer from './slices/boardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    tasks: taskReducer,
    teams: teamReducer,
    notifications: notificationReducer,
    boards: boardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

// Register store in registry so api.js can access it without circular imports
setStore(store);

export default store;
