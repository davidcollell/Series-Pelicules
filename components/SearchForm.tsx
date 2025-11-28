
import React, { useState } from 'react';
import { PlusIcon, SearchIcon } from './icons';

interface SearchFormProps {
  onAddItem: (query: string) => void;
  isLoading: boolean;
  onFilter: (query: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onAddItem, isLoading, onFilter }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onAddItem(query.trim());
      setQuery('');
      onFilter(''); // Reset filter after adding to show the new item at the top
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onFilter(value); // Update filter in parent component
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex gap-2 sticky top-0 bg-brand-bg/90 backdrop-blur-md z-10 border-b border-gray-800">
      <div className="flex-grow relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Cerca a la llista o afegeix un títol..."
          className="w-full bg-brand-surface border border-gray-700 rounded-md py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-primary focus:outline-none transition text-brand-text placeholder-gray-500"
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        className="bg-brand-primary hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed min-w-[100px]"
        disabled={isLoading || !query.trim()}
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
