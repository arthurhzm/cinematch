import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Debug: verificar se o evento está sendo registrado
    console.log('PWA: Registrando listener para beforeinstallprompt');

    const handler = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Só mostrar se não foi dispensado antes e não está instalado
      if (!localStorage.getItem('pwa-install-dismissed') && !isStandaloneMode) {
        setShowInstallPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Para iOS Safari - mostrar prompt manual após 30 segundos
    const iosTimer = setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isInStandaloneMode = (window.navigator as any).standalone;

      if (isIOS && !isInStandaloneMode && !localStorage.getItem('pwa-install-dismissed')) {
        console.log('PWA: Mostrando prompt iOS');
        setShowInstallPrompt(true);
      }
    }, 30000); // 30 segundos

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(iosTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Para iOS, mostrar instruções manuais
      alert(`Para instalar:\n\n1. Toque em ⋮ \n2. Selecione "Adicionar à Tela de Início"`);
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('PWA: User choice:', outcome);

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('PWA: Error during installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    console.log('PWA: Install prompt dismissed');
  };

  // Debug: mostrar sempre em desenvolvimento
  const isDev = import.meta.env.DEV;

  // Não mostrar se já está instalado
  if (isStandalone) {
    return null;
  }

  // Em desenvolvimento, mostrar sempre (para teste)
  if (isDev && !localStorage.getItem('pwa-install-dismissed')) {
    return (
      <Card className="fixed bottom-24 left-4 right-4 z-50 cinema-card border-primary/40 md:left-auto md:right-4 md:w-80">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Download className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Instalar CineMatch</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Adicione à tela inicial para acesso rápido e melhor experiência
              </p>
              <p className="text-xs text-orange-400 mb-3">
                🚧 Modo desenvolvimento - Prompt sempre visível
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  Instalar
                </Button>
                <Button size="sm" variant="outline" onClick={handleDismiss}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Em produção, só mostrar se o evento foi disparado
  if (!showInstallPrompt) {
    return null;
  }

  return (
    <Card className="fixed bottom-24 left-4 right-4 z-50 cinema-card border-primary/40 md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Instalar CineMatch</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Adicione à tela inicial para acesso rápido e melhor experiência
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleInstall} className="flex-1">
                Instalar
              </Button>
              <Button size="sm" variant="outline" onClick={handleDismiss}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}