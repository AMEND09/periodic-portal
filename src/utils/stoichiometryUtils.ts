import { calculateMolarMass, parseChemicalFormula } from './chemistryUtils';

/**
 * Calculate the theoretical yield of a product based on reactants
 */
export const calculateTheoreticalYield = (
  equation: string,
  limitingReagentFormula: string,
  limitingReagentMass: number,
  productFormula: string
): number => {
  try {
    // Parse the equation
    const [reactantsStr, productsStr] = equation.split(/->|→|=/);
    if (!reactantsStr || !productsStr) {
      throw new Error('Invalid equation format');
    }
    
    // Parse reactants
    const reactants = reactantsStr.split('+').map(part => {
      const trimmed = part.trim();
      const match = trimmed.match(/^(\d*)(.+)$/);
      if (!match) {
        throw new Error(`Invalid reactant format: ${trimmed}`);
      }
      
      const coefficient = match[1] ? parseInt(match[1]) : 1;
      const formula = match[2].trim();
      
      return { formula, coefficient };
    });
    
    // Parse products
    const products = productsStr.split('+').map(part => {
      const trimmed = part.trim();
      const match = trimmed.match(/^(\d*)(.+)$/);
      if (!match) {
        throw new Error(`Invalid product format: ${trimmed}`);
      }
      
      const coefficient = match[1] ? parseInt(match[1]) : 1;
      const formula = match[2].trim();
      
      return { formula, coefficient };
    });
    
    // Find the limiting reagent
    const limitingReagent = reactants.find(r => r.formula === limitingReagentFormula);
    if (!limitingReagent) {
      throw new Error(`Limiting reagent not found: ${limitingReagentFormula}`);
    }
    
    // Find the product
    const product = products.find(p => p.formula === productFormula);
    if (!product) {
      throw new Error(`Product not found: ${productFormula}`);
    }
    
    // Calculate molar mass of limiting reagent
    const { molarMass: limitingMolarMass } = calculateMolarMass(limitingReagentFormula);
    
    // Calculate molar mass of product
    const { molarMass: productMolarMass } = calculateMolarMass(productFormula);
    
    // Calculate moles of limiting reagent
    const limitingReagentMoles = limitingReagentMass / limitingMolarMass;
    
    // Calculate moles of product
    const productMoles = (product.coefficient / limitingReagent.coefficient) * limitingReagentMoles;
    
    // Calculate mass of product
    const productMass = productMoles * productMolarMass;
    
    return productMass;
  } catch (error) {
    console.error('Error calculating theoretical yield:', error);
    throw error;
  }
};

/**
 * Calculate percent yield
 */
export const calculatePercentYield = (
  theoreticalYield: number,
  actualYield: number
): number => {
  return (actualYield / theoreticalYield) * 100;
};

/**
 * Find the limiting reagent in a reaction
 */
export const findLimitingReagent = (
  reagents: Array<{ formula: string; coefficient: number; mass: number }>
): string => {
  let limitingReagentFormula = '';
  let minMoles = Infinity;
  
  for (const reagent of reagents) {
    const { molarMass } = calculateMolarMass(reagent.formula);
    const moles = reagent.mass / molarMass;
    const molesPerCoefficient = moles / reagent.coefficient;
    
    if (molesPerCoefficient < minMoles) {
      minMoles = molesPerCoefficient;
      limitingReagentFormula = reagent.formula;
    }
  }
  
  return limitingReagentFormula;
};
