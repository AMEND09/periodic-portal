# Periodic Portal

An interactive chemistry application featuring a periodic table, stoichiometry calculator, and other chemistry tools.

## Features

- Interactive Periodic Table
- Element and Polyatomic Ion Information
- Molar Mass Calculator
- Chemical Equation Balancer
- Chemical Nomenclature Tool
- Stoichiometry Calculator
- Solubility Rules Reference

## Chemistry API

The application includes a Chemistry API that can be used to offload calculations to a server if needed, but by default, all calculations are performed locally in the browser.

### Using the API

To use the API for calculations instead of local processing, update the `USE_API` flag in `/src/api/chemistryApi.ts` to `true`. Note that you'll need to have a backend server that implements the following endpoints:

- `POST /api/chemistry/stoichiometry` - Calculates stoichiometry for a chemical reaction
- `POST /api/chemistry/yield` - Calculates theoretical, actual, and percent yield
- `POST /api/chemistry/balance` - Balances a chemical equation
- `POST /api/chemistry/molar-mass` - Calculates the molar mass of a compound

### Local Implementation

Even when not using the API, the chemistry calculation functions are available through:

1. Direct imports from utility files:
   ```typescript
   import { calculateMolarMass, balanceEquation } from '../utils/chemistryUtils';
   import { findLimitingReagent, calculatePercentYield } from '../utils/stoichiometryUtils';
   ```

2. The Chemistry API client (which falls back to local calculations when the API is disabled):
   ```typescript
   import { ChemistryAPI } from '../api/chemistryApi';
   
   // Example usage
   const result = await ChemistryAPI.calculateStoichiometry({
     equation: '2H2 + O2 -> 2H2O',
     knownMasses: { 'H2': 2.0 }
   });
   ```

## Elements API

The application also includes an Elements API for accessing information about chemical elements. Like the Chemistry API, it falls back to local data when a server is not available.

### Using the Elements API

The Elements API is available through the following endpoints:

- `GET /api/elements` - Returns all elements
- `GET /api/elements/symbol/{symbol}` - Returns element data for the given symbol
- `GET /api/elements/number/{number}` - Returns element data for the given atomic number
- `GET /api/elements/search` - Searches for elements based on query parameters (symbol, number, name, category)

### Example Usage in JavaScript

```javascript
import { ElementsAPI } from '../api/elementsApi';

// Get all elements
const allElements = await ElementsAPI.getAllElements();

// Get element by symbol
const hydrogen = await ElementsAPI.getElementBySymbol('H');

// Get element by atomic number
const oxygen = await ElementsAPI.getElementByNumber(8);

// Search for elements
const metals = await ElementsAPI.searchElements({ category: 'transition-metal' });
```

## Development

This project is built with React, TypeScript, and TailwindCSS.

To run the application locally:

```bash
npm install
npm run dev
```

