import useAxios from "./use-axios";

const useMoviesAPI = () => {
    const { api } = useAxios();

    const getGenres = async () => {
        const response = await api.get('/genres');
        return response.data;
    }

    const getDirectors = async () => {
        const response = await api.get('/directors');
        return response.data;
    }

    const getActors = async () => {
        const response = await api.get('/actors');
        return response.data;
    }

    return {
        getGenres,
        getDirectors,
        getActors
    }
}
export default useMoviesAPI;
