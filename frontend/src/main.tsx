import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx'
import './index.css'
import AppRoute from './components/Route.tsx'
import LoginPage from './pages/login-page.tsx'
import RegisterPage from './pages/register-page.tsx'
import HomePage from './pages/home-page.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/register' element={<RegisterPage />} />
            <Route element={<AppRoute isPrivate={false} />} >
              <Route path='/login' element={<LoginPage />} />
            </Route>
            <Route element={<AppRoute isPrivate={true} />} >
              <Route path='/' element={<HomePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
