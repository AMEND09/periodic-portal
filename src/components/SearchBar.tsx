
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, onSearch]);

  return (
    <div 
      className={`search-bar transition-all duration-300 ease-in-out ${
        isFocused ? 'ring-2 ring-primary/50 shadow-lg' : ''
      }`}
    >
      <Search className="text-muted-foreground h-5 w-5" />
      <input
        type="text"
        placeholder="Search element by name, symbol, or number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="bg-transparent flex-1 border-none outline-none text-foreground placeholder:text-muted-foreground"
      />
      {query && (
        <button 
          onClick={() => setQuery('')}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default SearchBar;
