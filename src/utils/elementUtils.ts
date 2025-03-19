
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

// Search function for elements
export const searchElements = (query: string, elementsList: Element[]): Element[] => {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return elementsList.filter(element => 
    element.name.toLowerCase().includes(normalizedQuery) ||
    element.symbol.toLowerCase().includes(normalizedQuery) ||
    element.number.toString().includes(normalizedQuery)
  );
};

// Get element by atomic number
export const getElementById = (id: number): Element | undefined => {
  return elements.find(element => element.number === id);
};

// Function to determine if an element should be highlighted based on search
export const shouldHighlightElement = (element: Element, searchResults: Element[]): boolean => {
  if (!searchResults.length) return false;
  return searchResults.some(result => result.number === element.number);
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
