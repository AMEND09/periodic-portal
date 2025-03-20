import React, { useState, useEffect, useCallback } from 'react';
import { balanceEquation } from '../utils/chemistryUtils';

// Helper function to format chemical formulas with subscripts
const formatChemicalFormula = (formula: string): React.ReactNode => {
  // Regular expression to match numbers that should be subscripts
  // This looks for digits that follow a letter or closing parenthesis
  const parts = formula.split(/(\d+|\+|->|→|=|\s+)/g).filter(Boolean);
  
  return parts.map((part, index) => {
    // Check if this part is a number following an element symbol or closing parenthesis
    const shouldBeSubscript = 
      /^\d+$/.test(part) && 
      index > 0 && 
      (
        /[A-Z][a-z]?$/.test(parts[index - 1]) || 
        /\)$/.test(parts[index - 1])
      );
    
    if (shouldBeSubscript) {
      return <sub key={index}>{part}</sub>;
    } else if (part === '+') {
      return <span key={index}> + </span>;
    } else if (part === '->' || part === '→') {
      return <span key={index}> → </span>;
    } else if (part === '=') {
      return <span key={index}> = </span>;
    } else if (/^\s+$/.test(part)) {
      return <span key={index}>{part}</span>;
    } else {
      return <span key={index}>{part}</span>;
    }
  });
};

// Format an entire equation with coefficients and subscripts
const formatEquation = (equation: string): React.ReactNode => {
  // Split the equation into coefficients and compounds
  const parts = equation.split(/(\d+)([A-Z][a-zA-Z\d\(\)]*)|(\+)|(\s+)|(->|→|=)/g).filter(Boolean);
  
  return parts.map((part, index) => {
    // If it's a standalone number (coefficient)
    if (/^\d+$/.test(part) && (index === 0 || /\+|\s+|->|→|=$/.test(parts[index - 1]))) {
      return <span key={index} className="coefficient">{part}</span>;
    } else {
      return <span key={index}>{formatChemicalFormula(part)}</span>;
    }
  });
};

const EquationBalancer: React.FC = () => {
  const [equation, setEquation] = useState('');
  const [result, setResult] = useState<{
    balanced: string;
    coefficients: number[];
    error?: string;
  }>({
    balanced: '',
    coefficients: []
  });
  const [showExamples, setShowExamples] = useState(false);

  const handleBalance = useCallback(() => {
    if (!equation.trim()) {
      setResult({
        balanced: '',
        coefficients: [],
        error: 'Please enter a chemical equation'
      });
      return;
    }

    const balanceResult = balanceEquation(equation);
    setResult(balanceResult);
  }, [equation]);

  // Auto-balance when equation changes
  useEffect(() => {
    if (equation.trim()) {
      handleBalance();
    }
  }, [equation, handleBalance]);

  const examples = [
    'H2 + O2 -> H2O',
    'Fe + O2 -> Fe2O3',
    'C3H8 + O2 -> CO2 + H2O',
    'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2',
    'Cu + HNO3 -> Cu(NO3)2 + NO + H2O',
    'C2H5OH + O2 -> CO2 + H2O'
  ];

  const selectExample = (ex: string) => {
    setEquation(ex);
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Chemical Equation Balancer</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter a chemical equation using arrow (-&gt;) or equals (=) to separate reactants and products
      </p>
      
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="e.g., H2 + O2 -> H2O"
            className="equation-input flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => setEquation('')}
            className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
          >
            Clear
          </button>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="text-xs text-primary hover:underline flex items-center"
          >
            <span className="material-icons text-xs mr-1">
              {showExamples ? 'expand_less' : 'expand_more'}
            </span>
            {showExamples ? 'Hide examples' : 'Show examples'}
          </button>
        </div>
        
        {showExamples && (
          <div className="flex flex-wrap gap-1 mt-2 bg-secondary/10 p-2 rounded">
            {examples.map((ex, index) => (
              <button
                key={index}
                onClick={() => selectExample(ex)}
                className="px-2 py-0.5 text-xs bg-secondary/30 hover:bg-secondary/40 rounded-full"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4">
        {result.error ? (
          <div className="p-3 bg-red-500/10 rounded text-red-500 text-sm">
            {result.error}
          </div>
        ) : result.balanced ? (
          <div className="space-y-3">
            <div className="p-3 bg-green-500/10 rounded">
              <div className="text-xs text-muted-foreground mb-1">Balanced Equation:</div>
              <div className="balanced-equation text-lg font-medium">
                {formatEquation(result.balanced)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-secondary/10 p-3 rounded">
                <h3 className="font-medium text-xs mb-2">How to Balance Equations</h3>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Count atoms on both sides</li>
                  <li>Add coefficients to equalize atoms</li>
                  <li>Verify the equation is balanced</li>
                  <li>Reduce coefficients to smallest possible values</li>
                </ul>
              </div>
              
              <div className="bg-secondary/10 p-3 rounded">
                <h3 className="font-medium text-xs mb-2">Conservation of Mass</h3>
                <p className="text-xs">
                  In a chemical reaction, atoms are neither created nor destroyed.
                  The same number of each type of atom must appear on both sides.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-secondary/10 rounded text-center text-muted-foreground text-sm">
            Enter a chemical equation to balance
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(EquationBalancer);
