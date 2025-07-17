import type { TMDBMovie } from "@/utils/types";

type TMDBGetMovieResponse = {
    page: number;
    results: TMDBMovie[];
    total_pages: number;
    total_results: number;
}

const useTMDB = () => {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    const baseUrl = 'https://api.themoviedb.org/3';

    const getMovieByTitle = async (title: string) => {
        const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&query=${title}`);
        return await response.json() as TMDBGetMovieResponse;
    }

    const getGenresById = async (genreIds: number[]) => {
        const responses = await Promise.all(
            genreIds.map(id => fetch(`${baseUrl}/genre/${id}?api_key=${apiKey}`))
        );
        const data = await Promise.all(responses.map(res => res.json()));
        return data.map((genre: { id: number; name: string }) => ({
            id: genre.id,
            name: genre.name
        }));
    }

    return { getMovieByTitle, getGenresById };
}

export default useTMDB;