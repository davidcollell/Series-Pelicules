
import React, { useState, useEffect } from 'react';
import { MediaItem, MediaStatus } from './types';
import { fetchMediaDetails } from './services/geminiService';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import MediaList from './components/MediaList';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('mediaWatchlist');
    let items: MediaItem[] = saved ? JSON.parse(saved) : [];
    
    // Migració de dades: Assegurar que tots els registres tenen imatge
    // Si un element antic no té posterUrl, li assignem un de generat.
    let hasChanges = false;
    items = items.map(item => {
      if (!item.posterUrl || item.posterUrl.trim() === '') {
        hasChanges = true;
        return {
          ...item,
          posterUrl: `https://image.pollinations.ai/prompt/movie%20poster%20key%20art%20for%20${encodeURIComponent(item.title)}%20${item.year}%20vertical%20high%20quality?width=400&height=600&nologo=true`
        };
      }
      return item;
    });

    if (hasChanges) {
       localStorage.setItem('mediaWatchlist', JSON.stringify(items));
    }
    
    return items;
  });
  
  const [activeTab, setActiveTab] = useState<MediaStatus>(MediaStatus.Watchlist);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterQuery, setFilterQuery] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('mediaWatchlist', JSON.stringify(mediaItems));
  }, [mediaItems]);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleAddItem = async (query: string) => {
    setIsLoading(true);
    try {
      const details = await fetchMediaDetails(query);
      
      const exists = mediaItems.some(
        (item) => item.title.toLowerCase() === details.title.toLowerCase()
      );

      if (exists) {
        showToast(`"${details.title}" ja és a la teva llista.`);
        setIsLoading(false);
        return;
      }

      // Utilitzar la URL trobada per Gemini, o generar-ne una si no n'hi ha.
      let posterUrl = details.posterUrl;
      if (!posterUrl || posterUrl.trim() === '') {
         posterUrl = `https://image.pollinations.ai/prompt/movie%20poster%20key%20art%20for%20${encodeURIComponent(details.title)}%20${details.year}%20vertical%20high%20quality?width=400&height=600&nologo=true`;
      }

      const newItem: MediaItem = {
        id: crypto.randomUUID(),
        ...details,
        status: MediaStatus.Watchlist,
        posterUrl: posterUrl,
      };

      setMediaItems((prev) => [newItem, ...prev]);
      showToast(`Afegit: ${newItem.title}`);
    } catch (error) {
      console.error(error);
      showToast("Error en obtenir dades. Torna-ho a provar.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: MediaStatus) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    const statusText = newStatus === MediaStatus.Watched ? "Vist" : "Per veure";
    showToast(`Mogut a: ${statusText}`);
  };

  const handleRatingChange = (id: string, rating: number) => {
    setMediaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, userRating: rating } : item))
    );
  };

  const handleDeleteRequest = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const item = mediaItems.find((i) => i.id === itemToDelete);
      setMediaItems((prev) => prev.filter((i) => i.id !== itemToDelete));
      setItemToDelete(null);
      if (item) showToast(`Eliminat: ${item.title}`);
    }
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const filteredItems = mediaItems.filter((item) => {
    const matchesTab = item.status === activeTab;
    if (!matchesTab) return false;

    if (!filterQuery) return true;

    const query = filterQuery.toLowerCase();
    const matchesSearch = 
      item.title.toLowerCase().includes(query) ||
      item.year.toString().includes(query) ||
      (item.platform && item.platform.toLowerCase().includes(query));
    
    return matchesSearch;
  });
  
  const watchlistCount = mediaItems.filter(i => i.status === MediaStatus.Watchlist).length;
  const watchedCount = mediaItems.filter(i => i.status === MediaStatus.Watched).length;

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <SearchForm 
        onAddItem={handleAddItem} 
        isLoading={isLoading} 
        onFilter={setFilterQuery}
      />

      <div className="flex justify-center my-6 border-b border-gray-800 mx-4">
        <button
          onClick={() => setActiveTab(MediaStatus.Watchlist)}
          className={`px-6 py-3 text-lg font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === MediaStatus.Watchlist
              ? 'text-brand-primary'
              : 'text-brand-text-muted hover:text-brand-text'
          }`}
        >
          Per veure
          <span className={`text-xs rounded-full px-2 py-0.5 ${
            activeTab === MediaStatus.Watchlist 
              ? 'bg-brand-primary/20 text-brand-primary' 
              : 'bg-gray-800 text-gray-400'
          }`}>
            {watchlistCount}
          </span>
          {activeTab === MediaStatus.Watchlist && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab(MediaStatus.Watched)}
          className={`px-6 py-3 text-lg font-medium transition-colors relative flex items-center gap-2 ${
            activeTab === MediaStatus.Watched
              ? 'text-brand-primary'
              : 'text-brand-text-muted hover:text-brand-text'
          }`}
        >
          Vistos
          <span className={`text-xs rounded-full px-2 py-0.5 ${
            activeTab === MediaStatus.Watched 
              ? 'bg-brand-primary/20 text-brand-primary' 
              : 'bg-gray-800 text-gray-400'
          }`}>
            {watchedCount}
          </span>
          {activeTab === MediaStatus.Watched && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-primary rounded-t-full"></span>
          )}
        </button>
      </div>

      <MediaList
        items={filteredItems}
        onStatusChange={handleStatusChange}
        onDelete={handleDeleteRequest}
        onRatingChange={handleRatingChange}
        title={activeTab === MediaStatus.Watchlist ? "Llista de seguiment" : "Historial de visualitzacions"}
        emptyMessage={
          filterQuery 
            ? "No s'han trobat resultats per a la teva cerca."
            : (activeTab === MediaStatus.Watchlist
                ? "No tens res pendent. Afegeix la teva primera pel·lícula o sèrie!"
                : "Encara no has marcat res com a vist.")
        }
      />

      {itemToDelete && (
        <ConfirmationModal
          itemTitle={mediaItems.find((i) => i.id === itemToDelete)?.title || ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
};

export default App;