export class CreateMovieFeedbackDTO {
    movieTitle: string;
    rating: number;
    review: string;

    constructor(movieTitle: string, rating: number, review: string) {
        this.movieTitle = movieTitle;
        this.rating = rating;
        this.review = review;
    }
}


