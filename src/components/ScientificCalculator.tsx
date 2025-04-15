import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// Define the types of operations and their display values
const operations = {
  add: '+',
  subtract: '-',
  multiply: '×',
  divide: '÷',
  power: '^',
  sqrt: '√',
  sin: 'sin',
  cos: 'cos',
  tan: 'tan',
  log: 'log',
  ln: 'ln',
  factorial: '!',
  percent: '%',
  pi: 'π',
  e: 'e'
};

type OperationType = keyof typeof operations;

const ScientificCalculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [currentOperation, setCurrentOperation] = useState<OperationType | null>(null);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Convert degrees to radians if needed
  const toRadians = (value: number): number => {
    return angleMode === 'deg' ? value * (Math.PI / 180) : value;
  };

  // Clear the display and reset the calculator
  const clearDisplay = () => {
    setDisplay('0');
    setCurrentOperation(null);
    setPreviousValue(null);
    setShouldResetDisplay(false);
  };

  // Handle number input
  const handleNumberInput = (num: string) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(num);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + num);
    }
  };

  // Handle decimal point
  const handleDecimal = () => {
    if (shouldResetDisplay) {
      setDisplay('0.');
      setShouldResetDisplay(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle basic operations (add, subtract, multiply, divide)
  const handleBasicOperation = (operation: OperationType) => {
    const currentValue = parseFloat(display);
    
    if (previousValue === null) {
      setPreviousValue(currentValue);
      setCurrentOperation(operation);
      setShouldResetDisplay(true);
    } else {
      // If we have a previous operation, calculate it first
      const result = calculateResult();
      if (result !== null) {
        setPreviousValue(result);
        setDisplay(String(result));
        setCurrentOperation(operation);
        setShouldResetDisplay(true);
      }
    }
  };

  // Handle unary operations (sin, cos, sqrt, etc.)
  const handleUnaryOperation = (operation: OperationType) => {
    const currentValue = parseFloat(display);
    let result: number;

    switch (operation) {
      case 'sqrt':
        if (currentValue < 0) {
          setDisplay('Error');
          return;
        }
        result = Math.sqrt(currentValue);
        break;
      case 'sin':
        result = Math.sin(toRadians(currentValue));
        break;
      case 'cos':
        result = Math.cos(toRadians(currentValue));
        break;
      case 'tan':
        result = Math.tan(toRadians(currentValue));
        break;
      case 'log':
        if (currentValue <= 0) {
          setDisplay('Error');
          return;
        }
        result = Math.log10(currentValue);
        break;
      case 'ln':
        if (currentValue <= 0) {
          setDisplay('Error');
          return;
        }
        result = Math.log(currentValue);
        break;
      case 'factorial':
        if (currentValue < 0 || !Number.isInteger(currentValue)) {
          setDisplay('Error');
          return;
        }
        result = factorial(currentValue);
        break;
      case 'percent':
        result = currentValue / 100;
        break;
      default:
        return;
    }

    // Add to history
    addToHistory(`${operations[operation]}(${currentValue}) = ${result}`);
    
    setDisplay(String(result));
    setShouldResetDisplay(true);
  };

  // Handle equals button press
  const handleEquals = () => {
    if (previousValue !== null && currentOperation !== null) {
      const result = calculateResult();
      if (result !== null) {
        // Add to history
        addToHistory(`${previousValue} ${operations[currentOperation]} ${parseFloat(display)} = ${result}`);
        
        setDisplay(String(result));
        setPreviousValue(null);
        setCurrentOperation(null);
        setShouldResetDisplay(true);
      }
    }
  };

  // Calculate the result based on the current operation
  const calculateResult = (): number | null => {
    if (previousValue === null || currentOperation === null) return null;
    
    const currentValue = parseFloat(display);
    let result: number;

    switch (currentOperation) {
      case 'add':
        result = previousValue + currentValue;
        break;
      case 'subtract':
        result = previousValue - currentValue;
        break;
      case 'multiply':
        result = previousValue * currentValue;
        break;
      case 'divide':
        if (currentValue === 0) {
          setDisplay('Error');
          return null;
        }
        result = previousValue / currentValue;
        break;
      case 'power':
        result = Math.pow(previousValue, currentValue);
        break;
      default:
        return null;
    }

    return result;
  };

  // Handle constants like pi and e
  const handleConstant = (constant: 'pi' | 'e') => {
    const value = constant === 'pi' ? Math.PI : Math.E;
    setDisplay(String(value));
    setShouldResetDisplay(true);
  };

  // Handle memory operations (M+, M-, MR, MC)
  const handleMemory = (operation: 'add' | 'subtract' | 'recall' | 'clear') => {
    const currentValue = parseFloat(display);

    switch (operation) {
      case 'add':
        setMemory((prev) => (prev !== null ? prev + currentValue : currentValue));
        setShouldResetDisplay(true);
        break;
      case 'subtract':
        setMemory((prev) => (prev !== null ? prev - currentValue : -currentValue));
        setShouldResetDisplay(true);
        break;
      case 'recall':
        if (memory !== null) {
          setDisplay(String(memory));
        }
        break;
      case 'clear':
        setMemory(null);
        break;
    }
  };

  // Helper function for factorial
  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  // Toggle angle mode between degrees and radians
  const toggleAngleMode = () => {
    setAngleMode(prev => prev === 'deg' ? 'rad' : 'deg');
  };

  // Add calculation to history
  const addToHistory = (calculation: string) => {
    setHistory(prev => [...prev.slice(-9), calculation]);
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Format display for better readability
  const formatDisplay = (value: string): string => {
    if (value === 'Error') return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // If it's a very large or small number, use scientific notation
    if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-10 && num !== 0)) {
      return num.toExponential(6);
    }
    
    return value;
  };

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/[0-9]/.test(e.key)) {
        handleNumberInput(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleBasicOperation('add');
      } else if (e.key === '-') {
        handleBasicOperation('subtract');
      } else if (e.key === '*') {
        handleBasicOperation('multiply');
      } else if (e.key === '/') {
        handleBasicOperation('divide');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Escape') {
        clearDisplay();
      } else if (e.key === 'Backspace') {
        if (display !== '0' && !shouldResetDisplay) {
          setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, previousValue, currentOperation, shouldResetDisplay]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scientific Calculator</CardTitle>
        <CardDescription>
          Perform complex mathematical calculations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Display */}
          <div className="relative bg-secondary/10 rounded-md p-3 h-16 flex items-center justify-end overflow-hidden">
            <div className="absolute top-1 left-2 text-xs text-muted-foreground">
              {currentOperation && previousValue !== null
                ? `${previousValue} ${operations[currentOperation]}`
                : ""}
            </div>
            <div className="text-right font-mono text-2xl w-full overflow-x-auto scrollbar-hide">
              {formatDisplay(display)}
            </div>
          </div>

          {/* History */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-xs flex items-center text-primary"
            >
              <span className="material-icons text-xs mr-1">
                {showHistory ? 'expand_less' : 'expand_more'}
              </span>
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
            <div className="text-xs text-muted-foreground">
              {angleMode === 'deg' ? 'DEG' : 'RAD'} {memory !== null ? 'M' : ''}
            </div>
          </div>

          {showHistory && (
            <div className="bg-secondary/5 rounded-md p-2 max-h-40 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center py-2">
                  No calculation history
                </div>
              ) : (
                <>
                  <div className="flex justify-between mb-1">
                    <h4 className="text-xs font-medium">History</h4>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-muted-foreground hover:text-primary"
                    >
                      Clear
                    </button>
                  </div>
                  {history.map((item, index) => (
                    <div key={index} className="text-xs py-1 border-b border-secondary/20 last:border-0">
                      {item}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Calculator buttons */}
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {/* First row */}
            <button
              onClick={toggleAngleMode}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              {angleMode === 'deg' ? 'DEG' : 'RAD'}
            </button>
            <button
              onClick={() => handleMemory('recall')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              MR
            </button>
            <button
              onClick={() => handleMemory('add')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              M+
            </button>
            <button
              onClick={() => handleMemory('subtract')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              M-
            </button>
            <button
              onClick={() => handleMemory('clear')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm hidden sm:block"
            >
              MC
            </button>

            {/* Second row */}
            <button
              onClick={() => handleConstant('pi')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              π
            </button>
            <button
              onClick={() => handleConstant('e')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              e
            </button>
            <button
              onClick={() => handleUnaryOperation('factorial')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              !
            </button>
            <button
              onClick={() => handleBasicOperation('power')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              ^
            </button>
            <button
              onClick={() => handleUnaryOperation('percent')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm hidden sm:block"
            >
              %
            </button>

            {/* Third row */}
            <button
              onClick={() => handleUnaryOperation('sin')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              sin
            </button>
            <button
              onClick={() => handleUnaryOperation('cos')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              cos
            </button>
            <button
              onClick={() => handleUnaryOperation('tan')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              tan
            </button>
            <button
              onClick={() => handleUnaryOperation('sqrt')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              √
            </button>
            <button
              onClick={() => {
                if (display !== '0' && !shouldResetDisplay) {
                  setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
                }
              }}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm hidden sm:block"
            >
              ⌫
            </button>

            {/* Fourth row */}
            <button
              onClick={() => handleUnaryOperation('log')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              log
            </button>
            <button
              onClick={() => handleUnaryOperation('ln')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm"
            >
              ln
            </button>
            <button
              onClick={clearDisplay}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-700 rounded-md text-xs sm:text-sm col-span-2 sm:col-span-1"
            >
              C
            </button>
            <button
              onClick={() => handleBasicOperation('divide')}
              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-xs sm:text-sm"
            >
              ÷
            </button>
            <button
              onClick={() => {
                if (display !== '0' && !shouldResetDisplay) {
                  setDisplay(display.startsWith('-') ? display.slice(1) : `-${display}`);
                } else {
                  setDisplay('-0');
                }
              }}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm hidden sm:block"
            >
              +/-
            </button>

            {/* Number pad and operations */}
            <button
              onClick={() => handleNumberInput('7')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              7
            </button>
            <button
              onClick={() => handleNumberInput('8')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              8
            </button>
            <button
              onClick={() => handleNumberInput('9')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              9
            </button>
            <button
              onClick={() => handleBasicOperation('multiply')}
              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm"
            >
              ×
            </button>
            <button
              onClick={() => handleNumberInput('0')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm hidden sm:block row-span-3"
            >
              0
            </button>

            <button
              onClick={() => handleNumberInput('4')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              4
            </button>
            <button
              onClick={() => handleNumberInput('5')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              5
            </button>
            <button
              onClick={() => handleNumberInput('6')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              6
            </button>
            <button
              onClick={() => handleBasicOperation('subtract')}
              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm"
            >
              -
            </button>

            <button
              onClick={() => handleNumberInput('1')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              1
            </button>
            <button
              onClick={() => handleNumberInput('2')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              2
            </button>
            <button
              onClick={() => handleNumberInput('3')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm"
            >
              3
            </button>
            <button
              onClick={() => handleBasicOperation('add')}
              className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm"
            >
              +
            </button>

            <button
              onClick={() => handleNumberInput('0')}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm sm:hidden col-span-2"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="px-3 py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-sm sm:col-span-2"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-700 rounded-md text-sm sm:col-span-2"
            >
              =
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-2 text-xs text-muted-foreground">
            <p>You can also use the keyboard for input: numbers, operators (+, -, *, /), Enter for equals, Escape for clear.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ScientificCalculator);