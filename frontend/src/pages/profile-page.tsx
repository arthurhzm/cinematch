import AppLayout from "@/components/app-layout";
import FollowUnfollowButton from "@/components/follow-unfollow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MoviePoster from "@/components/ui/movie-poster";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useFeedback from "@/hooks/use-feedback";
import useTMDB from "@/hooks/use-tmdb";
import useUser from "@/hooks/use-user";
import { getInitials } from "@/lib/utils";
import { ROUTES } from "@/utils/routes";
import type { UserMovieFeedback, UserProfile, UserProfilePreview } from "@/utils/types";
import { Calendar, Clock, Film, Star, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function ProfilePage() {
    const { username } = useParams();
    const { getUserFeedback } = useFeedback();
    const { getMovieByTitle, getGenresById } = useTMDB();
    const { getUserById, getUserFollowers, getUserFollowing } = useUser();
    const { showError } = useToast();
    const { userData } = useAuth();
    const location = useLocation();
    const { userId } = location.state || {};
    const navigate = useNavigate();

    const [recentMovies, setRecentMovies] = useState<any[]>([]);
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({
        totalMovies: 0,
        averageRating: 0,
        favoriteGenres: [] as string[]
    });
    const [followers, setFollowers] = useState<UserProfilePreview[] | []>([]);
    const [following, setFollowing] = useState<UserProfilePreview[] | []>([]);

    const isOwnProfile = userData?.username === username;

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                const followersResponse = await getUserFollowers(userId);
                setFollowers(followersResponse.data);
                const followingResponse = await getUserFollowing(userId);
                setFollowing(followingResponse.data);

                const userResponse = await getUserById(userId);
                setUserInfo(userResponse.data);

                const feedback = await getUserFeedback(userId);
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
                const validMovies = movies.filter(movie => movie !== null);
                setRecentMovies(validMovies);

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

            } catch (error) {
                showError("Erro ao carregar informações do perfil.");
                console.error("Error fetching profile data:", error);
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
            <div className="space-y-6">
                {/* Profile Header */}
                <Card className="cinema-card border-primary/20">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Avatar */}
                            <Avatar className="w-24 h-24 border-2 border-primary/30">
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
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Badge className="w-4 h-4 text-primary" />
                                Gêneros Favoritos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1">
                                {stats.favoriteGenres.slice(0, 2).map((genre, index) => (
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
            </div>
        </AppLayout>
    );
}