export class UserDTO {
    id: number;
    username: string;
    birthDate?: Date;
    gender?: string;
    profilePicture?: string;
    email?: string;
    password?: string;
    apiKey?: string;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        id: number,
        username: string,
        createdAt: Date,
        updatedAt: Date,
        birthDate?: Date,
        gender?: string,
        profilePicture?: string,
        email?: string,
        password?: string,
        apiKey?: string,
        lastLogin?: Date
    ) {
        this.id = id;
        this.username = username;
        this.birthDate = birthDate;
        this.gender = gender;
        this.profilePicture = profilePicture;
        this.email = email;
        this.password = password;
        this.apiKey = apiKey;
        this.lastLogin = lastLogin;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}