import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { CreateMovieFeedbackDTO } from "@/DTO/CreateMovieFeedbackDTO";
import { UpdateMovieFeedbackDTO } from "@/DTO/UpdateMovieFeedbackDTO";
import useFeedback from "@/hooks/use-feedback";
import type { AIRecommendations, UserMovieFeedback } from "@/utils/types";
import { Check, Star, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { CreateMovieRecommendationFeedbackDTO } from "@/DTO/CreateMovieRecommendationFeedbackDTO";
import useRecommendation from "@/hooks/use-recommendation";

type RateMovieRecommendationProps = {
    movie: AIRecommendations;
    userId?: number;
    onFeedbackComplete?: (feedback: { rating: number; review: string; movieTitle: string }) => void;
}

export default function RateMovieRecommendation({ movie, userId, onFeedbackComplete }: RateMovieRecommendationProps) {
    const { userData } = useAuth();
    const { getUserFeedback, submitFeedback, updateFeedback } = useFeedback();
    const { putRecommendationFeedback } = useRecommendation();

    const { showSuccess, showError } = useToast();


    const [showFeedbackSection, setShowFeedbackSection] = useState(false);
    const [showRecommendationFeedback, setShowRecommendationFeedback] = useState(false);
    const [feedback, setFeedback] = useState<UserMovieFeedback | null>(null);

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!movie || !userData) return;
        console.log(userData.id, userId);

        const fetchFeedback = async () => {
            const user = userId || userData.id;
            if (!user) return;
            const response = await getUserFeedback(user, movie.title);
            if (response.data) {
                setRating(response.data[0].rating);
                setReview(response.data[0].review);
                setFeedback(response.data[0]);
                setShowFeedbackSection(true);
            }
        };
        fetchFeedback();
    }, [movie])

    const handleReviewSubmit = async () => {
        if (!userData) return;
        setLoading(true);

        try {
            if (!!feedback) {
                const updatedFeedback = new UpdateMovieFeedbackDTO(rating, review);
                await updateFeedback(feedback.id, updatedFeedback);
                showSuccess("Avaliação atualizada com sucesso!");
            } else {
                const newFeedback = new CreateMovieFeedbackDTO(movie.title, rating, review);
                await submitFeedback(userData.id, newFeedback);
                showSuccess("Avaliação enviada com sucesso!");
            }

            // Chama a callback com os dados do feedback quando concluído com sucesso
            if (onFeedbackComplete) {
                onFeedbackComplete({
                    rating,
                    review,
                    movieTitle: movie.title
                });
            }
        } catch (error) {
            showError(!!feedback ? "Falha ao atualizar avaliação." : "Falha ao enviar avaliação.");
        } finally {
            setLoading(false);
        }
    }

    const handleRecommendationFeedback = async (feedback: "like" | "dislike" | "superlike") => {
        if (!userData || !movie) return;
        setLoading(true);
        const recommendationFeedback = new CreateMovieRecommendationFeedbackDTO(
            userData.id,
            movie.title,
            feedback
        );
        try {
            await putRecommendationFeedback(recommendationFeedback);
            showSuccess("Avaliação enviada com sucesso! Suas recomendações serão melhoradas com base no seu feedback.");
            setShowRecommendationFeedback(false);
            setShowFeedbackSection(false);

            if(onFeedbackComplete) {
                onFeedbackComplete({
                    rating: 0,
                    review: "", 
                    movieTitle: movie.title
                });
            }
        } catch (error) {
            showError("Falha ao enviar feedback.");
        } finally {
            setLoading(false);
        }

    }

    return (
        <>
            {/* Seção do 'Sim' ou 'Não' para feedback */}
            {!showFeedbackSection && !showRecommendationFeedback && (
                <>
                    <p className="text-xl font-semibold text-center mb-4">Você já assistiu {movie.title}?</p>
                    <div className="w-full flex gap-3 justify-center">
                        <button
                            className="w-full flex justify-center items-center gap-2 max-w-32 py-3 px-6 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-400 rounded-lg transition-colors duration-200 font-medium"
                            onClick={() => setShowFeedbackSection(true)}
                        >
                            <Check /> Sim
                        </button>
                        <button
                            className="w-full flex justify-center items-center gap-2 max-w-32 py-3 px-6 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 rounded-lg transition-colors duration-200 font-medium"
                            onClick={() => setShowRecommendationFeedback(true)}
                        >
                            <X /> Não
                        </button>
                    </div>
                </>
            )}

            {/* Seção de feedback detalhado de filme JÁ ASSISTIDO */}
            {showFeedbackSection && (
                <div className="flex flex-col items-center gap-4">
                    {/* Star Rating */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="text-gray-400 hover:text-yellow-400 transition-colors relative"
                                onClick={() => {
                                    if (rating === star) {
                                        setRating(star - 0.5);
                                    } else {
                                        setRating(star);
                                    }
                                }}
                                disabled={(!!userId && (userId !== userData?.id))}

                            >
                                <Star
                                    size={48}
                                    className={rating >= star ? "text-yellow-400" : rating >= star - 0.5 ? "text-yellow-400" : "text-gray-400"}
                                    fill={rating >= star ? "currentColor" : "none"}
                                />
                                {rating >= star - 0.5 && rating < star && (
                                    <Star
                                        size={48}
                                        className="text-yellow-400 absolute top-0 left-0"
                                        fill="currentColor"
                                        style={{ clipPath: "inset(0 50% 0 0)" }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Review Textarea */}
                    <textarea
                        placeholder="Escreva sua opinião sobre o filme... (opcional)"
                        className="w-full h-24 p-3 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        value={review}
                        onChange={(e) => setReview(e.currentTarget.value)}
                        disabled={(!!userId && (userId !== userData?.id))}
                    />

                    {/* Submit Button */}
                    {((!!userId && (userId == userData?.id)) || !userId) && (
                        <button
                            className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            onClick={handleReviewSubmit}
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : "Enviar Avaliação"}
                        </button>)}
                </div>
            )}

            {showRecommendationFeedback && (
                <div className="w-full">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Avalie esta recomendação:</h3>
                    <div className="w-full flex gap-2">
                        <div className="w-1/3 text-center">
                            <Button
                                onClick={() => handleRecommendationFeedback("like")}
                                disabled={loading}
                                className="flex items-center justify-center w-full py-3 px-4 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-400 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <ThumbsUp size={20} />
                            </Button>
                        </div>
                        <div className="w-1/3 text-center">
                            <Button
                                onClick={() => handleRecommendationFeedback("superlike")}
                                disabled={loading}
                                className="flex items-center justify-center w-full py-3 px-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/40 text-purple-400 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <Star size={20} />
                            </Button>
                        </div>
                        <div className="w-1/3 text-center">
                            <Button
                                onClick={() => handleRecommendationFeedback("dislike")}
                                disabled={loading}
                                className="flex items-center justify-center w-full py-3 px-4 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 rounded-lg transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                <ThumbsDown size={20} />
                            </Button>
                        </div>
                    </div>
                </div>

            )}

        </>
    )
}