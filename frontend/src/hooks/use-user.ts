import useAxios from "./use-axios";

const useUser = () => {
    const { api } = useAxios();

    const refreshToken = async () => {
        const res = await api.post("/auth/refresh-token");
        return res;
    }

    return {
        refreshToken,
    }
}

export default useUser;