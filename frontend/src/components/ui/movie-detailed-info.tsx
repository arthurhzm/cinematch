import type { AIRecommendations } from "@/utils/types";
import { useEffect } from "react";
import RateMovieRecommendation from "../rate-movie-recommendation";

type MovieDetailedInfoProps = {
    movie: AIRecommendations;
    open: boolean;
    onClose: () => void;
    userId?: number;
};

export default function MovieDetailedInfo({ movie, open, onClose, userId }: MovieDetailedInfoProps) {

    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [open]);

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <div className="relative w-2xl max-w-2xl max-h-[90vh] overflow-y-auto cinema-card">
                        {/* ...existing code... */}
                        <div className="relative">
                            {movie.poster_url && (
                                <div className="h-32 sm:h-48 overflow-hidden rounded-t-lg">
                                    <img
                                        src={movie.poster_url}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                </div>
                            )}

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 w-8 h-8 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                            >
                                <span className="text-lg">×</span>
                            </button>

                            {/* Title overlay */}
                            <div className="absolute bottom-4 left-4 right-16">
                                <h2 className="text-2xl font-bold text-white mb-1">{movie.title}</h2>
                                <div className="flex items-center gap-2 text-white/80">
                                    <span className="text-sm">{movie.year}</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">

                            {/* Genres */}
                            {movie.genres && (
                                <div className="flex flex-wrap gap-2">
                                    {movie.genres.map((genre, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Ratings */}
                            <RateMovieRecommendation
                                movie={movie}
                                userId={userId}
                                onFeedbackComplete={() => onClose()}
                            />

                            {/* Overview */}
                            {movie.overview && (
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Sinopse</h3>
                                    <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>
                                </div>
                            )}

                            {/* Why recommend */}
                            {movie.why_recommend && (
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Por que recomendamos</h3>
                                    <p className="text-muted-foreground leading-relaxed">{movie.why_recommend}</p>
                                </div>
                            )}

                            {/* Streaming services */}
                            {movie.streaming_services && movie.streaming_services.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Onde assistir</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {movie.streaming_services.map((service, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-2 bg-secondary text-secondary-foreground text-sm rounded-lg border border-border"
                                            >
                                                {service}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            )
            }
        </>
    );
}