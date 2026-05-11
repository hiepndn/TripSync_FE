import axios, { CancelToken, Method, ResponseType } from 'axios';

// Giữ nguyên logic parseParams xịn xò của bạn
const parseParams = (params: Record<string, any>) => {
    const keys = Object.keys(params);
    let options = '';

    keys.forEach((key) => {
        const value = params[key];
        const isParamTypeObject = typeof value === 'object';

        if (!isParamTypeObject && typeof value !== 'undefined' && value !== '') {
            options += `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}&`;
        }

        if (isParamTypeObject && value != null && Array.isArray(value) && value.length > 0) {
            value.forEach((element: any) => {
                if (typeof element !== 'undefined' && element !== '') {
                    options += `${encodeURIComponent(key)}=${encodeURIComponent(String(element))}&`;
                }
            });
        }
    });

    return options ? options.slice(0, -1) : options;
};

type ApiParam = {
    baseURL?: string;
    cancelToken?: CancelToken;
    url: string;
    method: Method;
    payload?: any;
    headers?: Record<string, string>;
    params?: Record<string, any>;
    signal?: AbortSignal;
    responseType?: ResponseType;
};

export const apiCall = async ({
    baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080',
    cancelToken,
    url,
    method,
    payload,
    headers = {},
    params,
    signal,
    responseType
}: ApiParam) => {
    const token = localStorage.getItem('jwt');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const result = await axios({
            baseURL,
            cancelToken,
            method,
            url,
            headers,
            data: payload,
            params,
            signal,
            responseType,
            withCredentials: true,
            paramsSerializer: (params) => parseParams(params)
        });

        if (result.data && result.data.token) {
            localStorage.setItem('jwt', result.data.token);
            if (result.data.refreshToken) {
                localStorage.setItem('reft', result.data.refreshToken);
            }
        }

        return {
            response: result,
            error: null
        };
    } catch (e: any) {
        if (axios.isCancel(e)) {
            console.log('%cREQUEST CANCELLED', 'color: red');
            return { response: null, error: null };
        } else {
            if (e.response && e.response.status === 401) {
                console.warn('⚠️ Token hết hạn hoặc không hợp lệ. Đang đưa về trang đăng nhập...');
                
                // Demo mode: không redirect, trả về lỗi im lặng
                if ((window as any).__DEMO_MODE__) {
                    return { response: null, error: null };
                }

                // Xóa token cũ
                localStorage.removeItem('jwt');
                localStorage.removeItem('reft');
                
                // Ép chuyển hướng về trang login (Dùng window.location để force reload State của React)
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            return {
                response: e.response || null,
                error: e.request || e.message
            };
        }
    }
};