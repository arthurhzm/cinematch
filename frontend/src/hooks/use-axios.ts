import axios, { HttpStatusCode, isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const useAxios = () => {

    const { showError } = useToast();
    const { token, setToken, setUserData } = useAuth();

    const api = axios.create({
        baseURL: import.meta.env.VITE_FETCH_URL,
        timeout: 5000,
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    api.interceptors.response.use(
        response => {
            return response.data;
        },
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            if (error.response?.status === HttpStatusCode.Unauthorized && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (!refreshToken) throw new Error('No refresh token');

                    const response = await axios.post(`${import.meta.env.VITE_FETCH_URL}/refresh-token`, {
                        refreshToken,
                    });

                    const { token: newAccessToken, user, refreshToken: newRefreshToken } = response.data;
                    
                    setToken(newAccessToken);
                    setUserData(user);
                    if (newRefreshToken) {
                        localStorage.setItem('refresh_token', newRefreshToken);
                    }

                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed, redirect to login
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('user_data');
                    setToken(null);
                    setUserData(null);
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            if (isAxiosError(error)) {
                const status = error.response?.status;

                if (status === HttpStatusCode.BadRequest) {
                    const message = (error.response?.data as any)?.message || "Bad Request";
                    showError(message);
                }
            }

            return Promise.reject(error);
        }
    );

    api.interceptors.request.use(
        config => {
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }

            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    return { api };
}

export default useAxios;