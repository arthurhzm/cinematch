import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { CreateMovieRecommendationFeedbackDTO } from "@/DTO/CreateMovieRecommendationFeedbackDTO";
import useAI from "@/hooks/use-ai";
import useRecommendation from "@/hooks/use-recommendation";
import type { AIRecommendations } from "@/utils/types";
import { Heart, RotateCcw, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function RecommendationsPage() {
    const { generateMovieRecommendations } = useAI();
    const { putRecommendationFeedback } = useRecommendation();
    const { userData } = useAuth();
    const { showSuccess, showError } = useToast();

    const [recommendations, setRecommendations] = useState<AIRecommendations[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [rotation, setRotation] = useState(0);

    const cardRef = useRef<HTMLDivElement>(null);
    const startPosRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        loadRecommendations();
    }, []);

    const loadRecommendations = async () => {
        try {
            setIsLoading(true);
            const data = await generateMovieRecommendations(false, false);
            setRecommendations(data);
            setCurrentIndex(0);
        } catch (error) {
            showError("Erro ao carregar recomendações");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFeedback = async (feedback: "like" | "dislike" | "superlike") => {
        if (!userData || currentIndex >= recommendations.length) return;

        const movie = recommendations[currentIndex];
        const recommendationFeedback = new CreateMovieRecommendationFeedbackDTO(
            userData.id,
            movie.title,
            feedback
        );

        try {
            await putRecommendationFeedback(recommendationFeedback);
            showSuccess("Avaliação enviada!");
            nextMovie();
        } catch (error) {
            showError("Erro ao enviar avaliação");
        }
    };

    const nextMovie = () => {
        if (currentIndex < recommendations.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Acabaram as recomendações
            setCurrentIndex(recommendations.length);
        }
        resetCard();
    };

    const resetCard = () => {
        setDragOffset({ x: 0, y: 0 });
        setRotation(0);
        setIsDragging(false);
    };

    const handleStart = (clientX: number, clientY: number) => {
        setIsDragging(true);
        startPosRef.current = { x: clientX, y: clientY };
    };

    const handleMove = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const deltaX = clientX - startPosRef.current.x;
        const deltaY = clientY - startPosRef.current.y;

        setDragOffset({ x: deltaX, y: deltaY });
        setRotation(deltaX * 0.1);
    };

    const handleEnd = () => {
        if (!isDragging) return;

        const threshold = 100;
        const { x, y } = dragOffset;

        if (Math.abs(x) > threshold) {
            if (x > 0) {
                handleFeedback("like");
            } else {
                handleFeedback("dislike");
            }
        } else if (y < -threshold) {
            handleFeedback("superlike");
        } else {
            resetCard();
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        handleEnd();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = () => {
        handleEnd();
    };

    const currentMovie = recommendations[currentIndex];

    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex flex-col h-[calc(100vh-200px)] items-center justify-center">
                    <Skeleton className="w-80 h-96 rounded-2xl mb-4" />
                    <div className="flex gap-4">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                </div>
            </AppLayout>
        );
    }

    if (currentIndex >= recommendations.length) {
        return (
            <AppLayout>
                <div className="flex flex-col h-[calc(100vh-200px)] items-center justify-center text-center space-y-8">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                        <Heart className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Todas as recomendações avaliadas!
                        </h2>
                        <Button onClick={loadRecommendations} className="w-full flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Novas recomendações
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] items-center justify-center relative overflow-hidden">
                {/* Card do filme */}
                <div className="relative mb-6">
                    <Card
                        ref={cardRef}
                        className="w-80 h-[520px] cinema-card cursor-grab active:cursor-grabbing select-none overflow-hidden"
                        style={{
                            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                            transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={isDragging ? handleMouseMove : undefined}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={isDragging ? handleTouchMove : undefined}
                        onTouchEnd={handleTouchEnd}
                    >
                        <CardContent className="p-0 h-full relative flex flex-col">
                            {/* Trailer/Poster */}
                            <div className="h-64 relative overflow-hidden rounded-t-lg flex-shrink-0">
                                {currentMovie.poster_url ? (
                                    <img
                                        src={currentMovie.poster_url}
                                        alt={currentMovie.title}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                        <span className="text-4xl">🎬</span>
                                    </div>
                                )}

                                {/* Overlay gradiente */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                {/* Título overlay */}
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-xl font-bold text-white mb-1">{currentMovie.title}</h3>
                                    <p className="text-white/80 text-sm">{currentMovie.year}</p>
                                </div>
                            </div>

                            {/* Informações do filme */}
                            <div className="flex-1 p-4 space-y-3 overflow-hidden">
                                {/* Gêneros */}
                                <div className="flex flex-wrap gap-1">
                                    {currentMovie.genres.slice(0, 3).map((genre, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>

                                {/* Sinopse */}
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-6">
                                        {currentMovie.overview}
                                    </p>
                                </div>

                                {/* Por que recomendamos */}
                                {currentMovie.why_recommend && (
                                    <div className="bg-primary/10 p-3 rounded-lg mt-auto">
                                        <p className="text-xs text-primary font-medium line-clamp-2">
                                            {currentMovie.why_recommend}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Indicadores de swipe */}
                            {isDragging && (
                                <>
                                    {dragOffset.x > 50 && (
                                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                                            <div className="bg-green-500 p-4 rounded-full">
                                                <ThumbsUp className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {dragOffset.x < -50 && (
                                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                            <div className="bg-red-500 p-4 rounded-full">
                                                <ThumbsDown className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    {dragOffset.y < -50 && (
                                        <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                            <div className="bg-purple-500 p-4 rounded-full">
                                                <Star className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center gap-6 pb-4">
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-16 h-16 rounded-full bg-red-600/20 hover:bg-red-600/30 border-red-600/40 text-red-400"
                        onClick={() => handleFeedback("dislike")}
                    >
                        <ThumbsDown className="w-6 h-6" />
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-20 h-20 rounded-full bg-purple-600/20 hover:bg-purple-600/30 border-purple-600/40 text-purple-400"
                        onClick={() => handleFeedback("superlike")}
                    >
                        <Star className="w-8 h-8" />
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        className="w-16 h-16 rounded-full bg-green-600/20 hover:bg-green-600/30 border-green-600/40 text-green-400"
                        onClick={() => handleFeedback("like")}
                    >
                        <ThumbsUp className="w-6 h-6" />
                    </Button>
                </div>

                {/* Contador */}
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm">
                        {currentIndex + 1} / {recommendations.length}
                    </span>
                </div>
            </div>
        </AppLayout>
    );
}