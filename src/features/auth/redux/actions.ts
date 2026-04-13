import { apiCall } from '@/config/api';
import * as types from './types';
import { ENDPOINTS } from '@/config/api/endpoint';

export const loginAction = (payload: any) => async (dispatch: any) => {
    dispatch({ type: types.LOGIN_REQUEST });

    const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.AUTH.LOGIN,
        payload: payload,
    });

    if (response && response.data?.success) {
        dispatch({
            type: types.LOGIN_SUCCESS,
            payload: response.data.token 
        });
        return { success: true }; 
    } else {
        dispatch({
            type: types.LOGIN_FAILURE,
            payload: error || response?.data?.error || 'Đăng nhập thất bại!'
        });
        return { success: false, message: error || response?.data?.error };
    }
};


export const registerAction = (payload: any) => async (dispatch: any) => {
    dispatch({ type: types.REGISTER_REQUEST });

    const { response, error } = await apiCall({
        method: 'POST',
        url: ENDPOINTS.AUTH.REGISTER,
        payload: payload,
    });

    if (response && response.data?.success) {
        dispatch({
            type: types.REGISTER_SUCCESS,
            payload: response.data.token 
        });
        return { success: true }; 
    } else {
        dispatch({
            type: types.REGISTER_FAILURE,
            payload: error || response?.data?.error || 'Đăng ký thất bại!'
        });
        return { success: false, message: error || response?.data?.error };
    }
};