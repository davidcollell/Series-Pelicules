import React, { useState } from 'react';
import { MediaItem, MediaStatus } from '../types';
import { CheckIcon, ReplayIcon, TrashIcon, ClockIcon, TvIcon } from './icons';

interface MediaCardProps {
  item: MediaItem;
  onStatusChange: (id: string, newStatus: MediaStatus) => void;
  onDelete: (id: string) => void;
}

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

const MediaCard: React.FC<MediaCardProps> = ({ item, onStatusChange, onDelete }) => {
  const [showSeasons, setShowSeasons] = useState(false);
  const isWatched = item.status === MediaStatus.Watched;

  return (
    <div className="bg-brand-surface rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col">
      <img className="w-full h-64 object-cover" src={item.posterUrl} alt={`Pòster de ${item.title}`} />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-brand-text">{item.title}</h3>
            <span className="text-sm font-semibold text-brand-text-muted bg-gray-700 px-2 py-1 rounded">{item.year}</span>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
             <span className={`inline-block rounded-full px-3 py-1 font-semibold ${item.type === 'Pel·lícula' ? 'bg-indigo-600 text-indigo-100' : 'bg-purple-600 text-purple-100'}`}>
                {item.type}
            </span>
            {item.platform && item.platform !== 'No disponible' && (
                <span className="inline-block rounded-full bg-gray-600 text-gray-200 px-3 py-1 font-semibold">
                    {item.platform}
                </span>
            )}
            {item.type === 'Pel·lícula' && item.duration && (
                <span className="inline-flex items-center rounded-full bg-blue-600 text-blue-100 px-3 py-1 font-semibold">
                    <ClockIcon />
                    {formatDuration(item.duration)}
                </span>
            )}
            {item.type === 'Sèrie' && item.seasons && (
                <button 
                    onClick={() => setShowSeasons(!showSeasons)}
                    className={`inline-flex items-center rounded-full px-3 py-1 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-surface ${
                        showSeasons 
                        ? 'bg-teal-500 text-white ring-2 ring-teal-400' 
                        : 'bg-teal-600 text-teal-100 hover:bg-teal-500'
                    }`}
                    title={showSeasons ? "Amagar detalls" : "Veure episodis per temporada"}
                >
                    <TvIcon />
                    {item.seasons} {item.seasons > 1 ? 'temporades' : 'temporada'}
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
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                        {item.episodesPerSeason.map((count, index) => (
                            <div key={index} className="bg-brand-surface p-2 rounded text-center border border-gray-700 shadow-sm">
                                <span className="block text-[10px] uppercase text-brand-text-muted">Temp {index + 1}</span>
                                <span className="block font-bold text-brand-text">{count} eps</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic text-xs">Informació detallada no disponible.</p>
                )}
            </div>
        )}

        <p className="text-brand-text-muted text-sm flex-grow">{item.description}</p>
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
          {isWatched ? (
            <button
              onClick={() => onStatusChange(item.id, MediaStatus.Watchlist)}
              className="flex items-center text-sm bg-gray-600 hover:bg-gray-500 text-white py-2 px-3 rounded-md transition"
            >
              <ReplayIcon /> Torna a mirar
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(item.id, MediaStatus.Watched)}
              className="flex items-center text-sm bg-green-600 hover:bg-green-500 text-white py-2 px-3 rounded-md transition"
            >
              <CheckIcon /> Marcar com a vista
            </button>
          )}
          <button
            onClick={() => onDelete(item.id)}
            className="text-red-500 hover:text-red-400 p-2 rounded-full bg-red-900/20 hover:bg-red-900/40 transition"
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
      `}</style>
    </div>
  );
};

export default MediaCard;