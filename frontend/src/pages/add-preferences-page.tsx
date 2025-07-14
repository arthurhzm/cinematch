import AppLayout from "@/components/app-layout";
import SearchableInput from "@/components/searchable-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import Title from "@/components/ui/title";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { SavePreferencesDTO } from "@/DTO/SavePreferencesDTO";
import useMoviesAPI from "@/hooks/use-movies-api";
import usePreferences from "@/hooks/use-preferences";
import { ROUTES } from "@/utils/routes";
import { type Actors, type Directors, type Genres } from "@/utils/types";
import { Check, CloudUpload } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddPreferencesPage() {

    const { getGenres, getDirectors, getActors } = useMoviesAPI();
    const { saveUserPreferences } = usePreferences();
    const { userData } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const [genres, setGenres] = useState<Genres[]>([]);
    const [directors, setDirectors] = useState<Directors[]>([]);
    const [actors, setActors] = useState<Actors[]>([]);

    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedDirectors, setSelectedDirectors] = useState<Directors[]>([]);
    const [selectedActors, setSelectedActors] = useState<Actors[]>([]);
    const [minYear, setMinYear] = useState<number>(2000);
    const [minDuration, setMinDuration] = useState<number>(90);
    const [acceptAdultContent, setAcceptAdultContent] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            const genresData = await getGenres();
            const directorsData = await getDirectors();
            const actorsData = await getActors();
            setGenres(genresData);
            setDirectors(directorsData);
            setActors(actorsData);
        };

        fetchData();
    }, []);

    const handleSavePreferences = async () => {
        if (!userData) return;

        if (selectedGenres.length === 0) {
            showError("Por favor, selecione pelo menos um gênero.");
            return;
        }

        const preferences = new SavePreferencesDTO(
            selectedGenres,
            selectedDirectors.map(d => d.name),
            selectedActors.map(a => a.name),
            minYear,
            minDuration,
            acceptAdultContent
        );

        try {
            await saveUserPreferences(userData.id, preferences);
            showSuccess("Preferências salvas com sucesso!");
            navigate(ROUTES.home);
        } catch (error) {
            showError("Erro ao salvar preferências. Tente novamente mais tarde.");
            console.error("Error saving preferences:", error);
        }
    }

    return (
        <AppLayout>
            {!!genres.length && (
                <div>
                    <Title>Gêneros</Title>
                    {genres.map((genre) => (
                        <Badge
                            className="m-1 p-2"
                            key={genre.id}
                            variant={selectedGenres.includes(genre.name) ? "default" : "secondary"}

                            onClick={() => {
                                if (selectedGenres.includes(genre.name)) {
                                    setSelectedGenres(selectedGenres.filter(g => g !== genre.name));
                                } else {
                                    setSelectedGenres([...selectedGenres, genre.name]);
                                }
                            }}>
                            {selectedGenres.includes(genre.name) && <Check />}{genre.name}
                        </Badge>
                    ))}
                </div>
            )}
            <hr className="mt-3 mb-3" />

            {!!directors.length && (
                <>
                    <div>
                        <Title>Diretores</Title>
                        <SearchableInput
                            label="Digite o nome do diretor"
                            search={directors}
                            selectedItems={selectedDirectors}
                            onSelectionChange={setSelectedDirectors}
                        />
                    </div>
                    <div>
                        {selectedDirectors.map((director) => (
                            <Badge
                                className="m-1 p-2"
                                key={director.id}
                                onClick={() => {
                                    console.log(selectedDirectors);
                                    setSelectedDirectors(selectedDirectors.filter(d => d !== director))
                                }}
                            >
                                <Check />{director.name}
                            </Badge>
                        ))}
                    </div>
                </>
            )}
            <hr className="mt-5 mb-3" />

            {!!actors.length && (
                <>
                    <div>
                        <Title>Atores</Title>
                        <SearchableInput
                            label="Digite o nome do ator"
                            search={actors}
                            selectedItems={selectedActors}
                            onSelectionChange={setSelectedActors}
                        />
                    </div>
                    <div>
                        {selectedActors.map((actor) => (
                            <Badge
                                className="m-1 p-2"
                                key={actor.id}
                                onClick={() => {
                                    console.log(selectedActors);
                                    setSelectedActors(selectedActors.filter(d => d !== actor))
                                }}
                            >
                                <Check />{actor.name}
                            </Badge>
                        ))}
                    </div>
                </>
            )}

            <hr className="mt-5 mb-3" />

            <Title>Ano mínimo de Lançamento</Title>
            <div className="relative">
                <Slider
                    value={[minYear]}
                    onValueChange={(value) => setMinYear(value[0])}
                    min={1895}
                    max={new Date().getFullYear()}
                />
                <div
                    className="absolute -bottom-9 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm"
                    style={{
                        left: `${Math.min(Math.max(((minYear - 1895) / (new Date().getFullYear() - 1895)) * 100, 5), 95)}%`
                    }}
                >
                    {minYear}
                </div>
            </div>

            <hr className="mt-5 mb-3" />

            <Title>Duração mínima</Title>
            <div className="relative">
                <Slider
                    value={[minDuration]}
                    onValueChange={(value) => setMinDuration(value[0])}
                    min={0}
                    max={300}
                />
                <div
                    className="absolute -bottom-9 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm"
                    style={{
                        left: `${Math.min(Math.max(((minDuration - 0) / (300 - 0)) * 100, 5), 95)}%`
                    }}
                >
                    {minDuration} min
                </div>
            </div>

            <hr className="mt-5 mb-3" />

            <Title>Conteúdo Adulto</Title>
            <div className="flex items-center gap-1">
                <Switch
                    checked={acceptAdultContent}
                    onCheckedChange={setAcceptAdultContent}
                    className={!acceptAdultContent ? "data-[state=unchecked]:bg-[#504f4e]" : ""}
                />
                <small className="text-sm font-semibold">Sim</small>
            </div>

            <hr className="mt-5 mb-3" />

            <Button
                onClick={handleSavePreferences}
                className="w-full"
            >
                <CloudUpload /> Salvar Preferências
            </Button>
        </AppLayout>
    )
}