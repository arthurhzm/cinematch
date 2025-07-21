export class FollowUnfollowUserDTO {
    userId: number;
    followerId: number;

    constructor(userId: number, followerId: number) {
        this.userId = userId;
        this.followerId = followerId;
    }
}