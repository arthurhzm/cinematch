export const ROUTES = {
    home: '/',
    login: '/login',
    register: '/register',
    addPreferences: '/add-preferences',
    search: '/search',
    chat: '/chat',
    profile: (username: string) => `/profile/${username}`,
}
