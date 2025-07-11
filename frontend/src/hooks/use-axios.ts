import axios, { HttpStatusCode, isAxiosError } from "axios";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";

const useAxios = () => {

    const { showError } = useToast();
    const { token } = useAuth();

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
        error => {
            if (isAxiosError(error)) {
                const status = error.response?.status;

                if (status === HttpStatusCode.BadRequest) {
                    const message = error.response?.data.message || "Bad Request";
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