import { elements } from '../data/elements';
import { polyatomicIons } from '../data/polyatomicIons';
import { calculateMolarMass, balanceEquation } from '../utils/chemistryUtils';

export interface StoichiometryRequest {
  equation: string;
  knownMasses?: Record<string, number>;
  knownMoles?: Record<string, number>;
}

export interface StoichiometryResult {
  reactants: ReactionComponent[];
  products: ReactionComponent[];
  limitingReagent?: string;
  success: boolean;
  error?: string;
}

export interface ReactionComponent {
  formula: string;
  molarMass: number;
  coefficient: number;
  mass: number;
  moles: number;
  isLimitingReagent?: boolean;
}

/**
 * Calculate stoichiometry for a chemical reaction
 */
export const calculateStoichiometry = async (request: StoichiometryRequest): Promise<StoichiometryResult> => {
  try {
    // Balance the equation if it's not already balanced
    const { equation, knownMasses = {}, knownMoles = {} } = request;
    
    // Split equation into reactants and products
    const parts = equation.split(/->|→|=/);
    if (parts.length !== 2) {
      throw new Error("Invalid equation format. Use -> or = to separate reactants and products");
    }
    
    const [reactantsStr, productsStr] = parts;
    
    // Try to parse as a balanced equation
    const reactants: ReactionComponent[] = [];
    const products: ReactionComponent[] = [];
    
    // Parse reactants
    const reactantParts = reactantsStr.split('+').map(r => r.trim());
    for (const part of reactantParts) {
      // Extract coefficient and formula
      const match = part.match(/^(\d*)(.+)$/);
      if (!match) continue;
      
      const coefficient = match[1] ? parseInt(match[1]) : 1;
      const formula = match[2].trim();
      
      try {
        const { molarMass } = calculateMolarMass(formula);
        
        const reactant: ReactionComponent = {
          formula,
          coefficient,
          molarMass,
          mass: knownMasses[formula] || 0,
          moles: knownMoles[formula] || 0
        };
        
        // If mass is provided but not moles, calculate moles
        if (reactant.mass && !reactant.moles) {
          reactant.moles = reactant.mass / molarMass;
        }
        // If moles is provided but not mass, calculate mass
        else if (reactant.moles && !reactant.mass) {
          reactant.mass = reactant.moles * molarMass;
        }
        
        reactants.push(reactant);
      } catch (error) {
        throw new Error(`Invalid formula: ${formula}`);
      }
    }
    
    // Parse products
    const productParts = productsStr.split('+').map(p => p.trim());
    for (const part of productParts) {
      // Extract coefficient and formula
      const match = part.match(/^(\d*)(.+)$/);
      if (!match) continue;
      
      const coefficient = match[1] ? parseInt(match[1]) : 1;
      const formula = match[2].trim();
      
      try {
        const { molarMass } = calculateMolarMass(formula);
        
        products.push({
          formula,
          coefficient,
          molarMass,
          mass: 0, // Will be calculated
          moles: 0  // Will be calculated
        });
      } catch (error) {
        throw new Error(`Invalid formula: ${formula}`);
      }
    }
    
    // Find limiting reagent
    let limitingReagentIndex = -1;
    let minProductAmount = Infinity;
    
    for (let i = 0; i < reactants.length; i++) {
      const reactant = reactants[i];
      
      // Skip if no mass or moles provided
      if (!reactant.mass && !reactant.moles) continue;
      
      const ratio = reactant.moles / reactant.coefficient;
      if (ratio < minProductAmount) {
        minProductAmount = ratio;
        limitingReagentIndex = i;
      }
    }
    
    // If no limiting reagent found, we need at least one known value
    if (limitingReagentIndex === -1) {
      throw new Error("Please provide mass or moles for at least one reactant");
    }
    
    const limitingReagent = reactants[limitingReagentIndex];
    reactants[limitingReagentIndex].isLimitingReagent = true;
    
    // Calculate stoichiometry based on limiting reagent
    const limitingRatio = limitingReagent.moles / limitingReagent.coefficient;
    
    // Calculate amounts for other reactants
    for (let i = 0; i < reactants.length; i++) {
      if (i === limitingReagentIndex) continue;
      
      const reactant = reactants[i];
      
      if (!reactant.mass && !reactant.moles) {
        // Calculate based on limiting reagent
        reactant.moles = reactant.coefficient * limitingRatio;
        reactant.mass = reactant.moles * reactant.molarMass;
      }
    }
    
    // Calculate product amounts
    for (const product of products) {
      product.moles = product.coefficient * limitingRatio;
      product.mass = product.moles * product.molarMass;
    }
    
    return {
      reactants,
      products,
      limitingReagent: limitingReagent.formula,
      success: true
    };
  } catch (error) {
    return {
      reactants: [],
      products: [],
      success: false,
      error: (error as Error).message
    };
  }
};

export interface YieldCalculationRequest {
  equation: string;
  limitingReagentFormula: string;
  limitingReagentMass: number;
  productFormula: string;
  actualProductMass: number;
}

export interface YieldCalculationResult {
  theoreticalYield: number;
  actualYield: number;
  percentYield: number;
  success: boolean;
  error?: string;
}

/**
 * Calculate theoretical, actual, and percent yield
 */
export const calculateYield = async (request: YieldCalculationRequest): Promise<YieldCalculationResult> => {
  try {
    const { equation, limitingReagentFormula, limitingReagentMass, productFormula, actualProductMass } = request;
    
    // Calculate stoichiometry first
    const stoichResult = await calculateStoichiometry({
      equation,
      knownMasses: { [limitingReagentFormula]: limitingReagentMass }
    });
    
    if (!stoichResult.success) {
      throw new Error(stoichResult.error);
    }
    
    // Find the product
    const product = stoichResult.products.find(p => p.formula === productFormula);
    if (!product) {
      throw new Error(`Product formula not found: ${productFormula}`);
    }
    
    const theoreticalYield = product.mass;
    const percentYield = (actualProductMass / theoreticalYield) * 100;
    
    return {
      theoreticalYield,
      actualYield: actualProductMass,
      percentYield,
      success: true
    };
  } catch (error) {
    return {
      theoreticalYield: 0,
      actualYield: 0,
      percentYield: 0,
      success: false,
      error: (error as Error).message
    };
  }
};
