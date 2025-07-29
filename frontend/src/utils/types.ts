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
    original_title?: string;
    year: number;
    genres: string[];
    overview: string;
    why_recommend?: string;
    poster_url: string | null;
    streaming_services: string[];
    confidence_score?: number;
    perfect_match_reasons?: string[];
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
    feedback: 'like' | 'dislike' | 'superlike';
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

export type FriendsMovieFeedback = {
    userId: number;
    profilePicture: string | null;
    username: string;
    movieTitle: string;
    rating: number;
    review: string;
    title: string;
    year: number;
    genres: string[];
    overview: string;
    poster_url: string | null;
    streaming_services: string[];
}

export type TMDBMovieDetails = {
    adult: boolean;
    backdrop_path: string | null;
    belongs_to_collection?: object | null;
    budget: number;
    genres: { id: number; name: string }[];
    homepage?: string | null;
    id: number;
    imdb_id?: string | null;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
    production_companies?: { id: number; name: string }[];
    production_countries?: { iso_3166_1: string; name: string }[];
    release_date: string;
    revenue?: number;
    runtime: number | null;
    spoken_languages?: { iso_639_1: string; name: string }[];
    status?: string;
    tagline?: string | null;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    backdropUrl?: string | null;
    posterUrl?: string | null;
}