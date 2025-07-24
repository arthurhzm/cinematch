import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import useUser from '@/hooks/use-user';
import { ROUTES } from '@/utils/routes';
import { DoorOpen, Film, Heart, Home, Lightbulb, MessageSquare, Search, Settings, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import Title from './ui/title';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getInitials } from '@/lib/utils';
import PWAInstallPrompt from './ui/pwa-installer-prompt';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {

  const { logoutUser } = useUser();
  const { userData, logout } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen cinema-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 cinema-card border-b border-primary/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2" onClick={() => navigate(ROUTES.home)}>
            <div className="p-2 rounded-full bg-primary/20">
              <Film className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-primary">CineMatch</span>
          </div>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar filmes..."
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md focus:border-primary focus:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <Button variant="ghost" className="text-foreground hover:text-primary p-3" onClick={() => navigate(ROUTES.chat)}>
              <MessageSquare className="w-8 h-8" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                  <Avatar className="w-8 h-8 border-2 border-primary/30">
                    <AvatarImage src={userData?.profilePicture || ""} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xl font-semibold">
                      {userData ? getInitials(userData.username) : <User />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(ROUTES.addPreferences)}>
                  <Heart />Minhas Preferências
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(ROUTES.settings)}>
                  <Settings /> Configurações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <DoorOpen /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header >
      
      <PWAInstallPrompt />

      {/* Main content */}
      <main className="container mx-auto px-4 py-2 pb-6 md:pb-2">
        {title && (
          <div className="mb-6">
            <Title>{title}</Title>
          </div>
        )
        }
        {children}
      </main >

      {/* Bottom navigation - mobile only */}
      < nav className="fixed bottom-0 left-0 right-0 md:hidden cinema-card border-t border-primary/20 backdrop-blur-lg" >
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.home)}>
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.search)}>
            <Search className="w-5 h-5" />
            <span className="text-xs">Buscar</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.recommendations)}>
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs">Descobrir</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2" onClick={() => navigate(ROUTES.profile(userData?.username || ''), { state: { userId: userData?.id } })}>
            <User className="w-5 h-5" />
            <span className="text-xs">{userData?.username || "Perfil"}</span>
          </Button>
        </div>
      </nav >

      {/* Spacer for mobile navigation */}
      < div className="h-20 md:hidden" ></div >
    </div >
  );
}