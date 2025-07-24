import type { UserDTO } from "@/DTO/UserDTO";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
    userData?: UserDTO | null;
    setUserData: (userData: UserDTO | null) => void;
    token: string | null;
    setToken: (token: string | null) => void;
    removeToken: () => void;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setTokenState] = useState<string | null>(null);
    const [userData, setUserDataState] = useState<UserDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Inicialização - verificar tokens salvos e userData
    useEffect(() => {
        const initAuth = () => {
            try {
                setIsLoading(true);
                
                // Verificar tokens no localStorage
                const savedToken = localStorage.getItem("auth_token");
                const savedUserData = localStorage.getItem("user_data");

                if (savedToken) {
                    setTokenState(savedToken);
                    
                    if (savedUserData) {
                        try {
                            const parsedUserData = JSON.parse(savedUserData);
                            setUserDataState(parsedUserData);
                            setIsAuthenticated(true);
                        } catch (error) {
                            console.error('Erro ao parsear userData:', error);
                            // Se userData está corrompido, limpar tudo
                            handleLogout();
                        }
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Erro na inicialização:', error);
                handleLogout();
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    const setToken = (token: string | null) => {
        setTokenState(token);
        if (token) {
            localStorage.setItem("auth_token", token);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem("auth_token");
            setIsAuthenticated(false);
        }
    };

    const setUserData = (user: UserDTO | null) => {
        setUserDataState(user);
        if (user) {
            localStorage.setItem("user_data", JSON.stringify(user));
        } else {
            localStorage.removeItem("user_data");
        }
    };

    const removeToken = () => {
        localStorage.removeItem("auth_token");
        setTokenState(null);
        setIsAuthenticated(false);
    };

    const handleLogout = () => {
        // Limpar tudo
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        setTokenState(null);
        setUserDataState(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{
            token,
            setToken,
            removeToken,
            userData,
            setUserData,
            isLoading,
            isAuthenticated,
            logout: handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    )
};

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}