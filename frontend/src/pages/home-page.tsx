import AppLayout from "@/components/app-layout";
import MovieCard from "@/components/movie-card";
import { Button } from "@/components/ui/button";
import { Star, TrendingUp } from "lucide-react";

export default function HomePage() {
    // Mock data para demonstração
    const featuredMovies = [
        {
            id: 1,
            title: "Duna: Parte Dois",
            year: "2024",
            rating: 8.5,
            genre: "Ficção Científica",
            description: "Paul Atreides une-se a Chani e aos Fremen enquanto busca vingança contra os conspiradores..."
        },
        {
            id: 2,
            title: "Oppenheimer",
            year: "2023",
            rating: 8.3,
            genre: "Drama Histórico",
            description: "A história do físico americano J. Robert Oppenheimer e sua participação no desenvolvimento da bomba atômica..."
        },
        {
            id: 3,
            title: "Barbie",
            year: "2023",
            rating: 6.9,
            genre: "Comédia",
            description: "Barbie e Ken embarcam em uma jornada de autodescoberta após uma crise existencial..."
        }
    ];

    return (
        <AppLayout title="Descubra seus próximos filmes favoritos">
            {/* Hero section */}
            <section className="cinema-card p-6 mb-8 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-sm font-medium">Em Alta</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Filmes Recomendados</h2>
                    <p className="text-muted-foreground text-sm mb-4">
                        Baseado em suas preferências e tendências atuais
                    </p>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cinema-glow">
                        Ver Recomendações
                    </Button>
                </div>

                {/* Background decoration */}
                <div className="absolute top-4 right-4 opacity-10">
                    <Star className="w-16 h-16 text-primary" />
                </div>
            </section>

            {/* Featured movies */}
            <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">Filmes em Destaque</h3>
                    <Button variant="ghost" className="text-primary hover:text-primary/80">
                        Ver todos
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredMovies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            title={movie.title}
                            year={movie.year}
                            rating={movie.rating}
                            genre={movie.genre}
                            description={movie.description}
                            onClick={() => console.log('Movie clicked:', movie.title)}
                        />
                    ))}
                </div>
            </section>

            {/* Categories */}
            <section>
                <h3 className="text-lg font-semibold text-foreground mb-4">Explorar por Categoria</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {['Ação', 'Drama', 'Comédia', 'Terror', 'Ficção Científica', 'Romance', 'Aventura', 'Documentário'].map((category) => (
                        <Button
                            key={category}
                            variant="outline"
                            className="h-12 border-primary/20 hover:border-primary hover:bg-primary/10 transition-all duration-200"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}