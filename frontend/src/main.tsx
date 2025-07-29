import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppRoute from './components/Route.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import './index.css'
import AddPreferencesPage from './pages/add-preferences-page.tsx'
import ChatPage from './pages/chat-page.tsx'
import DiscoveryPage from './pages/discovery-page.tsx'
import FollowersPage from './pages/followers-page.tsx'
import ForgotPasswordPage from './pages/forgot-password-page.tsx'
import HomePage from './pages/home-page.tsx'
import LoginPage from './pages/login-page.tsx'
import MoviePage from './pages/movie-page.tsx'
import ProfilePage from './pages/profile-page.tsx'
import RecommendationsPage from './pages/recommendations-page.tsx'
import RegisterPage from './pages/register-page.tsx'
import RoulettePage from './pages/roulette-page.tsx'
import SearchPage from './pages/search-page.tsx'
import SettingsPage from './pages/settings-page.tsx'
import { ROUTES } from './utils/routes.ts'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route element={<AppRoute isPrivate={false} />} >
            <Route path={ROUTES.login} element={<LoginPage />} />
            <Route path={ROUTES.register} element={<RegisterPage />} />
            <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
          </Route>
          
          {/* Rotas protegidas */}
          <Route element={<AppRoute isPrivate={true} />} >
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.addPreferences} element={<AddPreferencesPage />} />
            <Route path={ROUTES.profile(':username')} element={<ProfilePage />} />
            <Route path={ROUTES.followers(':username')} element={<FollowersPage />} />
            <Route path={ROUTES.following(':username')} element={<FollowersPage />} />
            <Route path={ROUTES.search} element={<SearchPage />} />
            <Route path={ROUTES.chat} element={<ChatPage />} />
            <Route path={ROUTES.discovery} element={<DiscoveryPage />} />
            <Route path={ROUTES.recommendations} element={<RecommendationsPage />} />
            <Route path={ROUTES.roulette} element={<RoulettePage />} />
            <Route path={ROUTES.settings} element={<SettingsPage />} />
            <Route path={ROUTES.movie(':movieTitle')} element={<MoviePage />} />
            {/* Redirect root to home */}
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
)
