export class UpdateMovieFeedbackDTO {
    rating: number;
    review: string;

    constructor(rating: number, review: string) {
        this.rating = rating;
        this.review = review;
    }
}