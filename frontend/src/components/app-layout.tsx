import type { ReactNode } from 'react';
import { Film, Search, User, Home, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  return (
    <div className="min-h-screen cinema-gradient">
      {/* Header */}
      <header className="sticky top-0 z-50 cinema-card border-b border-primary/20 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
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
          <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
            <User className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          </div>
        )}
        {children}
      </main>

      {/* Bottom navigation - mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden cinema-card border-t border-primary/20 backdrop-blur-lg">
        <div className="flex items-center justify-around py-2">
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2">
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2">
            <Search className="w-5 h-5" />
            <span className="text-xs">Buscar</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2">
            <Heart className="w-5 h-5" />
            <span className="text-xs">Favoritos</span>
          </Button>
          <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto py-2">
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Button>
        </div>
      </nav>

      {/* Spacer for mobile navigation */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}