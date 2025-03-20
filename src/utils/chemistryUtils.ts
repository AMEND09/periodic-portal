import { Element, elements, getElementBySymbol } from '../data/elements';
import { polyatomicIons, getPolyatomicIonByFormula } from '../data/polyatomicIons';

// Function to parse a chemical formula into its component elements and their counts
export function parseChemicalFormula(formula: string): Record<string, number> {
  // Remove all whitespace
  formula = formula.replace(/\s+/g, '');
  
  if (!formula) {
    throw new Error("Empty formula");
  }

  // Regular expression to match element symbols (one or two characters) followed by optional numbers
  const elementRegex = /([A-Z][a-z]?)(\d*)|(\(([^)]+)\)(\d+))/g;
  
  const elementCounts: Record<string, number> = {};
  let match;
  
  // Handle nested parentheses by recursive parsing
  const parseWithParentheses = (input: string): Record<string, number> => {
    const result: Record<string, number> = {};
    let remaining = input;
    
    while (remaining.length > 0) {
      // Check for opening parenthesis
      if (remaining[0] === '(') {
        let depth = 1;
        let closeIndex = 1;
        
        // Find matching closing parenthesis
        while (depth > 0 && closeIndex < remaining.length) {
          if (remaining[closeIndex] === '(') depth++;
          if (remaining[closeIndex] === ')') depth--;
          closeIndex++;
        }
        
        if (depth !== 0) {
          throw new Error("Mismatched parentheses");
        }
        
        // Extract content inside parentheses
        const content = remaining.substring(1, closeIndex - 1);
        
        // Find multiplier after closing parenthesis
        let multiplierStr = '';
        let i = closeIndex;
        while (i < remaining.length && /\d/.test(remaining[i])) {
          multiplierStr += remaining[i];
          i++;
        }
        
        const multiplier = multiplierStr ? parseInt(multiplierStr, 10) : 1;
        
        // Parse inside parentheses recursively
        const innerCounts = parseWithParentheses(content);
        
        // Apply multiplier
        for (const element in innerCounts) {
          result[element] = (result[element] || 0) + innerCounts[element] * multiplier;
        }
        
        // Move to next part
        remaining = remaining.substring(multiplierStr ? closeIndex + multiplierStr.length : closeIndex);
      } else {
        // Handle normal element symbol
        const elementMatch = /^([A-Z][a-z]?)(\d*)/.exec(remaining);
        if (!elementMatch) {
          throw new Error(`Invalid formula near: ${remaining}`);
        }
        
        const [fullMatch, symbol, countStr] = elementMatch;
        const count = countStr ? parseInt(countStr, 10) : 1;
        
        // Validate element exists
        if (!getElementBySymbol(symbol)) {
          throw new Error(`Unknown element symbol: ${symbol}`);
        }
        
        result[symbol] = (result[symbol] || 0) + count;
        remaining = remaining.substring(fullMatch.length);
      }
    }
    
    return result;
  };
  
  try {
    return parseWithParentheses(formula);
  } catch (error) {
    throw new Error(`Error parsing formula: ${(error as Error).message}`);
  }
}

// Calculate molar mass from a chemical formula
export function calculateMolarMass(formula: string): {
  molarMass: number;
  components: Array<{ symbol: string; count: number; mass: number; totalMass: number }>;
} {
  const elementCounts = parseChemicalFormula(formula);
  let totalMass = 0;
  const components: Array<{ symbol: string; count: number; mass: number; totalMass: number }> = [];
  
  for (const symbol in elementCounts) {
    const element = getElementBySymbol(symbol);
    if (element) {
      const count = elementCounts[symbol];
      const atomicMass = parseFloat(element.atomicMass);
      const massContribution = atomicMass * count;
      
      components.push({
        symbol: symbol,
        count: count,
        mass: atomicMass,
        totalMass: massContribution
      });
      
      totalMass += massContribution;
    } else {
      throw new Error(`Unknown element symbol: ${symbol}`);
    }
  }
  
  // Sort components by their order in the periodic table (atomic number)
  components.sort((a, b) => {
    const elemA = getElementBySymbol(a.symbol);
    const elemB = getElementBySymbol(b.symbol);
    return elemA && elemB ? elemA.number - elemB.number : 0;
  });
  
  return {
    molarMass: totalMass,
    components: components
  };
}

// Function to balance a chemical equation
export function balanceEquation(equation: string): string {
  // This would be a more complex implementation that would require
  // solving a system of linear equations. This is just a placeholder.
  return "Equation balancing functionality coming soon";
}
