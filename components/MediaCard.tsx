import React from 'react';
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
  const isWatched = item.status === MediaStatus.Watched;

  return (
    <div className="bg-brand-surface rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 duration-300 flex flex-col">
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
                <span 
                    className="inline-flex items-center rounded-full bg-teal-600 text-teal-100 px-3 py-1 font-semibold cursor-default"
                    title={item.episodesPerSeason && item.episodesPerSeason.length > 0 ? `Episodis per temporada: ${item.episodesPerSeason.join(', ')}` : ''}
                >
                    <TvIcon />
                    {item.seasons} {item.seasons > 1 ? 'temporades' : 'temporada'}
                </span>
            )}
        </div>
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
    </div>
  );
};

export default MediaCard;