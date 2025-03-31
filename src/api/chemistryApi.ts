import { StoichiometryRequest, StoichiometryResult, YieldCalculationRequest, YieldCalculationResult } from './chemistry';
import { calculateStoichiometry as calculateLocalStoichiometry, calculateYield as calculateLocalYield } from './chemistry';
import { balanceEquation } from '../utils/chemistryUtils';

// API base URL - in a real app, this would be configured based on environment
const API_BASE_URL = '/api/chemistry';

// Flag to determine if we should use the API or local calculation
// In a real app, this might be controlled by environment variables
const USE_API = false;

/**
 * Client for the Chemistry API
 * This can be used if you want to offload calculations to a server,
 * but the app will use local calculations by default
 */
export const ChemistryAPI = {
  /**
   * Calculate stoichiometry for a chemical reaction
   */
  calculateStoichiometry: async (request: StoichiometryRequest): Promise<StoichiometryResult> => {
    // Use local calculation if API is disabled
    if (!USE_API) {
      return calculateLocalStoichiometry(request);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/stoichiometry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate stoichiometry');
      }

      return await response.json();
    } catch (error) {
      console.error('API error, falling back to local calculation:', error);
      // Fallback to local calculation if API fails
      return calculateLocalStoichiometry(request);
    }
  },

  /**
   * Calculate reaction yield
   */
  calculateYield: async (request: YieldCalculationRequest): Promise<YieldCalculationResult> => {
    // Use local calculation if API is disabled
    if (!USE_API) {
      return calculateLocalYield(request);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/yield`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate yield');
      }

      return await response.json();
    } catch (error) {
      console.error('API error, falling back to local calculation:', error);
      // Fallback to local calculation if API fails
      return calculateLocalYield(request);
    }
  },

  /**
   * Balance a chemical equation
   */
  balanceEquation: async (equation: string): Promise<{
    balanced: string;
    coefficients: number[];
    error?: string;
  }> => {
    // Use local calculation if API is disabled
    if (!USE_API) {
      return balanceEquation(equation);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ equation }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to balance equation');
      }

      return await response.json();
    } catch (error) {
      console.error('API error, falling back to local calculation:', error);
      // Fallback to local calculation if API fails
      return balanceEquation(equation);
    }
  },

  /**
   * Calculate molar mass of a compound
   */
  calculateMolarMass: async (formula: string): Promise<{
    molarMass: number;
    components: Array<{ symbol: string; count: number; mass: number; totalMass: number }>;
    error?: string;
  }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/molar-mass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formula }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to calculate molar mass');
      }

      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return {
        molarMass: 0,
        components: [],
        error: (error as Error).message || 'Failed to communicate with the server'
      };
    }
  }
};
