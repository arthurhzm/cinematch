import AppLayout from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MovieDetailedInfo from "@/components/ui/movie-detailed-info";
import { Skeleton } from "@/components/ui/skeleton";
import UserPreview from "@/components/ui/user-profile-preview";
import { useToast } from "@/contexts/ToastContext";
import useAI from "@/hooks/use-ai";
import useUser from "@/hooks/use-user";
import type { AIRecommendations, UserProfilePreview } from "@/utils/types";
import type { AxiosResponse } from "axios";
import { Clapperboard, Film, Search, User, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('query');

        if (query && query.trim() !== '') {
            setSearchQuery(query);
            setSearchType("movies");
            performSearch(query);
        }
    }, []);

    const performSearch = async (queryToSearch?: string) => {
        const searchTerm = queryToSearch || searchQuery;

        if (searchTerm.trim() === "" || searchTerm.length < 3) {
            showError(`Informe pelo menos 3 caracteres para pesquisar.`);
            return;
        }

        setIsLoading(true);
        setSearchResults([]);
        setHasSearched(true);

        try {
            const results = searchType === "movies"
                ? await searchMovie(searchTerm)
                : await getUsersByUsername(searchTerm);

            setSearchResults(searchType === "movies" ? results : (results as AxiosResponse).data || results);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        await performSearch();
    };

    const handleSearchTypeChange = (type: "movies" | "people") => {
        // Só limpar se realmente mudou o tipo
        if (type !== searchType) {
            setSearchType(type);
            setSearchResults([]);
            setSelectedMovie(null);
            setSearchQuery("");
            setHasSearched(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

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
            <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar filmes ou pessoas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="w-full pl-4 pr-20 py-4 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 transition-all duration-200 text-base"
                    />
                    <Button
                        onClick={handleSearch}
                        disabled={isLoading || searchQuery.length < 3}
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50"
                        size="icon"
                    >
                        <Search className="w-5 h-5 text-primary-foreground" />
                    </Button>
                </div>

                {/* Search Type Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button
                        className={`flex-1 h-12 ${searchType === "movies" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                        variant="outline"
                        onClick={() => handleSearchTypeChange("movies")}
                        disabled={isLoading}
                    >
                        <Clapperboard size={20} className="mr-2" />
                        Filmes
                    </Button>
                    <Button
                        className={`flex-1 h-12 ${searchType === "people" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                        variant="outline"
                        onClick={() => handleSearchTypeChange("people")}
                        disabled={isLoading}
                    >
                        <User size={20} className="mr-2" />
                        Pessoas
                    </Button>
                </div>
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
                                <li key={index} className="mb-4" onClick={() => navigate(`/movie/${result.original_title}`)}>
                                    <div className="cinema-card p-4 hover:border-primary/40 transition-all cursor-pointer">
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                {!!result.poster_url ? (
                                                    <img
                                                        src={result.poster_url || "/placeholder-poster.png"}
                                                        alt={`Poster de ${result.original_title}`}
                                                        className="w-24 h-36 object-cover rounded-md"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-36 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center text-gray-300 border border-gray-700">
                                                        <Film size={48} className="mb-4 text-gray-400" />
                                                        <div className="text-center px-4">
                                                            <p className="text-sm font-medium text-gray-300 mb-1">{result.title}</p>
                                                            <p className="text-xs text-gray-500">({result.year})</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg text-foreground mb-1">
                                                    {result.original_title} ({result.year})
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
                                    <UserPreview
                                        key={index}
                                        user={user}
                                    />
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