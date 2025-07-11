import type { ReactNode } from 'react';
import { Film } from 'lucide-react';

interface PageContainerProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export default function PageContainer({ children, title, subtitle }: PageContainerProps) {
    return (
        <div className="min-h-screen cinema-gradient relative overflow-hidden">
            {/* Film strip decoration */}
            <div className="film-strip absolute top-0 left-0 h-full w-8 opacity-20"></div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 text-primary/20">
                    <Film size={64} />
                </div>
                <div className="absolute top-32 right-16 text-primary/10">
                    <Film size={48} />
                </div>
                <div className="absolute bottom-20 left-1/4 text-primary/15">
                    <Film size={32} />
                </div>
                <div className="absolute bottom-40 right-8 text-primary/10">
                    <Film size={56} />
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand area */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-full bg-primary/20 cinema-glow">
                                <Film className="w-8 h-8 text-primary" />
                            </div>
                            <h1 className="text-3xl font-bold text-primary">CineMatch</h1>
                        </div>
                        {title && (
                            <div>
                                <h2 className="text-2xl font-semibold text-foreground mb-2">{title}</h2>
                                {subtitle && (
                                    <p className="text-muted-foreground text-sm">{subtitle}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Content card */}
                    <div className="cinema-card p-6 shadow-2xl">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 text-xs text-muted-foreground">
                        Descubra filmes perfeitos para você
                    </div>
                </div>
            </div>
        </div>
    );
}