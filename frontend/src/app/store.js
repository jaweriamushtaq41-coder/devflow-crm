import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import leadReducer from '../features/leads/leadSlice';
import uiReducer from '../features/ui/uiSlice';
import notificationReducer from '../features/notifications/notificationSlice';
import requirementReducer from '../features/requirements/requirementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    requirements: requirementReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});
