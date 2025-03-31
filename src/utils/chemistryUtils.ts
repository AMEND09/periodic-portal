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
export function balanceEquation(equation: string): {
  balanced: string;
  coefficients: number[];
  error?: string;
} {
  try {
    // Clean up the equation
    equation = equation.replace(/\s+/g, '');
    
    // Split into reactants and products
    const sides = equation.split('->');
    if (sides.length !== 2) {
      const sides2 = equation.split('=');
      if (sides2.length !== 2) {
        throw new Error("Invalid equation format. Use either '->' or '=' to separate reactants and products.");
      } else {
        sides[0] = sides2[0];
        sides[1] = sides2[1];
      }
    }
    
    // Parse reactants and products
    const reactantStrings = sides[0].split('+');
    const productStrings = sides[1].split('+');
    
    // Parse each compound to get element counts
    const reactantCompounds = reactantStrings.map(parseCompound);
    const productCompounds = productStrings.map(parseCompound);
    
    // Get all unique elements
    const allElements = new Set<string>();
    [...reactantCompounds, ...productCompounds].forEach(compound => {
      Object.keys(compound.elements).forEach(element => {
        allElements.add(element);
      });
    });
    
    // Create matrix for solving the system of linear equations
    const elementArray = [...allElements];
    const numCompounds = reactantCompounds.length + productCompounds.length;
    const matrix: number[][] = [];
    
    // Fill matrix with element coefficients
    elementArray.forEach(element => {
      const row: number[] = Array(numCompounds + 1).fill(0);
      
      // Fill in reactants (positive values)
      reactantCompounds.forEach((compound, i) => {
        row[i] = compound.elements[element] || 0;
      });
      
      // Fill in products (negative values)
      productCompounds.forEach((compound, i) => {
        row[i + reactantCompounds.length] = -(compound.elements[element] || 0);
      });
      
      matrix.push(row);
    });
    
    // Add a constraint: set first coefficient to 1
    const constraintRow = Array(numCompounds + 1).fill(0);
    constraintRow[0] = 1;
    constraintRow[numCompounds] = 1;
    matrix.push(constraintRow);
    
    // Solve the system of linear equations using Gaussian elimination
    const solution = solveLinearSystem(matrix);
    
    // Find the least common multiple to convert to whole numbers
    let lcm = 1;
    for (let i = 0; i < solution.length; i++) {
      // Get the denominator part of the fraction
      const fraction = toFraction(solution[i]);
      lcm = leastCommonMultiple(lcm, fraction[1]);
    }
    
    // Multiply all coefficients by the LCM to get whole numbers
    const coefficients = solution.map(val => Math.round(val * lcm));
    
    // Generate the balanced equation
    let balancedEquation = '';
    
    // Add reactants
    reactantCompounds.forEach((compound, i) => {
      if (i > 0) balancedEquation += ' + ';
      if (coefficients[i] === 1) {
        balancedEquation += compound.formula;
      } else {
        balancedEquation += coefficients[i] + compound.formula;
      }
    });
    
    // Add separator
    balancedEquation += ' → ';
    
    // Add products
    productCompounds.forEach((compound, i) => {
      if (i > 0) balancedEquation += ' + ';
      const index = i + reactantCompounds.length;
      if (coefficients[index] === 1) {
        balancedEquation += compound.formula;
      } else {
        balancedEquation += coefficients[index] + compound.formula;
      }
    });
    
    return {
      balanced: balancedEquation,
      coefficients: coefficients
    };
  } catch (error) {
    return {
      balanced: equation,
      coefficients: [],
      error: (error as Error).message
    };
  }
}

// Helper function to parse a compound and count elements
function parseCompound(compoundStr: string): { formula: string; elements: Record<string, number> } {
  const elements: Record<string, number> = {};
  const formula = compoundStr.trim();
  
  // Use the parseChemicalFormula function we already have
  const elementCounts = parseChemicalFormula(formula);
  
  return {
    formula,
    elements: elementCounts
  };
}

// Function to solve a system of linear equations using Gaussian elimination
function solveLinearSystem(matrix: number[][]): number[] {
  const n = matrix.length;
  const m = matrix[0].length - 1; // Number of variables
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(matrix[j][i]) > Math.abs(matrix[maxRow][i])) {
        maxRow = j;
      }
    }
    
    // Swap rows if necessary
    [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]];
    
    // Skip if pivot is zero
    if (Math.abs(matrix[i][i]) < 1e-10) continue;
    
    // Eliminate
    for (let j = i + 1; j < n; j++) {
      const factor = matrix[j][i] / matrix[i][i];
      for (let k = i; k <= m; k++) {
        matrix[j][k] -= factor * matrix[i][k];
      }
    }
  }
  
  // Back substitution
  const solution = new Array(m).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = matrix[i][m];
    for (let j = i + 1; j < m; j++) {
      sum -= matrix[i][j] * solution[j];
    }
    if (Math.abs(matrix[i][i]) > 1e-10) {
      solution[i] = sum / matrix[i][i];
    }
  }
  
  return solution;
}

// Function to convert decimal to fraction
function toFraction(decimal: number): [number, number] {
  const tolerance = 1.0E-10;
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
  let b = decimal;
  
  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;
    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;
    b = 1 / (b - a);
  } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
  
  return [h1, k1];
}

// Function to find the greatest common divisor
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Function to find the least common multiple
function leastCommonMultiple(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// Chemical name to formula conversion
export function translateChemicalName(name: string): string {
  // Remove extra spaces and convert to lowercase for easier matching
  const normalizedName = name.trim().toLowerCase();
  
  // Check built-in dictionary first
  const commonNames: Record<string, string> = {
    // Common compounds with traditional names
    "water": "H2O",
    "ammonia": "NH3",
    "methane": "CH4",
    "carbon dioxide": "CO2",
    "carbon monoxide": "CO",
    "sodium chloride": "NaCl",
    "table salt": "NaCl",
    "potassium chloride": "KCl",
    "hydrogen peroxide": "H2O2",
    "glucose": "C6H12O6",
    "sulfuric acid": "H2SO4",
    "nitric acid": "HNO3",
    "hydrochloric acid": "HCl",
    "acetic acid": "CH3COOH",
    "sodium hydroxide": "NaOH",
    "potassium hydroxide": "KOH",
    "calcium carbonate": "CaCO3",
    "sodium bicarbonate": "NaHCO3",
    "baking soda": "NaHCO3",
    "sodium hydrogen carbonate": "NaHCO3",
    "calcium oxide": "CaO",
    "quicklime": "CaO",
    "calcium hydroxide": "Ca(OH)2",
    "slaked lime": "Ca(OH)2",
    "magnesium sulfate": "MgSO4",
    "epsom salt": "MgSO4·7H2O",
    "sodium carbonate": "Na2CO3",
    "washing soda": "Na2CO3",
    "ammonium chloride": "NH4Cl",
    "ferrous sulfate": "FeSO4",
    "ferric sulfate": "Fe2(SO4)3",
    "ferrous oxide": "FeO",
    "ferric oxide": "Fe2O3",
    "cuprous oxide": "Cu2O",
    "cupric oxide": "CuO",
    "lead dioxide": "PbO2",
    "mercuric oxide": "HgO",
    "mercurous chloride": "Hg2Cl2",
    "calomel": "Hg2Cl2",
    "mercuric chloride": "HgCl2",
    "copper sulfate": "CuSO4",
    "blue vitriol": "CuSO4·5H2O",
    "aluminum oxide": "Al2O3",
    "alumina": "Al2O3",
    "silicon dioxide": "SiO2",
    "silica": "SiO2",
    "calcium sulfate": "CaSO4",
    "gypsum": "CaSO4·2H2O",
    "sodium sulfate": "Na2SO4",
    "zinc sulfate": "ZnSO4",
    "white vitriol": "ZnSO4·7H2O",
    "manganese dioxide": "MnO2",
    "potassium permanganate": "KMnO4",
    "potassium dichromate": "K2Cr2O7",
    "silver nitrate": "AgNO3",
    "barium sulfate": "BaSO4",
    "diantimony trisulfide": "Sb2S3",
    "antimony trisulfide": "Sb2S3",
    "dihydrogen monoxide": "H2O",
    "sodium phosphate": "Na3PO4",
    "calcium phosphate": "Ca3(PO4)2",
    "potassium nitrate": "KNO3",
    "saltpeter": "KNO3",
    "ammonium nitrate": "NH4NO3",
    "iron pyrite": "FeS2",
    "fool's gold": "FeS2",
    "sodium nitrate": "NaNO3",
    "chile saltpeter": "NaNO3",
    "potassium cyanide": "KCN",
    "hydrogen cyanide": "HCN",
    "prussic acid": "HCN",
    "silver chloride": "AgCl",
    "laughing gas": "N2O",
    "nitrous oxide": "N2O",
    "freon": "CCl2F2",
    "dichlorodifluoromethane": "CCl2F2"
  };
  
  // Check if the name exists in our dictionary
  if (commonNames[normalizedName]) {
    return commonNames[normalizedName];
  }
  
  // Process systematic names using patterns
  const systemicMatch = processSystematicName(normalizedName);
  if (systemicMatch) {
    return systemicMatch;
  }
  
  // Try to parse ionic compound names (e.g., "sodium chloride" -> "NaCl")
  const ionicMatch = processIonicName(normalizedName);
  if (ionicMatch) {
    return ionicMatch;
  }
  
  throw new Error(`Could not translate "${name}" to a chemical formula. Try using the formula directly.`);
}

// Helper function to process systematic names like "diantimony trisulfide"
function processSystematicName(name: string): string | null {
  // Prefixes for counting atoms
  const prefixes: Record<string, number> = {
    "mono": 1, "di": 2, "tri": 3, "tetra": 4, "penta": 5,
    "hexa": 6, "hepta": 7, "octa": 8, "nona": 9, "deca": 10
  };
  
  // Common element name mappings
  const elementMappings: Record<string, string> = {
    "hydrogen": "H", "carbon": "C", "nitrogen": "N", "oxygen": "O",
    "fluorine": "F", "chlorine": "Cl", "bromine": "Br", "iodine": "I",
    "sulfur": "S", "phosphorus": "P", "lithium": "Li", "sodium": "Na",
    "potassium": "K", "magnesium": "Mg", "calcium": "Ca", "aluminum": "Al",
    "silicon": "Si", "iron": "Fe", "copper": "Cu", "silver": "Ag",
    "gold": "Au", "zinc": "Zn", "platinum": "Pt", "mercury": "Hg",
    "lead": "Pb", "tin": "Sn", "chromium": "Cr", "manganese": "Mn",
    "nickel": "Ni", "cobalt": "Co", "arsenic": "As", "antimony": "Sb",
    "boron": "B", "helium": "He", "neon": "Ne", "argon": "Ar",
    "krypton": "Kr", "xenon": "Xe", "radon": "Rn", "selenium": "Se",
    "tellurium": "Te", "barium": "Ba", "strontium": "Sr", "caesium": "Cs",
    "cesium": "Cs", "rubidium": "Rb", "francium": "Fr", "radium": "Ra",
    "beryllium": "Be", "tungsten": "W", "uranium": "U", "plutonium": "Pu",
    "titanium": "Ti", "scandium": "Sc", "gallium": "Ga", "germanium": "Ge",
    "bismuth": "Bi", "polonium": "Po", "astatine": "At", "thallium": "Tl",
    "indium": "In", "cadmium": "Cd", "palladium": "Pd", "rhodium": "Rh",
    "ruthenium": "Ru", "osmium": "Os", "iridium": "Ir", "hafnium": "Hf",
    "tantalum": "Ta", "rhenium": "Re", "zirconium": "Zr", "vanadium": "V",
    "niobium": "Nb", "molybdenum": "Mo", "yttrium": "Y"
  };
  
  // Common suffixes to remove for identification
  const suffixesToRemove = ["ide", "ate", "ite"];
  
  // Match patterns like "diantimony trisulfide"
  const systematicPattern = /^(?:(mono|di|tri|tetra|penta|hexa|hepta|octa|nona|deca))?([a-z]+)(?:\s+)(mono|di|tri|tetra|penta|hexa|hepta|octa|nona|deca)?([a-z]+)$/i;
  
  const match = name.match(systematicPattern);
  if (match) {
    const [_, firstPrefix, firstElement, secondPrefix, secondElement] = match;
    
    // Process first element name to get symbol
    let firstElementName = firstElement.toLowerCase();
    for (const suffix of suffixesToRemove) {
      if (firstElementName.endsWith(suffix)) {
        firstElementName = firstElementName.slice(0, -suffix.length);
      }
    }
    
    // Process second element name to get symbol
    let secondElementName = secondElement.toLowerCase();
    for (const suffix of suffixesToRemove) {
      if (secondElementName.endsWith(suffix)) {
        secondElementName = secondElementName.slice(0, -suffix.length);
      }
    }
    
    // Look up element symbols
    const firstSymbol = elementMappings[firstElementName];
    const secondSymbol = elementMappings[secondElementName];
    
    if (firstSymbol && secondSymbol) {
      const firstCount = firstPrefix ? prefixes[firstPrefix.toLowerCase()] : 1;
      const secondCount = secondPrefix ? prefixes[secondPrefix.toLowerCase()] : 1;
      
      // Construct the formula
      let formula = "";
      if (firstCount === 1) {
        formula += firstSymbol;
      } else {
        formula += firstSymbol + firstCount;
      }
      
      if (secondCount === 1) {
        formula += secondSymbol;
      } else {
        formula += secondSymbol + secondCount;
      }
      
      return formula;
    }
  }
  
  return null;
}

// Helper function to process ionic compound names
function processIonicName(name: string): string | null {
  // Check for common patterns in ionic names like "sodium chloride"
  const words = name.split(/\s+/);
  if (words.length === 2) {
    // Common cation mappings (first word)
    const cationMappings: Record<string, { symbol: string, charge: number }> = {
      "lithium": { symbol: "Li", charge: 1 },
      "sodium": { symbol: "Na", charge: 1 },
      "potassium": { symbol: "K", charge: 1 },
      "rubidium": { symbol: "Rb", charge: 1 },
      "cesium": { symbol: "Cs", charge: 1 },
      "francium": { symbol: "Fr", charge: 1 },
      "beryllium": { symbol: "Be", charge: 2 },
      "magnesium": { symbol: "Mg", charge: 2 },
      "calcium": { symbol: "Ca", charge: 2 },
      "strontium": { symbol: "Sr", charge: 2 },
      "barium": { symbol: "Ba", charge: 2 },
      "radium": { symbol: "Ra", charge: 2 },
      "aluminum": { symbol: "Al", charge: 3 },
      "aluminium": { symbol: "Al", charge: 3 },
      "zinc": { symbol: "Zn", charge: 2 },
      "iron": { symbol: "Fe", charge: 2 }, // Default to Fe(II), ferrous
      "ferrous": { symbol: "Fe", charge: 2 },
      "ferric": { symbol: "Fe", charge: 3 },
      "copper": { symbol: "Cu", charge: 2 }, // Default to Cu(II), cupric
      "cuprous": { symbol: "Cu", charge: 1 },
      "cupric": { symbol: "Cu", charge: 2 },
      "silver": { symbol: "Ag", charge: 1 },
      "gold": { symbol: "Au", charge: 3 }, // Default to Au(III)
      "ammonium": { symbol: "NH4", charge: 1 }
    };
    
    // Common anion mappings (second word)
    const anionMappings: Record<string, { symbol: string, charge: number }> = {
      "fluoride": { symbol: "F", charge: 1 },
      "chloride": { symbol: "Cl", charge: 1 },
      "bromide": { symbol: "Br", charge: 1 },
      "iodide": { symbol: "I", charge: 1 },
      "oxide": { symbol: "O", charge: 2 },
      "sulfide": { symbol: "S", charge: 2 },
      "nitride": { symbol: "N", charge: 3 },
      "phosphide": { symbol: "P", charge: 3 },
      "hydride": { symbol: "H", charge: 1 },
      "hydroxide": { symbol: "OH", charge: 1 },
      "cyanide": { symbol: "CN", charge: 1 },
      "nitrate": { symbol: "NO3", charge: 1 },
      "nitrite": { symbol: "NO2", charge: 1 },
      "sulfate": { symbol: "SO4", charge: 2 },
      "sulfite": { symbol: "SO3", charge: 2 },
      "carbonate": { symbol: "CO3", charge: 2 },
      "bicarbonate": { symbol: "HCO3", charge: 1 },
      "phosphate": { symbol: "PO4", charge: 3 },
      "acetate": { symbol: "CH3COO", charge: 1 },
      "permanganate": { symbol: "MnO4", charge: 1 },
      "dichromate": { symbol: "Cr2O7", charge: 2 },
      "chromate": { symbol: "CrO4", charge: 2 },
      "peroxide": { symbol: "O2", charge: 2 }
    };
    
    const cation = cationMappings[words[0].toLowerCase()];
    const anion = anionMappings[words[1].toLowerCase()];
    
    if (cation && anion) {
      // Calculate the number of cations and anions needed to balance charges
      const cationCount = anion.charge;
      const anionCount = cation.charge;
      
      // Simplify by finding the greatest common divisor
      const gcd = findGCD(cationCount, anionCount);
      const simplifiedCationCount = cationCount / gcd;
      const simplifiedAnionCount = anionCount / gcd;
      
      // Construct the formula
      let formula = "";
      
      // Add cation with subscript if needed
      if (simplifiedCationCount === 1) {
        formula += cation.symbol;
      } else {
        formula += cation.symbol + simplifiedCationCount;
      }
      
      // Add anion with subscript if needed
      if (simplifiedAnionCount === 1) {
        formula += anion.symbol;
      } else {
        // Add parentheses around polyatomic ions if needed
        if (anion.symbol.length > 1 && simplifiedAnionCount > 1) {
          formula += "(" + anion.symbol + ")" + simplifiedAnionCount;
        } else {
          formula += anion.symbol + simplifiedAnionCount;
        }
      }
      
      return formula;
    }
  }
  
  return null;
}

// Find greatest common divisor (Euclidean algorithm)
function findGCD(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

// Function to translate a chemical formula to a systematic name
export function translateChemicalFormula(formula: string): string {
  try {
    // First, see if it's a common compound with a traditional name
    const commonFormulasToNames = reverseCommonNameDictionary();
    if (commonFormulasToNames[formula]) {
      return commonFormulasToNames[formula];
    }

    // Parse the formula to get element counts
    const elementCounts = parseChemicalFormula(formula);
    
    // Identify compound type based on elements and structure
    if (isSimpleBinaryCompound(elementCounts)) {
      return nameBinaryCompound(elementCounts);
    }
    
    if (isTernaryOxoanionCompound(elementCounts, formula)) {
      return nameOxoanionCompound(formula);
    }
    
    if (isAcid(elementCounts, formula)) {
      return nameAcid(formula);
    }
    
    if (isHydrate(formula)) {
      return nameHydrate(formula);
    }
    
    // If we can't determine a more specific type, use generic naming
    return createSystematicName(elementCounts);
  } catch (error) {
    throw new Error(`Unable to translate formula to name: ${(error as Error).message}`);
  }
}

// Create a reverse mapping of the common names dictionary
function reverseCommonNameDictionary(): Record<string, string> {
  const commonNames: Record<string, string> = {
    "water": "H2O",
    "ammonia": "NH3",
    "methane": "CH4",
    // ...more existing names from translateChemicalName...
    "dichlorodifluoromethane": "CCl2F2"
  };
  
  const reversed: Record<string, string> = {};
  for (const [name, formula] of Object.entries(commonNames)) {
    reversed[formula] = name;
  }
  return reversed;
}

// Check if the compound is a simple binary compound (two elements)
function isSimpleBinaryCompound(elementCounts: Record<string, number>): boolean {
  return Object.keys(elementCounts).length === 2;
}

// Check if the compound contains a ternary oxoanion (contains oxygen and another non-metal)
function isTernaryOxoanionCompound(elementCounts: Record<string, number>, formula: string): boolean {
  const hasOxygen = elementCounts["O"] !== undefined;
  const hasNonMetal = Object.keys(elementCounts).some(el => 
    ["C", "N", "P", "S", "Se", "Cl", "Br", "I"].includes(el));
  
  return hasOxygen && hasNonMetal && Object.keys(elementCounts).length >= 3;
}

// Check if the compound is an acid
function isAcid(elementCounts: Record<string, number>, formula: string): boolean {
  return elementCounts["H"] !== undefined && 
    (formula.startsWith("H") || formula.includes("(H)")) &&
    Object.keys(elementCounts).some(el => ["Cl", "Br", "I", "F", "S", "N", "C", "P"].includes(el));
}

// Check if the compound is a hydrate
function isHydrate(formula: string): boolean {
  return formula.includes("·") && formula.includes("H2O");
}

// Name a binary compound (composed of two elements)
function nameBinaryCompound(elementCounts: Record<string, number>): string {
  const elements = Object.keys(elementCounts);
  
  // Determine which is the metal/more electropositive element (usually comes first in the formula)
  const nonMetals = ["H", "B", "C", "N", "O", "F", "Ne", "Si", "P", "S", "Cl", "Ar", 
                     "As", "Se", "Br", "Kr", "Te", "I", "Xe", "At", "Rn"];
  
  let cation, anion;
  if (nonMetals.includes(elements[0]) && nonMetals.includes(elements[1])) {
    // If both are non-metals, the one with lower electronegativity goes first
    const electronegativities: Record<string, number> = {
      "H": 2.20, "C": 2.55, "N": 3.04, "O": 3.44, "F": 3.98, "P": 2.19, 
      "S": 2.58, "Cl": 3.16, "Br": 2.96, "I": 2.66
    };
    
    if ((electronegativities[elements[0]] || 0) < (electronegativities[elements[1]] || 0)) {
      cation = elements[0];
      anion = elements[1];
    } else {
      cation = elements[1];
      anion = elements[0];
    }
  } else {
    // For metal/non-metal compounds, metal is the cation
    const element0IsMetal = !nonMetals.includes(elements[0]);
    cation = element0IsMetal ? elements[0] : elements[1];
    anion = element0IsMetal ? elements[1] : elements[0];
  }
  
  // Get element names
  const cationData = getElementBySymbol(cation);
  const anionData = getElementBySymbol(anion);
  
  if (!cationData || !anionData) {
    throw new Error(`Unknown elements in formula: ${cation}, ${anion}`);
  }
  
  // Convert anion name to its ionic form
  let anionName = anionData.name.toLowerCase();
  if (anionName.endsWith("gen")) {
    anionName = anionName.replace("gen", "ide");
  } else if (anionName.endsWith("ine")) {
    anionName = anionName.replace("ine", "ide");
  } else if (anionName.endsWith("on")) {
    anionName = anionName.replace("on", "ide");
  } else if (anionName === "oxygen") {
    anionName = "oxide";
  } else if (anionName === "sulfur") {
    anionName = "sulfide";
  } else {
    anionName += "ide";
  }
  
  // Add Roman numerals for transition metals with multiple oxidation states
  let cationName = cationData.name;
  const transitionMetals = ["Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn"];
  if (transitionMetals.includes(cation)) {
    const anionCharge = anionData.symbol === "O" ? 2 : 1;
    const cationCount = elementCounts[cation];
    const anionCount = elementCounts[anion];
    const oxidationState = (anionCharge * anionCount) / cationCount;
    
    if (oxidationState > 1) {
      // Convert to Roman numerals
      const oxidationStateRoman = toRoman(oxidationState);
      cationName += ` (${oxidationStateRoman})`;
    }
  }
  
  // Add prefixes for non-metal/non-metal compounds
  if (nonMetals.includes(cation) && nonMetals.includes(anion)) {
    const prefixes = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "nona", "deca"];
    const cationPrefix = elementCounts[cation] > 1 ? prefixes[elementCounts[cation]] : "";
    const anionPrefix = elementCounts[anion] > 1 ? prefixes[elementCounts[anion]] : "";
    
    return `${cationPrefix}${cationData.name.toLowerCase()} ${anionPrefix}${anionName}`;
  }
  
  return `${cationName} ${anionName}`;
}

// Name compounds with oxoanions
function nameOxoanionCompound(formula: string): string {
  // This is a simplified implementation that handles common patterns
  const oxoanionPatterns: Record<string, { prefix: string, suffix: string, charge: number }> = {
    "NO3": { prefix: "nitrat", suffix: "e", charge: -1 },
    "NO2": { prefix: "nitrit", suffix: "e", charge: -1 },
    "SO4": { prefix: "sulfat", suffix: "e", charge: -2 },
    "SO3": { prefix: "sulfit", suffix: "e", charge: -2 },
    "PO4": { prefix: "phosphat", suffix: "e", charge: -3 },
    "CO3": { prefix: "carbonat", suffix: "e", charge: -2 },
    "ClO4": { prefix: "perchlorat", suffix: "e", charge: -1 },
    "ClO3": { prefix: "chlorat", suffix: "e", charge: -1 },
    "ClO2": { prefix: "chlorit", suffix: "e", charge: -1 },
    "ClO": { prefix: "hypochlorit", suffix: "e", charge: -1 },
    "CrO4": { prefix: "chromat", suffix: "e", charge: -2 },
    "Cr2O7": { prefix: "dichromat", suffix: "e", charge: -2 },
    "MnO4": { prefix: "permanganat", suffix: "e", charge: -1 }
  };
  
  // Identify the oxoanion part of the formula
  for (const [pattern, info] of Object.entries(oxoanionPatterns)) {
    if (formula.includes(pattern)) {
      // Extract the cation part
      const parts = formula.split(pattern);
      const cationPart = parts[0].replace(/[()]/g, "");
      
      // Identify the cation
      const cationSymbol = cationPart.match(/[A-Z][a-z]?/g)?.[0];
      if (!cationSymbol) continue;
      
      const cationElement = getElementBySymbol(cationSymbol);
      if (!cationElement) continue;
      
      // For elements with multiple oxidation states, add Roman numerals
      let cationName = cationElement.name;
      if (["Fe", "Cu", "Co", "Mn", "Pb", "Sn", "Hg"].includes(cationSymbol)) {
        const oxidationState = info.charge * (formula.includes("2" + pattern) ? 2 : 1) * -1;
        if (oxidationState > 1) {
          cationName += ` (${toRoman(oxidationState)})`;
        }
      }
      
      return `${cationName} ${info.prefix}${info.suffix}`;
    }
  }
  
  return createSystematicName(parseChemicalFormula(formula));
}

// Name acids
function nameAcid(formula: string): string {
  // Binary acids (HF, HCl, HBr, HI)
  const binaryAcidPatterns: Record<string, string> = {
    "HF": "hydrofluoric acid",
    "HCl": "hydrochloric acid",
    "HBr": "hydrobromic acid",
    "HI": "hydroiodic acid",
    "H2S": "hydrosulfuric acid"
  };
  
  if (binaryAcidPatterns[formula]) {
    return binaryAcidPatterns[formula];
  }
  
  // Oxoacids
  const oxoacidPatterns: Record<string, { hypo: string, regular: string, per: string }> = {
    "Cl": { hypo: "hypochlorous acid", regular: "chlorous acid", per: "perchloric acid" },
    "Br": { hypo: "hypobromous acid", regular: "bromous acid", per: "perbromic acid" },
    "I": { hypo: "hypoiodous acid", regular: "iodous acid", per: "periodic acid" },
    "S": { hypo: "hyposulfurous acid", regular: "sulfurous acid", per: "persulfuric acid" }
  };
  
  // Check for common oxoacid patterns
  if (formula === "H2SO4") return "sulfuric acid";
  if (formula === "H2SO3") return "sulfurous acid";
  if (formula === "HNO3") return "nitric acid";
  if (formula === "HNO2") return "nitrous acid";
  if (formula === "H3PO4") return "phosphoric acid";
  if (formula === "H2CO3") return "carbonic acid";
  if (formula === "CH3COOH" || formula === "HC2H3O2") return "acetic acid";
  
  // Default case: return a systematic name
  return createSystematicName(parseChemicalFormula(formula)) + " (acid)";
}

// Name hydrates
function nameHydrate(formula: string): string {
  const parts = formula.split("·");
  if (parts.length !== 2 || !parts[1].includes("H2O")) {
    return createSystematicName(parseChemicalFormula(formula));
  }
  
  const compoundFormula = parts[0];
  const waterCount = parseInt(parts[1].replace("H2O", "")) || 1;
  
  const compoundName = translateChemicalFormula(compoundFormula);
  
  // Add the appropriate prefix for the water molecules
  const hydratePrefix = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "nona", "deca", "undeca", "dodeca"][waterCount] || waterCount.toString();
  
  return `${compoundName} ${hydratePrefix}hydrate`;
}

// Create a systematic name for a compound that doesn't fit specific patterns
function createSystematicName(elementCounts: Record<string, number>): string {
  const prefixes = ["", "mono", "di", "tri", "tetra", "penta", "hexa", "hepta", "octa", "nona", "deca"];
  
  // Sort elements by electronegativity (simplification: use alphabetical order)
  const sortedElements = Object.keys(elementCounts).sort();
  
  let name = "";
  sortedElements.forEach((symbol, index) => {
    const element = getElementBySymbol(symbol);
    if (!element) return;
    
    const count = elementCounts[symbol];
    const prefix = count > 1 ? prefixes[count] : "";
    
    // For the last element (anion), change the ending
    if (index === sortedElements.length - 1) {
      let elementName = element.name.toLowerCase();
      if (elementName === "oxygen") elementName = "ox";
      if (elementName === "sulfur") elementName = "sulf";
      if (elementName === "nitrogen") elementName = "nitr";
      if (elementName === "fluorine") elementName = "fluor";
      if (elementName === "chlorine") elementName = "chlor";
      if (elementName === "bromine") elementName = "brom";
      if (elementName === "iodine") elementName = "iod";
      
      name += prefix + elementName + "ide";
    } else {
      name += prefix + element.name.toLowerCase() + " ";
    }
  });
  
  return name;
}

// Convert number to Roman numeral (for oxidation states)
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  
  let result = "";
  let n = num;
  
  for (const [value, numeral] of romanNumerals) {
    while (n >= value) {
      result += numeral;
      n -= value;
    }
  }
  
  return result;
}

// Function to get IUPAC naming rules for a specific compound type
export function getNamingRules(compoundType: string): string[] {
  const rules: Record<string, string[]> = {
    "binary": [
      "For compounds with two elements, name the more electropositive element first (usually the metal or element further left/down in the periodic table).",
      "The second element (usually non-metal) gets an '-ide' ending.",
      "For compounds between non-metals, use prefixes (mono-, di-, tri-, etc.) to indicate the number of atoms.",
      "For metals with multiple oxidation states, use Roman numerals to indicate the charge."
    ],
    "ionic": [
      "Name the cation first, followed by the anion.",
      "Monoatomic cations use the element name (e.g., sodium, calcium).",
      "Transition metals with multiple oxidation states use Roman numerals (e.g., iron(III)).",
      "Monoatomic anions replace the element ending with '-ide' (e.g., oxide, chloride)."
    ],
    "oxoacid": [
      "Acids with '-ate' anions change to '-ic acid' (e.g., sulfate → sulfuric acid).",
      "Acids with '-ite' anions change to '-ous acid' (e.g., sulfite → sulfurous acid).",
      "The prefix 'hypo-' with '-ite' anion becomes 'hypo-' with '-ous acid'.",
      "The prefix 'per-' with '-ate' anion becomes 'per-' with '-ic acid'."
    ],
    "hydrate": [
      "Name the ionic compound first, followed by the prefix indicating water molecules.",
      "Use prefixes mono-, di-, tri-, etc. to indicate the number of water molecules.",
      "End with the word 'hydrate'."
    ],
    "salt": [
      "Name the cation first, followed by the anion.",
      "Polyatomic anions often end in '-ate' or '-ite'.",
      "Hydrogen-containing anions use the prefix 'hydrogen' or 'bi-'."
    ]
  };
  
  return rules[compoundType] || rules["binary"];
}
