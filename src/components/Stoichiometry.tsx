import React, { useState, useCallback } from 'react';
import { calculateMolarMass, parseChemicalFormula } from '../utils/chemistryUtils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ReactionComponent {
  formula: string;
  molarMass: number;
  coefficient: number;
  mass: string;
  moles: string;
  isLimitingReagent?: boolean;
}

const Stoichiometry: React.FC = () => {
  const [equation, setEquation] = useState('');
  const [parsedEquation, setParsedEquation] = useState<{
    reactants: ReactionComponent[];
    products: ReactionComponent[];
    error?: string;
  }>({
    reactants: [],
    products: []
  });
  const [showResults, setShowResults] = useState(false);

  const parseEquation = useCallback((eq: string) => {
    if (!eq.trim()) {
      setParsedEquation({
        reactants: [],
        products: [],
        error: 'Please enter a balanced chemical equation'
      });
      setShowResults(false);
      return;
    }

    try {
      // Split equation into reactants and products
      const [reactantsStr, productsStr] = eq.split(/->|→|=/);
      
      if (!reactantsStr || !productsStr) {
        throw new Error('Invalid equation format. Use -> or = to separate reactants and products');
      }
      
      // Parse reactants
      const reactants = reactantsStr.split('+').map(part => {
        const trimmed = part.trim();
        // Extract coefficient if present
        const match = trimmed.match(/^(\d+)(.+)$/);
        const coefficient = match ? parseInt(match[1]) : 1;
        const formula = match ? match[2].trim() : trimmed;
        
        // Calculate molar mass
        const { molarMass } = calculateMolarMass(formula);
        
        return {
          formula,
          molarMass,
          coefficient,
          mass: '',
          moles: ''
        };
      });
      
      // Parse products
      const products = productsStr.split('+').map(part => {
        const trimmed = part.trim();
        // Extract coefficient if present
        const match = trimmed.match(/^(\d+)(.+)$/);
        const coefficient = match ? parseInt(match[1]) : 1;
        const formula = match ? match[2].trim() : trimmed;
        
        // Calculate molar mass
        const { molarMass } = calculateMolarMass(formula);
        
        return {
          formula,
          molarMass,
          coefficient,
          mass: '',
          moles: ''
        };
      });
      
      setParsedEquation({ reactants, products });
    } catch (error) {
      setParsedEquation({
        reactants: [],
        products: [],
        error: (error as Error).message
      });
      setShowResults(false);
    }
  }, []);

  const handleInputChange = (value: string, index: number, type: 'reactants' | 'products', field: 'mass' | 'moles') => {
    setParsedEquation(prev => {
      const updated = { ...prev };
      updated[type] = [...prev[type]];
      updated[type][index] = { ...updated[type][index], [field]: value };
      return updated;
    });
  };

  const calculateStoichiometry = () => {
    // Create a copy of the current state
    const updated = { 
      reactants: [...parsedEquation.reactants],
      products: [...parsedEquation.products]
    };
    
    // Find the limiting reagent by checking which reactant will produce the least amount of product
    let limitingReagentIndex = -1;
    let minProductAmount = Infinity;
    
    // Check which reactant has values entered
    const reactantsWithValues = updated.reactants.map((reactant, index) => {
      if (reactant.mass && !isNaN(parseFloat(reactant.mass))) {
        const moles = parseFloat(reactant.mass) / reactant.molarMass;
        updated.reactants[index].moles = moles.toFixed(4);
        return { index, moles };
      } else if (reactant.moles && !isNaN(parseFloat(reactant.moles))) {
        updated.reactants[index].mass = (parseFloat(reactant.moles) * reactant.molarMass).toFixed(4);
        return { index, moles: parseFloat(reactant.moles) };
      }
      return null;
    }).filter(Boolean);
    
    if (reactantsWithValues.length === 0) {
      setParsedEquation({
        ...updated,
        error: 'Enter mass or moles for at least one reactant'
      });
      return;
    }
    
    // Determine limiting reagent by comparing moles/coefficient ratios
    reactantsWithValues.forEach(item => {
      if (item) {
        const { index, moles } = item;
        const reactant = updated.reactants[index];
        const ratio = moles / reactant.coefficient;
        
        if (ratio < minProductAmount) {
          minProductAmount = ratio;
          limitingReagentIndex = index;
        }
      }
    });
    
    // Mark the limiting reagent
    if (limitingReagentIndex >= 0) {
      updated.reactants = updated.reactants.map((r, i) => ({ 
        ...r, 
        isLimitingReagent: i === limitingReagentIndex 
      }));
    }
    
    // Calculate masses and moles for all other reactants based on the limiting reagent
    const limitingRatio = minProductAmount;
    
    // Calculate remaining reactants if not entered
    updated.reactants.forEach((reactant, i) => {
      if (i !== limitingReagentIndex) {
        const expectedMoles = reactant.coefficient * limitingRatio;
        
        if (!reactant.moles && !reactant.mass) {
          updated.reactants[i].moles = expectedMoles.toFixed(4);
          updated.reactants[i].mass = (expectedMoles * reactant.molarMass).toFixed(4);
        }
      }
    });
    
    // Calculate products based on limiting reagent
    updated.products.forEach((product, i) => {
      const productMoles = product.coefficient * limitingRatio;
      updated.products[i].moles = productMoles.toFixed(4);
      updated.products[i].mass = (productMoles * product.molarMass).toFixed(4);
    });
    
    setParsedEquation(updated);
    setShowResults(true);
  };

  const examples = [
    '2H2 + O2 -> 2H2O',
    'CH4 + 2O2 -> CO2 + 2H2O',
    '2C8H18 + 25O2 -> 16CO2 + 18H2O',
    'Fe2O3 + 3CO -> 2Fe + 3CO2',
    'Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stoichiometry Calculator</CardTitle>
        <CardDescription>
          Calculate masses and moles in chemical reactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <label className="block text-sm mb-1">Balanced Chemical Equation</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={equation}
              onChange={(e) => setEquation(e.target.value)}
              placeholder="e.g., 2H2 + O2 -> 2H2O"
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={() => parseEquation(equation)}
              className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-md text-sm"
            >
              Parse
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-xs text-muted-foreground">Examples:</span>
            {examples.map(ex => (
              <button
                key={ex}
                onClick={() => {
                  setEquation(ex);
                  parseEquation(ex);
                }}
                className="px-2 py-0.5 text-xs bg-secondary/30 hover:bg-secondary/40 rounded-full"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
        
        {parsedEquation.error ? (
          <div className="p-3 bg-red-500/10 rounded text-red-500 text-sm">
            {parsedEquation.error}
          </div>
        ) : (
          <>
            {parsedEquation.reactants.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Reactants</h3>
                <div className="bg-secondary/10 rounded-md p-3">
                  {parsedEquation.reactants.map((reactant, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 last:mb-0">
                      <div className="flex items-center">
                        <span className="bg-secondary/20 px-2 py-1 rounded mr-2 text-sm font-mono">
                          {reactant.coefficient > 1 ? reactant.coefficient : ''}{reactant.formula}
                        </span>
                        {reactant.isLimitingReagent && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded">
                            Limiting
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Mass (g)</label>
                        <input
                          type="number"
                          value={reactant.mass}
                          onChange={(e) => handleInputChange(e.target.value, index, 'reactants', 'mass')}
                          placeholder="Enter mass"
                          className="w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Moles (mol)</label>
                        <input
                          type="number"
                          value={reactant.moles}
                          onChange={(e) => handleInputChange(e.target.value, index, 'reactants', 'moles')}
                          placeholder="Enter moles"
                          className="w-full px-3 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {parsedEquation.products.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium">Products</h3>
                  {parsedEquation.reactants.length > 0 && (
                    <button
                      onClick={calculateStoichiometry}
                      className="text-xs px-3 py-1 bg-green-500/20 hover:bg-green-500/30 rounded-md"
                    >
                      Calculate
                    </button>
                  )}
                </div>
                
                <div className="bg-secondary/10 rounded-md p-3">
                  {parsedEquation.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 last:mb-0">
                      <div className="flex items-center">
                        <span className="bg-secondary/20 px-2 py-1 rounded mr-2 text-sm font-mono">
                          {product.coefficient > 1 ? product.coefficient : ''}{product.formula}
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Mass (g)</label>
                        <div className="w-full px-3 py-1 border rounded-md bg-secondary/5 text-sm">
                          {showResults ? product.mass : '---'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Moles (mol)</label>
                        <div className="w-full px-3 py-1 border rounded-md bg-secondary/5 text-sm">
                          {showResults ? product.moles : '---'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {showResults && (
              <div className="mt-4 p-3 bg-green-500/10 rounded-md">
                <h3 className="text-sm font-medium mb-2">Reaction Summary</h3>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Component</th>
                      <th className="text-right py-1">Coefficient</th>
                      <th className="text-right py-1">Molar Mass (g/mol)</th>
                      <th className="text-right py-1">Mass (g)</th>
                      <th className="text-right py-1">Moles (mol)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedEquation.reactants.map((reactant, idx) => (
                      <tr key={`reactant-${idx}`} className="border-b border-border/40">
                        <td className="py-1 font-mono">{reactant.formula}{reactant.isLimitingReagent ? ' (limiting)' : ''}</td>
                        <td className="text-right py-1">{reactant.coefficient}</td>
                        <td className="text-right py-1">{reactant.molarMass.toFixed(2)}</td>
                        <td className="text-right py-1">{reactant.mass}</td>
                        <td className="text-right py-1">{reactant.moles}</td>
                      </tr>
                    ))}
                    {parsedEquation.products.map((product, idx) => (
                      <tr key={`product-${idx}`} className="border-b border-border/40">
                        <td className="py-1 font-mono">{product.formula}</td>
                        <td className="text-right py-1">{product.coefficient}</td>
                        <td className="text-right py-1">{product.molarMass.toFixed(2)}</td>
                        <td className="text-right py-1">{product.mass}</td>
                        <td className="text-right py-1">{product.moles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(Stoichiometry);
