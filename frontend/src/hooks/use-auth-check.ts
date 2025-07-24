// filepath: c:\www\src\cinematch\frontend\src\hooks\use-auth-check.ts
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useAuthCheck = () => {
    const { token, setToken, setUserData } = useAuth();

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) return;

            try {
                const response = await fetch(`${import.meta.env.VITE_FETCH_URL}/auth/verify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    // Token inválido, tentar renovar
                    const refreshToken = localStorage.getItem('refresh_token');
                    if (refreshToken) {
                        const refreshResponse = await fetch(`${import.meta.env.VITE_FETCH_URL}/refresh-token`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ refreshToken }),
                        });

                        if (refreshResponse.ok) {
                            const { token: newToken, user, refreshToken: newRefreshToken } = await refreshResponse.json();
                            setToken(newToken);
                            setUserData(user);
                            if (newRefreshToken) {
                                localStorage.setItem('refresh_token', newRefreshToken);
                            }
                        } else {
                            // Refresh falhou, limpar tudo
                            setToken(null);
                            setUserData(null);
                            localStorage.removeItem('refresh_token');
                        }
                    }
                }
            } catch (error) {
                console.error('Erro na verificação do token:', error);
            }
        };

        verifyToken();
    }, [token, setToken, setUserData]);
};