import type { CreateMovieRecommendationFeedbackDTO } from "@/DTO/CreateMovieRecommendationFeedbackDTO";
import useAxios from "./use-axios";

const useRecommendation = () => {
    const { api } = useAxios();

    const getUserRecommendationsFeedback = async (userId: number) => {
        const response = await api.get(`user/${userId}/recommendations/feedback`);
        return response;
    }

    const putRecommendationFeedback = async (recommendation: CreateMovieRecommendationFeedbackDTO) => {
        const response = await api.put("/recommendations/feedback", recommendation);
        return response;
    }

    return { getUserRecommendationsFeedback, putRecommendationFeedback };
}
export default useRecommendation;