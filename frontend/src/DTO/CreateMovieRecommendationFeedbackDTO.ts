export class CreateMovieRecommendationFeedbackDTO {
    userId: number;
    movieTitle: string;
    feedback: "like" | "dislike" | "superlike";

    constructor(
        userId: number,
        movieTitle: string,
        feedback: "like" | "dislike" | "superlike"
    ) {
        this.userId = userId;
        this.movieTitle = movieTitle;
        this.feedback = feedback;
    }
}