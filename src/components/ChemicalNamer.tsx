import React, { useState, useEffect } from 'react';
import { translateChemicalName, translateChemicalFormula, getNamingRules } from '../utils/chemistryUtils';

type ConversionMode = 'name-to-formula' | 'formula-to-name';

const ChemicalNamer: React.FC = () => {
  const [mode, setMode] = useState<ConversionMode>('name-to-formula');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [showNamingRules, setShowNamingRules] = useState(false);
  const [compoundType, setCompoundType] = useState('binary');
  
  // Detect compound type from input
  useEffect(() => {
    if (!input) return;
    
    if (mode === 'name-to-formula') {
      if (input.includes('acid')) {
        setCompoundType('oxoacid');
      } else if (input.includes('hydrate')) {
        setCompoundType('hydrate');
      } else if (input.includes('ate') || input.includes('ite')) {
        setCompoundType('salt');
      } else if (input.includes('oxide') || input.includes('chloride') || input.includes('bromide')) {
        setCompoundType('binary');
      } else {
        setCompoundType('ionic');
      }
    } else {
      if (input.includes('H') && (input.includes('SO4') || input.includes('NO3'))) {
        setCompoundType('oxoacid');
      } else if (input.includes('·') && input.includes('H2O')) {
        setCompoundType('hydrate');
      } else if (input.match(/[A-Z][a-z]?[0-9]?[A-Z]/)) {
        setCompoundType('salt');
      } else if (input.match(/^[A-Z][a-z]?[0-9]?[A-Z][a-z]?[0-9]?$/)) {
        setCompoundType('binary');
      } else {
        setCompoundType('ionic');
      }
    }
  }, [input, mode]);

  // Perform conversion
  const handleConversion = () => {
    if (!input.trim()) {
      setError('Please enter a value to convert');
      setResult('');
      return;
    }

    try {
      if (mode === 'name-to-formula') {
        const formula = translateChemicalName(input);
        setResult(formula);
        setError('');
      } else {
        const name = translateChemicalFormula(input);
        setResult(name);
        setError('');
      }
    } catch (err) {
      setError((err as Error).message);
      setResult('');
    }
  };

  // Toggle conversion mode
  const toggleMode = () => {
    setMode(mode === 'name-to-formula' ? 'formula-to-name' : 'name-to-formula');
    setInput('');
    setResult('');
    setError('');
  };

  // Examples based on current mode
  const getExamples = () => {
    if (mode === 'name-to-formula') {
      return [
        'iron(III) oxide',
        'calcium carbonate',
        'sodium hydroxide',
        'sulfuric acid',
        'potassium permanganate',
        'copper(II) sulfate pentahydrate'
      ];
    } else {
      return [
        'Fe2O3',
        'CaCO3',
        'NaOH',
        'H2SO4',
        'KMnO4',
        'CuSO4·5H2O'
      ];
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-bold mb-2">Chemical Nomenclature Converter</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {mode === 'name-to-formula' 
          ? 'Convert chemical names to formulas using IUPAC nomenclature rules' 
          : 'Convert chemical formulas to their systematic names'}
      </p>
      
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setMode('name-to-formula')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === 'name-to-formula' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/20 hover:bg-secondary/30'
            }`}
          >
            Name → Formula
          </button>
          <button
            onClick={() => setMode('formula-to-name')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              mode === 'formula-to-name' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/20 hover:bg-secondary/30'
            }`}
          >
            Formula → Name
          </button>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'name-to-formula' 
              ? 'e.g., sodium chloride, sulfuric acid' 
              : 'e.g., NaCl, H2SO4, CuSO4·5H2O'
            }
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleConversion}
            className="px-3 py-2 bg-primary/20 hover:bg-primary/30 rounded-md text-sm"
          >
            Convert
          </button>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-2">
          <span className="text-xs text-muted-foreground">Examples:</span>
          {getExamples().map(example => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="px-2 py-0.5 text-xs bg-secondary/30 hover:bg-secondary/40 rounded-full"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {result ? (
        <div className="mb-3 px-4 py-3 bg-green-500/10 rounded-md">
          <span className="text-xs text-muted-foreground mr-1">
            {mode === 'name-to-formula' ? 'Formula:' : 'Chemical Name:'}
          </span>
          <div className="text-lg font-medium mt-1">
            {result}
          </div>
        </div>
      ) : error ? (
        <div className="mb-3 px-4 py-3 bg-red-500/10 rounded-md text-red-500 text-sm">
          {error}
        </div>
      ) : null}

      <div className="mt-4">
        <button
          onClick={() => setShowNamingRules(!showNamingRules)}
          className="flex items-center gap-1 text-sm text-primary"
        >
          <span className="material-icons text-sm">
            {showNamingRules ? 'expand_less' : 'expand_more'}
          </span>
          {showNamingRules ? 'Hide Naming Rules' : 'Show Naming Rules'}
        </button>
        
        {showNamingRules && (
          <div className="mt-2 p-3 bg-secondary/10 rounded-md">
            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
              {['binary', 'ionic', 'oxoacid', 'hydrate', 'salt'].map(type => (
                <button
                  key={type}
                  onClick={() => setCompoundType(type)}
                  className={`px-2 py-1 text-xs rounded ${
                    type === compoundType 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/20'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            
            <h3 className="font-medium text-sm mb-2 capitalize">{compoundType} Compound Naming Rules:</h3>
            <ul className="list-disc list-inside space-y-1">
              {getNamingRules(compoundType).map((rule, index) => (
                <li key={index} className="text-xs">{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChemicalNamer);
