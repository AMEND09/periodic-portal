import React, { useState, useEffect, useCallback } from 'react';
import { elements, getElementBySymbol } from '../data/elements';
import { getPolyatomicIonByFormula } from '../data/polyatomicIons';
import { calculateMolarMass, parseChemicalFormula, translateChemicalName } from '../utils/chemistryUtils';

const MolarMassCalculator: React.FC = () => {
  const [inputMode, setInputMode] = useState<'formula' | 'name'>('formula');
  const [input, setInput] = useState('');
  const [formula, setFormula] = useState('');
  const [showConverter, setShowConverter] = useState(false);
  
  // States for mass-mole converter
  const [massInput, setMassInput] = useState('');
  const [moleInput, setMoleInput] = useState('');
  const [lastEdited, setLastEdited] = useState<'mass' | 'mole' | null>(null);
  
  const [result, setResult] = useState<{
    molarMass: number;
    breakdown: Array<{ symbol: string; count: number; mass: number; totalMass: number }>;
    valid: boolean;
    error?: string;
    nameTranslation?: string;
  }>({
    molarMass: 0,
    breakdown: [],
    valid: false
  });

  const calculateResult = useCallback((currentFormula: string) => {
    if (!currentFormula.trim()) {
      setResult({ molarMass: 0, breakdown: [], valid: false });
      return;
    }

    try {
      const { molarMass, components } = calculateMolarMass(currentFormula);
      
      setResult({
        molarMass,
        breakdown: components,
        valid: true,
        nameTranslation: inputMode === 'name' ? currentFormula : undefined
      });
    } catch (error) {
      setResult({
        molarMass: 0,
        breakdown: [],
        valid: false,
        error: (error as Error).message
      });
    }
  }, [inputMode]);

  // Handle input changes
  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (inputMode === 'name') {
      try {
        // Try to translate chemical name to formula
        const translatedFormula = translateChemicalName(value);
        setFormula(translatedFormula);
      } catch (error) {
        setFormula('');
        setResult({
          molarMass: 0,
          breakdown: [],
          valid: false,
          error: (error as Error).message
        });
      }
    } else {
      setFormula(value);
    }
  };

  // Process formula when it changes
  useEffect(() => {
    if (formula) {
      calculateResult(formula);
    } else {
      setResult({
        molarMass: 0,
        breakdown: [],
        valid: false
      });
    }
  }, [formula, calculateResult]);

  // Update conversions when molar mass or inputs change
  useEffect(() => {
    if (!result.valid) {
      return;
    }

    // Skip if both inputs are empty or we shouldn't recalculate
    if ((!massInput && !moleInput) || !lastEdited) {
      return;
    }
    
    // Convert between mass and moles based on the last field edited
    if (lastEdited === 'mass' && massInput) {
      const mass = parseFloat(massInput);
      if (!isNaN(mass)) {
        const moles = mass / result.molarMass;
        setMoleInput(moles.toFixed(6));
      }
    } else if (lastEdited === 'mole' && moleInput) {
      const moles = parseFloat(moleInput);
      if (!isNaN(moles)) {
        const mass = moles * result.molarMass;
        setMassInput(mass.toFixed(6));
      }
    }
  }, [result.valid, result.molarMass, massInput, moleInput, lastEdited]);

  // Handle mass input change
  const handleMassInputChange = (value: string) => {
    setMassInput(value);
    setLastEdited('mass');
  };

  // Handle mole input change
  const handleMoleInputChange = (value: string) => {
    setMoleInput(value);
    setLastEdited('mole');
  };

  // Reset converter fields
  const resetConverter = () => {
    setMassInput('');
    setMoleInput('');
    setLastEdited(null);
  };

  // Common examples based on input mode
  const getExamples = () => {
    if (inputMode === 'formula') {
      return [
        'H2O',
        'NaCl',
        'C6H12O6',
        'H2SO4',
        'NH4OH',
        'CaCO3',
        'Fe2O3'
      ];
    } else {
      return [
        'water',
        'sodium chloride',
        'glucose',
        'sulfuric acid',
        'ammonium hydroxide',
        'calcium carbonate',
        'ferric oxide'
      ];
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Molar Mass Calculator</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {inputMode === 'formula' 
          ? 'Enter a chemical formula to calculate its molar mass'
          : 'Enter a chemical name to calculate its molar mass'}
      </p>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setInputMode('formula')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'formula' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/20 hover:bg-secondary/30'
            }`}
          >
            Formula
          </button>
          <button
            onClick={() => setInputMode('name')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'name' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/20 hover:bg-secondary/30'
            }`}
          >
            Chemical Name
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={inputMode === 'formula' 
              ? 'e.g., H2O, NaCl, C6H12O6' 
              : 'e.g., water, sodium chloride, ferric sulfate'
            }
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => {
              setInput('');
              setFormula('');
              resetConverter();
            }}
            className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
          >
            Clear
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-muted-foreground">Examples:</span>
          {getExamples().map(example => (
            <button
              key={example}
              onClick={() => handleInputChange(example)}
              className="px-2 py-0.5 text-xs bg-secondary/30 hover:bg-secondary/40 rounded-full"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {inputMode === 'name' && result.nameTranslation && (
        <div className="mb-3 px-3 py-2 bg-secondary/10 rounded-md">
          <span className="text-xs text-muted-foreground mr-1">Formula:</span>
          <span className="text-sm font-mono">{result.nameTranslation}</span>
        </div>
      )}

      {result.valid ? (
        <div className="space-y-3">
          <div className="text-center py-3 bg-green-500/10 rounded-md">
            <div className="text-sm">Molar Mass:</div>
            <div className="text-2xl font-bold">{result.molarMass.toFixed(4)} g/mol</div>
          </div>
          
          {/* Toggle for mass-mole converter */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowConverter(!showConverter)}
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 hover:bg-primary/20 rounded-md text-sm transition-colors"
            >
              <span className="material-icons text-sm">
                {showConverter ? 'expand_less' : 'expand_more'}
              </span>
              {showConverter ? 'Hide Converter' : 'Mass-Mole Converter'}
            </button>
          </div>
          
          {/* Mass-mole converter */}
          {showConverter && (
            <div className="border border-primary/20 rounded-md p-3 bg-primary/5">
              <h3 className="text-sm font-medium mb-3">Mass-Mole Converter</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Mass (g)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={massInput}
                      onChange={(e) => handleMassInputChange(e.target.value)}
                      placeholder="Enter mass in grams"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Amount (mol)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={moleInput}
                      onChange={(e) => handleMoleInputChange(e.target.value)}
                      placeholder="Enter amount in moles"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <div className="bg-secondary/10 p-2 rounded text-center">
                  <p>
                    {massInput && moleInput ? (
                      <>
                        {parseFloat(massInput).toFixed(4)} g of {formula} = {parseFloat(moleInput).toFixed(6)} mol
                      </>
                    ) : (
                      <span className="text-muted-foreground">Enter either mass or moles to convert</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {result.breakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Breakdown:</h3>
              <div className="bg-secondary/10 rounded-md p-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">Element</th>
                      <th className="text-right py-1">Count</th>
                      <th className="text-right py-1">Atomic Mass</th>
                      <th className="text-right py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.breakdown.map((item, idx) => (
                      <tr key={idx} className="border-b border-border/40">
                        <td className="py-1">{item.symbol}</td>
                        <td className="text-right py-1">{item.count}</td>
                        <td className="text-right py-1">{item.mass.toFixed(4)}</td>
                        <td className="text-right py-1">{item.totalMass.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-sm">
          {input ? (
            <div className="text-red-500">
              {result.error || (inputMode === 'name' 
                ? "Could not translate this chemical name. Try another name or use formula mode." 
                : "Invalid formula. Check for proper element symbols and formatting.")}
            </div>
          ) : (
            <div className="text-muted-foreground">
              Enter a chemical {inputMode === 'formula' ? 'formula' : 'name'} to calculate
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(MolarMassCalculator);
