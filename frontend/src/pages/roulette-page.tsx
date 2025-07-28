import AppLayout from "@/components/app-layout";
import RateMovieRecommendation from "@/components/rate-movie-recommendation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useAI from "@/hooks/use-ai";
import useFeedback from "@/hooks/use-feedback";
import usePreferences from "@/hooks/use-preferences";
import useRecommendation from "@/hooks/use-recommendation";
import useTMDB from "@/hooks/use-tmdb";
import { AI_MODELS } from "@/utils/ai-models";
import type { AIRecommendations, UserMovieFeedback, UserPreferences, UserRecommendationsFeedback } from "@/utils/types";
import { Calendar, Clock, Film, RotateCcw, Sparkles, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export default function RoulettePage() {
    const { ai } = useAI();
    const { getUserFeedback } = useFeedback();
    const { getUserRecommendationsFeedback } = useRecommendation();
    const { getMovieByTitle } = useTMDB();
    const { getUserPreferences } = usePreferences();
    const { userData } = useAuth();
    const { showSuccess, showError } = useToast();

    const [isSpinning, setIsSpinning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [spinRotation, setSpinRotation] = useState(0);
    const [selectedMovie, setSelectedMovie] = useState<AIRecommendations | null>(null);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [userStats, setUserStats] = useState({
        totalMovies: 0,
        avgRating: 0,
        favoriteGenres: [] as string[],
        recentlyWatched: [] as string[],
        preferences: null as UserPreferences | null
    });
    const [showFeedbackSection, setShowFeedbackSection] = useState(true);

    useEffect(() => {
        if (!userData) return;
        loadUserData();
    }, [userData]);

    const loadUserData = async () => {
        if (!userData) return;

        try {
            setIsLoading(true);

            const [preferences, feedback] = await Promise.all([
                getUserPreferences(userData.id),
                getUserFeedback(userData.id)
            ]);

            const prefs = preferences.data as UserPreferences;
            const feedbackData = feedback.data as UserMovieFeedback[];

            // Calcular estatísticas
            const totalRating = feedbackData.reduce((sum, movie) => sum + movie.rating, 0);
            const avgRating = feedbackData.length > 0 ? totalRating / feedbackData.length : 0;

            // Filmes recentes (últimos 5)
            const recentMovies = feedbackData
                .slice(-5)
                .map(movie => movie.movieTitle);

            setUserStats({
                totalMovies: feedbackData.length,
                avgRating,
                favoriteGenres: prefs.favoriteGenres || [],
                recentlyWatched: recentMovies,
                preferences: prefs
            });
        } catch (error) {
            showError("Erro ao carregar dados do usuário");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateSuperPrompt = async (): Promise<string> => {
        if (!userData || !userStats.preferences) return '';

        const preferences = userStats.preferences;
        const feedback = (await getUserFeedback(userData.id)).data as UserMovieFeedback[];
        const recFeedback = (await getUserRecommendationsFeedback(userData.id)).data as UserRecommendationsFeedback[];

        // Análise avançada dos dados
        const highRatedMovies = feedback.filter(movie => movie.rating >= 4);
        const lowRatedMovies = feedback.filter(movie => movie.rating <= 2);
        const likedRecommendations = recFeedback.filter(rec => rec.feedback === 'like' || rec.feedback === 'superlike');
        const dislikedRecommendations = recFeedback.filter(rec => rec.feedback === 'dislike');

        const currentHour = new Date().getHours();
        const timeContext = currentHour < 12 ? 'manhã' : currentHour < 18 ? 'tarde' : 'noite';
        const dayOfWeek = new Date().getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        return `
            [SISTEMA ROLETA MÁGICA - SUPER RECOMENDAÇÃO]
            
            Você é o algoritmo mais avançado de recomendação cinematográfica do mundo. Sua missão é encontrar 
            O FILME PERFEITO para ${userData.username} baseado em análise profunda e inteligente de todos os dados disponíveis.

            PERFIL DETALHADO DO USUÁRIO:
            - Nome: ${userData.username}
            - Total de filmes assistidos: ${userStats.totalMovies}
            - Nota média dos filmes: ${userStats.avgRating.toFixed(1)}/5
            - Gêneros preferidos: ${preferences.favoriteGenres.join(', ')}
            - Diretores favoritos: ${preferences.favoriteDirectors.join(', ')}
            - Atores favoritos: ${preferences.favoriteActors.join(', ')}
            - Aceita conteúdo adulto: ${preferences.acceptAdultContent ? 'Sim' : 'Não'}
            - Duração máxima preferida: ${preferences.maxDuration} minutos
            - Filmes a partir de: ${preferences.minReleaseYear}

            ANÁLISE COMPORTAMENTAL AVANÇADA:
            - Filmes recentemente assistidos: ${userStats.recentlyWatched.join(', ') || 'Nenhum'}
            - Filmes muito bem avaliados (4-5★): ${highRatedMovies.map(m => `${m.movieTitle} (${m.rating}★)`).join(', ') || 'Nenhum ainda'}
            - Filmes mal avaliados (1-2★): ${lowRatedMovies.map(m => `${m.movieTitle} (${m.rating}★)`).join(', ') || 'Nenhum'}
            - Recomendações que o usuário gostou: ${likedRecommendations.map(r => r.movieTitle).join(', ') || 'Nenhuma ainda'}
            - Recomendações rejeitadas: ${dislikedRecommendations.map(r => r.movieTitle).join(', ') || 'Nenhuma'}

            CONTEXTO TEMPORAL INTELIGENTE:
            - Horário atual: ${timeContext}
            - É fim de semana: ${isWeekend ? 'Sim' : 'Não'}
            - Data: ${new Date().toLocaleDateString('pt-BR')}

            ALGORITMO SUPER INTELIGENTE:
            1. ANALISE PROFUNDA: Identifique padrões ocultos nos gostos do usuário baseado em:
               - Correlações entre filmes bem avaliados
               - Elementos em comum dos filmes curtidos (temas, estilos, épocas)
               - Evolução do gosto cinematográfico ao longo do tempo
               
            2. CONTEXTO TEMPORAL: Considere o momento ideal para assistir:
               - ${timeContext === 'manhã' ? 'Filmes energizantes e motivacionais' : ''}
               - ${timeContext === 'tarde' ? 'Filmes envolventes e aventurescos' : ''}
               - ${timeContext === 'noite' ? 'Filmes mais profundos e cinematicamente ricos' : ''}
               - ${isWeekend ? 'Filme para relaxar e curtir sem pressa' : 'Filme que cabe na rotina'}

            3. EXCLUSÕES INTELIGENTES:
               - NUNCA recomende: ${[...feedback.map(f => f.movieTitle), ...recFeedback.map(r => r.movieTitle)].join(', ') || 'Nenhum'}
               - Evite padrões de filmes mal avaliados
               - Respeite as preferências de duração e conteúdo
               - Não repita filmes já assistidos ou recomendados

            4. INOVAÇÃO CONTROLADA:
               - 70% baseado nos gostos comprovados
               - 20% expansão cuidadosa dos horizontes
               - 10% elemento surpresa (mas ainda conectado ao perfil)

            MISSÃO FINAL:
            Encontre UM ÚNICO FILME que seja a combinação perfeita de:
            - Máxima compatibilidade com o perfil
            - Momento ideal para assistir
            - Qualidade cinematográfica excepcional
            - Potencial de se tornar um novo favorito

            FORMATO DE RESPOSTA (JSON com Markdown):
            {
                "title": "Nome do Filme",
                "year": 2023,
                "genres": ["Gênero1", "Gênero2"],
                "overview": "Sinopse detalhada e envolvente em **markdown** com formatação rica",
                "why_recommend": "Explicação **detalhada** e *personalizada* de por que este é O filme **perfeito** para ${userData.username} neste momento. Use markdown para destacar pontos importantes.",
                "streaming_services": ["Netflix", "Prime Video"],
                "confidence_score": 95,
                "perfect_match_reasons": [
                    "**Razão específica 1** com detalhes",
                    "*Razão específica 2* bem explicada", 
                    "**Razão específica 3** convincente"
                ]
            }

            IMPORTANTE: 
            - Este deve ser O MELHOR filme possível para este usuário
            - Use toda sua inteligência cinematográfica
            - Use **markdown** para formatação rica (negrito, itálico, etc.)
            - A explicação deve ser convincente e personalizada
            - Confidence score de 90-100 (indique sua certeza de que é uma boa escolha)
            - Retorne apenas o JSON válido, sem markdown wrapper ou formatação adicional
        `.trim();
    };

    const spinRoulette = async () => {
        if (!userData || isSpinning) return;

        try {
            setIsSpinning(true);
            setSelectedMovie(null);
            setLoadingProgress(0);

            // Fase 1: Animação de rotação (0-30%)
            setLoadingMessage('🎰 Iniciando a roleta mágica...');
            const spins = 5 + Math.random() * 3;
            const finalRotation = spinRotation + (spins * 360);
            setSpinRotation(finalRotation);

            // Progresso da animação
            const animationInterval = setInterval(() => {
                setLoadingProgress(prev => {
                    if (prev < 30) return prev + 2;
                    return prev;
                });
            }, 100);

            await new Promise(resolve => setTimeout(resolve, 1500));
            clearInterval(animationInterval);
            setLoadingProgress(30);

            // Fase 2: Análise dos dados (30-60%)
            setLoadingMessage('🧠 Analisando seus gostos cinematográficos...');

            const analysisSteps = [
                { message: '📊 Processando {totalMovies} filmes avaliados...', progress: 35 },
                { message: '⭐ Calculando padrões de preferência...', progress: 40 },
                { message: '🎭 Identificando gêneros favoritos...', progress: 45 },
                { message: '🎬 Correlacionando diretores e atores...', progress: 50 },
                { message: '⏰ Considerando contexto temporal...', progress: 55 },
                { message: '🎯 Aplicando algoritmo de compatibilidade...', progress: 60 }
            ];

            for (const step of analysisSteps) {
                setLoadingMessage(step.message.replace('{totalMovies}', userStats.totalMovies.toString()));
                setLoadingProgress(step.progress);
                await new Promise(resolve => setTimeout(resolve, 400));
            }

            // Fase 3: Geração da recomendação (60-90%)
            setLoadingMessage('🤖 Gerando recomendação perfeita...');
            setLoadingProgress(60);

            const superPrompt = await generateSuperPrompt();
            setLoadingProgress(70);

            const response = await ai.models.generateContent({
                model: AI_MODELS.GEMINI_2_5_FLASH,
                contents: superPrompt,
            });

            setLoadingProgress(80);

            if (!response.text) {
                throw new Error("Falha ao gerar recomendação");
            }

            // Fase 4: Processamento e busca de dados (80-100%)
            setLoadingMessage('🎬 Buscando informações do filme...');
            setLoadingProgress(85);

            // Processar resposta (agora esperando JSON puro)
            let jsonText = response.text
                .replace(/^```json\s*/, '')
                .replace(/\s*```$/, '')
                .replace(/^```\s*/, '')
                .replace(/\s*```$/, '')
                .trim();

            const recommendation = JSON.parse(jsonText);
            setLoadingProgress(90);

            // Buscar poster
            setLoadingMessage('🖼️ Carregando poster do filme...');
            try {
                const movieData = await getMovieByTitle(recommendation.title);
                if (movieData.results && movieData.results.length > 0) {
                    const posterPath = movieData.results[0].poster_path;
                    recommendation.poster_url = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
                }
            } catch (error) {
                console.error('Erro ao buscar poster:', error);
                recommendation.poster_url = null;
            }

            setLoadingProgress(95);
            setLoadingMessage('✨ Finalizando recomendação...');

            // Processamento de markdown para HTML
            if (recommendation.why_recommend) {
                recommendation.why_recommend = processMarkdownToHtml(recommendation.why_recommend);
            }
            if (recommendation.overview) {
                recommendation.overview = processMarkdownToHtml(recommendation.overview);
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            setLoadingProgress(100);
            setLoadingMessage('🎯 Filme perfeito encontrado!');

            setSelectedMovie(recommendation);
            showSuccess("🎯 Filme perfeito encontrado!");
            setShowFeedbackSection(true);

        } catch (error) {
            showError("Erro ao sortear filme. Tente novamente!");
            console.error(error);
        } finally {
            setIsSpinning(false);
            setLoadingProgress(0);
            setLoadingMessage('');
        }
    };

    // Função para processar Markdown simples para HTML
    const processMarkdownToHtml = (text: string): string => {
        return text
            // Headers
            .replace(/### (.*$)/gm, '<h3>$1</h3>')
            .replace(/## (.*$)/gm, '<h2>$1</h2>')
            .replace(/# (.*$)/gm, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Wrap in paragraphs
            .replace(/^(.+)$/gm, '<p>$1</p>')
            // Clean up empty paragraphs
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<h[1-6]>.*<\/h[1-6]>)<\/p>/g, '$1');
    };

    const resetRoulette = () => {
        setSelectedMovie(null);
        setSpinRotation(0);
    };

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <div className="text-center space-y-2">
                        <Skeleton className="h-8 w-48 mx-auto" />
                        <Skeleton className="h-4 w-64 mx-auto" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        <Skeleton className="h-20" />
                        <Skeleton className="h-20" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header */}
                <Card className="cinema-card border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
                    <CardContent className="p-6 text-center">
                        <div className="space-y-3">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                                Roleta Mágica
                            </h1>
                            <p className="text-muted-foreground">
                                <strong>Algoritmo super inteligente</strong> que analisa todos os seus dados<br />
                                para encontrar o filme PERFEITO para você!
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats do usuário */}
                <p className="text-muted-foreground">Um pouco sobre você:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="cinema-card border-primary/20">
                        <CardContent className="p-4 text-center">
                            <Film className="w-6 h-6 text-primary mx-auto mb-2" />
                            <div className="text-lg font-bold text-primary">{userStats.totalMovies}</div>
                            <div className="text-xs text-muted-foreground">Filmes avaliados</div>
                        </CardContent>
                    </Card>

                    <Card className="cinema-card border-primary/20">
                        <CardContent className="p-4 text-center">
                            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-yellow-400">{userStats.avgRating.toFixed(1)}</div>
                            <div className="text-xs text-muted-foreground">Nota Média</div>
                        </CardContent>
                    </Card>

                    <Card className="cinema-card border-primary/20">
                        <CardContent className="p-4 text-center">
                            <Zap className="w-6 h-6 text-green-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-green-400">{userStats.favoriteGenres.length}</div>
                            <div className="text-xs text-muted-foreground">Gêneros preferidos</div>
                        </CardContent>
                    </Card>

                    <Card className="cinema-card border-primary/20">
                        <CardContent className="p-4 text-center">
                            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                            <div className="text-lg font-bold text-blue-400">{userStats.preferences?.maxDuration || 0}</div>
                            <div className="text-xs text-muted-foreground">Max Min Duração</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Roleta Principal */}
                <Card className="cinema-card">
                    <CardContent className="p-8">
                        <div className="flex flex-col items-center space-y-6">
                            {/* Roleta Visual Ultra Premium */}
                            <div className="relative z-0">
                                <div className="relative w-80 h-80 mx-auto">
                                    {/* Círculo externo com luzes neon */}
                                    <div
                                        className="absolute inset-0 rounded-full p-2 animate-spin-slow"
                                        style={{
                                            background: 'conic-gradient(from 0deg, #facc15, #f97316, #ef4444, #a855f7, #3b82f6, #10b981, #facc15)'
                                        }}
                                    >
                                        <div className="w-full h-full rounded-full bg-background/95 shadow-inner"></div>
                                    </div>

                                    {/* Roleta principal com segmentos 3D */}
                                    <div
                                        className="absolute inset-4 rounded-full overflow-hidden shadow-2xl border-2 border-yellow-400/60"
                                        style={{
                                            transform: `rotate(${spinRotation}deg)`,
                                            transition: isSpinning ? 'transform 4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                                            background: 'conic-gradient(from 0deg, #8B5CF6 0deg 45deg, #F59E0B 45deg 90deg, #EF4444 90deg 135deg, #10B981 135deg 180deg, #3B82F6 180deg 225deg, #F97316 225deg 270deg, #EC4899 270deg 315deg, #6366F1 315deg 360deg)',
                                            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
                                        }}
                                    >
                                        {/* Segmentos com ícones e texto 3D */}
                                        {[
                                            { color: '#8B5CF6', label: 'Drama', icon: '🎭', textColor: 'white' },
                                            { color: '#F59E0B', label: 'Ação', icon: '⚡', textColor: 'white' },
                                            { color: '#EF4444', label: 'Terror', icon: '👻', textColor: 'white' },
                                            { color: '#10B981', label: 'Comédia', icon: '😂', textColor: 'white' },
                                            { color: '#3B82F6', label: 'Ficção', icon: '🚀', textColor: 'white' },
                                            { color: '#F97316', label: 'Romance', icon: '💕', textColor: 'white' },
                                            { color: '#EC4899', label: 'Fantasia', icon: '🔮', textColor: 'white' },
                                            { color: '#6366F1', label: 'Aventura', icon: '🗺️', textColor: 'white' }
                                        ].map((segment, index) => {
                                            const angle = index * 45;

                                            return (
                                                <div
                                                    key={index}
                                                    className="absolute inset-0 flex items-center justify-center"
                                                    style={{
                                                        transform: `rotate(${angle + 22.5}deg)`,
                                                        transformOrigin: 'center'
                                                    }}
                                                >
                                                    <div
                                                        className="absolute text-center pointer-events-none"
                                                        style={{
                                                            top: '12%',
                                                            transform: `rotate(-${angle + 22.5}deg)`,
                                                            color: segment.textColor,
                                                            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                                                        }}
                                                    >
                                                        <div className="text-2xl mb-1">{segment.icon}</div>
                                                        <div className="text-xs font-bold tracking-wide">{segment.label}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Linhas divisórias douradas com brilho */}
                                        {Array.from({ length: 8 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="absolute w-0.5 bg-gradient-to-b from-yellow-300 via-yellow-400 to-yellow-600"
                                                style={{
                                                    height: '50%',
                                                    top: '0',
                                                    left: '50%',
                                                    transformOrigin: 'bottom',
                                                    transform: `translateX(-50%) rotate(${i * 45}deg)`,
                                                    filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.6))'
                                                }}
                                            />
                                        ))}

                                        {/* Efeito de reflexo na superfície */}
                                        <div
                                            className="absolute inset-0 rounded-full opacity-20"
                                            style={{
                                                background: 'linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 25%, transparent 75%, rgba(255,255,255,0.3) 100%)',
                                                pointerEvents: 'none'
                                            }}
                                        />

                                        {/* Reflexo rotativo sutil */}
                                        <div
                                            className="absolute inset-0 rounded-full opacity-15"
                                            style={{
                                                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.8) 3deg, transparent 6deg)',
                                                animation: isSpinning ? 'none' : 'spin 15s linear infinite reverse'
                                            }}
                                        />
                                    </div>

                                    {/* Centro da roleta com design ultra premium */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 z-10">
                                        {/* Anel externo com gradiente dourado */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-full shadow-xl"></div>

                                        {/* Anel do meio */}
                                        <div className="absolute inset-2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-full shadow-inner border border-yellow-300/50"></div>

                                        {/* Centro interno */}
                                        <div className="absolute inset-4 bg-gradient-to-br from-background via-muted to-background rounded-full border border-primary/50 flex items-center justify-center shadow-lg">
                                            {isSpinning ? (
                                                <div className="text-3xl animate-bounce filter drop-shadow-lg">🎰</div>
                                            ) : selectedMovie ? (
                                                <div className="text-3xl animate-pulse filter drop-shadow-lg">🎯</div>
                                            ) : (
                                                <div className="text-3xl filter drop-shadow-lg hover:animate-spin transition-transform duration-300 cursor-pointer">🎲</div>
                                            )}
                                        </div>

                                        {/* Reflexo premium no centro */}
                                        <div className="absolute inset-6 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-full pointer-events-none"></div>

                                        {/* Borda externa brilhante */}
                                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/80 shadow-lg"></div>
                                    </div>

                                    {/* Ponteiro ultra premium */}
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20">
                                        <div className="relative">
                                            {/* Sombra projetada */}
                                            <div className="absolute top-1 left-0.5 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-black/20 filter blur-sm"></div>

                                            {/* Ponteiro principal com gradiente 3D */}
                                            <div
                                                className="w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent shadow-xl"
                                                style={{
                                                    borderBottomColor: '#F59E0B',
                                                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))'
                                                }}
                                            ></div>

                                            {/* Base do ponteiro com anel dourado */}
                                            <div className="w-6 h-6 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-full absolute -bottom-3 left-1/2 transform -translate-x-1/2 shadow-lg border-2 border-yellow-100"></div>

                                            {/* Reflexo na base */}
                                            <div className="w-3 h-3 bg-gradient-to-br from-white/80 to-transparent rounded-full absolute -bottom-1.5 left-1/2 transform -translate-x-1/2"></div>

                                            {/* Ponto central da base */}
                                            <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full absolute -bottom-2.25 left-1/2 transform -translate-x-1/2"></div>
                                        </div>
                                    </div>

                                    {/* Efeitos de partículas mágicas durante o spin */}
                                    {isSpinning && (
                                        <>
                                            {/* Partículas orbitais */}
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="absolute w-2 h-2 rounded-full animate-ping"
                                                    style={{
                                                        top: '50%',
                                                        left: '50%',
                                                        background: `hsl(${i * 30}, 80%, 60%)`,
                                                        transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-150px)`,
                                                        animationDelay: `${i * 0.1}s`,
                                                        animationDuration: '1.2s',
                                                        filter: 'drop-shadow(0 0 4px currentColor)'
                                                    }}
                                                />
                                            ))}

                                            {/* Círculos de energia */}
                                            {Array.from({ length: 2 }).map((_, i) => (
                                                <div
                                                    key={`circle-${i}`}
                                                    className="absolute border rounded-full opacity-20 animate-ping"
                                                    style={{
                                                        top: '50%',
                                                        left: '50%',
                                                        width: `${240 + i * 40}px`,
                                                        height: `${240 + i * 40}px`,
                                                        transform: 'translate(-50%, -50%)',
                                                        borderColor: `hsl(${45 + i * 45}, 80%, 60%)`,
                                                        borderWidth: '2px',
                                                        animationDelay: `${i * 0.5}s`,
                                                        animationDuration: '2s'
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}

                                    {/* Aura mágica quando girando */}
                                    {isSpinning && (
                                        <div
                                            className="absolute inset-0 rounded-full animate-pulse"
                                            style={{
                                                background: 'radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(255,165,0,0.1) 60%, transparent 100%)',
                                                filter: 'blur(15px)',
                                                transform: 'scale(1.1)'
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Base reflexiva premium */}
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-60 h-12 bg-gradient-to-r from-transparent via-primary/20 to-transparent rounded-full blur-lg opacity-50"></div>

                                {/* Luzes ambientais laterais */}
                                <div className="absolute top-1/2 -left-8 transform -translate-y-1/2 w-4 h-32 bg-gradient-to-r from-yellow-400/40 to-transparent rounded-r-full animate-pulse"></div>
                                <div className="absolute top-1/2 -right-8 transform -translate-y-1/2 w-4 h-32 bg-gradient-to-l from-yellow-400/40 to-transparent rounded-l-full animate-pulse"></div>

                                {/* Luzes superiores e inferiores */}
                                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-gradient-to-b from-orange-400/40 to-transparent rounded-b-full animate-pulse"></div>
                                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-24 h-3 bg-gradient-to-t from-orange-400/40 to-transparent rounded-t-full animate-pulse"></div>
                            </div>

                            {/* Estilos CSS customizados */}
                            <style>{`
                                @keyframes spin {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                                
                                @keyframes spin-slow {
                                    from { transform: rotate(0deg); }
                                    to { transform: rotate(360deg); }
                                }
                                
                                .animate-spin-slow {
                                    animation: spin-slow 25s linear infinite;
                                }
                            `}</style>

                            {/* Botão de Ação - Garantindo que fique acima da roleta */}
                            <div className="relative z-50 mt-8">
                                {!selectedMovie ? (
                                    <div className="w-full max-w-xs space-y-4">
                                        <Button
                                            onClick={spinRoulette}
                                            disabled={isSpinning}
                                            size="lg"
                                            className="w-full h-14 text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white transition-all duration-300 shadow-xl transform hover:scale-105"
                                        >
                                            {isSpinning ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                                    ANALISANDO...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-6 h-6 mr-3" />
                                                    SORTEAR FILME PERFEITO!
                                                </>
                                            )}
                                        </Button>

                                        {/* Progress Bar */}
                                        {isSpinning && (
                                            <div className="space-y-3">
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                                                        style={{ width: `${loadingProgress}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                                    </div>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-foreground mb-1">
                                                        {loadingMessage}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {loadingProgress}% completo
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Button
                                        onClick={resetRoulette}
                                        variant="outline"
                                        size="lg"
                                        className="w-full max-w-xs shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                    >
                                        <RotateCcw className="w-5 h-5 mr-2" />
                                        Sortear Novamente
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Resultado do Sorteio */}
                {selectedMovie && (
                    <Card className="cinema-card border-green-500/40 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                        <CardContent className="p-6">
                            <div className="text-center mb-4">
                                <h2 className="text-xl font-bold text-green-400 mb-2">
                                    🎯 SEU FILME PERFEITO!
                                </h2>
                                {selectedMovie.confidence_score && (
                                    <div className="text-sm text-muted-foreground">
                                        Compatibilidade: <span className="text-green-400 font-semibold">{selectedMovie.confidence_score}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Poster */}
                                <div className="flex-shrink-0 mx-auto md:mx-0">
                                    {selectedMovie.poster_url ? (
                                        <img
                                            src={selectedMovie.poster_url}
                                            alt={selectedMovie.title}
                                            className="w-48 h-72 object-cover rounded-lg shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-48 h-72 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg flex flex-col items-center justify-center text-gray-300 border border-gray-700">
                                            <Film size={64} className="mb-4 text-gray-400" />
                                            <div className="text-center px-4">
                                                <p className="text-sm font-medium text-gray-300 mb-1">{selectedMovie.title}</p>
                                                <p className="text-xs text-gray-500">({selectedMovie.year})</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Informações */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-foreground mb-2">
                                            {selectedMovie.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {selectedMovie.year}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Gêneros */}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMovie.genres.map((genre, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {genre}
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Sinopse */}
                                    <div>
                                        <h4 className="font-semibold mb-2">Sinopse:</h4>
                                        <div
                                            className="text-muted-foreground text-sm leading-relaxed [&>p]:mb-2 [&>strong]:font-semibold [&>em]:italic [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium"
                                            dangerouslySetInnerHTML={{ __html: selectedMovie.overview || '' }}
                                        />
                                    </div>

                                    {/* Por que foi escolhido */}
                                    <div className="bg-primary/10 p-4 rounded-lg">
                                        <h4 className="font-semibold text-primary mb-2">
                                            🎯 Por que este filme é perfeito para você:
                                        </h4>
                                        <div
                                            className="text-sm leading-relaxed [&>p]:mb-2 [&>strong]:font-semibold [&>em]:italic [&>h1]:text-lg [&>h1]:font-bold [&>h2]:text-base [&>h2]:font-semibold [&>h3]:text-sm [&>h3]:font-medium"
                                            dangerouslySetInnerHTML={{ __html: selectedMovie.why_recommend || '' }}
                                        />
                                    </div>

                                    {/* Motivos específicos */}
                                    {selectedMovie.perfect_match_reasons && (
                                        <div>
                                            <h4 className="font-semibold mb-2">✨ Match Perfeito:</h4>
                                            <ul className="space-y-1">
                                                {selectedMovie.perfect_match_reasons.map((reason, index) => (
                                                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                                        <span className="text-green-400 mt-1">•</span>
                                                        <div
                                                            className="[&>strong]:font-semibold [&>em]:italic"
                                                            dangerouslySetInnerHTML={{ __html: processMarkdownToHtml(reason || '') }}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Onde assistir */}
                                    {selectedMovie.streaming_services.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold mb-2">📺 Onde assistir:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedMovie.streaming_services.map((service, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {service}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Avaliação da recomendação */}
                                    {!!showFeedbackSection && (
                                        <RateMovieRecommendation
                                            movie={selectedMovie}
                                            onFeedbackComplete={() => {
                                                showSuccess("Obrigado pelo feedback! Suas recomendações serão ainda mais precisas.");
                                                setShowFeedbackSection(false);
                                            }} />
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Footer informativo */}
                <Card className="cinema-card bg-muted/20">
                    <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            <strong>🤖 IA Avançada:</strong> Analisamos seus {userStats.totalMovies} filmes avaliados,
                            suas preferências e o contexto atual para encontrar a recomendação perfeita!
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}