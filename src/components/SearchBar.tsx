import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Element, elements } from '../data/elements';
import { PolyatomicIon, polyatomicIons } from '../data/polyatomicIons';
import { clearHighlightCache } from '../utils/elementUtils';
import { searchElements } from '../utils/elementUtils';
import { searchPolyatomicIons } from '../data/polyatomicIons';

type SearchResultType = 'element' | 'polyatomic';

interface SearchResult {
  type: SearchResultType;
  item: Element | PolyatomicIon;
  text: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onElementSelect?: (element: Element) => void;
  onPolyatomicSelect?: (ion: PolyatomicIon) => void;
}

// Popular search terms to suggest
const popularSearches = [
  "Hydrogen", 
  "Carbon", 
  "Oxygen", 
  "Gold", 
  "Silver", 
  "Sodium",
  "Calcium", 
  "Iron", 
  "Uranium", 
  "Nitrate", 
  "Ammonium", 
  "Phosphate"
];

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onElementSelect, onPolyatomicSelect }) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Perform search across both elements and polyatomic ions
  const performSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const elementResults = searchElements(searchTerm, elements).map(element => ({
      type: 'element' as SearchResultType,
      item: element,
      text: `${element.name} (${element.symbol})`
    }));

    const polyatomicResults = searchPolyatomicIons(searchTerm).map(ion => ({
      type: 'polyatomic' as SearchResultType,
      item: ion,
      text: `${ion.name} (${ion.formula})`
    }));

    // Combine results, sort alphabetically, and limit to 10 results
    const combinedResults = [...elementResults, ...polyatomicResults]
      .sort((a, b) => a.text.localeCompare(b.text))
      .slice(0, 10);

    setSearchResults(combinedResults);
  }, []);

  // Debounce search to avoid excessive re-renders
  const debouncedSearch = useCallback((searchTerm: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onSearch(searchTerm);
      performSearch(searchTerm);
      // Clean up highlight cache periodically
      clearHighlightCache();
    }, 300);
  }, [onSearch, performSearch]);

  useEffect(() => {
    debouncedSearch(query);
    
    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debouncedSearch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        (searchResults.length ? Math.min(prev + 1, searchResults.length - 1) : -1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && searchResults[selectedIndex]) {
        handleResultClick(searchResults[selectedIndex]);
      } else if (searchResults.length > 0) {
        // When pressing Enter with no selection, select the first result
        handleResultClick(searchResults[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.text);
    setSearchResults([]);
    setSelectedIndex(-1);
    
    if (result.type === 'element' && onElementSelect) {
      onElementSelect(result.item as Element);
    } else if (result.type === 'polyatomic' && onPolyatomicSelect) {
      onPolyatomicSelect(result.item as PolyatomicIon);
    }
  };

  return (
    <div className="mb-6 relative w-full max-w-md mx-auto">
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search elements, polyatomic ions, or chemical properties..."
          className="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            onClick={() => setQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {focused && (
        <div className="absolute z-10 w-full mt-1 bg-card rounded-md shadow-lg overflow-hidden border border-border left-0 right-0">
          {searchResults.length > 0 ? (
            <ul className="max-h-60 overflow-auto py-1">
              {searchResults.map((result, index) => (
                <li 
                  key={`${result.type}-${index}`}
                  className={`px-4 py-2 cursor-pointer hover:bg-primary/10 flex items-center ${
                    index === selectedIndex ? 'bg-primary/10' : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    result.type === 'element' ? 'bg-primary' : 'bg-amber-500'
                  }`}/>
                  <span className="flex-1">{result.text}</span>
                  <span className="text-xs text-muted-foreground">{
                    result.type === 'element' ? 'Element' : 'Polyatomic Ion'
                  }</span>
                </li>
              ))}
            </ul>
          ) : (
            !query && (
              <div className="p-3">
                <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, index) => (
                    <button
                      key={index}
                      className="px-2 py-1 text-xs bg-secondary rounded-full hover:bg-secondary/80"
                      onClick={() => setQuery(term)}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
