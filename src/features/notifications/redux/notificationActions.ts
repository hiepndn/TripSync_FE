import { Dispatch } from 'redux';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';
import {
  setNotifications,
  setUnreadCount,
  setLoading,
  setError,
  markAsRead,
  markAllAsRead,
} from './notificationSlice';

export const fetchNotificationsAction = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.NOTIFICATION.LIST,
    });

    if (response && response.status === 200) {
      dispatch(setNotifications(response.data.notifications || []));
      dispatch(setUnreadCount(response.data.unread_count || 0));
      dispatch(setError(null));
    } else {
      dispatch(setError(error || 'Lỗi khi lấy thông báo'));
    }
  } catch (err: any) {
    dispatch(setError(err.message || 'Lỗi hệ thống'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const markNotificationAsReadAction = (id: number) => async (dispatch: Dispatch) => {
  try {
    const { response } = await apiCall({
      method: 'PATCH',
      url: ENDPOINTS.NOTIFICATION.MARK_READ(id),
    });

    if (response && response.status === 200) {
      dispatch(markAsRead(id));
    }
  } catch (err) {
    console.error('Lỗi khi đánh dấu đã đọc:', err);
  }
};

export const markAllNotificationsAsReadAction = () => async (dispatch: Dispatch) => {
  try {
    const { response } = await apiCall({
      method: 'PATCH',
      url: ENDPOINTS.NOTIFICATION.MARK_ALL_READ,
    });

    if (response && response.status === 200) {
      dispatch(markAllAsRead());
    }
  } catch (err) {
    console.error('Lỗi khi đánh dấu tất cả đã đọc:', err);
  }
};
