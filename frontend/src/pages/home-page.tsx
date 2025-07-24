import AppLayout from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MoviePoster from "@/components/ui/movie-poster";
import Title from "@/components/ui/title";
import { useAuth } from "@/contexts/AuthContext";
import useAI from "@/hooks/use-ai";
import usePreferences from "@/hooks/use-preferences";
import useTMDB from "@/hooks/use-tmdb";
import useUser from "@/hooks/use-user";
import { getInitials } from "@/lib/utils";
import type { AIRecommendations, FriendsMovieFeedback } from "@/utils/types";
import { isAxiosError } from "axios";
import { Star, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
    const { userData } = useAuth();
    const { getUserPreferences } = usePreferences();
    const { generateMovieRecommendations } = useAI();
    const { getFriendsMoviesFeedback } = useUser();
    const { getGenresById, getMovieByTitle } = useTMDB();
    const [recommendations, setRecommendations] = useState<AIRecommendations[]>([]);
    const [specialRecommendations, setSpecialRecommendations] = useState<AIRecommendations[]>([]);
    const [friendsFeedback, setFriendsFeedback] = useState<FriendsMovieFeedback[] | []>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData) return;
        getUserPreferences(userData.id).then(async (_) => {
            const [recommendations, special] = await Promise.all([
                generateMovieRecommendations(false),
                generateMovieRecommendations(true, false)
            ]);
            console.log(recommendations);
            setRecommendations(recommendations);
            setSpecialRecommendations(special);
            setLoading(false);
            getFriendsMoviesFeedback(userData.id).then(async (feedback) => {
                const moviePromises = feedback.data.map(async (item: FriendsMovieFeedback) => {
                    const movieData = await getMovieByTitle(item.movieTitle);
                    const movie = movieData.results[0];
                    if (!movie) return null;

                    const genres = await getGenresById(movie.genre_ids);
                    return {
                        title: item.movieTitle,
                        profilePicture: item.profilePicture,
                        userId: item.userId,
                        username: item.username,
                        rating: item.rating,
                        review: item.review,
                        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                        genres: genres.map((g: any) => g.name),
                        overview: movie.overview,
                        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                        streaming_services: [],
                    };
                });

                console.log(await Promise.all(moviePromises));

                setFriendsFeedback(await Promise.all(moviePromises));
            });
        }).catch((error) => {
            if (!isAxiosError(error)) {
                console.error(error);
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
            <section>
                {friendsFeedback.length > 0 && (
                    <div className="mt-6">
                        <p className="text-muted-foreground">Seus amigos estão assistindo</p>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {friendsFeedback.slice(0, 10).map((movie, index) => (
                                <div key={`${movie.title}-${index}`} className="flex-none relative">
                                    <MoviePoster movie={movie} userId={movie.userId} />
                                    <div className="absolute top-2 right-2">
                                        <Avatar className="w-8 h-8 border-2 border-primary/30">
                                            <AvatarImage src={movie.profilePicture || ""} />
                                            <AvatarFallback className="bg-primary/30 text-primary text-sm font-bold border-2 border-primary/50 shadow-md">
                                                {movie.username ? getInitials(movie.username) : <User className="w-4 h-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            <span className="text-xs text-muted-foreground">{movie.rating}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>
        </AppLayout>
    );
}