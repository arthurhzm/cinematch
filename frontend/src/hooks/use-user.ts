import type { CreateUserDTO } from "@/DTO/CreateUserDTO";
import useAxios from "./use-axios";

const useUser = () => {
    const { api } = useAxios();

    const createUser = async (userData: CreateUserDTO) => {
        const res = await api.post("/register", userData);
        return res;
    }

    const refreshToken = async () => {
        const res = await api.post("/refresh-token");
        return res;
    }

    return {
        createUser,
        refreshToken,
    }
}

export default useUser;