import { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import PageLoadingSkeleton from './components/page-loading-skeleton.tsx'
import AppRoute from './components/Route.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import './index.css'
import ForgotPasswordPage from './pages/forgot-password-page.tsx'
import LoginPage from './pages/login-page.tsx'
import RegisterPage from './pages/register-page.tsx'
import * as LazyComponents from './utils/lazy-components.ts'
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

            <Route path={ROUTES.home} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.HomePage />
              </Suspense>
            }
            />

            <Route path={ROUTES.addPreferences} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.AddPreferencesPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.profile(':username')} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.ProfilePage />
              </Suspense>
            }
            />

            <Route path={ROUTES.followers(':username')} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.FollowersPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.following(':username')} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.FollowersPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.search} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.SearchPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.chat} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.ChatPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.discovery} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.DiscoveryPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.recommendations} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.RecommendationsPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.roulette} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.RoulettePage />
              </Suspense>
            }
            />

            <Route path={ROUTES.settings} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.SettingsPage />
              </Suspense>
            }
            />

            <Route path={ROUTES.movie(':movieTitle')} element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.MoviePage />
              </Suspense>
            }
            />

            {/* Redirect root to home */}
            <Route index element={
              <Suspense fallback={<PageLoadingSkeleton />}>
                <LazyComponents.HomePage />
              </Suspense>
            }
            />

          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
)
