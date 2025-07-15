export type Genres = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export type Directors = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export type Actors = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export type UserPreferences = {
    favoriteGenres: string[];
    favoriteDirectors: string[];
    favoriteActors: string[];
    minReleaseYear: number;
    maxDuration: number;
    acceptAdultContent: boolean;
}

export type AIRecommendations = {
    title: string;
    year: number;
    genres: string[];
    overview: string;
    why_recommend: string;
    poster_url: string | null;
    streaming_services: string[];
}

export type UserMovieFeedback = {
    id: number;
    rating: number;
    review: string;
}
