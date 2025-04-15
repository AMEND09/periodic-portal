import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

// Define interfaces for unit structure
interface UnitInfo {
  name: string;
  factor: number;
}

interface CategoryUnits {
  [key: string]: UnitInfo;
}

interface UnitCategoryInfo {
  name: string;
  units: CategoryUnits;
}

interface UnitCategoriesType {
  [key: string]: UnitCategoryInfo;
}

// Unit conversion categories and their respective units
const unitCategories: UnitCategoriesType = {
  length: {
    name: 'Length',
    units: {
      meter: { name: 'Meter (m)', factor: 1 },
      kilometer: { name: 'Kilometer (km)', factor: 1000 },
      centimeter: { name: 'Centimeter (cm)', factor: 0.01 },
      millimeter: { name: 'Millimeter (mm)', factor: 0.001 },
      mile: { name: 'Mile (mi)', factor: 1609.34 },
      yard: { name: 'Yard (yd)', factor: 0.9144 },
      foot: { name: 'Foot (ft)', factor: 0.3048 },
      inch: { name: 'Inch (in)', factor: 0.0254 },
      nauticalMile: { name: 'Nautical Mile (nmi)', factor: 1852 }
    }
  },
  mass: {
    name: 'Mass',
    units: {
      kilogram: { name: 'Kilogram (kg)', factor: 1 },
      gram: { name: 'Gram (g)', factor: 0.001 },
      milligram: { name: 'Milligram (mg)', factor: 0.000001 },
      metricTon: { name: 'Metric Ton (t)', factor: 1000 },
      pound: { name: 'Pound (lb)', factor: 0.453592 },
      ounce: { name: 'Ounce (oz)', factor: 0.0283495 },
      stone: { name: 'Stone (st)', factor: 6.35029 }
    }
  },
  volume: {
    name: 'Volume',
    units: {
      liter: { name: 'Liter (L)', factor: 1 },
      milliliter: { name: 'Milliliter (mL)', factor: 0.001 },
      cubicMeter: { name: 'Cubic Meter (m³)', factor: 1000 },
      gallon: { name: 'Gallon (gal)', factor: 3.78541 },
      quart: { name: 'Quart (qt)', factor: 0.946353 },
      pint: { name: 'Pint (pt)', factor: 0.473176 },
      cup: { name: 'Cup (cup)', factor: 0.24 },
      fluidOunce: { name: 'Fluid Ounce (fl oz)', factor: 0.0295735 }
    }
  },
  temperature: {
    name: 'Temperature',
    units: {
      celsius: { name: 'Celsius (°C)', factor: 1 },
      fahrenheit: { name: 'Fahrenheit (°F)', factor: 1 },
      kelvin: { name: 'Kelvin (K)', factor: 1 }
    }
  },
  time: {
    name: 'Time',
    units: {
      second: { name: 'Second (s)', factor: 1 },
      minute: { name: 'Minute (min)', factor: 60 },
      hour: { name: 'Hour (h)', factor: 3600 },
      day: { name: 'Day (d)', factor: 86400 },
      week: { name: 'Week (wk)', factor: 604800 },
      month: { name: 'Month (mo)', factor: 2629800 },
      year: { name: 'Year (yr)', factor: 31557600 }
    }
  },
  area: {
    name: 'Area',
    units: {
      squareMeter: { name: 'Square Meter (m²)', factor: 1 },
      squareKilometer: { name: 'Square Kilometer (km²)', factor: 1000000 },
      hectare: { name: 'Hectare (ha)', factor: 10000 },
      squareFoot: { name: 'Square Foot (ft²)', factor: 0.092903 },
      squareYard: { name: 'Square Yard (yd²)', factor: 0.836127 },
      acre: { name: 'Acre (ac)', factor: 4046.86 },
      squareMile: { name: 'Square Mile (mi²)', factor: 2589990 }
    }
  },
  pressure: {
    name: 'Pressure',
    units: {
      pascal: { name: 'Pascal (Pa)', factor: 1 },
      kilopascal: { name: 'Kilopascal (kPa)', factor: 1000 },
      bar: { name: 'Bar (bar)', factor: 100000 },
      psi: { name: 'Pound per Square Inch (psi)', factor: 6894.76 },
      atmosphere: { name: 'Atmosphere (atm)', factor: 101325 },
      mmHg: { name: 'Millimeter of Mercury (mmHg)', factor: 133.322 },
      inHg: { name: 'Inch of Mercury (inHg)', factor: 3386.39 }
    }
  },
  energy: {
    name: 'Energy',
    units: {
      joule: { name: 'Joule (J)', factor: 1 },
      kilojoule: { name: 'Kilojoule (kJ)', factor: 1000 },
      calorie: { name: 'Calorie (cal)', factor: 4.184 },
      kilocalorie: { name: 'Kilocalorie (kcal)', factor: 4184 },
      wattHour: { name: 'Watt-hour (Wh)', factor: 3600 },
      kilowattHour: { name: 'Kilowatt-hour (kWh)', factor: 3600000 },
      electronvolt: { name: 'Electronvolt (eV)', factor: 1.602177e-19 }
    }
  },
  speed: {
    name: 'Speed',
    units: {
      meterPerSecond: { name: 'Meter per Second (m/s)', factor: 1 },
      kilometerPerHour: { name: 'Kilometer per Hour (km/h)', factor: 0.277778 },
      milePerHour: { name: 'Mile per Hour (mph)', factor: 0.44704 },
      knot: { name: 'Knot (kn)', factor: 0.514444 },
      footPerSecond: { name: 'Foot per Second (ft/s)', factor: 0.3048 }
    }
  },
  data: {
    name: 'Data',
    units: {
      bit: { name: 'Bit (b)', factor: 1 },
      byte: { name: 'Byte (B)', factor: 8 },
      kilobit: { name: 'Kilobit (kb)', factor: 1000 },
      kilobyte: { name: 'Kilobyte (kB)', factor: 8000 },
      megabit: { name: 'Megabit (Mb)', factor: 1000000 },
      megabyte: { name: 'Megabyte (MB)', factor: 8000000 },
      gigabit: { name: 'Gigabit (Gb)', factor: 1000000000 },
      gigabyte: { name: 'Gigabyte (GB)', factor: 8000000000 },
      terabit: { name: 'Terabit (Tb)', factor: 1000000000000 },
      terabyte: { name: 'Terabyte (TB)', factor: 8000000000000 }
    }
  }
};

// Special conversion functions for temperature
const temperatureConversions = {
  celsiusToFahrenheit: (celsius: number) => (celsius * 9/5) + 32,
  celsiusToKelvin: (celsius: number) => celsius + 273.15,
  fahrenheitToCelsius: (fahrenheit: number) => (fahrenheit - 32) * 5/9,
  fahrenheitToKelvin: (fahrenheit: number) => ((fahrenheit - 32) * 5/9) + 273.15,
  kelvinToCelsius: (kelvin: number) => kelvin - 273.15,
  kelvinToFahrenheit: (kelvin: number) => ((kelvin - 273.15) * 9/5) + 32
};

type UnitCategory = keyof typeof unitCategories;
type Unit = string;

const UnitConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<UnitCategory>('length');
  const [fromUnit, setFromUnit] = useState<Unit>('meter');
  const [toUnit, setToUnit] = useState<Unit>('kilometer');
  const [inputValue, setInputValue] = useState<string>('1');
  const [convertedValue, setConvertedValue] = useState<string>('');
  const [conversionFormula, setConversionFormula] = useState<string>('');
  const [recentConversions, setRecentConversions] = useState<string[]>([]);

  // Handle category change
  const handleCategoryChange = (category: UnitCategory) => {
    setSelectedCategory(category);
    // Set default units for the new category
    const unitKeys = Object.keys(unitCategories[category].units);
    setFromUnit(unitKeys[0]);
    setToUnit(unitKeys[1]);
    // Reset the input value
    setInputValue('1');
    // Perform conversion with new units
    performConversion('1', unitKeys[0], unitKeys[1], category);
  };

  // Handle from unit change
  const handleFromUnitChange = (unit: Unit) => {
    setFromUnit(unit);
    performConversion(inputValue, unit, toUnit, selectedCategory);
  };

  // Handle to unit change
  const handleToUnitChange = (unit: Unit) => {
    setToUnit(unit);
    performConversion(inputValue, fromUnit, unit, selectedCategory);
  };

  // Handle input value change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    performConversion(value, fromUnit, toUnit, selectedCategory);
  };

  // Swap units
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    performConversion(inputValue, toUnit, fromUnit, selectedCategory);
  };

  // Handle temperature conversions
  const convertTemperature = (value: number, from: Unit, to: Unit): number => {
    if (from === to) return value;
    
    if (from === 'celsius') {
      if (to === 'fahrenheit') return temperatureConversions.celsiusToFahrenheit(value);
      if (to === 'kelvin') return temperatureConversions.celsiusToKelvin(value);
    } else if (from === 'fahrenheit') {
      if (to === 'celsius') return temperatureConversions.fahrenheitToCelsius(value);
      if (to === 'kelvin') return temperatureConversions.fahrenheitToKelvin(value);
    } else if (from === 'kelvin') {
      if (to === 'celsius') return temperatureConversions.kelvinToCelsius(value);
      if (to === 'fahrenheit') return temperatureConversions.kelvinToFahrenheit(value);
    }
    
    return value; // Fallback
  };

  // Generate conversion formula
  const generateFormula = (
    value: number,
    fromUnit: Unit,
    toUnit: Unit,
    category: UnitCategory
  ): string => {
    const units = unitCategories[category].units;
    const fromName = units[fromUnit as keyof typeof units].name.split(' ')[0];
    const toName = units[toUnit as keyof typeof units].name.split(' ')[0];

    if (category === 'temperature') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return `(${value} °C × 9/5) + 32 = ${convertedValue} °F`;
      } else if (fromUnit === 'celsius' && toUnit === 'kelvin') {
        return `${value} °C + 273.15 = ${convertedValue} K`;
      } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return `(${value} °F - 32) × 5/9 = ${convertedValue} °C`;
      } else if (fromUnit === 'fahrenheit' && toUnit === 'kelvin') {
        return `(${value} °F - 32) × 5/9 + 273.15 = ${convertedValue} K`;
      } else if (fromUnit === 'kelvin' && toUnit === 'celsius') {
        return `${value} K - 273.15 = ${convertedValue} °C`;
      } else if (fromUnit === 'kelvin' && toUnit === 'fahrenheit') {
        return `(${value} K - 273.15) × 9/5 + 32 = ${convertedValue} °F`;
      }
      return '';
    }

    const fromFactor = units[fromUnit as keyof typeof units].factor;
    const toFactor = units[toUnit as keyof typeof units].factor;
    const conversion = (value * fromFactor) / toFactor;
    
    return `${value} ${fromName} × ${fromFactor} / ${toFactor} = ${conversion.toFixed(6)} ${toName}`;
  };

  // Perform the conversion
  const performConversion = (
    input: string,
    from: Unit,
    to: Unit,
    category: UnitCategory
  ) => {
    if (!input || isNaN(parseFloat(input))) {
      setConvertedValue('');
      setConversionFormula('');
      return;
    }

    const value = parseFloat(input);
    let result: number;

    if (category === 'temperature') {
      result = convertTemperature(value, from, to);
    } else {
      const fromFactor = unitCategories[category].units[from as keyof typeof unitCategories[typeof category]['units']].factor;
      const toFactor = unitCategories[category].units[to as keyof typeof unitCategories[typeof category]['units']].factor;
      result = (value * fromFactor) / toFactor;
    }

    const formattedResult = formatResult(result);
    setConvertedValue(formattedResult);
    
    // Generate and set the formula
    const formula = generateFormula(value, from, to, category);
    setConversionFormula(formula);
    
    // Add to recent conversions if it's a valid conversion
    if (formattedResult) {
      const unitFrom = unitCategories[category].units[from as keyof typeof unitCategories[typeof category]['units']].name;
      const unitTo = unitCategories[category].units[to as keyof typeof unitCategories[typeof category]['units']].name;
      const conversionText = `${value} ${unitFrom.split(' ')[0]} = ${formattedResult} ${unitTo.split(' ')[0]}`;
      
      // Add to recent conversions (limit to 5)
      setRecentConversions(prev => {
        const newConversions = [conversionText, ...prev.filter(c => c !== conversionText)];
        return newConversions.slice(0, 5);
      });
    }
  };

  // Format the result based on the magnitude
  const formatResult = (value: number): string => {
    if (isNaN(value) || !isFinite(value)) return '';
    
    // For very small or very large numbers, use scientific notation
    if (Math.abs(value) < 0.000001 || Math.abs(value) > 1000000000) {
      return value.toExponential(6);
    }
    
    // For regular numbers, use a reasonable number of decimal places
    const decimalPlaces = value % 1 === 0 ? 0 : 6;
    return value.toFixed(decimalPlaces);
  };

  // Initialize conversion on component mount
  useEffect(() => {
    performConversion(inputValue, fromUnit, toUnit, selectedCategory);
  }, []);

  // Get units for current category
  const categoryUnits = unitCategories[selectedCategory].units;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Converter</CardTitle>
        <CardDescription>
          Convert between different units of measurement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Category selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(unitCategories).map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category as UnitCategory)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary/20 hover:bg-secondary/30'
                  }`}
                >
                  {unitCategories[category as UnitCategory].name}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From unit */}
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <div className="flex flex-col space-y-2">
                <select
                  value={fromUnit}
                  onChange={(e) => handleFromUnitChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {Object.keys(categoryUnits).map((unit) => (
                    <option key={unit} value={unit}>
                      {categoryUnits[unit as keyof typeof categoryUnits].name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter value"
                />
              </div>
            </div>

            {/* Swap button (visible only on mobile) */}
            <div className="flex justify-center items-center md:hidden">
              <button
                onClick={swapUnits}
                className="p-2 bg-secondary/20 hover:bg-secondary/30 rounded-full"
              >
                ⇄
              </button>
            </div>

            {/* To unit */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">To</label>
                {/* Swap button (visible only on desktop) */}
                <button
                  onClick={swapUnits}
                  className="hidden md:flex items-center text-xs text-primary"
                >
                  Swap units ⇄
                </button>
              </div>
              <div className="flex flex-col space-y-2">
                <select
                  value={toUnit}
                  onChange={(e) => handleToUnitChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {Object.keys(categoryUnits).map((unit) => (
                    <option key={unit} value={unit}>
                      {categoryUnits[unit as keyof typeof categoryUnits].name}
                    </option>
                  ))}
                </select>
                <div className="w-full px-3 py-2 border rounded-md bg-secondary/5 font-mono">
                  {convertedValue || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Conversion formula */}
          {conversionFormula && (
            <div className="p-3 bg-secondary/10 rounded-md">
              <h3 className="text-xs font-medium mb-1">Conversion Formula:</h3>
              <p className="text-sm font-mono">{conversionFormula}</p>
            </div>
          )}

          {/* Recent conversions */}
          {recentConversions.length > 0 && (
            <div className="bg-secondary/5 rounded-md p-3">
              <h3 className="text-xs font-medium mb-2">Recent Conversions:</h3>
              <ul className="space-y-1">
                {recentConversions.map((conversion, index) => (
                  <li key={index} className="text-xs border-b border-secondary/20 last:border-0 py-1">
                    {conversion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional info based on category */}
          {selectedCategory === 'temperature' && (
            <div className="text-xs text-muted-foreground">
              <p>Common reference points:</p>
              <ul className="list-disc list-inside">
                <li>Water freezes: 0°C / 32°F / 273.15K</li>
                <li>Water boils: 100°C / 212°F / 373.15K</li>
                <li>Body temperature: ~37°C / ~98.6°F / ~310.15K</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(UnitConverter);