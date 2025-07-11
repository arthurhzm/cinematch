import { Calendar, Play, Star } from 'lucide-react';
import type { ReactNode } from 'react';

interface MovieCardProps {
  title: string;
  year?: string;
  rating?: number;
  poster?: string;
  genre?: string;
  description?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export default function MovieCard({ 
  title, 
  year, 
  rating, 
  poster, 
  genre, 
  description, 
  onClick,
  children 
}: MovieCardProps) {
  return (
    <div className="cinema-card group hover:scale-105 transition-all duration-300 cursor-pointer" onClick={onClick}>
      {/* Poster section */}
      <div className="relative overflow-hidden rounded-t-lg">
        {poster ? (
          <img 
            src={poster} 
            alt={title}
            className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Play className="w-12 h-12 text-primary/60" />
          </div>
        )}
        
        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-medium text-white">{rating.toFixed(1)}</span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Play className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Content section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground text-sm leading-tight flex-1">{title}</h3>
          {year && (
            <div className="flex items-center gap-1 text-muted-foreground ml-2">
              <Calendar className="w-3 h-3" />
              <span className="text-xs">{year}</span>
            </div>
          )}
        </div>
        
        {genre && (
          <div className="text-xs text-primary mb-2">{genre}</div>
        )}
        
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{description}</p>
        )}
        
        {children && (
          <div className="mt-3">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}