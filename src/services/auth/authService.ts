import { httpClient } from '@/lib/http/httpClient';
import { AxiosError } from 'axios';
import { BackendLoginResponse, BackendCheckStatusResponse } from '@/lib/types';

/**
 * Servicio de Autenticación
 * Maneja operaciones de autenticación como login y verificación de estado
 */
class AuthService {
    /**
     * Iniciar sesión con nombre de usuario y contraseña
     * @param userName - Nombre de usuario
     * @param password - Contraseña del usuario
     * @returns Promise con respuesta de login incluyendo token
     */
    async login(userName: string, password: string): Promise<BackendLoginResponse> {
        try {
            return await httpClient.post<BackendLoginResponse>('/auth/login', { userName, password });
        } catch (error) {
            const axiosError = error as AxiosError;
            // Mapear errores del axios a mensajes amigables
            if (axiosError.response?.status === 401) {
                throw new Error('Credenciales inválidas');
            }
            throw new Error('Error al iniciar sesión');
        }
    }

    /**
     * Verificar estado de autenticación y renovar token
     * @param token - Token JWT actual
     * @returns Promise con token renovado e información del usuario
     */
    async checkAuthStatus(token: string): Promise<BackendCheckStatusResponse> {
        try {
            // El interceptor ya añade el token del sessionStorage,
            // pero si necesitamos usar un token específico, podemos pasarlo en config
            return await httpClient.get<BackendCheckStatusResponse>('/auth/check-status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 401) {
                throw new Error('Token inválido o expirado');
            }
            throw new Error('Error al verificar autenticación');
        }
    }
}

// Singleton instance
export const authService = new AuthService();
