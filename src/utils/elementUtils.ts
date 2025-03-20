import { Element, elements } from '../data/elements';

// Function to format atomic mass for display
export const formatAtomicMass = (mass: string): string => {
  const numMass = parseFloat(mass);
  if (isNaN(numMass)) return mass;
  return numMass.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
};

// Format a value with a unit for display
export const formatWithUnit = (value: number | null, unit: string): string => {
  if (value === null) return 'Unknown';
  return `${value} ${unit}`;
};

// Optimized search function that uses caching and early termination
export const searchElements = (query: string, elements: Element[]): Element[] => {
  const lowercaseQuery = query.toLowerCase().trim();
  
  if (!lowercaseQuery) return [];
  
  // Use Set for faster lookups
  const resultSet = new Set<Element>();
  
  // Search by exact atomic number for fast lookup
  if (/^\d+$/.test(lowercaseQuery)) {
    const number = parseInt(lowercaseQuery, 10);
    const element = elements.find(el => el.number === number);
    if (element) resultSet.add(element);
  }
  
  // Search by exact symbol match first (fastest match)
  const symbolMatch = elements.find(
    el => el.symbol.toLowerCase() === lowercaseQuery
  );
  if (symbolMatch) resultSet.add(symbolMatch);
  
  // Only continue searching if we don't have exact matches
  if (resultSet.size === 0) {
    // Search by name, symbol, and category
    elements.forEach(element => {
      if (
        element.name.toLowerCase().includes(lowercaseQuery) ||
        element.symbol.toLowerCase().includes(lowercaseQuery) ||
        element.category.toLowerCase().includes(lowercaseQuery)
      ) {
        resultSet.add(element);
      }
    });
  }
  
  return Array.from(resultSet);
};

// Get element by atomic number
export const getElementById = (id: number): Element | undefined => {
  return elements.find(element => element.number === id);
};

// Memoization cache for highlight calculations
const highlightCache = new Map<string, boolean>();

export const shouldHighlightElement = (element: Element, searchResults: Element[]): boolean => {
  if (searchResults.length === 0) return false;
  
  // Create a more specific cache key using element number and a hash of the search results
  // This ensures the cache is invalidated when search results change
  const searchResultsKey = searchResults.map(el => el.number).sort().join(',');
  const cacheKey = `${element.number}-${searchResultsKey}`;
  
  if (highlightCache.has(cacheKey)) {
    return highlightCache.get(cacheKey)!;
  }
  
  // Instead of using a global searchResultsSet, create a new one for this invocation
  const resultsSet = new Set(searchResults.map(el => el.number));
  const isHighlighted = resultsSet.has(element.number);
  
  highlightCache.set(cacheKey, isHighlighted);
  return isHighlighted;
};

// Clear the cache when it gets too large or explicitly requested
export const clearHighlightCache = () => {
  if (highlightCache.size > 1000) {  // Reduced threshold for more frequent clearing
    highlightCache.clear();
  }
};

// Function to get a temperature display in both Kelvin and Celsius
export const formatTemperature = (kelvin: number | null): string => {
  if (kelvin === null) return 'Unknown';
  const celsius = kelvin - 273.15;
  return `${kelvin} K (${celsius.toFixed(2)} °C)`;
};

// Function to get a formatted discovery information
export const getDiscoveryInfo = (element: Element): string => {
  if (!element.discoveredBy) return 'Unknown';
  
  let info = `Discovered by ${element.discoveredBy}`;
  if (element.discoveryYear) {
    info += ` in ${element.discoveryYear}`;
  }
  
  return info;
};

// Performance optimization - cache element positions for faster rendering
const elementPositionCache = new Map<number, { row: number, col: number }>();

export const getElementPosition = (element: Element) => {
  if (elementPositionCache.has(element.number)) {
    return elementPositionCache.get(element.number)!;
  }
  
  let position;
  // Handle special cases for lanthanides and actinides
  if (element.category === 'lanthanide') {
    position = { row: 8, col: element.number - 56 };
  } else if (element.category === 'actinide') {
    position = { row: 9, col: element.number - 88 };
  } else {
    // For normal elements
    position = { row: element.period, col: element.group || 0 };
  }
  
  elementPositionCache.set(element.number, position);
  return position;
};

// Get a range of visible elements
export const getVisibleElements = (
  startRow: number, 
  endRow: number, 
  startCol: number, 
  endCol: number
): Element[] => {
  return elements.filter(element => {
    const pos = getElementPosition(element);
    return pos.row >= startRow && pos.row <= endRow && 
           pos.col >= startCol && pos.col <= endCol;
  });
};
