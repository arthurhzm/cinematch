import type { CreateMovieFeedbackDTO } from "@/DTO/CreateMovieFeedbackDTO";
import useAxios from "./use-axios";
import type { UpdateMovieFeedbackDTO } from "@/DTO/UpdateMovieFeedbackDTO";

const useFeedback = () => {
    const { api } = useAxios();

    const getUserFeedback = async (userId: number, movieTitle?: string) => {
        const params = movieTitle ? { movieTitle } : {};
        const response = await api.get(`user/${userId}/feedback`, {
            params
        });
        return response;
    };

    const submitFeedback = async (userId: number, feedback: CreateMovieFeedbackDTO) => {
        const response = await api.post(`user/${userId}/feedback`, feedback);
        return response;
    };

    const updateFeedback = async (feedbackId: number, feedback: UpdateMovieFeedbackDTO) => {
        const response = await api.patch(`/feedback/${feedbackId}`, feedback);
        return response;
    };

    return { getUserFeedback, submitFeedback, updateFeedback };
};

export default useFeedback;
