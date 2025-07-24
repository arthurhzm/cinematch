import type { UserDTO } from "@/DTO/UserDTO";
import { createContext, useContext, useState } from "react";

interface AuthContextType {
    userData?: UserDTO | null;
    setUserData: (userData: UserDTO | null) => void;
    token: string | null;
    setToken: (token: string | null) => void;
    removeToken: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [token, setTokenState] = useState<string | null>(() => {
        return localStorage.getItem("auth_token");
    });
    const [userData, setUserData] = useState<UserDTO | null>(null);

    const setToken = (token: string | null) => {
        if (token) {
            localStorage.setItem("auth_token", token);
        } else {
            localStorage.removeItem("auth_token");
        }
        setTokenState(token);
    };

    const removeToken = () => {
        localStorage.removeItem("auth_token");
        setTokenState(null);
    };

    return (
        <AuthContext.Provider value={{
            token,
            setToken,
            removeToken,
            userData,
            setUserData
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