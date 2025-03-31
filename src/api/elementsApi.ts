import { Element, elements, getElementBySymbol, getElementByNumber } from '../data/elements';

export interface ElementSearchParams {
  symbol?: string;
  number?: number;
  name?: string;
  category?: string;
}

/**
 * Client for the Elements REST API
 */
export const ElementsAPI = {
  /**
   * Get all elements
   */
  getAllElements: async (): Promise<Element[]> => {
    try {
      const response = await fetch('/api/elements');
      
      if (!response.ok) {
        throw new Error('Failed to fetch elements');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      // Fall back to local data
      return elements;
    }
  },
  
  /**
   * Get an element by its symbol
   */
  getElementBySymbol: async (symbol: string): Promise<Element | null> => {
    try {
      const response = await fetch(`/api/elements/symbol/${symbol}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch element');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      // Fall back to local data
      return getElementBySymbol(symbol);
    }
  },
  
  /**
   * Get an element by its atomic number
   */
  getElementByNumber: async (number: number): Promise<Element | null> => {
    try {
      const response = await fetch(`/api/elements/number/${number}`);
      
      if (response.status === 404) {
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch element');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      // Fall back to local data
      return getElementByNumber(number);
    }
  },
  
  /**
   * Search elements by various parameters
   */
  searchElements: async (params: ElementSearchParams): Promise<Element[]> => {
    try {
      // Build query string
      const queryParams = new URLSearchParams();
      if (params.symbol) queryParams.append('symbol', params.symbol);
      if (params.number) queryParams.append('number', params.number.toString());
      if (params.name) queryParams.append('name', params.name);
      if (params.category) queryParams.append('category', params.category);
      
      const response = await fetch(`/api/elements/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to search elements');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      // Fall back to local filtering
      let results = elements;
      
      if (params.symbol) {
        results = results.filter(e => 
          e.symbol.toLowerCase().includes(params.symbol!.toLowerCase())
        );
      }
      
      if (params.number) {
        results = results.filter(e => e.number === params.number);
      }
      
      if (params.name) {
        results = results.filter(e => 
          e.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }
      
      if (params.category) {
        results = results.filter(e => e.category === params.category);
      }
      
      return results;
    }
  }
};
