import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import useFeedback from "@/hooks/use-feedback";
import useTMDB from "@/hooks/use-tmdb";
import { type TMDBMovie, type TMDBMovieDetails, type UserMovieFeedback } from "@/utils/types";
import { ArrowLeft, Calendar, Clock, DollarSign, Eye, Film, MessageCircle, Play, Star, ThumbsUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MoviePage() {

    const params = useParams();
    const movieTitle = params.movieTitle;
    const { getMovieByTitle, getMovieDetails } = useTMDB();
    const {getUserFeedback, updateFeedback, submitFeedback} = useFeedback();
    const {userData} = useAuth();
    const navigate = useNavigate();

    const [movieDetails, setMovieDetails] = useState<TMDBMovieDetails>();
    const [isWatched, setIsWatched] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [showFullOverview, setShowFullOverview] = useState(false);
    const [feedback, setFeedback] = useState<UserMovieFeedback | null>(null);

    useEffect(() => {
        if (!movieTitle || !userData) return;
        const fetchData = async () => {
            const movies = await getMovieByTitle(movieTitle.split(" ")[0]);
            const movie = movies.results.find((movie: TMDBMovie) => movie.original_title.toLowerCase() === movieTitle.toLowerCase());
            if (!movie) return;
            const details = await getMovieDetails(movie.id);
            const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null;
            const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
            setMovieDetails({ ...details, backdropUrl, posterUrl });

            setFeedback((await getUserFeedback(userData.id, movieTitle)).data);

        };
        fetchData();
    }, [movieTitle])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatRuntime = (minutes: number | null) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    const StarRating = ({ rating, size = "w-5 h-5", interactive = false, onRate }: { rating: number, size?: string, interactive?: boolean, onRate?: (rating: number) => void }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => interactive && onRate && onRate(star)}
                        className={`${interactive ? 'hover:scale-110 transition-transform' : ''} ${star <= rating ? 'text-yellow-400' : 'text-gray-600'}`}
                        disabled={!interactive}
                    >
                        <Star className={`${size} ${star <= rating ? 'fill-current' : ''}`} />
                    </button>
                ))}
            </div>
        );
    };

    if (!movieDetails || !userData) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-96 space-y-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
                    <h1 className="text-2xl font-bold text-primary mb-2">Carregando filme...</h1>
                    <p className="text-muted-foreground text-center">Buscando informações cinematográficas<br />Aguarde um instante!</p>
                </div>
            </AppLayout>
        )
    }

    return (
        <AppLayout>
            <div className="min-h-screen bg-gradient-to-br cinema-gradient text-white overflow-x-hidden">
                {/* Hero Section com Backdrop */}
                <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
                    {/* Backdrop Image */}
                    <div className="absolute inset-0">
                        {movieDetails.backdropUrl ? (
                            <img
                                src={movieDetails.backdropUrl}
                                alt={movieDetails.title}
                                className="w-full h-full object-cover object-center"
                            />
                        ) : (
                            <div className="w-full h-full" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />
                    </div>

                    {/* Navigation */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
                        <Button
                            variant={"default"}
                            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors text-white"
                            onClick={() => navigate(`/search?query=${movieTitle}`)}
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-end gap-6">
                            {/* Poster */}
                            <div className="flex-shrink-0 hidden sm:block">
                                {movieDetails.posterUrl ? (
                                    <img
                                        src={movieDetails.posterUrl}
                                        alt={movieDetails.title}
                                        className="w-40 h-60 object-cover rounded-lg shadow-2xl border-2 border-white/20"
                                    />
                                ) : (
                                    <div className="w-40 h-60 bg-gray-800 rounded-lg shadow-2xl border-2 border-white/20 flex items-center justify-center">
                                        <Film className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            {/* Movie Info */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h1 className="text-3xl md:text-5xl font-bold mb-2 leading-tight">
                                        {movieDetails.title}
                                    </h1>
                                    {movieDetails.tagline && (
                                        <p className="text-xl text-yellow-400 font-medium italic">
                                            "{movieDetails.tagline}"
                                        </p>
                                    )}
                                </div>

                                {/* Quick Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(movieDetails.release_date).getFullYear()}</span>
                                    </div>
                                    {movieDetails.runtime && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatRuntime(movieDetails.runtime)}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="font-semibold">{movieDetails.vote_average.toFixed(1)}</span>
                                        <span className="text-gray-400">({movieDetails.vote_count.toLocaleString()})</span>
                                    </div>
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {movieDetails.genres.map((genre) => (
                                        <span
                                            key={genre.id}
                                            className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30"
                                        >
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-lg border-b border-gray-800">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={() => {
                                        setIsWatched(!isWatched)
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isWatched
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {isWatched ? 'Assistido' : 'Marcar como visto'}
                                    </span>
                                </Button>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-400">Sua avaliação:</span>
                                <StarRating
                                    rating={userRating}
                                    interactive={true}
                                    onRate={setUserRating}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-8 space-y-12">
                    {/* Overview */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                            Sinopse
                        </h2>
                        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                            <p className={`text-gray-300 leading-relaxed text-lg ${!showFullOverview && movieDetails.overview.length > 300 ? 'line-clamp-4' : ''}`}>
                                {movieDetails.overview}
                            </p>
                            {movieDetails.overview.length > 300 && (
                                <button
                                    onClick={() => setShowFullOverview(!showFullOverview)}
                                    className="mt-4 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                                >
                                    {showFullOverview ? 'Ver menos' : 'Ver mais'}
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Movie Stats */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                            Estatísticas
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
                                <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-green-400">
                                    {formatCurrency(movieDetails.budget)}
                                </div>
                                <div className="text-sm text-gray-400">Orçamento</div>
                            </div>

                            {movieDetails.revenue && (
                                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
                                    <DollarSign className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {formatCurrency(movieDetails.revenue)}
                                    </div>
                                    <div className="text-sm text-gray-400">Bilheteria</div>
                                </div>
                            )}

                            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
                                <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                                <div className="text-2xl font-bold text-blue-400">
                                    {movieDetails.vote_count.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-400">Avaliações</div>
                            </div>

                            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
                                <Star className="w-8 h-8 text-purple-400 mx-auto mb-3 fill-current" />
                                <div className="text-2xl font-bold text-purple-400">
                                    {movieDetails.vote_average.toFixed(1)}
                                </div>
                                <div className="text-sm text-gray-400">Nota Média</div>
                            </div>
                        </div>
                    </section>

                    {/* Additional Info */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                            Informações Técnicas
                        </h2>
                        <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Detalhes</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Data de Lançamento</span>
                                            <span className="text-white">{formatDate(movieDetails.release_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Idioma Original</span>
                                            <span className="text-white uppercase">{movieDetails.original_language}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Status</span>
                                            <span className="text-white">{movieDetails.status}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-200">Produção</h3>
                                    <div className="space-y-3">
                                        {movieDetails.production_companies && movieDetails.production_companies.length > 0 && (
                                            <div>
                                                <span className="text-gray-400 block mb-1">Estúdios</span>
                                                <div className="space-y-1">
                                                    {movieDetails.production_companies.slice(0, 3).map((company) => (
                                                        <div key={company.id} className="text-white text-sm">
                                                            {company.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {movieDetails.production_countries && movieDetails.production_countries.length > 0 && (
                                            <div>
                                                <span className="text-gray-400 block mb-1">Países</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {movieDetails.production_countries.map((country) => (
                                                        <span key={country.iso_3166_1} className="text-white text-sm bg-gray-800 px-2 py-1 rounded">
                                                            {country.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Actions */}
                    <section>
                        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-800/30">
                            <h3 className="text-xl font-bold mb-4 text-center">Compartilhe sua opinião</h3>
                            <div className="flex items-center justify-center gap-4">
                                <button className="flex items-center gap-2 bg-gray-900/70 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>Curtir</span>
                                </button>
                                <button className="flex items-center gap-2 bg-gray-900/70 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Comentar</span>
                                </button>
                                <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors">
                                    <Play className="w-4 h-4" />
                                    <span>Assistir Trailer</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

        </AppLayout>
    )
}