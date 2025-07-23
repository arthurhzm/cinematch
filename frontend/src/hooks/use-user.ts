import { useAuth } from "@/contexts/AuthContext";
import type { CreateUserDTO } from "@/DTO/CreateUserDTO";
import type { FollowUnfollowUserDTO } from "@/DTO/FollowUnfollowUserDTO";
import type { UpdateUserDTO } from "@/DTO/UpdateUserDTO";
import useAxios from "./use-axios";

const useUser = () => {
    const { api } = useAxios();
    const { setToken, setUserData } = useAuth();

    const getUserById = async (userId: string) => {
        const res = await api.get(`/users/${userId}`);
        return res;
    }

    const getUserByEmail = async (email: string) => {
        const res = await api.get(`/users/email`, { params: { email } });
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

    const updateUser = async (userId: number, userData: UpdateUserDTO) => {
        const res = await api.patch(`/users/${userId}`, userData);
        return res;
    }

    const getFriendsMoviesFeedback = async (userId: number) => {
        const res = await api.get(`/user/${userId}/friends-feedback`);
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

    const generateRecoveryCode = async (email: string) => {
        const res = await api.post("/forgot-password", { email });
        return res;
    }

    const verifyRecoveryCode = async (email: string, code: string) => {
        const res = await api.post("/forgot-password/verify", { email, code });
        return res;
    }

    const updatePassword = async (email: string, password: string) => {
        const res = await api.put("/update-password", { email, newPassword: password });
        return res;
    }

    return {
        getUsersByUsername,
        getUserById,
        getUserByEmail,
        getUserFollowers,
        getUserFollowing,
        getFriendsMoviesFeedback,
        followUser,
        unfollowUser,
        authenticateUser,
        createUser,
        refreshToken,
        logoutUser,
        updateUser,
        generateRecoveryCode,
        verifyRecoveryCode,
        updatePassword,
    }
}

export default useUser;