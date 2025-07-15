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