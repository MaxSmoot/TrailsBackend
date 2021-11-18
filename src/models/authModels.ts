export interface RegisterParams {
    username: string;
    password: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
}

export interface LoginParams {
    email: string;
    password: string;
    rememberMe: boolean;
}

export interface RefreshTokensObject {
    userID: string,
    secondaryRefreshToken: string
}