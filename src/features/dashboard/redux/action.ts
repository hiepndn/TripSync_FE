import { Dispatch } from 'redux';
import {
  CREATE_GROUP_FAILURE,
  CREATE_GROUP_REQUEST,
  CREATE_GROUP_SUCCESS,
  FETCH_GROUPS_FAILURE,
  FETCH_GROUPS_REQUEST,
  FETCH_GROUPS_SUCCESS,
  GET_PROFILE_FAILURE,
  GET_PROFILE_REQUEST,
  GET_PROFILE_SUCCESS,
  JOIN_GROUP_FAILURE,
  JOIN_GROUP_REQUEST,
  JOIN_GROUP_SUCCESS,
} from './types';
import { apiCall } from '@/config/api';
import { ENDPOINTS } from '@/config/api/endpoint';

// Action Creator
export const createGroupAction =
  (groupData: any, onSuccess?: () => void, onError?: (msg: string) => void) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: CREATE_GROUP_REQUEST });

    try {
      const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.GROUP.CREATE,
        payload: groupData,
      });

      if (response && response.status === 200) {
        // Thành công: Ném cục data mới tạo vào Redux store
        dispatch({
          type: CREATE_GROUP_SUCCESS,
          payload: response.data.data,
        });

        // Gọi callback để đóng Modal hoặc hiện thông báo bên UI
        if (onSuccess) onSuccess();
      } else {
        const errMsg = error || response?.data?.error || 'Lỗi không xác định';
        dispatch({ type: CREATE_GROUP_FAILURE, payload: errMsg });
        if (onError) onError(errMsg); // 👈 Bắn lỗi ra Snackbar
      }
    } catch (err: any) {
      dispatch({ type: CREATE_GROUP_FAILURE, payload: err.message || 'Lỗi hệ thống' });
      if (onError) onError(err.message || 'Lỗi hệ thống'); // 👈 Bắn lỗi ra Snackbar
    }
  };

export const fetchGroupsAction = () => async (dispatch: any) => {
  dispatch({ type: FETCH_GROUPS_REQUEST });

  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.GROUP.CREATE, // Trùng URL với CREATE nhưng khác method GET
    });

    if (response && response.status === 200) {
      dispatch({ type: FETCH_GROUPS_SUCCESS, payload: response.data.data });
    } else {
      dispatch({ type: FETCH_GROUPS_FAILURE, payload: error || 'Lỗi khi tải dữ liệu' });
    }
  } catch (err: any) {
    dispatch({ type: FETCH_GROUPS_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};

export const joinGroupAction = (inviteCode: string, onSuccess?: () => void, onError?: (msg: string) => void) => async (dispatch: any) => {
  dispatch({ type: JOIN_GROUP_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'POST',
      url: ENDPOINTS.GROUP.JOIN,
      payload: { invite_code: inviteCode },
    });

    if (response && response.status === 200) {
      dispatch({ type: JOIN_GROUP_SUCCESS, payload: response.data.data });
      if (onSuccess) onSuccess();
    } else {
      const errMsg = error || response?.data?.error || 'Mã mời không hợp lệ';
      dispatch({ type: JOIN_GROUP_FAILURE, payload: errMsg });
      if (onError) onError(errMsg);
    }
  } catch (err: any) {
    dispatch({ type: JOIN_GROUP_FAILURE, payload: err.message || 'Lỗi hệ thống' });
    if (onError) onError(err.message || 'Lỗi hệ thống');
  }
};

export const getProfileAction = () => async (dispatch: any) => {
  dispatch({ type: GET_PROFILE_REQUEST });
  try {
    const { response, error } = await apiCall({
      method: 'GET',
      url: ENDPOINTS.USER.GET_PROFILE,
    });
    if (response && response.status === 200) {
      dispatch({ type: GET_PROFILE_SUCCESS, payload: response.data.data });
    } else {
      dispatch({ type: GET_PROFILE_FAILURE, payload: error || 'Lỗi khi tải thông tin cá nhân' });
    }
  } catch (err: any) {
    dispatch({ type: GET_PROFILE_FAILURE, payload: err.message || 'Lỗi hệ thống' });
  }
};
