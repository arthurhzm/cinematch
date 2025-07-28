import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import useUser from '@/hooks/use-user';
import { getInitials } from '@/lib/utils';
import { ROUTES } from '@/utils/routes';
import { DoorOpen, Film, Heart, Home, Lightbulb, MessageSquare, Search, Settings, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import PWAInstallPrompt from './ui/pwa-installer-prompt';
import Title from './ui/title';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {

  const { logoutUser } = useUser();
  const { userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === ROUTES.home && location.pathname === '/') return true;
    if (path === ROUTES.home) return false;
    return location.pathname.includes(path);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
    } catch (error) {
      // Se falhar, limpar localmente mesmo assim
      logout();
    } finally {
      navigate('/login');
    }
  };

  // Loading state enquanto userData não está disponível
  if (!userData) {
    return (
      <div className="min-h-screen cinema-gradient flex items-center justify-center overflow-x-hidden">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo animado */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <Film className="w-10 h-10 text-primary animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            {/* Círculos de loading */}
            <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-2 border-primary/50 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          </div>

          {/* Texto */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CineMatch
            </h2>
            <p className="text-muted-foreground animate-pulse">
              Carregando sua experiência cinematográfica...
            </p>
          </div>

          {/* Dots loading */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-gradient flex overflow-x-hidden">
      {/* Sidebar Desktop - hidden on mobile */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:top-0 lg:left-0 cinema-card border-r border-primary/20 backdrop-blur-lg overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Logo - fixed at top */}
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center gap-2 mb-8 cursor-pointer" onClick={() => navigate(ROUTES.home)}>
              <div className="p-2 rounded-full bg-primary/20">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary">CineMatch</span>
            </div>
          </div>

          {/* Navigation - scrollable */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <nav className="space-y-2">
              <Button
                variant={isActive(ROUTES.home) ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate(ROUTES.home)}
              >
                <Home className="w-5 h-5" />
                Início
              </Button>

              <Button
                variant={isActive(ROUTES.search) ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate(ROUTES.search)}
              >
                <Search className="w-5 h-5" />
                Buscar
              </Button>

              <Button
                variant={isActive(ROUTES.discovery) ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate(ROUTES.discovery)}
              >
                <Lightbulb className="w-5 h-5" />
                Descobrir
              </Button>
              <Button
                variant={isActive(ROUTES.addPreferences) ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate(ROUTES.addPreferences)}
              >
                <Heart className="w-5 h-5" />
                Minhas Preferências
              </Button>

              <Button
                variant={isActive(ROUTES.chat) ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate(ROUTES.chat)}
              >
                <MessageSquare className="w-5 h-5" />
                Chat IA
              </Button>

              <div className="border-t border-border my-4"></div>

              <Button
                variant={isActive(ROUTES.settings) ? "default" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => navigate(ROUTES.settings)}
              >
                <Settings className="w-5 h-5" />
                Configurações
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <DoorOpen className="w-5 h-5" />
                Sair
              </Button>
            </nav>
          </div>

          {/* User section - fixed at bottom */}
          <div className="flex-shrink-0 p-6 border-t border-border cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => navigate(ROUTES.profile(userData.username || ''), { state: { userId: userData.id } })}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-10 h-10 border-2 border-primary/30">
                <AvatarImage src={userData.profilePicture || ""} />
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {getInitials(userData.username)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-foreground truncate">
                  {userData.username}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userData.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Header - mobile only */}
        <header className="sticky top-0 z-50 cinema-card border-b border-primary/20 backdrop-blur-lg lg:hidden overflow-hidden">
          <div className="w-full px-4 h-16 flex items-center justify-between min-w-0">
            {/* Logo - mobile */}
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0 min-w-0" onClick={() => navigate(ROUTES.home)}>
              <div className="p-2 rounded-full bg-primary/20 flex-shrink-0">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-primary truncate">CineMatch</span>
            </div>

            {/* Actions - mobile */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary flex-shrink-0" onClick={() => navigate(ROUTES.chat)}>
                <MessageSquare className="w-6 h-6" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-primary flex-shrink-0">
                    <Avatar className="w-8 h-8 border-2 border-primary/30">
                      <AvatarImage src={userData.profilePicture || ""} />
                      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                        {getInitials(userData.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(ROUTES.addPreferences)}>
                    <Heart className="w-4 h-4 mr-2" />
                    Minhas Preferências
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(ROUTES.settings)}>
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <DoorOpen className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <header className="hidden lg:flex sticky top-0 z-50 cinema-card border-b border-primary/20 backdrop-blur-lg">
          <div className="flex-1 px-6 h-16 flex items-center">
            {/* Search bar - desktop - full width */}
            <div className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar filmes..."
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md focus:border-primary focus:ring-primary/20 transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      navigate(`${ROUTES.search}?query=${encodeURIComponent(e.currentTarget.value)}`);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <PWAInstallPrompt />

        {/* Main content */}
        <main className="flex-1 container mx-auto px-4 py-2 pb-6 md:pb-2">
          {title && (
            <div className="mb-6">
              <Title>{title}</Title>
            </div>
          )}
          {children}
        </main>
      </div>

      {/* Bottom navigation - mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden cinema-card border-t border-primary/20 backdrop-blur-lg">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.home)}>
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.search)}>
            <Search className="w-5 h-5" />
            <span className="text-xs">Buscar</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.discovery)}>
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs">Descobrir</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.profile(userData.username || ''), { state: { userId: userData.id } })}>
            <User className="w-5 h-5" />
            <span className="text-xs">{userData.username.split(" ")[0] || "Perfil"}</span>
          </Button>
        </div>
      </nav>

      {/* Spacer for mobile navigation */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}