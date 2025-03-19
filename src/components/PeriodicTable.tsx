
import React, { useState } from 'react';
import { Element, elements, getElementColor, isPlaceholder } from '../data/elements';
import ElementCard from './ElementCard';
import SearchBar from './SearchBar';
import { searchElements, shouldHighlightElement } from '../utils/elementUtils';

const PeriodicTable: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [searchResults, setSearchResults] = useState<Element[]>([]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = searchElements(query, elements);
    setSearchResults(results);
  };

  const handleElementClick = (element: Element) => {
    setSelectedElement(element);
  };

  // Create a map to place elements in the correct position in the grid
  const elementMap: Record<string, Element> = {};
  elements.forEach(element => {
    if (element.group && element.period) {
      const key = `${element.period}-${element.group}`;
      elementMap[key] = element;
    }
  });

  // Render a single element tile
  const renderElementTile = (element: Element) => {
    const isHighlighted = shouldHighlightElement(element, searchResults);
    
    return (
      <div
        key={element.number}
        className={`element-tile cursor-pointer ${isHighlighted ? 'highlighted' : ''}`}
        style={{ backgroundColor: `${getElementColor(element.category)}20` }}
        onClick={() => handleElementClick(element)}
      >
        <div className="flex justify-between items-start text-xs">
          <span>{element.number}</span>
          <span className="opacity-70">{element.atomicMass}</span>
        </div>
        <div className="text-center my-1">
          <div className="text-xl font-bold">{element.symbol}</div>
          <div className="text-xs truncate">{element.name}</div>
        </div>
      </div>
    );
  };

  // Render the lanthanides and actinides rows
  const renderSpecialRows = () => {
    const lanthanides = elements.filter(el => el.category === 'lanthanide');
    const actinides = elements.filter(el => el.category === 'actinide');

    return (
      <div className="mt-4">
        <div className="grid grid-cols-15 gap-1 mb-1">
          <div className="col-span-2 flex items-center justify-center text-sm">
            Lanthanides
          </div>
          {lanthanides.map(element => renderElementTile(element))}
        </div>
        <div className="grid grid-cols-15 gap-1">
          <div className="col-span-2 flex items-center justify-center text-sm">
            Actinides
          </div>
          {actinides.map(element => renderElementTile(element))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 max-w-full overflow-x-auto">
      <SearchBar onSearch={handleSearch} />

      {searchResults.length > 0 && (
        <div className="mb-4 text-center text-sm">
          <span className="px-3 py-1 bg-primary/10 rounded-full">
            Found {searchResults.length} element{searchResults.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="element-grid overflow-x-auto pb-2">
        {/* Generate the grid for the main periodic table */}
        {Array.from({ length: 7 }, (_, rowIndex) => {
          const row = rowIndex + 1; // 1-indexed for period
          
          return (
            <React.Fragment key={`row-${row}`}>
              {Array.from({ length: 18 }, (_, colIndex) => {
                const col = colIndex + 1; // 1-indexed for group
                const key = `${row}-${col}`;
                const element = elementMap[key];
                const placeholderInfo = isPlaceholder(row, col);
                
                if (element) {
                  return renderElementTile(element);
                } else if (placeholderInfo) {
                  if (placeholderInfo.type === 'empty') {
                    return <div key={key} className="element-tile opacity-0"></div>;
                  } else {
                    return (
                      <div
                        key={key}
                        className="element-tile bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground"
                      >
                        {placeholderInfo.text}
                      </div>
                    );
                  }
                } else {
                  return <div key={key} className="element-tile"></div>;
                }
              })}
            </React.Fragment>
          );
        })}
      </div>

      {renderSpecialRows()}

      {selectedElement && (
        <ElementCard
          element={selectedElement}
          onClose={() => setSelectedElement(null)}
        />
      )}
    </div>
  );
};

export default PeriodicTable;
