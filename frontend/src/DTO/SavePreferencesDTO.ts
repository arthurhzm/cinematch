export class SavePreferencesDTO {
    genres: string[];
    directors: string[];
    actors: string[];
    minReleaseYear: number;
    maxDuration: number;
    acceptAdultContent: boolean;

    constructor(
        genres: string[],
        directors: string[],
        actors: string[],
        minReleaseYear: number,
        maxDuration: number,
        acceptAdultContent: boolean
    ) {
        this.genres = genres;
        this.directors = directors;
        this.actors = actors;
        this.minReleaseYear = minReleaseYear;
        this.maxDuration = maxDuration;
        this.acceptAdultContent = acceptAdultContent;
    }

}