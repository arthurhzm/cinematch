import useAxios from "./use-axios";

const usePreferences = () => {
    const { api } = useAxios();
    
    const getUserPreferences = (userId: number) => {
        return api.get(`/user/${userId}/preferences`);
    }

    return {
        getUserPreferences
    }
}

export default usePreferences;