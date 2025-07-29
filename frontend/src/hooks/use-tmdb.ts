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
    const options = {
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
        }
    }

    const getMovieByTitle = async (title: string) => {
        const response = await fetch(`${baseUrl}/search/movie?query=${title}`, options);
        return await response.json() as TMDBGetMovieResponse;
    }

    const getGenresById = async (genreIds: number[]) => {
        const responses = await Promise.all(genreIds.map(id => fetch(`${baseUrl}/genre/${id}`, options)));
        const data = await Promise.all(responses.map(res => res.json()));
        return data.map((genre: { id: number; name: string }) => ({
            id: genre.id,
            name: genre.name
        }));
    }

    const getMovieDetails = async (movieId: number) => {
        const response = await fetch(
            `${baseUrl}/movie/${movieId}?append_to_response=credits,videos,images,recommendations,similar`,
            options
        );
        return await response.json();
    }

    return { getMovieByTitle, getGenresById, getMovieDetails };
}

export default useTMDB;