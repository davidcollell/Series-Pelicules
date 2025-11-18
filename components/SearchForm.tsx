import React, { useState } from 'react';
import { PlusIcon } from './icons';

interface SearchFormProps {
  onAddItem: (query: string) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onAddItem, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onAddItem(query.trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex gap-2 sticky top-0 bg-brand-bg/80 backdrop-blur-sm z-10">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="p. ex., 'The Matrix', 'Stranger Things'..."
        className="flex-grow bg-brand-surface border border-gray-700 rounded-md py-2 px-4 focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <>
            <PlusIcon />
            <span className="hidden sm:inline ml-2">Afegeix</span>
          </>
        )}
      </button>
    </form>
  );
};

export default SearchForm;