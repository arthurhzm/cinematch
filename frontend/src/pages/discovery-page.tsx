import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/utils/routes";
import {
    Brain,
    Coffee,
    Dice1,
    Flame,
    Heart,
    Moon,
    Shuffle,
    Star,
    Target,
    ThumbsDown,
    ThumbsUp,
    Timer,
    Users,
    Wand2
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DiscoveryPage() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSwipeRecommendations = async () => {
        navigate('/recommendations');
    };

    const moodButtons = [
        { emoji: '😢', label: 'Triste', description: 'Me anima!', color: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/40 text-blue-400' },
        { emoji: '😭', label: 'Chorão', description: 'Quero chorar', color: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/40 text-purple-400' },
        { emoji: '⚡', label: 'Energia', description: 'Adrenalina!', color: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40 text-yellow-400' },
        { emoji: '🧠', label: 'Cansado', description: 'Algo leve', color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/40 text-green-400' },
        { emoji: '❤️', label: 'Romântico', description: 'No amor', color: 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/40 text-pink-400' },
        { emoji: '🤔', label: 'Reflexivo', description: 'Filosofar', color: 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/40 text-indigo-400' },
    ];

    const emergencyButtons = [
        {
            icon: Timer,
            title: 'Tô Sem Tempo',
            subtitle: '< 90min',
            emoji: '⏰',
            description: 'Algo rápido',
            color: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-400',
            action: () => navigate('/search?query=filmes curtos com menos de 90 minutos')
        },
        {
            icon: Coffee,
            title: 'Background',
            subtitle: 'Meio prestar atenção',
            emoji: '☕',
            description: 'Pra fazer outras coisas',
            color: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40 text-orange-400',
            action: () => navigate('/search?query=filmes leves para deixar de fundo')
        },
        {
            icon: Moon,
            title: 'Pré-Sleep',
            subtitle: 'Relaxante',
            emoji: '😴',
            description: 'Antes de dormir',
            color: 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/40 text-indigo-400',
            action: () => navigate('/search?query=filmes calmos relaxantes para antes de dormir')
        },
        {
            icon: Users,
            title: 'Galera Reunida',
            subtitle: 'Assistir junto',
            emoji: '🍿',
            description: 'Diversão garantida',
            color: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/40 text-green-400',
            action: () => navigate('/search?query=filmes para assistir em grupo ou com amigos')
        }
    ];

    const getTimeBasedGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return { emoji: '🌅', text: 'Bom dia!', suggestion: 'Que tal algo leve para começar bem?' };
        if (hour < 18) return { emoji: '☀️', text: 'Boa tarde!', suggestion: 'Hora perfeita para uma aventura!' };
        return { emoji: '🌙', text: 'Boa noite!', suggestion: 'Momento de se envolver numa boa história!' };
    };

    const greeting = getTimeBasedGreeting();

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Hero Header */}
                <Card className="cinema-card border-primary/30">
                    <CardContent className="p-6 text-center">
                        <div className="space-y-4">
                            <div className="relative">
                                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    🎬 Central de Descobrimento
                                </h1>
                                <div className="absolute -top-1 -right-1 text-lg animate-bounce">✨</div>
                            </div>
                            <p className="text-muted-foreground">
                                {greeting.emoji} {greeting.text} <br />
                                <span className="text-primary font-medium">{greeting.suggestion}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* MEGA Botão Principal - Swipe Mode */}
                <Card className="cinema-card bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 border-primary/40">
                    <CardContent className="p-6 text-center relative overflow-hidden">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                <Shuffle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                                    Modo Swipe
                                </h2>
                                <p className="text-muted-foreground text-sm mb-4">
                                    <strong>Deslize para descobrir!</strong><br />
                                    Filmes personalizados baseados no seu gosto
                                </p>
                            </div>
                            <Button
                                onClick={handleSwipeRecommendations}
                                size="lg"
                                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300"
                            >
                                <Wand2 className="mr-2" />
                                COMEÇAR A DESCOBRIR!
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* "Tô Sem Ideia!" Section */}
                <Card className="cinema-card">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold flex items-center justify-center gap-2 mb-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Tô sem ideia, me ajuda aí!
                                </h3>
                                <p className="text-muted-foreground text-sm">Botões de emergência para a indecisão</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {emergencyButtons.map((btn, index) => (
                                    <Card
                                        key={index}
                                        className={`cinema-card hover:border-primary/40 cursor-pointer transition-all duration-300 ${btn.color}`}
                                        onClick={btn.action}
                                    >
                                        <CardContent className="p-4 text-center">
                                            <div className="text-2xl mb-2">{btn.emoji}</div>
                                            <h4 className="font-semibold text-sm mb-1">{btn.title}</h4>
                                            <p className="text-xs opacity-90 mb-1">{btn.subtitle}</p>
                                            <p className="text-xs opacity-70">{btn.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Mood Selector */}
                <Card className="cinema-card">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold flex items-center justify-center gap-2 mb-2">
                                    <Heart className="w-5 h-5 text-primary" />
                                    💭 Como você tá se sentindo?
                                </h3>
                                <p className="text-muted-foreground text-sm">Escolha seu mood e encontre o filme perfeito</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {moodButtons.map((mood, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className={`h-20 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${mood.color}`}
                                        onClick={() => navigate(`/search?query=filmes para quando estou no mood "${mood.label.toLowerCase()} - ${mood.description.toLowerCase()}"`)}
                                    >
                                        <span className="text-xl">{mood.emoji}</span>
                                        <div className="text-center">
                                            <div className="text-sm font-semibold">{mood.label}</div>
                                            <div className="text-xs opacity-80">{mood.description}</div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roleta Mágica */}
                <Card className="cinema-card border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <Dice1 className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="font-semibold text-lg text-yellow-400">🎰 Roleta Mágica</h3>
                                <p className="text-muted-foreground text-sm">
                                    <strong>Deixa o destino decidir!</strong><br />
                                    <span className="hidden md:inline">Para quando você não quer nem pensar</span>
                                    <span className="md:hidden">Filme surpresa!</span>
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/40 text-yellow-400 font-semibold transition-all duration-300 w-full md:w-auto"
                                onClick={() => navigate(ROUTES.roulette)}
                            >
                                🎲 GIRAR!
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Trending & Special */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Em Alta */}
                    <Card className="cinema-card border-orange-500/40 bg-gradient-to-br from-orange-500/10 to-red-500/10">
                        <CardContent className="p-6 text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                                <Flame className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2 text-orange-400">🔥 BOMBANDO AGORA</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Os filmes que <strong>TODO MUNDO</strong> está assistindo
                            </p>
                            <Button
                                variant="outline"
                                className="w-full bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/40 text-orange-400 font-semibold"
                                onClick={() => navigate(`/search?query=filmes trending populares hoje`)}
                            >
                                VER TENDÊNCIAS
                            </Button>
                        </CardContent>
                    </Card>

                </div>

                {/* Footer Motivacional */}
                <Card className="cinema-card bg-muted/20 border-primary/20">
                    <CardContent className="p-6 text-center">
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-2">
                                <Brain className="w-5 h-5 text-primary" />
                                <h4 className="font-semibold text-lg">💡 Dica de Ouro</h4>
                            </div>
                            <p className="text-muted-foreground">
                                <strong>Quanto mais você avaliar filmes, mais certeiras serão as recomendações!</strong><br />
                                <span className="text-sm">A IA aprende com cada like, dislike e superlike 🤖✨</span>
                            </p>
                            <div className="flex items-center justify-center gap-3 pt-3">
                                <div className="flex items-center gap-1 text-xs px-3 py-2 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 hover:bg-green-500/30 transition-all">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span className="font-medium">Curti</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs px-3 py-2 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-all">
                                    <Star className="w-3 h-3" />
                                    <span className="font-medium">Amei</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs px-3 py-2 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 hover:bg-red-500/30 transition-all">
                                    <ThumbsDown className="w-3 h-3" />
                                    <span className="font-medium">Não curti</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}