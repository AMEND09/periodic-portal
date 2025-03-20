import React, { useState, useEffect, useCallback } from 'react';
import { elements, getElementBySymbol } from '../data/elements';
import { getPolyatomicIonByFormula } from '../data/polyatomicIons';
import { calculateMolarMass, parseChemicalFormula } from '../utils/chemistryUtils';

const MolarMassCalculator: React.FC = () => {
  const [formula, setFormula] = useState('');
  const [result, setResult] = useState<{
    molarMass: number;
    breakdown: Array<{ symbol: string; count: number; mass: number; totalMass: number }>;
    valid: boolean;
    error?: string;
  }>({
    molarMass: 0,
    breakdown: [],
    valid: false
  });

  const calculateResult = useCallback((input: string) => {
    if (!input.trim()) {
      setResult({ molarMass: 0, breakdown: [], valid: false });
      return;
    }

    try {
      const { molarMass, components } = calculateMolarMass(input);
      
      setResult({
        molarMass,
        breakdown: components,
        valid: true
      });
    } catch (error) {
      setResult({
        molarMass: 0,
        breakdown: [],
        valid: false,
        error: (error as Error).message
      });
    }
  }, []);

  // Process formula when it changes
  useEffect(() => {
    calculateResult(formula);
  }, [formula, calculateResult]);

  // Common formulas to provide as examples
  const commonFormulas = [
    'H2O',
    'NaCl',
    'C6H12O6',
    'H2SO4',
    'NH4OH',
    'CaCO3',
    'Fe2O3'
  ];

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Molar Mass Calculator</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Enter a chemical formula to calculate its molar mass
      </p>
      
      <div className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={formula}
            onChange={(e) => setFormula(e.target.value)}
            placeholder="e.g., H2O, NaCl, C6H12O6"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={() => setFormula('')}
            className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-muted-foreground">Common formulas:</span>
          {commonFormulas.map(f => (
            <button
              key={f}
              onClick={() => setFormula(f)}
              className="px-2 py-0.5 text-xs bg-secondary/30 hover:bg-secondary/40 rounded-full"
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {result.valid ? (
        <div className="space-y-3">
          <div className="text-center py-3 bg-green-500/10 rounded-md">
            <div className="text-sm">Molar Mass:</div>
            <div className="text-2xl font-bold">{result.molarMass.toFixed(4)} g/mol</div>
          </div>
          
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
          {formula ? (
            <div className="text-red-500">
              {result.error || "Invalid formula. Check for proper element symbols and formatting."}
            </div>
          ) : (
            <div className="text-muted-foreground">Enter a chemical formula to calculate</div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(MolarMassCalculator);
