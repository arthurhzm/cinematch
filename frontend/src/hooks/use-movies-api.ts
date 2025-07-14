import useAxios from "./use-axios";

const useMoviesAPI = () => {
    const { api } = useAxios();

    const getGenres = async () => {
        const response = await api.get('/genres');
        return response.data.genres;
    }

    const getDirectors = async () => {
        const response = await api.get('/directors');
        return response.data.directors;
    }

    const getActors = async () => {
        const response = await api.get('/actors');
        return response.data.actors;
    }

    return {
        getGenres,
        getDirectors,
        getActors
    }
}
export default useMoviesAPI;
