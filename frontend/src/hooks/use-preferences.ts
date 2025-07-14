import type { SavePreferencesDTO } from "@/DTO/SavePreferencesDTO";
import useAxios from "./use-axios";

const usePreferences = () => {
    const { api } = useAxios();

    const getUserPreferences = (userId: number) => {
        return api.get(`/user/${userId}/preferences`);
    }

    const saveUserPreferences = (userId: number, preferences: SavePreferencesDTO) => {
        return api.post(`/user/${userId}/preferences`, preferences);
    }

    return {
        getUserPreferences,
        saveUserPreferences
    }
}

export default usePreferences;