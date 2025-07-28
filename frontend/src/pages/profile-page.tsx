import AppLayout from "@/components/app-layout";
import FollowUnfollowButton from "@/components/follow-unfollow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MoviePoster from "@/components/ui/movie-poster";
import UpdateProfilePicture from "@/components/ui/update-profile-picture";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useFeedback from "@/hooks/use-feedback";
import usePreferences from "@/hooks/use-preferences";
import useRecommendation from "@/hooks/use-recommendation";
import useTMDB from "@/hooks/use-tmdb";
import useUser from "@/hooks/use-user";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import { type UserPreferences, type UserMovieFeedback, type UserProfile, type UserProfilePreview, type UserRecommendationsFeedback } from "@/utils/types";
import { Calendar, Clock, Film, Star, ThumbsDown, ThumbsUp, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ProfilePage() {
    console.log('aloo');
    
    const { username } = useParams();
    const { getUserFeedback } = useFeedback();
    const { getUserRecommendationsFeedback } = useRecommendation();
    const { getMovieByTitle, getGenresById } = useTMDB();
    const { getUserById, getUserFollowers, getUserFollowing } = useUser();
    const { getUserPreferences } = usePreferences();
    const { showError } = useToast();
    const { userData } = useAuth();
    const location = useLocation();
    const { userId } = location.state || {};
    console.log(location.state);
    
    const navigate = useNavigate();

    const [preferences, setPreferences] = useState<UserPreferences>();
    const [recentMovies, setRecentMovies] = useState<any[]>([]);
    const [recentRecommendations, setRecentRecommendations] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({
        totalMovies: 0,
        averageRating: 0,
        favoriteGenres: [] as string[]
    });
    const [followers, setFollowers] = useState<UserProfilePreview[] | []>([]);
    const [following, setFollowing] = useState<UserProfilePreview[] | []>([]);
    const [dialogUpdatePicture, setDialogUpdatePicture] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);

    const isOwnProfile = userData?.username === username;

    useEffect(() => {
        console.log(userId);
        
        if (!userId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setLoadingProgress(0);

                // Passo 1: Buscar dados básicos do usuário (20%)
                const [followersResponse, followingResponse, userResponse] = await Promise.all([
                    getUserFollowers(userId),
                    getUserFollowing(userId),
                    getUserById(userId)
                ]);

                setFollowers(followersResponse.data);
                setFollowing(followingResponse.data);
                setUserInfo(userResponse.data);
                setLoadingProgress(20);

                // Passo 2: Buscar preferências (30%)
                const preferencesResponse = await getUserPreferences(userId);
                setPreferences(preferencesResponse.data);
                setLoadingProgress(30);

                // Passo 3: Buscar feedback de filmes (50%)
                const feedback = await getUserFeedback(userId);
                setLoadingProgress(50);

                // Passo 4: Processar filmes avaliados (70%)
                const moviePromises = feedback.data.map(async (item: UserMovieFeedback) => {
                    const movieData = await getMovieByTitle(item.movieTitle);
                    const movie = movieData.results[0];
                    if (!movie) return null;

                    const genres = await getGenresById(movie.genre_ids);
                    return {
                        title: item.movieTitle,
                        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                        genres: genres.map((g: any) => g.name),
                        overview: movie.overview,
                        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                        streaming_services: [],
                        rating: item.rating
                    };
                });

                const movies = await Promise.all(moviePromises);
                const validMovies = movies.filter(movie => movie !== null).slice(0, 10);
                setRecentMovies(validMovies);
                setLoadingProgress(70);

                // Passo 5: Buscar recomendações (85%)
                const recommendationsFeedback = await getUserRecommendationsFeedback(userId);
                const recommendationPromises = recommendationsFeedback.data.map(async (rec: UserRecommendationsFeedback) => {
                    const movieData = await getMovieByTitle(rec.movieTitle);
                    const movie = movieData.results[0];
                    if (!movie) return null;

                    const genres = await getGenresById(movie.genre_ids);
                    return {
                        title: rec.movieTitle,
                        year: movie.release_date ? new Date(movie.release_date).getFullYear() : 0,
                        genres: genres.map((g: any) => g.name),
                        overview: movie.overview,
                        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
                        streaming_services: [],
                        feedback: rec.feedback
                    };
                });

                const recommendations = await Promise.all(recommendationPromises);
                setRecentRecommendations(recommendations.filter(movie => movie !== null).slice(0, 10));
                setLoadingProgress(85);

                // Passo 6: Calcular estatísticas (100%)
                const totalRating = feedback.data.reduce((sum: number, item: UserMovieFeedback) => sum + item.rating, 0);
                const avgRating = feedback.data.length > 0 ? totalRating / feedback.data.length : 0;

                const genreCount: { [key: string]: number } = {};
                validMovies.forEach(movie => {
                    movie.genres.forEach((genre: string) => {
                        genreCount[genre] = (genreCount[genre] || 0) + 1;
                    });
                });

                const favoriteGenres = Object.entries(genreCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([genre]) => genre);

                setStats({
                    totalMovies: feedback.data.length,
                    averageRating: avgRating,
                    favoriteGenres
                });

                setLoadingProgress(100);

                // Pequeno delay para suavizar a transição
                setTimeout(() => {
                    setIsLoading(false);
                }, 200);

            } catch (error) {
                showError("Erro ao carregar informações do perfil.");
                console.error("Error fetching profile data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AppLayout>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-primary"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-primary/50 animate-pulse"></div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-semibold text-foreground">
                            Carregando perfil...
                        </h3>
                        <p className="text-muted-foreground max-w-md">
                            Estamos buscando todas as informações do perfil
                        </p>
                    </div>
                    <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <div className="flex space-x-1">
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Profile Header */}
                    <Card className="cinema-card border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                {/* Avatar */}
                                <Avatar className="w-24 h-24 border-2 border-primary/30" onClick={() => setDialogUpdatePicture(true)}>
                                    <AvatarImage src={userInfo?.profilePicture || ""} />
                                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                                        {username ? getInitials(username) : <User />}
                                    </AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1 space-y-3">
                                    <div>
                                        <div className="flex flex-row items-center md:justify-between gap-3">
                                            <h1 className="text-3xl font-bold text-foreground">{username}</h1>
                                            {!isOwnProfile && userInfo && (<FollowUnfollowButton user={{ userId: userId, username: username || "", profilePicture: userInfo.profilePicture }} />)}
                                        </div>
                                        <div className="flex items-center gap-3 mt-2">
                                            {isOwnProfile && (
                                                <Badge variant="outline">
                                                    <User className="w-3 h-3 mr-1" />
                                                    Seu perfil
                                                </Badge>
                                            )}
                                            <div
                                                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                                onClick={() => {
                                                    if (!username) return;
                                                    navigate(ROUTES.following(username), { state: { users: following } })
                                                }}
                                            >
                                                <span className="font-semibold">{following.length}</span> seguindo
                                            </div>
                                            <div
                                                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                                                onClick={() => {
                                                    if (!username) return;
                                                    navigate(ROUTES.followers(username), { state: { users: followers } })
                                                }}
                                            >
                                                <span className="font-semibold">{followers.length}</span> seguidores
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                                        {userInfo?.birthdate && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Nascimento: {formatDate(userInfo.birthdate)}</span>
                                            </div>
                                        )}
                                        {userInfo?.gender && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                <span>Gênero: {userInfo.gender}</span>
                                            </div>
                                        )}
                                        {userInfo?.createdAt && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Membro desde: {formatDate(userInfo.createdAt)}</span>
                                            </div>
                                        )}
                                        {userInfo?.lastLogin && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>Último acesso: {formatDate(userInfo.lastLogin)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="cinema-card border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Film className="w-4 h-4 text-primary" />
                                    Filmes Avaliados
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">{stats.totalMovies}</div>
                            </CardContent>
                        </Card>

                        <Card className="cinema-card border-primary/20">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Star className="w-4 h-4 text-primary" />
                                    Nota Média
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {stats.averageRating.toFixed(1)}
                                    <span className="text-sm text-muted-foreground ml-1">/ 5</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="cinema-card border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Badge className="w-4 h-4 text-primary" />
                                    Gêneros Favoritos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1.5">
                                    {preferences?.favoriteGenres.map((genre, index) => (
                                        <Badge key={index} variant="secondary" className="text-xs">
                                            {genre}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Movies */}
                    {recentMovies.length > 0 && (
                        <Card className="cinema-card border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Film className="w-5 h-5 text-primary" />
                                    Filmes Avaliados Recentemente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {recentMovies.slice(0, 10).map((movie, index) => (
                                        <div key={`${movie.title}-${index}`} className="flex-none">
                                            <MoviePoster movie={movie} userId={userId} />
                                            <div className="mt-2 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                    <span className="text-xs text-muted-foreground">{movie.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {recentMovies.length === 0 && (
                        <Card className="cinema-card border-primary/20">
                            <CardContent className="p-8 text-center">
                                <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    Nenhum filme avaliado ainda
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isOwnProfile
                                        ? "Comece avaliando alguns filmes para ver suas estatísticas aqui!"
                                        : `${username} ainda não avaliou nenhum filme.`
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Recommendations */}
                    {recentRecommendations.length > 0 && (
                        <Card className="cinema-card border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Film className="w-5 h-5 text-primary" />
                                    Recomendações Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {recentRecommendations.slice(0, 10).map((movie, index) => (
                                        <div key={`${movie.title}-${index}`} className="flex-none relative">
                                            <MoviePoster movie={movie} userId={userId} />
                                            <div className="absolute top-2 right-2">
                                                {movie.feedback === 'like' && (
                                                    <div className="bg-green-500 p-1.5 rounded-full shadow-lg">
                                                        <ThumbsUp className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                {movie.feedback === 'dislike' && (
                                                    <div className="bg-red-500 p-1.5 rounded-full shadow-lg">
                                                        <ThumbsDown className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                                {movie.feedback === 'superlike' && (
                                                    <div className="bg-purple-500 p-1.5 rounded-full shadow-lg">
                                                        <Star className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {recentRecommendations.length === 0 && (
                        <Card className="cinema-card border-primary/20">
                            <CardContent className="p-8 text-center">
                                <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                    Nenhuma recomendação recebida ainda
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {isOwnProfile
                                        ? "Comece a receber recomendações de filmes para ver suas estatísticas aqui!"
                                        : `${username} ainda não recebeu nenhuma recomendação.`
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Dialog para atualizar foto de perfil */}
            {dialogUpdatePicture && isOwnProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setDialogUpdatePicture(false)}
                    />
                    <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto cinema-card">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Atualizar Foto de Perfil</h2>
                                <button
                                    onClick={() => setDialogUpdatePicture(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <UpdateProfilePicture
                                onImageChange={(base64) => {
                                    if (userInfo) {
                                        setUserInfo({ ...userInfo, profilePicture: base64 });
                                    }
                                    setDialogUpdatePicture(false);
                                }}
                                previewImage={userInfo?.profilePicture}
                                autoUpdate={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}