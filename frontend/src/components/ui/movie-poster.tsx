import type { AIRecommendations } from "@/utils/types";
import { useState } from "react";
import MovieDetailedInfo from "./movie-detailed-info";
import { Film } from "lucide-react";

export default function MoviePoster({ movie }: { movie: AIRecommendations }) {

    const [open, setOpen] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handlePosterClick = () => {
        setOpen(true);
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <>
            <div
                key={movie.title}
                className="flex-none"
                onClick={handlePosterClick}>
                {!imageError && movie.poster_url ? (
                    <img
                        src={movie.poster_url}
                        alt={`Filme ${movie.title}`}
                        className="w-48 h-72 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="w-48 h-72 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center text-gray-300 border border-gray-700">
                        <Film size={48} className="mb-4 text-gray-400" />
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-300 mb-1">{movie.title}</p>
                            <p className="text-xs text-gray-500">({movie.year})</p>
                        </div>
                    </div>
                )}
            </div>
            {open && (
                <MovieDetailedInfo
                    movie={movie}
                    open={open}
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}