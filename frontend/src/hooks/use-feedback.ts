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

    const deleteFeedback = async (feedbackId: number) => {
        const response = await api.delete(`/feedback/${feedbackId}`);
        return response;
    };

    const getMovieUsersFeedback = async (movieTitle: string) => {
        const response = await api.get(`/movies/${encodeURIComponent(movieTitle)}/feedback`);
        return response;
    };

    return { getUserFeedback, submitFeedback, updateFeedback, deleteFeedback, getMovieUsersFeedback };
};

export default useFeedback;
