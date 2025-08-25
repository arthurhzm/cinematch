import { lazy } from 'react';

export const HomePage = lazy(() => import('@/pages/home-page'));
export const AddPreferencesPage = lazy(() => import('@/pages/add-preferences-page'));
export const ProfilePage = lazy(() => import('@/pages/profile-page'));
export const FollowersPage = lazy(() => import('@/pages/followers-page'));
export const SearchPage = lazy(() => import('@/pages/search-page'));
export const ChatPage = lazy(() => import('@/pages/chat-page'));
export const DiscoveryPage = lazy(() => import('@/pages/discovery-page'));
export const RecommendationsPage = lazy(() => import('@/pages/recommendations-page'));
export const RoulettePage = lazy(() => import('@/pages/roulette-page'));
export const SettingsPage = lazy(() => import('@/pages/settings-page'));
export const MoviePage = lazy(() => import('@/pages/movie-page'));