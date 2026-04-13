import * as types from './types';

const initialState = {
    loading: false,
    token: null,
    error: null
};

const authReducer = (state = initialState, action: any) => {
    console.log('Auth Reducer Action:', action);
    switch (action.type) {
        case types.LOGIN_REQUEST:
            return { ...state, loading: true, error: null };
            
        case types.LOGIN_SUCCESS:
            return { ...state, loading: false, token: action.payload, error: null };
            
        case types.LOGIN_FAILURE:
            return { ...state, loading: false, error: action.payload };

        case types.REGISTER_REQUEST:
            return { ...state, loading: true, error: null };
            
        case types.REGISTER_SUCCESS:
            return { ...state, loading: false, token: action.payload, error: null };
            
        case types.REGISTER_FAILURE:
            return { ...state, loading: false, error: action.payload };
            
        default:
            return state;
    }
};

export default authReducer;