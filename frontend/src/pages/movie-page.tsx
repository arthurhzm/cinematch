import AppLayout from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import useFeedback from "@/hooks/use-feedback";
import useTMDB from "@/hooks/use-tmdb";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import { type MovieUsersFeedback, type TMDBMovie, type TMDBMovieDetails, type UserMovieFeedback } from "@/utils/types";
import { ArrowLeft, Calendar, Clock, DollarSign, Eye, Film, MessageCircle, Star, User, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function MoviePage() {

    const params = useParams();
    const movieTitle = params.movieTitle;
    const { getMovieByTitle, getMovieDetails } = useTMDB();
    const { getUserFeedback, updateFeedback, submitFeedback, getMovieUsersFeedback } = useFeedback();
    const { userData } = useAuth();
    const navigate = useNavigate();

    const [movieDetails, setMovieDetails] = useState<TMDBMovieDetails>();
    const [isWatched, setIsWatched] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [showFullOverview, setShowFullOverview] = useState(false);
    const [feedback, setFeedback] = useState<UserMovieFeedback | null>(null);
    const [usersFeedback, setUsersFeedback] = useState<MovieUsersFeedback[]>([]);
    const [review, setReview] = useState("");
    const [showFullReviews, setShowFullReviews] = useState(false);

    useEffect(() => {
        if (!movieTitle || !userData) return;
        const fetchData = async () => {
            const movies = await getMovieByTitle(movieTitle);
            const movie = movies.results.find((movie: TMDBMovie) => movie.original_title.toLowerCase() === movieTitle.toLowerCase());
            if (!movie) return;
            const details: TMDBMovieDetails = await getMovieDetails(movie.id);
            const backdropUrl = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null;
            const posterUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null;
            console.log(details);
            
            setMovieDetails({ ...details, backdropUrl, posterUrl });
            const feedback: UserMovieFeedback = (await getUserFeedback(userData.id, details.title)).data[0] || null;

            setFeedback(feedback);
            setIsWatched(!!feedback);
            setUserRating(feedback?.rating || 0);
            setReview(feedback?.review || "");

            const usersFeedback: MovieUsersFeedback[] = (await getMovieUsersFeedback(details.title)).data || [];
            setUsersFeedback(usersFeedback);
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

    const StarRating = ({ userId, disabled }: { userId: number, disabled?: boolean }) => {
        if (!movieDetails) return null;

        return (
            <>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        disabled={disabled}
                        key={star}
                        className="relative text-gray-400 hover:text-yellow-400 transition-colors"
                        onClick={async () => {
                            let newRating = userRating === star ? star - 0.5 : star;
                            setUserRating(newRating);
                            if (!!feedback) {
                                await updateFeedback(feedback.id, { ...feedback, rating: newRating });
                                setFeedback({ ...feedback, rating: newRating });
                                setUsersFeedback((await getMovieUsersFeedback(movieDetails.title)).data);

                            } else {
                                const response = await submitFeedback(userId, {
                                    movieTitle: movieDetails.title,
                                    rating: newRating,
                                    review: ''
                                });
                                setFeedback(response.data);
                                setUsersFeedback((await getMovieUsersFeedback(movieDetails.title)).data);

                            }
                        }}
                    >
                        <Star
                            className={`w-6 h-6 ${userRating >= star ? "text-yellow-400" : userRating >= star - 0.5 ? "text-yellow-400" : "text-gray-400"}`}
                            fill={userRating >= star ? "currentColor" : "none"}
                        />
                        {userRating >= star - 0.5 && userRating < star && (
                            <Star
                                className="w-6 h-6 text-yellow-400 absolute top-0 left-0"
                                fill="currentColor"
                                style={{ clipPath: "inset(0 50% 0 0)" }}
                            />
                        )}
                    </button>
                ))}
            </>
        )
    }

    const StarRatingStatic = ({ rating }: { rating: number }) => (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className="relative">
                    <Star
                        className={`w-6 h-6 ${rating >= star ? "text-yellow-400" : rating >= star - 0.5 ? "text-yellow-400" : "text-gray-400"}`}
                        fill={rating >= star ? "currentColor" : "none"}
                    />
                    {rating >= star - 0.5 && rating < star && (
                        <Star
                            className="w-6 h-6 text-yellow-400 absolute top-0 left-0"
                            fill="currentColor"
                            style={{ clipPath: "inset(0 50% 0 0)" }}
                        />
                    )}
                </span>
            ))}
        </div>
    );

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
                                        <span className="font-semibold">{usersFeedback.reduce((acc, curr) => acc + curr.rating, 0) / usersFeedback.length || 0}</span>
                                        <span className="text-gray-400">({usersFeedback.length})</span>
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
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                            <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
                                <Button
                                    onClick={async () => {
                                        if (!!feedback) {
                                            await updateFeedback(feedback.id, { ...feedback, rating: userRating });
                                            setFeedback({ ...feedback, rating: userRating });
                                            setUsersFeedback((await getMovieUsersFeedback(movieDetails.title)).data);
                                        } else {
                                            const response = await submitFeedback(userData.id, {
                                                movieTitle: movieDetails.title,
                                                rating: userRating,
                                                review: ''
                                            });
                                            setFeedback(response.data);
                                            setUsersFeedback((await getMovieUsersFeedback(movieDetails.title)).data);
                                        }
                                        setIsWatched(!isWatched)
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isWatched
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                        }`}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {isWatched ? 'Assistiu' : 'Marcar como visto'}
                                    </span>
                                </Button>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                                <span className="text-sm text-gray-400">Sua avaliação:</span>
                                <div className="flex items-center gap-2">
                                    <StarRating userId={userData.id} />
                                </div>

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
                                    {usersFeedback.length}
                                </div>
                                <div className="text-sm text-gray-400">Avaliações CineMatch</div>
                            </div>

                            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 text-center">
                                <Star className="w-8 h-8 text-purple-400 mx-auto mb-3 fill-current" />
                                <div className="text-2xl font-bold text-purple-400">
                                    {usersFeedback.reduce((acc, feedback) => acc + feedback.rating, 0) / (usersFeedback.length || 1)}
                                </div>
                                <div className="text-sm text-gray-400">Nota Média CineMatch</div>
                            </div>


                        </div>
                    </section>

                    {/* Additional Info */}
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                            Informações Técnicas
                        </h2>
                        <div className="bg-gradient-to-br from-gray-900/70 via-gray-900/40 to-gray-900/70 rounded-2xl p-6 md:p-8 border border-gray-800 shadow-lg">
                            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                                {/* Detalhes */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-4 text-orange-400 flex items-center gap-2">
                                        <Film className="w-5 h-5" />
                                        Detalhes
                                    </h3>
                                    <ul className="space-y-4">
                                        <li className="flex items-center justify-between border-b border-gray-800 pb-2">
                                            <span className="text-gray-400">Data de Lançamento</span>
                                            <span className="text-white font-medium">{formatDate(movieDetails.release_date)}</span>
                                        </li>
                                        <li className="flex items-center justify-between border-b border-gray-800 pb-2">
                                            <span className="text-gray-400">Idioma Original</span>
                                            <span className="text-white font-medium uppercase">{movieDetails.original_language}</span>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span className="text-gray-400">Status</span>
                                            <span className="text-white font-medium">{movieDetails.status}</span>
                                        </li>
                                    </ul>
                                </div>
                                {/* Produção */}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2">
                                        <Users className="w-5 h-5" />
                                        Produção
                                    </h3>
                                    <div className="space-y-4">
                                        {movieDetails.production_companies && movieDetails.production_companies.length > 0 && (
                                            <div>
                                                <span className="text-gray-400 block mb-2">Estúdios</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {movieDetails.production_companies.slice(0, 3).map((company) => (
                                                        <span
                                                            key={company.id}
                                                            className="bg-orange-900/40 text-orange-200 px-3 py-1 rounded-full text-sm font-medium border border-orange-700/30 shadow-sm"
                                                        >
                                                            {company.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {movieDetails.production_countries && movieDetails.production_countries.length > 0 && (
                                            <div>
                                                <span className="text-gray-400 block mb-2">Países</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {movieDetails.production_countries.map((country) => (
                                                        <span
                                                            key={country.iso_3166_1}
                                                            className="bg-red-900/40 text-red-200 px-3 py-1 rounded-full text-sm font-medium border border-red-700/30 shadow-sm"
                                                        >
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

                    <section>

                        {/* Write Review Section */}
                        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-4 md:p-6 border border-blue-800/30 mb-8">
                            <h3 className="text-lg md:text-xl font-bold mb-4 text-center">Compartilhe sua opinião</h3>
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-1 md:gap-3 flex-wrap justify-center w-full">
                                    <span className="text-gray-300">Sua avaliação:</span>
                                    <StarRating userId={userData.id} />
                                </div>

                                <textarea
                                    placeholder="Escreva sua crítica aqui... O que você achou do filme?"
                                    className="w-full h-24 bg-gray-900/70 border border-gray-700 rounded-lg p-3 md:p-4 text-white placeholder-gray-400 resize-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                    value={review}
                                    onChange={(e) => setReview(e.currentTarget.value)}
                                />

                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:justify-end">
                                    <Button
                                        className="w-full md:w-auto text-white flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 md:px-6 py-2 rounded-lg transition-colors font-medium"
                                        onClick={async () => {
                                            if (!!feedback) {
                                                await updateFeedback(feedback.id, { ...feedback, review: review.trim() });
                                                setFeedback({ ...feedback, review: review.trim() });
                                                setUsersFeedback((await getMovieUsersFeedback(movieDetails.title)).data);

                                            } else {
                                                const response = await submitFeedback(userData.id, {
                                                    movieTitle: movieDetails.title,
                                                    rating: userRating,
                                                    review: review.trim()
                                                });
                                                setFeedback(response.data);
                                                setUsersFeedback((await getMovieUsersFeedback(movieDetails.title)).data);

                                            }
                                            setReview("")
                                        }}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Publicar Avaliação
                                    </Button>
                                    {/* <Button className="w-full md:w-auto text-white flex items-center justify-center gap-2 bg-gray-900/70 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors">
                                        <Play className="w-4 h-4" />
                                        Assistir ao trailer
                                    </Button> */}
                                </div>
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <div className="w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></div>
                            Avaliações da Comunidade
                            <span className="text-lg text-gray-400 font-normal">({usersFeedback.length})</span>
                        </h2>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {usersFeedback.slice(0, showFullReviews ? usersFeedback.length : 10).map((review) => (
                                <div
                                    key={review.id}
                                    className="bg-gray-900/40 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-800/50 hover:border-gray-700/80 transition-all group flex flex-col gap-4"
                                >
                                    {/* Avatar & User Info */}
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-0">
                                        <Avatar
                                            className="w-14 h-14 md:w-24 md:h-24 border-2 border-primary/30"
                                            onClick={() => navigate(ROUTES.profile(review.username), { state: { userId: review.userId } })}
                                        >
                                            <AvatarImage src={review.profilePicture || ""} />
                                            <AvatarFallback className="bg-primary/20 text-primary text-lg md:text-xl font-semibold">
                                                {review.username ? getInitials(review.username) : <User />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4
                                                onClick={() => navigate(ROUTES.profile(review.username), { state: { userId: review.userId } })}
                                                className="cursor-pointer text-base md:text-lg font-semibold text-white group-hover:text-purple-300 transition-colors"
                                            >
                                                {review.username}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400">
                                                <span>{new Date(review.updatedAt).toLocaleDateString("pt-BR")}</span>
                                                <div className="flex items-center">
                                                    <StarRatingStatic rating={review.rating} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Content */}
                                    <div className="flex-1 flex flex-col gap-2">
                                        {review.review && review.review.trim() && (
                                            <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-2">
                                                {review.review}
                                            </p>
                                        )}

                                        {/* Actions & Indicators */}
                                        <div className="flex items-center gap-3 flex-wrap">
                                            {/* <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors group/like text-xs md:text-sm">
                                                <ThumbsUp className="w-4 h-4 group-hover/like:scale-110 transition-transform" />
                                                <span>Útil</span>
                                                <span className="bg-gray-800 px-2 py-1 rounded-full text-xs">12</span>
                                            </button> */}
                                            <div className="flex items-center gap-1">
                                                {review.review && review.review.length > 100 && (
                                                    <span className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded-full border border-purple-600/30">
                                                        Crítica Detalhada
                                                    </span>
                                                )}
                                                {review.rating === 5 && (
                                                    <span className="text-xs bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-600/30">
                                                        ⭐ Obra-prima
                                                    </span>
                                                )}
                                                {review.rating === 1 && (
                                                    <span className="text-xs bg-red-600/20 text-red-300 px-2 py-1 rounded-full border border-red-600/30">
                                                        👎 Decepção
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Reviews */}
                            {usersFeedback.length > 10 && !showFullReviews && (
                                <div className="text-center pt-6">
                                    <button
                                        onClick={() => setShowFullReviews(true)}
                                        className="bg-gray-800/60 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 px-8 py-3 rounded-lg transition-all font-medium text-gray-300 hover:text-white">
                                        Ver mais avaliações ({usersFeedback.length - 10} restantes)
                                    </button>
                                </div>
                            )}

                            {/* Empty state */}
                            {usersFeedback.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                                        Ainda não há avaliações
                                    </h3>
                                    <p className="text-gray-500 mb-6">
                                        Seja o primeiro a compartilhar sua opinião sobre este filme!
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>

        </AppLayout>
    )
}