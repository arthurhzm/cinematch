import AppLayout from "@/components/app-layout";
import InputSearch from "@/components/input-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MovieDetailedInfo from "@/components/ui/movie-detailed-info";
import { useToast } from "@/contexts/ToastContext";
import useAI from "@/hooks/use-ai";
import useUser from "@/hooks/use-user";
import type { AIRecommendations, UserProfilePreview } from "@/utils/types";
import type { AxiosResponse } from "axios";
import { Clapperboard, User, UserIcon } from "lucide-react";
import { useState } from "react";
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

    const handleSearchTypeChange = (type: "movies" | "people") => {
        setSearchType(type);
        setSearchResults([]);
        setSelectedMovie(null);
        setSearchQuery("");
    }

    const handleSearch = async () => {
        setSearchResults([]);

        if (searchQuery.trim() === "" || searchQuery.length < 3) {
            showError(`Informe pelo menos 3 caracteres para pesquisar.`);
            return;
        }

        try {
            const results = searchType === "movies"
                ? await searchMovie(searchQuery)
                : await getUsersByUsername(searchQuery);

            setSearchResults(searchType === "movies" ? results : (results as AxiosResponse).data || results);
        } catch (error: any) {
            showError(`Erro ao buscar: ${error.message}`);
        }

    }

    return (
        <AppLayout>
            <InputSearch
                label="Procurar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                onClick={handleSearch}
            />
            <div className="w-full mt-2 flex gap-2 justify-center">
                <Button
                    className={searchType === "movies" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                    variant={"outline"} onClick={() => handleSearchTypeChange("movies")}>
                    <Clapperboard size={20} className="mr-1" /> Filmes
                </Button>
                <Button
                    className={searchType === "people" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}
                    variant={"outline"} onClick={() => handleSearchTypeChange("people")}>
                    <User size={20} className="mr-1" /> Pessoas
                </Button>
            </div>
            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h2 className="text-lg font-semibold mb-2">Resultados da Pesquisa</h2>
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
                            <div className="cinema-card p-4 hover:border-primary/40 transition-all cursor-pointer">
                                {(searchResults as UserProfilePreview[]).map((user, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-4"
                                        onClick={() => navigate(`/profile/${user.username}`, { state: { userId: user.userId } })}
                                    >
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
                                ))}
                            </div>
                        )}
                    </ul>
                </div>
            )}

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