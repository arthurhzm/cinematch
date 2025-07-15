import AppLayout from "@/components/app-layout";
import Title from "@/components/ui/title";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useAI from "@/hooks/use-ai";
import usePreferences from "@/hooks/use-preferences";
import { ROUTES } from "@/utils/routes";
import type { AIRecommendations, UserPreferences } from "@/utils/types";
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

    useEffect(() => {
        if (!userData) return;
        getUserPreferences(userData.id).then(async (res) => {
            const recommendations = await generateMovieRecommendations(res.data);
            console.log(recommendations);
            setRecommendations(recommendations);
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
    }, [userData])

    return (
        <AppLayout>
            <section>
                {recommendations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-lg font-medium">Estamos buscando os melhores filmes para você...</p>
                    </div>
                ) : (
                    <div className="mt-6">
                        <p className="text-muted-foreground">Filmes recomendados com base nos seus gostos</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {recommendations.map((movie) => (
                                <div key={movie.title} className="flex-none">
                                    <img
                                        src={movie.poster_url || "https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Poster"}
                                        alt={`Filme ${movie.title}`}
                                        className="w-48 h-72 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </AppLayout>
    );
}