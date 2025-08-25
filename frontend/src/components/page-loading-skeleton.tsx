import { Film } from "lucide-react";

export default function PageLoadingSkeleton() {
    return (
        <div className="min-h-screen cinema-gradient flex items-center justify-center">
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