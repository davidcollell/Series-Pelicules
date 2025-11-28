
import React, { useState, useEffect } from 'react';
import { MediaItem, MediaStatus } from '../types';
import { CheckIcon, ReplayIcon, TrashIcon, ClockIcon, TvIcon, FilmIcon, ExternalLinkIcon, StarIcon } from './icons';

interface MediaCardProps {
  item: MediaItem;
  onStatusChange: (id: string, newStatus: MediaStatus) => void;
  onDelete: (id: string) => void;
  onRatingChange: (id: string, rating: number) => void;
}

const platformDomains: { [key: string]: string } = {
  'netflix': 'netflix.com',
  'hbo max': 'max.com',
  'max': 'max.com',
  'disney+': 'disneyplus.com',
  'amazon prime video': 'primevideo.com',
  'prime video': 'primevideo.com',
  'apple tv+': 'tv.apple.com',
  'hulu': 'hulu.com',
  'peacock': 'peacocktv.com',
  'youtube premium': 'youtube.com',
  'movistar+': 'movistarplus.es',
  'filmin': 'filmin.es',
  'atresplayer': 'atresplayer.com',
  'mitele': 'mitele.es',
  'rtve play': 'rtve.es',
  'skyshowtime': 'skyshowtime.com',
  'rakuten tv': 'rakuten.tv',
  'fubo': 'fubo.tv',
  'pluto tv': 'pluto.tv'
};

const formatDuration = (totalMinutes: number | undefined) => {
    if (!totalMinutes) return '';
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    let result = '';
    if (hours > 0) {
        result += `${hours}h `;
    }
    if (minutes > 0) {
        result += `${minutes}m`;
    }
    return result.trim();
};

const MediaCard: React.FC<MediaCardProps> = ({ item, onStatusChange, onDelete, onRatingChange }) => {
  const [showSeasons, setShowSeasons] = useState(false);
  const placeholderUrl = `https://placehold.co/400x600/1e1e1e/e5e7eb?text=${encodeURIComponent(item.title)}`;
  const [imgSrc, setImgSrc] = useState(item.posterUrl || placeholderUrl);
  const [logoError, setLogoError] = useState(false);
  
  const isWatched = item.status === MediaStatus.Watched;

  useEffect(() => {
    setImgSrc(item.posterUrl || placeholderUrl);
  }, [item.posterUrl, placeholderUrl]);

  const handleImageError = () => {
      if (imgSrc !== placeholderUrl) {
          setImgSrc(placeholderUrl);
      }
  };

  const getLogoUrl = () => {
    if (!item.platform) return null;
    const normalized = item.platform.toLowerCase().trim();
    const domain = platformDomains[normalized];
    // If exact match found, use it. Otherwise, try a simple guess by removing spaces + .com
    const targetDomain = domain || `${normalized.replace(/\s+/g, '')}.com`;
    return `https://logo.clearbit.com/${targetDomain}`;
  };

  const logoUrl = getLogoUrl();
  const searchUrl = `https://www.google.com/search?q=veure ${encodeURIComponent(item.title)} a ${encodeURIComponent(item.platform)}`;

  return (
    <div className="bg-brand-surface rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col group">
      <div className="relative">
        <img 
            className="w-full h-64 object-cover" 
            src={imgSrc} 
            alt={`Pòster de ${item.title}`}
            loading="lazy"
            onError={handleImageError}
        />
        
        {/* Platform Logo Overlay */}
        {item.platform && item.platform !== 'No disponible' && logoUrl && !logoError && (
             <div className="absolute top-2 left-2 bg-white/90 p-1.5 rounded-full shadow-lg z-10 transition-opacity hover:opacity-100 backdrop-blur-sm" title={item.platform}>
                <img 
                    src={logoUrl} 
                    alt={item.platform} 
                    className="h-6 w-6 object-contain rounded-full" 
                    onError={() => setLogoError(true)}
                />
            </div>
        )}

        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
            {item.type === 'Pel·lícula' ? (
                <FilmIcon className="h-5 w-5 text-indigo-400" />
            ) : (
                <TvIcon className="h-5 w-5 text-purple-400" />
            )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-brand-text leading-tight">{item.title}</h3>
            <span className="text-sm font-semibold text-brand-text-muted bg-gray-700 px-2 py-1 rounded ml-2 shrink-0">{item.year}</span>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm min-h-[32px]">
            {item.platform && item.platform !== 'No disponible' && (
                logoUrl && !logoError ? (
                  <a 
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center transition-transform hover:scale-110"
                      title={`Cerca on veure ${item.title} a ${item.platform}`}
                  >
                      <img 
                        src={logoUrl} 
                        alt={item.platform}
                        className="h-8 w-8 rounded-full bg-white object-contain p-0.5 shadow-sm"
                        onError={() => setLogoError(true)}
                      />
                  </a>
                ) : (
                  <a 
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-gray-600 text-gray-200 px-3 py-1 font-semibold hover:bg-gray-500 hover:text-white transition-colors cursor-pointer"
                      title={`Cerca on veure ${item.title} a ${item.platform}`}
                  >
                      {item.platform}
                      <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                )
            )}
            {item.type === 'Pel·lícula' && item.duration && (
                <span className="inline-flex items-center rounded-full bg-blue-600/20 text-blue-200 border border-blue-600/30 px-3 py-1 font-semibold text-xs">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {formatDuration(item.duration)}
                </span>
            )}
            {item.type === 'Sèrie' && item.seasons && (
                <button 
                    onClick={() => setShowSeasons(!showSeasons)}
                    className={`inline-flex items-center rounded-full px-3 py-1 font-semibold text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface ${
                        showSeasons 
                        ? 'bg-teal-500 text-white ring-2 ring-teal-400' 
                        : 'bg-teal-600/20 text-teal-200 border border-teal-600/30 hover:bg-teal-600/30'
                    }`}
                    title={showSeasons ? "Amagar detalls" : "Veure episodis per temporada"}
                >
                    <TvIcon className="h-3 w-3 mr-1" />
                    {item.seasons} {item.seasons > 1 ? 'temps' : 'temp'}
                </button>
            )}
        </div>
        
        {/* Season Details Section */}
        {showSeasons && item.type === 'Sèrie' && (
            <div className="mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700 text-sm animate-fade-in">
                <h4 className="text-brand-text-muted text-xs font-bold uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
                    Episodis per temporada
                </h4>
                {item.episodesPerSeason && item.episodesPerSeason.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {item.episodesPerSeason.map((count, index) => (
                            <div key={index} className="bg-brand-bg p-2 rounded text-center border border-gray-700 shadow-sm">
                                <span className="block text-[10px] uppercase text-brand-text-muted">T{index + 1}</span>
                                <span className="block font-bold text-brand-text">{count} ep</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-xs">Informació detallada no disponible.</p>
                )}
            </div>
        )}

        <p className="text-brand-text-muted text-sm flex-grow line-clamp-3 mb-2">{item.description}</p>
        
        {/* Rating Section */}
        <div className="flex items-center gap-1 mb-4 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button 
                    key={star} 
                    onClick={() => onRatingChange(item.id, star)}
                    className="focus:outline-none transition-transform hover:scale-110 active:scale-95 text-yellow-500 hover:text-yellow-400"
                    title={`Puntuar ${star} estrelles`}
                >
                    <StarIcon 
                        filled={(item.userRating || 0) >= star} 
                        className="h-5 w-5"
                    />
                </button>
            ))}
            {item.userRating ? (
               <span className="ml-2 text-xs text-brand-text-muted font-medium">({item.userRating}/5)</span>
            ) : (
               <span className="ml-2 text-xs text-gray-600">Puntuar</span>
            )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700 flex justify-between items-center gap-2">
          {isWatched ? (
            <button
              onClick={() => onStatusChange(item.id, MediaStatus.Watchlist)}
              className="flex-1 flex items-center justify-center text-sm bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md transition border border-gray-600"
            >
              <ReplayIcon /> <span className="hidden sm:inline">Torna a mirar</span><span className="sm:hidden">Recuperar</span>
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(item.id, MediaStatus.Watched)}
              className="flex-1 flex items-center justify-center text-sm bg-green-700 hover:bg-green-600 text-white py-2 px-3 rounded-md transition shadow-sm"
            >
              <CheckIcon /> <span className="hidden sm:inline">Marcar vista</span><span className="sm:hidden">Vist</span>
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-400 hover:text-red-300 p-2 rounded-md bg-red-900/20 hover:bg-red-900/40 transition border border-red-900/30"
            aria-label="Esborra l'element"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default MediaCard;
