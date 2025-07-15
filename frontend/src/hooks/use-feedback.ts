import type { CreateMovieFeedbackDTO } from "@/DTO/CreateMovieFeedbackDTO";
import useAxios from "./use-axios";

const useFeedback = () => {
    const { api } = useAxios();

    const submitFeedback = async (userId: number, feedback: CreateMovieFeedbackDTO) => {
        const response = await api.post(`user/${userId}/feedback`, feedback);
        return response;
    };

    return { submitFeedback };
};

export default useFeedback;
