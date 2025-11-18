import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MediaItem, MediaStatus } from './types';
import { fetchMediaDetails } from './services/geminiService';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import MediaList from './components/MediaList';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<MediaStatus>(MediaStatus.Watchlist);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  useEffect(() => {
    try {
      const storedItems = localStorage.getItem('mediaItems');
      if (storedItems) {
        setMediaItems(JSON.parse(storedItems));
      }
    } catch (e) {
      console.error("Failed to load items from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
    } catch (e) {
      console.error("Failed to save items to localStorage", e);
    }
  }, [mediaItems]);

  const handleAddItem = useCallback(async (query: string) => {
    if (mediaItems.some(item => item.title.toLowerCase() === query.toLowerCase())) {
        setError("Aquest element ja és a la teva llista.");
        setTimeout(() => setError(null), 3000);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const details = await fetchMediaDetails(query);
      const newItem: MediaItem = {
        id: new Date().toISOString(),
        ...details,
        posterUrl: `https://picsum.photos/seed/${details.title.replace(/\s/g, '')}/400/600`,
        status: MediaStatus.Watchlist,
      };
      setMediaItems(prev => [newItem, ...prev]);
      setActiveTab(MediaStatus.Watchlist);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("S'ha produït un error desconegut.");
      }
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, [mediaItems]);

  const handleStatusChange = (id: string, newStatus: MediaStatus) => {
    setMediaItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleDeleteRequest = (id: string) => {
    const item = mediaItems.find(i => i.id === id);
    if (item) {
      setItemToDelete(item);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setMediaItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setItemToDelete(null);
  };


  const filteredItems = useMemo(() => {
    return mediaItems.filter(item => item.status === activeTab);
  }, [mediaItems, activeTab]);

  const watchlistCount = useMemo(() => mediaItems.filter(item => item.status === MediaStatus.Watchlist).length, [mediaItems]);
  const watchedCount = useMemo(() => mediaItems.filter(item => item.status === MediaStatus.Watched).length, [mediaItems]);
  
  const TabButton: React.FC<{tab: MediaStatus, count: number, label: string}> = ({tab, count, label}) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`py-2 px-4 text-sm font-medium rounded-t-lg transition w-full ${
        activeTab === tab 
          ? 'border-b-2 border-brand-primary text-brand-primary' 
          : 'text-brand-text-muted hover:bg-brand-surface'
      }`}
    >
      {label} <span className="ml-1 bg-gray-700 text-xs font-bold rounded-full px-2 py-0.5">{count}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto">
        <Header />
        <SearchForm onAddItem={handleAddItem} isLoading={isLoading} />
        {error && (
            <div className="p-4 mx-4 my-2 bg-red-900/50 text-red-200 border border-red-700 rounded-md">
                <strong>Error:</strong> {error}
            </div>
        )}
        <div className="border-b border-gray-800 px-4">
          <div className="flex">
            <TabButton tab={MediaStatus.Watchlist} count={watchlistCount} label="Pendents" />
            <TabButton tab={MediaStatus.Watched} count={watchedCount} label="Vistes" />
          </div>
        </div>

        <main>
          <MediaList
            items={filteredItems}
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteRequest}
            title={activeTab === MediaStatus.Watchlist ? "Al meu radar" : "Completades"}
            emptyMessage={
              activeTab === MediaStatus.Watchlist
                ? "La teva llista de pendents és buida. Afegeix una pel·lícula o sèrie per començar!"
                : "Encara no has marcat cap element com a vist."
            }
          />
        </main>
        {itemToDelete && (
          <ConfirmationModal
            itemTitle={itemToDelete.title}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </div>
  );
};

export default App;
