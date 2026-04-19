import { Profile } from '@/models/profile';
import {
  CREATE_GROUP_REQUEST,
  CREATE_GROUP_SUCCESS,
  CREATE_GROUP_FAILURE,
  FETCH_GROUPS_REQUEST,
  FETCH_GROUPS_SUCCESS,
  FETCH_GROUPS_FAILURE,
  JOIN_GROUP_FAILURE,
  JOIN_GROUP_REQUEST,
  JOIN_GROUP_SUCCESS,
  GET_PROFILE_REQUEST,
  GET_PROFILE_FAILURE,
  GET_PROFILE_SUCCESS,
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
} from './types';
import { Group } from '@/models/group';

const initialState = {
  groups: [] as Group[],
  loading: false,
  error: null,
  profile: null as Profile | null,
};

export const groupReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case CREATE_GROUP_REQUEST:
      return { ...state, loading: true, error: null };
    case FETCH_GROUPS_REQUEST:
      return { ...state, loading: true, error: null };
    case JOIN_GROUP_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_PROFILE_REQUEST:
      return { ...state, loading: true, error: null };

    case CREATE_GROUP_SUCCESS:
      return {
        ...state,
        loading: false,
        // Đẩy nhóm mới tạo lên đầu mảng
        groups: [action.payload, ...state.groups],
      };
    case FETCH_GROUPS_SUCCESS:
      return { ...state, loading: false, groups: action.payload ?? [] };
    case JOIN_GROUP_SUCCESS:
      // Đẩy cái nhóm vừa join thành công lên đầu mảng hiển thị
      return { 
        ...state, 
        loading: false, 
        groups: [action.payload, ...state.groups] 
      };
    case GET_PROFILE_SUCCESS:
      return { ...state, loading: false, profile: action.payload };

    case CREATE_GROUP_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case FETCH_GROUPS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case JOIN_GROUP_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case GET_PROFILE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_PROFILE_REQUEST:
      return { ...state, loading: true, error: null };
    case UPDATE_PROFILE_SUCCESS:
      return { ...state, loading: false, profile: action.payload };
    case UPDATE_PROFILE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CHANGE_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null };
    case CHANGE_PASSWORD_SUCCESS:
      return { ...state, loading: false };
    case CHANGE_PASSWORD_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
