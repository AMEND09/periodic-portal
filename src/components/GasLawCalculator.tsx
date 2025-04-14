import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type GasLawType = 'boyle' | 'charles' | 'gay-lussac' | 'combined' | 'ideal';

interface GasLawFormValues {
  // Common values
  pressure1: string;
  volume1: string;
  temperature1: string;
  // Second state values
  pressure2: string;
  volume2: string;
  temperature2: string;
  // Ideal gas law
  moles: string;
  gasConstant: string;
}

const GasLawCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GasLawType>('boyle');
  const [values, setValues] = useState<GasLawFormValues>({
    pressure1: '',
    volume1: '',
    temperature1: '',
    pressure2: '',
    volume2: '',
    temperature2: '',
    moles: '',
    gasConstant: '0.0821', // Default R value in L·atm/(mol·K)
  });
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [units, setUnits] = useState({
    pressure: 'atm',
    volume: 'L',
    temperature: 'K',
  });

  // Handle input changes
  const handleInputChange = (field: keyof GasLawFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setError(null);
    setResult(null);
  };

  // Convert temperature if needed
  const convertTemperature = (value: string, from: string): number => {
    if (!value) return 0;
    const temp = parseFloat(value);
    if (isNaN(temp)) return 0;

    if (from === 'C') {
      return temp + 273.15; // Convert Celsius to Kelvin
    } else if (from === 'F') {
      return (temp - 32) * (5/9) + 273.15; // Convert Fahrenheit to Kelvin
    }
    return temp; // Already in Kelvin
  };

  // Calculate based on selected gas law
  const calculate = useCallback(() => {
    const {
      pressure1,
      volume1,
      temperature1,
      pressure2,
      volume2,
      temperature2,
      moles,
      gasConstant
    } = values;

    setError(null);
    setResult(null);

    try {
      // Convert string inputs to numbers
      const p1 = pressure1 ? parseFloat(pressure1) : 0;
      const v1 = volume1 ? parseFloat(volume1) : 0;
      const t1 = convertTemperature(temperature1, units.temperature === 'K' ? 'K' : units.temperature === 'C' ? 'C' : 'F');
      const p2 = pressure2 ? parseFloat(pressure2) : 0;
      const v2 = volume2 ? parseFloat(volume2) : 0;
      const t2 = convertTemperature(temperature2, units.temperature === 'K' ? 'K' : units.temperature === 'C' ? 'C' : 'F');
      const n = moles ? parseFloat(moles) : 0;
      const R = gasConstant ? parseFloat(gasConstant) : 0.0821;

      // Validate inputs based on law type
      switch (activeTab) {
        case 'boyle':
          if (!pressure1 || !volume1 || (!pressure2 && !volume2)) {
            throw new Error('Please provide P1, V1, and either P2 or V2');
          }
          break;
        case 'charles':
          if (!volume1 || !temperature1 || (!volume2 && !temperature2)) {
            throw new Error('Please provide V1, T1, and either V2 or T2');
          }
          break;
        case 'gay-lussac':
          if (!pressure1 || !temperature1 || (!pressure2 && !temperature2)) {
            throw new Error('Please provide P1, T1, and either P2 or T2');
          }
          break;
        case 'combined':
          if (!pressure1 || !volume1 || !temperature1 || 
              ((!pressure2 && !volume2) || !temperature2) && 
              ((!temperature2 && !pressure2) || !volume2) && 
              ((!temperature2 && !volume2) || !pressure2)) {
            throw new Error('Please provide P1, V1, T1, and at least two values for the second state');
          }
          break;
        case 'ideal':
          if (!moles && (!pressure1 || !volume1 || !temperature1)) {
            throw new Error('Please provide at least 3 of P, V, n, and T');
          }
          break;
      }

      // Calculate based on gas law
      if (activeTab === 'boyle') {
        // P1V1 = P2V2
        if (!pressure2) {
          const calculatedP2 = (p1 * v1) / v2;
          setResult(`P₂ = ${calculatedP2.toFixed(4)} ${units.pressure}`);
        } else if (!volume2) {
          const calculatedV2 = (p1 * v1) / p2;
          setResult(`V₂ = ${calculatedV2.toFixed(4)} ${units.volume}`);
        }
      } else if (activeTab === 'charles') {
        // V1/T1 = V2/T2
        if (t1 <= 0 || t2 <= 0) {
          throw new Error('Temperature must be above absolute zero');
        }
        
        if (!volume2) {
          const calculatedV2 = (v1 * t2) / t1;
          setResult(`V₂ = ${calculatedV2.toFixed(4)} ${units.volume}`);
        } else if (!temperature2) {
          const calculatedT2 = (t1 * v2) / v1;
          setResult(`T₂ = ${calculatedT2.toFixed(4)} K`);
        }
      } else if (activeTab === 'gay-lussac') {
        // P1/T1 = P2/T2
        if (t1 <= 0 || t2 <= 0) {
          throw new Error('Temperature must be above absolute zero');
        }
        
        if (!pressure2) {
          const calculatedP2 = (p1 * t2) / t1;
          setResult(`P₂ = ${calculatedP2.toFixed(4)} ${units.pressure}`);
        } else if (!temperature2) {
          const calculatedT2 = (t1 * p2) / p1;
          setResult(`T₂ = ${calculatedT2.toFixed(4)} K`);
        }
      } else if (activeTab === 'combined') {
        // P1V1/T1 = P2V2/T2
        if (t1 <= 0 || t2 <= 0) {
          throw new Error('Temperature must be above absolute zero');
        }

        if (!pressure2) {
          const calculatedP2 = (p1 * v1 * t2) / (t1 * v2);
          setResult(`P₂ = ${calculatedP2.toFixed(4)} ${units.pressure}`);
        } else if (!volume2) {
          const calculatedV2 = (p1 * v1 * t2) / (t1 * p2);
          setResult(`V₂ = ${calculatedV2.toFixed(4)} ${units.volume}`);
        } else if (!temperature2) {
          const calculatedT2 = (p2 * v2 * t1) / (p1 * v1);
          setResult(`T₂ = ${calculatedT2.toFixed(4)} K`);
        }
      } else if (activeTab === 'ideal') {
        // PV = nRT
        if (t1 <= 0) {
          throw new Error('Temperature must be above absolute zero');
        }

        if (!pressure1) {
          const calculatedP = (n * R * t1) / v1;
          setResult(`P = ${calculatedP.toFixed(4)} ${units.pressure}`);
        } else if (!volume1) {
          const calculatedV = (n * R * t1) / p1;
          setResult(`V = ${calculatedV.toFixed(4)} ${units.volume}`);
        } else if (!temperature1) {
          const calculatedT = (p1 * v1) / (n * R);
          setResult(`T = ${calculatedT.toFixed(4)} K`);
        } else if (!moles) {
          const calculatedN = (p1 * v1) / (R * t1);
          setResult(`n = ${calculatedN.toFixed(4)} mol`);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [activeTab, values, units]);

  const getDescription = (): string => {
    switch (activeTab) {
      case 'boyle':
        return "Boyle's Law: At constant temperature, the pressure of a gas is inversely proportional to its volume (P₁V₁ = P₂V₂).";
      case 'charles':
        return "Charles's Law: At constant pressure, the volume of a gas is directly proportional to its absolute temperature (V₁/T₁ = V₂/T₂).";
      case 'gay-lussac':
        return "Gay-Lussac's Law: At constant volume, the pressure of a gas is directly proportional to its absolute temperature (P₁/T₁ = P₂/T₂).";
      case 'combined':
        return "Combined Gas Law: Combines Boyle's, Charles's, and Gay-Lussac's laws (P₁V₁/T₁ = P₂V₂/T₂).";
      case 'ideal':
        return "Ideal Gas Law: Describes the behavior of an ideal gas (PV = nRT) where R is the gas constant.";
      default:
        return "";
    }
  };

  const getFormFields = () => {
    switch (activeTab) {
      case 'boyle':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Pressure 1 ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure1}
                onChange={(e) => handleInputChange('pressure1', e.target.value)}
                placeholder={`Initial pressure (${units.pressure})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Volume 1 ({units.volume})</label>
              <input
                type="number"
                value={values.volume1}
                onChange={(e) => handleInputChange('volume1', e.target.value)}
                placeholder={`Initial volume (${units.volume})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Pressure 2 ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure2}
                onChange={(e) => handleInputChange('pressure2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Volume 2 ({units.volume})</label>
              <input
                type="number"
                value={values.volume2}
                onChange={(e) => handleInputChange('volume2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );
      case 'charles':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Volume 1 ({units.volume})</label>
              <input
                type="number"
                value={values.volume1}
                onChange={(e) => handleInputChange('volume1', e.target.value)}
                placeholder={`Initial volume (${units.volume})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature 1 ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature1}
                onChange={(e) => handleInputChange('temperature1', e.target.value)}
                placeholder={`Initial temperature (${units.temperature})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Volume 2 ({units.volume})</label>
              <input
                type="number"
                value={values.volume2}
                onChange={(e) => handleInputChange('volume2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature 2 ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature2}
                onChange={(e) => handleInputChange('temperature2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );
      case 'gay-lussac':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Pressure 1 ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure1}
                onChange={(e) => handleInputChange('pressure1', e.target.value)}
                placeholder={`Initial pressure (${units.pressure})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature 1 ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature1}
                onChange={(e) => handleInputChange('temperature1', e.target.value)}
                placeholder={`Initial temperature (${units.temperature})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Pressure 2 ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure2}
                onChange={(e) => handleInputChange('pressure2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature 2 ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature2}
                onChange={(e) => handleInputChange('temperature2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );
      case 'combined':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1">Pressure 1 ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure1}
                onChange={(e) => handleInputChange('pressure1', e.target.value)}
                placeholder={`P₁ (${units.pressure})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Volume 1 ({units.volume})</label>
              <input
                type="number"
                value={values.volume1}
                onChange={(e) => handleInputChange('volume1', e.target.value)}
                placeholder={`V₁ (${units.volume})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature 1 ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature1}
                onChange={(e) => handleInputChange('temperature1', e.target.value)}
                placeholder={`T₁ (${units.temperature})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Pressure 2 ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure2}
                onChange={(e) => handleInputChange('pressure2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Volume 2 ({units.volume})</label>
              <input
                type="number"
                value={values.volume2}
                onChange={(e) => handleInputChange('volume2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature 2 ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature2}
                onChange={(e) => handleInputChange('temperature2', e.target.value)}
                placeholder="Leave empty to calculate"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        );
      case 'ideal':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1">Pressure ({units.pressure})</label>
              <input
                type="number"
                value={values.pressure1}
                onChange={(e) => handleInputChange('pressure1', e.target.value)}
                placeholder={`Pressure (${units.pressure})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Volume ({units.volume})</label>
              <input
                type="number"
                value={values.volume1}
                onChange={(e) => handleInputChange('volume1', e.target.value)}
                placeholder={`Volume (${units.volume})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Moles (mol)</label>
              <input
                type="number"
                value={values.moles}
                onChange={(e) => handleInputChange('moles', e.target.value)}
                placeholder="Amount of substance (mol)"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature ({units.temperature})</label>
              <input
                type="number"
                value={values.temperature1}
                onChange={(e) => handleInputChange('temperature1', e.target.value)}
                placeholder={`Temperature (${units.temperature})`}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Gas Constant (R)</label>
              <input
                type="number"
                value={values.gasConstant}
                onChange={(e) => handleInputChange('gasConstant', e.target.value)}
                placeholder="Gas constant (R)"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Default: 0.0821 L·atm/(mol·K)
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Laws Calculator</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setActiveTab('boyle')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'boyle' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
            >
              Boyle's Law
            </button>
            <button
              onClick={() => setActiveTab('charles')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'charles' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
            >
              Charles's Law
            </button>
            <button
              onClick={() => setActiveTab('gay-lussac')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'gay-lussac' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
            >
              Gay-Lussac's Law
            </button>
            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'combined' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
            >
              Combined Gas Law
            </button>
            <button
              onClick={() => setActiveTab('ideal')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'ideal' 
                  ? 'bg-primary/20 text-primary' 
                  : 'bg-secondary/20 hover:bg-secondary/30'
              }`}
            >
              Ideal Gas Law
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Units</div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label className="block text-xs mb-1">Pressure</label>
              <select
                value={units.pressure}
                onChange={(e) => setUnits({...units, pressure: e.target.value})}
                className="w-full px-2 py-1 border rounded-md"
              >
                <option value="atm">atm</option>
                <option value="kPa">kPa</option>
                <option value="mmHg">mmHg</option>
                <option value="bar">bar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Volume</label>
              <select
                value={units.volume}
                onChange={(e) => setUnits({...units, volume: e.target.value})}
                className="w-full px-2 py-1 border rounded-md"
              >
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="m³">m³</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Temperature</label>
              <select
                value={units.temperature}
                onChange={(e) => setUnits({...units, temperature: e.target.value})}
                className="w-full px-2 py-1 border rounded-md"
              >
                <option value="K">K</option>
                <option value="C">°C</option>
                <option value="F">°F</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          {getFormFields()}
        </div>

        <button
          onClick={calculate}
          className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-700 rounded-md transition-colors"
        >
          Calculate
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-3 bg-green-500/10 rounded text-center">
            <div className="text-sm">Result:</div>
            <div className="text-xl font-bold">{result}</div>
          </div>
        )}

        <div className="mt-6 text-xs text-muted-foreground">
          <h3 className="font-medium mb-1">Gas Law Formulas:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Boyle's Law: P₁V₁ = P₂V₂ (at constant T)</li>
            <li>Charles's Law: V₁/T₁ = V₂/T₂ (at constant P)</li>
            <li>Gay-Lussac's Law: P₁/T₁ = P₂/T₂ (at constant V)</li>
            <li>Combined Gas Law: P₁V₁/T₁ = P₂V₂/T₂</li>
            <li>Ideal Gas Law: PV = nRT</li>
          </ul>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <h3 className="font-medium mb-1">Notes:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Temperature must be in absolute units (K) for gas law calculations</li>
            <li>Input values are automatically converted if using °C or °F</li>
            <li>To calculate a value, leave its field empty and fill in the others</li>
            <li>Standard conditions: 1 atm, 273.15 K (0°C)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(GasLawCalculator);