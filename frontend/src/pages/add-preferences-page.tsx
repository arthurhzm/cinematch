import AppLayout from "@/components/app-layout";
import useMoviesAPI from "@/hooks/use-movies-api";
import { useEffect, useState } from "react";

export default function AddPreferencesPage() {

    const { getGenres, getDirectors, getActors } = useMoviesAPI();

    const [genres, setGenres] = useState([]);
    const [directors, setDirectors] = useState([]);
    const [actors, setActors] = useState([]);

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
    }, [getGenres, getDirectors, getActors]);

    return (
        <AppLayout>
            <h1>Adicionar Preferências</h1>
        </AppLayout>
    )
}