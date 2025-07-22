export class UpdateUserDTO {
    username?: string;
    password?: string;
    email?: string;
    birthdate?: string;
    gender?: string;
    profilePicture?: string;

    constructor(username?: string, password?: string, email?: string, birthdate?: string, gender?: string, profilePicture?: string) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.birthdate = birthdate;
        this.gender = gender;
        this.profilePicture = profilePicture;
    }
}