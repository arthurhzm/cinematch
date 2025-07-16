import type { CreateMovieRecommendationFeedbackDTO } from "@/DTO/CreateMovieRecommendationFeedbackDTO";
import useAxios from "./use-axios";

const useRecommendation = () => {
    const { api } = useAxios();

    const putRecommendationFeedback = async (recommendation: CreateMovieRecommendationFeedbackDTO) => {
        const response = await api.put("/recommendations/feedback", recommendation);
        return response;
    }

    return { putRecommendationFeedback };
}
export default useRecommendation;