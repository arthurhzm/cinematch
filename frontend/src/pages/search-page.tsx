import AppLayout from "@/components/app-layout";
import InputSearch from "@/components/input-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MovieDetailedInfo from "@/components/ui/movie-detailed-info";
import { useToast } from "@/contexts/ToastContext";
import useAI from "@/hooks/use-ai";
import useUser from "@/hooks/use-user";
import type { AIRecommendations, UserProfilePreview } from "@/utils/types";
import type { AxiosResponse } from "axios";
import { Clapperboard, User, UserIcon, Search, Film } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/routes";

export default function SearchPage() {
    const { showError } = useToast();
    const { searchMovie } = useAI();
    const { getUsersByUsername } = useUser();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchType, setSearchType] = useState<"movies" | "people">("movies");
    const [searchResults, setSearchResults] = useState<AIRecommendations[] | UserProfilePreview[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<AIRecommendations | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearchTypeChange = (type: "movies" | "people") => {
        setSearchType(type);
        setSearchResults([]);
        setSelectedMovie(null);
        setSearchQuery("");
        setHasSearched(false);
    }

    const handleSearch = async () => {
        if (searchQuery.trim() === "" || searchQuery.length < 3) {
            showError(`Informe pelo menos 3 caracteres para pesquisar.`);
            return;
        }

        setIsLoading(true);
        setSearchResults([]);
        setHasSearched(true);

        try {
            const results = searchType === "movies"
                ? await searchMovie(searchQuery)
                : await getUsersByUsername(searchQuery);

            setSearchResults(searchType === "movies" ? results : (results as AxiosResponse).data || results);
        } finally {
            setIsLoading(false);
        }
    }

    const renderLoadingSkeletons = () => {
        return (
            <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Carregando resultados...</h2>
                <div className="space-y-4">
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className="cinema-card p-4">
                            <div className="flex gap-4">
                                <Skeleton className="w-24 h-36 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-6 w-3/4" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-20" />
                                        <Skeleton className="h-5 w-14" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderNoResults = () => {
        if (!hasSearched || isLoading) return null;

        return (
            <div className="mt-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    {searchType === "movies" ? (
                        <Film className="w-8 h-8 text-muted-foreground" />
                    ) : (
                        <UserIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">
                        Nenhum {searchType === "movies" ? "filme" : "usuário"} encontrado
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                        {searchType === "movies"
                            ? `Não encontramos filmes relacionados a "${searchQuery}". Tente usar termos diferentes ou verificar a ortografia.`
                            : `Não encontramos usuários com o nome "${searchQuery}". Verifique se o nome está correto.`
                        }
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => {
                        setSearchQuery("");
                        setHasSearched(false);
                        setSearchResults([]);
                    }}
                    className="mt-4"
                >
                    <Search className="w-4 h-4 mr-2" />
                    Nova pesquisa
                </Button>
            </div>
        );
    };

    return (
        <AppLayout>
            <InputSearch
                label="Procurar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                onClick={handleSearch}
                disabled={isLoading}
            />
            <div className="w-full mt-2 flex gap-2 justify-center">
                <Button
                    className={searchType === "movies" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                    variant={"outline"}
                    onClick={() => handleSearchTypeChange("movies")}
                    disabled={isLoading}
                >
                    <Clapperboard size={20} className="mr-1" /> Filmes
                </Button>
                <Button
                    className={searchType === "people" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                    variant={"outline"}
                    onClick={() => handleSearchTypeChange("people")}
                    disabled={isLoading}
                >
                    <User size={20} className="mr-1" /> Pessoas
                </Button>
            </div>

            {/* Loading State */}
            {isLoading && renderLoadingSkeletons()}

            {/* Results */}
            {!isLoading && searchResults.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-2">
                        Resultados da Pesquisa ({searchResults.length})
                    </h2>
                    <ul className="space-y-2">
                        {searchType === "movies" ? (
                            (searchResults as AIRecommendations[]).map((result, index) => (
                                <li key={index} className="mb-4" onClick={() => setSelectedMovie(result)}>
                                    <div className="cinema-card p-4 hover:border-primary/40 transition-all cursor-pointer">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={result.poster_url || "/placeholder-poster.png"}
                                                    alt={`Poster de ${result.title}`}
                                                    className="w-24 h-36 object-cover rounded-md"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-foreground mb-1">
                                                    {result.title} ({result.year})
                                                </h3>
                                                <div className="flex flex-wrap gap-1">
                                                    {result.genres?.map((genre, genreIndex) => (
                                                        <Badge
                                                            key={genreIndex}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {genre}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="space-y-2">
                                {(searchResults as UserProfilePreview[]).map((user, index) => (
                                    <div
                                        key={index}
                                        className="cinema-card p-4 hover:border-primary/40 transition-all cursor-pointer"
                                        onClick={() => navigate(ROUTES.profile(user.username), { state: { userId: user.userId } })}
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar className="w-12 h-12">
                                                {user.profilePicture ? (
                                                    <AvatarImage
                                                        src={user.profilePicture}
                                                        alt={`Avatar de ${user.username}`}
                                                    />
                                                ) : (
                                                    <AvatarFallback>
                                                        <UserIcon />
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold text-lg text-foreground">{user.username}</h3>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ul>
                </div>
            )}

            {/* No Results */}
            {!isLoading && searchResults.length === 0 && renderNoResults()}

            {selectedMovie && (
                <MovieDetailedInfo
                    movie={selectedMovie}
                    open={!!selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </AppLayout>
    )
}