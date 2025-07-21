export const ROUTES = {
    home: '/',
    login: '/login',
    register: '/register',
    addPreferences: '/add-preferences',
    search: '/search',
    chat: '/chat',
    profile: (username: string) => `/${username}`,
    followers: (username: string) => `/${username}/followers`,
    following: (username: string) => `/${username}/following`,
}
