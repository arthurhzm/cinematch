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
    why_recommend?: string;
    poster_url: string | null;
    streaming_services: string[];
}

export type UserProfilePreview = {
    userId: number;
    username: string;
    profilePicture: string | null;
}

export type UserProfile = {
    birthdate: string | null;
    gender: string | null;
    profilePicture: string | null;
    lastLogin: string | null;
    createdAt: string | null;
}

export type UserMovieFeedback = {
    id: number;
    movieTitle: string;
    rating: number;
    review: string;
}

export type UserRecommendationsFeedback = {
    movieTitle: string;
    feedback: string;
    detailedFeedback: string | null;
}

export type TMDBMovie = {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

export type Message = {
    text: string;
    sender: "user" | "ai";
}
