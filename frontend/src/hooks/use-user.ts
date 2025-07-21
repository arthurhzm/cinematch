import type { CreateUserDTO } from "@/DTO/CreateUserDTO";
import useAxios from "./use-axios";
import { useAuth } from "@/contexts/AuthContext";
import type { FollowUnfollowUserDTO } from "@/DTO/FollowUnfollowUserDTO";

const useUser = () => {
    const { api } = useAxios();
    const { setToken, setUserData } = useAuth();

    const getUserById = async (userId: string) => {
        const res = await api.get(`/users/${userId}`);
        return res;
    }

    const getUsersByUsername = async (username: string) => {
        const res = await api.get(`/users/`, { params: { username } });
        return res;
    }

    const getUserFollowers = async (userId: number) => {
        const res = await api.get(`/user/${userId}/followers`);
        return res;
    }

    const getUserFollowing = async (userId: number) => {
        const res = await api.get(`/user/${userId}/following`);
        return res;
    }

    const followUser = async (data: FollowUnfollowUserDTO) => {
        const res = await api.post(`/follow`, data);
        return res;
    }

    const unfollowUser = async (data: FollowUnfollowUserDTO) => {
        const res = await api.post(`/unfollow`, data);
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
        getUsersByUsername,
        getUserById,
        getUserFollowers,
        getUserFollowing,
        followUser,
        unfollowUser,
        authenticateUser,
        createUser,
        refreshToken,
        logoutUser
    }
}

export default useUser;