import authReducer from '@/features/auth/redux/reducer';
import { groupReducer } from '@/features/dashboard/redux/reducer';
import { tripDetailReducer } from '@/features/trip-detail/redux/reducer';
import { notificationReducer } from '@/features/notifications/redux/notificationSlice';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupReducer,
    tripDetail: tripDetailReducer,
    notifications: notificationReducer,
    // expenses: expensesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;