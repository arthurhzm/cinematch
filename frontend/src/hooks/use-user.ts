import type { CreateUserDTO } from "@/DTO/CreateUserDTO";
import useAxios from "./use-axios";
import { useAuth } from "@/contexts/AuthContext";

const useUser = () => {
    const { api } = useAxios();
    const { setToken } = useAuth();


    const createUser = async (userData: CreateUserDTO) => {
        const res = await api.post("/register", userData);
        return res;
    }

    const authenticateUser = async (email: string, password: string) => {
        const res = await api.post("/login", { email, password });
        console.log(res);
        console.log(res.data);
        setToken(res.data.token);
        return res;
    }

    const refreshToken = async () => {
        const res = await api.post("/refresh-token");
        return res;
    }

    return {
        authenticateUser,
        createUser,
        refreshToken,
    }
}

export default useUser;