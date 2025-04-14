import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const SigFigCalculator: React.FC = () => {
  const [input, setInput] = useState('');
  const [operation, setOperation] = useState<'count' | 'add' | 'subtract' | 'multiply' | 'divide'>('count');
  const [secondInput, setSecondInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  // Function to count significant figures in a number
  const countSigFigs = useCallback((numStr: string): number => {
    if (!numStr) return 0;
    
    // Remove any commas
    numStr = numStr.replace(/,/g, '');
    
    // Check if it's in scientific notation
    const scientificMatch = numStr.match(/^([+-]?\d*\.?\d+)(?:[eE]([+-]?\d+))?$/);
    if (scientificMatch) {
      const baseNumber = scientificMatch[1];
      
      // Remove leading zeros and any sign
      let trimmed = baseNumber.replace(/^[+-]?0+/, '');
      
      // Remove decimal point
      trimmed = trimmed.replace(/\./, '');
      
      // Remove trailing zeros for numbers with a decimal point
      if (baseNumber.includes('.')) {
        // Keep all digits including trailing zeros
        return baseNumber.replace(/^[+-]?0+|\./, '').length;
      } else {
        // For integers, remove trailing zeros
        return baseNumber.replace(/^[+-]?0+/, '').replace(/0+$/, '').length;
      }
    }
    
    // Regular decimal number processing
    let normalized = numStr;
    
    // Remove sign if present
    normalized = normalized.replace(/^[+-]/, '');
    
    // Check if it's a decimal number
    const hasDecimal = normalized.includes('.');
    
    if (hasDecimal) {
      // Remove leading zeros before the first non-zero digit
      normalized = normalized.replace(/^0+/, '');
      
      // If the number is less than 1 (like 0.00123)
      if (normalized.startsWith('.')) {
        // Remove leading zeros after the decimal point
        normalized = normalized.replace(/^\.0+/, '.');
        
        // Count all digits after the first non-zero digit
        return normalized.replace(/^\.0+/, '.').replace(/[.]/, '').length;
      } else {
        // For numbers like 123.456
        return normalized.replace(/[.]/, '').length;
      }
    } else {
      // For integers, remove leading zeros and count digits excluding trailing zeros
      normalized = normalized.replace(/^0+/, '');
      return normalized.replace(/0+$/, '').length;
    }
  }, []);

  // Find the least number of decimal places
  const findDecimalPlaces = useCallback((num: string): number => {
    const parts = num.split('.');
    if (parts.length === 1) return 0; // No decimal point
    return parts[1].length;
  }, []);

  // Find the least number of significant figures
  const findLeastSigFigs = useCallback((num1: string, num2: string): number => {
    return Math.min(countSigFigs(num1), countSigFigs(num2));
  }, [countSigFigs]);

  // Calculate the result based on operation and significant figures rules
  const calculate = useCallback(() => {
    if (!input) {
      setResult(null);
      setExplanation(null);
      return;
    }
    
    try {
      // For counting significant figures
      if (operation === 'count') {
        const sigFigs = countSigFigs(input);
        setResult(`${sigFigs} significant figures`);
        
        // Provide explanation
        let explain = `The number ${input} has ${sigFigs} significant figures:\n`;
        explain += explainSigFigRules(input, sigFigs);
        setExplanation(explain);
        return;
      }
      
      // For operations requiring two inputs
      if (!secondInput) {
        setResult(null);
        setExplanation('Please enter a second number for this operation.');
        return;
      }
      
      const num1 = parseFloat(input);
      const num2 = parseFloat(secondInput);
      
      if (isNaN(num1) || isNaN(num2)) {
        setResult(null);
        setExplanation('Please enter valid numbers.');
        return;
      }
      
      let calculatedResult: number;
      let sigFigsToKeep: number;
      let decimalPlacesToKeep: number;
      let explainRule: string;
      
      switch (operation) {
        case 'add':
        case 'subtract':
          // For addition and subtraction, the result should have the same number of decimal places as the least precise input
          calculatedResult = operation === 'add' ? num1 + num2 : num1 - num2;
          decimalPlacesToKeep = Math.min(findDecimalPlaces(input), findDecimalPlaces(secondInput));
          setResult(calculatedResult.toFixed(decimalPlacesToKeep));
          explainRule = 'For addition and subtraction, the result should have the same number of decimal places as the least precise input.';
          break;
          
        case 'multiply':
        case 'divide':
          // For multiplication and division, the result should have the same number of significant figures as the least precise input
          calculatedResult = operation === 'multiply' ? num1 * num2 : num1 / num2;
          sigFigsToKeep = findLeastSigFigs(input, secondInput);
          setResult(formatToSigFigs(calculatedResult, sigFigsToKeep));
          explainRule = 'For multiplication and division, the result should have the same number of significant figures as the least precise input.';
          break;
          
        default:
          setResult(null);
          setExplanation('Invalid operation.');
          return;
      }
      
      // Create explanation
      let explain = `${explainRule}\n\n`;
      explain += `Input 1: ${input} (${countSigFigs(input)} sig figs, ${findDecimalPlaces(input)} decimal places)\n`;
      explain += `Input 2: ${secondInput} (${countSigFigs(secondInput)} sig figs, ${findDecimalPlaces(secondInput)} decimal places)\n`;
      explain += `${operation === 'add' ? 'Sum' : operation === 'subtract' ? 'Difference' : operation === 'multiply' ? 'Product' : 'Quotient'}: ${result}`;
      
      setExplanation(explain);
    } catch (error) {
      setResult(null);
      setExplanation(`Error: ${(error as Error).message}`);
    }
  }, [input, secondInput, operation, countSigFigs, findDecimalPlaces, findLeastSigFigs]);

  // Helper function to explain significant figure rules for a number
  const explainSigFigRules = (numStr: string, sigFigs: number): string => {
    let explanation = '';
    
    // Remove commas
    numStr = numStr.replace(/,/g, '');
    
    if (numStr.includes('e') || numStr.includes('E')) {
      // Scientific notation
      explanation += "In scientific notation, all digits in the coefficient are significant.\n";
      return explanation;
    }
    
    const hasDecimal = numStr.includes('.');
    
    if (hasDecimal) {
      if (parseFloat(numStr) < 1) {
        // Numbers less than 1
        explanation += "For numbers less than 1, leading zeros are not significant.\n";
        explanation += "All non-zero digits and trailing zeros after the decimal point are significant.\n";
      } else {
        // Numbers greater than 1 with decimal
        explanation += "All non-zero digits are significant.\n";
        explanation += "For numbers with a decimal point, all trailing zeros are significant.\n";
      }
    } else {
      // Integers
      explanation += "All non-zero digits are significant.\n";
      explanation += "Trailing zeros in a whole number are not significant unless explicitly shown to be with a decimal point or scientific notation.\n";
    }
    
    return explanation;
  };

  // Format a number to a specific number of significant figures
  const formatToSigFigs = (num: number, sigFigs: number): string => {
    if (sigFigs <= 0) return '0';
    
    // Handle the case of 0
    if (num === 0) return '0';
    
    // Convert to exponential notation with sigFigs - 1 digits after the decimal
    const expStr = num.toExponential(sigFigs - 1);
    
    // Split into coefficient and exponent
    const parts = expStr.split('e');
    const coefficient = parseFloat(parts[0]);
    const exponent = parseInt(parts[1]);
    
    // If the exponent is between -4 and sigFigs, display in fixed notation
    if (exponent >= -4 && exponent < sigFigs) {
      // For small numbers, we need to add leading zeros
      if (exponent < 0) {
        return (coefficient * Math.pow(10, exponent))
          .toFixed(Math.abs(exponent) + (sigFigs - 1));
      }
      
      // For larger numbers
      return num.toFixed(Math.max(0, sigFigs - exponent - 1));
    }
    
    // Otherwise, return in exponential notation
    return expStr;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Significant Figures Calculator</CardTitle>
        <CardDescription>
          Calculate with precise significant figures or count them in a number
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Operation</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setOperation('count')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  operation === 'count' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/20 hover:bg-secondary/30'
                }`}
              >
                Count Sig Figs
              </button>
              <button
                onClick={() => setOperation('add')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  operation === 'add' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/20 hover:bg-secondary/30'
                }`}
              >
                Addition
              </button>
              <button
                onClick={() => setOperation('subtract')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  operation === 'subtract' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/20 hover:bg-secondary/30'
                }`}
              >
                Subtraction
              </button>
              <button
                onClick={() => setOperation('multiply')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  operation === 'multiply' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/20 hover:bg-secondary/30'
                }`}
              >
                Multiplication
              </button>
              <button
                onClick={() => setOperation('divide')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  operation === 'divide' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-secondary/20 hover:bg-secondary/30'
                }`}
              >
                Division
              </button>
            </div>
          </div>
        
          <div>
            <label className="block text-sm font-medium mb-1">
              {operation === 'count' ? 'Number' : 'First Number'}
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a number (e.g., 123.45, 0.00678, 9.300)"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        
          {operation !== 'count' && (
            <div>
              <label className="block text-sm font-medium mb-1">Second Number</label>
              <input
                type="text"
                value={secondInput}
                onChange={(e) => setSecondInput(e.target.value)}
                placeholder="Enter a number"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          )}
        
          <button
            onClick={calculate}
            className="w-full px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
          >
            Calculate
          </button>
        
          {result && (
            <div className="mt-4 p-4 bg-green-500/10 rounded-md">
              <div className="font-medium">Result:</div>
              <div className="text-xl">{result}</div>
            </div>
          )}
        
          {explanation && (
            <div className="mt-2 p-4 bg-secondary/10 rounded-md">
              <div className="font-medium mb-1">Explanation:</div>
              <div className="text-sm whitespace-pre-line">{explanation}</div>
            </div>
          )}
        
          <div className="mt-4 text-xs text-muted-foreground">
            <h3 className="font-medium mb-1">Significant Figures Rules:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>All non-zero digits are significant (1-9)</li>
              <li>Interior zeros (between non-zero digits) are always significant (e.g., 1002 has 4 sig figs)</li>
              <li>Leading zeros are never significant (e.g., 0.0012 has 2 sig figs)</li>
              <li>Trailing zeros after a decimal point are significant (e.g., 1.200 has 4 sig figs)</li>
              <li>Trailing zeros in a whole number are not significant unless marked with a decimal point (e.g., 1200 vs 1200.)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(SigFigCalculator);