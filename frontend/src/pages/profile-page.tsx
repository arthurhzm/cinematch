import AppLayout from "@/components/app-layout";
import MoviePoster from "@/components/ui/movie-poster";
import useFeedback from "@/hooks/use-feedback";
import useTMDB from "@/hooks/use-tmdb";
import type { UserMovieFeedback } from "@/utils/types";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

export default function ProfilePage() {
    const { username } = useParams();
    const { getUserFeedback } = useFeedback();
    const { getMovieByTitle, getGenresById } = useTMDB();
    const location = useLocation();
    const { userId } = location.state;
    const [recentMovies, setRecentMovies] = useState<any[]>([]);

    useEffect(() => {
        if (!userId) return
        const fetchFeedback = async () => {
            try {
                const feedback = await getUserFeedback(userId);
                const moviePromises = feedback.data.map(async (item: UserMovieFeedback) => {
                    const movieData = await getMovieByTitle(item.movieTitle);
                    const movie = movieData.results[0];
                    const genres = await getGenresById(movie.genre_ids);
                    return {
                        title: item.movieTitle,
                        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                        genres: genres.map(g => g.name),
                        overview: movie.overview,
                        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                        streaming_services: [],
                    };
                });
                const movies = await Promise.all(moviePromises);
                setRecentMovies(movies);
            } catch (error) {
                console.error("Error fetching user feedback:", error);
            }
        };

        fetchFeedback();
    }, [userId]);

    return (
        <AppLayout>
            <h1>Profile Page</h1>
            <p>Username: {username}</p>
            {recentMovies.length > 0 && (
                <div className="mt-6">
                    <p className="text-muted-foreground">Filmes avaliados recentemente por {username}</p>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {recentMovies.map((movie) => (<MoviePoster movie={movie} key={movie.title} userId={userId} />))}
                    </div>
                </div>
            )}
        </AppLayout>
    )
}