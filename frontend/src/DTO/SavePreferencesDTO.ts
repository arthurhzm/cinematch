export class SavePreferencesDTO {
    genres: string[];
    directors: string[];
    actors: string[];
    minYear: number;
    minDuration: number;
    acceptAdultContent: boolean;

    constructor(
        genres: string[],
        directors: string[],
        actors: string[],
        minYear: number,
        minDuration: number,
        acceptAdultContent: boolean
    ) {
        this.genres = genres;
        this.directors = directors;
        this.actors = actors;
        this.minYear = minYear;
        this.minDuration = minDuration;
        this.acceptAdultContent = acceptAdultContent;
    }

}