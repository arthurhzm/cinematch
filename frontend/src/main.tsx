import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppRoute from './components/Route.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import './index.css'
import AddPreferencesPage from './pages/add-preferences-page.tsx'
import HomePage from './pages/home-page.tsx'
import LoginPage from './pages/login-page.tsx'
import ProfilePage from './pages/profile-page.tsx'
import RegisterPage from './pages/register-page.tsx'
import { ROUTES } from './utils/routes.ts'
import SearchPage from './pages/search-page.tsx'
import ChatPage from './pages/chat-page.tsx'

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.register} element={<RegisterPage />} />
          <Route element={<AppRoute isPrivate={false} />} >
            <Route path={ROUTES.login} element={<LoginPage />} />
          </Route>
            <Route element={<AppRoute isPrivate={true} />} >
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.addPreferences} element={<AddPreferencesPage />} />
            <Route path={ROUTES.profile(':username')} element={<ProfilePage />} />
            <Route path={ROUTES.search} element={<SearchPage />} />
            <Route path={ROUTES.chat} element={<ChatPage />} />
            </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
)
