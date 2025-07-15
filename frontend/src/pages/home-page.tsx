import AppLayout from "@/components/app-layout";
import MoviePoster from "@/components/ui/movie-poster";
import Title from "@/components/ui/title";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useAI from "@/hooks/use-ai";
import usePreferences from "@/hooks/use-preferences";
import { ROUTES } from "@/utils/routes";
import type { AIRecommendations } from "@/utils/types";
import { HttpStatusCode, isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const { userData } = useAuth();
    const { getUserPreferences } = usePreferences();
    const { showError } = useToast();
    const { generateMovieRecommendations } = useAI();
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState<AIRecommendations[]>([]);
    const [specialRecommendations, setSpecialRecommendations] = useState<AIRecommendations[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) return;
        getUserPreferences(userData.id).then(async (res) => {
            const [recommendations, special] = await Promise.all([
                generateMovieRecommendations(res.data),
                generateMovieRecommendations(res.data, true)
            ]);
            console.log(recommendations);
            setRecommendations(recommendations);
            setSpecialRecommendations(special);
            setLoading(false);
        }).catch((error) => {
            if (!isAxiosError(error)) {
                showError("Erro ao buscar preferências do usuário");
                return;
            }
            if (error.status === HttpStatusCode.NotFound) {
                navigate(ROUTES.addPreferences);
                return;
            }

        });
    }, [userData]);

    const getTimeOfTheDay = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    }

    if (loading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-primary/50 animate-pulse"></div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground">
                            Carregando...
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                            Estamos preparando uma experiência cinematográfica única para você
                        </p>
                    </div>
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div>
                <Title>{getTimeOfTheDay()}, {userData?.username}! </Title>
            </div>
            <section>
                {recommendations.length > 0 && (
                    <div className="mt-6">
                        <p className="text-muted-foreground">Filmes recomendados com base nos seus gostos</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {recommendations.map((movie) => (<MoviePoster movie={movie} key={movie.title} />))}
                        </div>
                    </div>
                )}
            </section>
            <section>
                {specialRecommendations.length > 0 && (
                    <div className="mt-6">
                        <p className="text-muted-foreground">Recomendações especiais para hoje</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {specialRecommendations.map((movie) => (<MoviePoster movie={movie} key={movie.title} />))}
                        </div>
                    </div>
                )}
            </section>
        </AppLayout>
    );
}