import type { SavePreferencesDTO } from "@/DTO/SavePreferencesDTO";
import useAxios from "./use-axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/routes";

const usePreferences = () => {
    const { api } = useAxios();
    const navigate = useNavigate();

    const getUserPreferences = async (userId: number) => {
        const res = await api.get(`/user/${userId}/preferences`);
        
        if (!res) {
            navigate(ROUTES.addPreferences);
        }

        return res;
    }

    const saveUserPreferences = async (userId: number, preferences: SavePreferencesDTO) => {
        return await api.put(`/user/${userId}/preferences`, preferences);
    }

    return {
        getUserPreferences,
        saveUserPreferences
    }
}

export default usePreferences;