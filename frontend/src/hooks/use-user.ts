import type { CreateUserDTO } from "@/DTO/CreateUserDTO";
import useAxios from "./use-axios";
import { useAuth } from "@/contexts/AuthContext";

const useUser = () => {
    const { api } = useAxios();
    const { setToken, setUserData } = useAuth();

    const getUserById = async (userId: string) => {
        const res = await api.get(`/users/${userId}`);
        return res;
    }

    const createUser = async (userData: CreateUserDTO) => {
        const res = await api.post("/register", userData);
        return res;
    }

    const authenticateUser = async (email: string, password: string) => {
        const res = await api.post("/login", { email, password });
        setToken(res.data.token);
        setUserData(res.data.user);
        return res;
    }

    const refreshToken = async () => {
        const res = await api.post("/refresh-token");
        setToken(res.data.token);
        setUserData(res.data.user);
        return res;
    }

    const logoutUser = async () => {
        await api.post("/logout");
        setToken(null);
        setUserData(null);
    }

    return {
        getUserById,
        authenticateUser,
        createUser,
        refreshToken,
        logoutUser
    }
}

export default useUser;