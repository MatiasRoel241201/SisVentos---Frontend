import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export class HttpClient {
    private api: AxiosInstance;

    constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api') {
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.initializeInterceptors();
    }

    private initializeInterceptors() {
        // Request Interceptor: Add Token
        this.api.interceptors.request.use(config => {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('token');
                if (token) config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Response Interceptor: Handle Errors
        this.api.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    if (typeof window !== 'undefined') {
                        // Limpiar sesión solo si no estamos en la página de login
                        if (!window.location.pathname.includes('/login')) {
                            localStorage.removeItem('user');
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.get(url, config);
        return response.data;
    }

    public async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.post(url, data, config);
        return response.data;
    }

    public async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.put(url, data, config);
        return response.data;
    }

    public async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.patch(url, data, config);
        return response.data;
    }

    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.api.delete(url, config);
        return response.data;
    }
}

export const httpClient = new HttpClient();
