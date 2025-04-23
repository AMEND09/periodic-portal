import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const ColligativePropertiesCalculator: React.FC = () => {
  const [molesSolute, setMolesSolute] = useState('');
  const [massSolvent, setMassSolvent] = useState('');
  const [boilingPointElevationConstant, setBoilingPointElevationConstant] = useState('');
  const [freezingPointDepressionConstant, setFreezingPointDepressionConstant] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    setResult(null);

    try {
      const moles = parseFloat(molesSolute);
      const mass = parseFloat(massSolvent);
      const kb = parseFloat(boilingPointElevationConstant);
      const kf = parseFloat(freezingPointDepressionConstant);

      if (isNaN(moles) || isNaN(mass) || mass <= 0 || isNaN(kb) || isNaN(kf)) {
        throw new Error('Please provide valid inputs. Mass of solvent must be greater than zero.');
      }

      const molality = moles / mass;
      const boilingPointElevation = molality * kb;
      const freezingPointDepression = molality * kf;

      setResult(
        `Boiling Point Elevation = ${boilingPointElevation.toFixed(4)} °C\n` +
        `Freezing Point Depression = ${freezingPointDepression.toFixed(4)} °C`
      );
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Colligative Properties Calculator</CardTitle>
        <CardDescription>Calculate boiling point elevation and freezing point depression based on molality.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs mb-1">Moles of Solute</label>
            <input
              type="number"
              value={molesSolute}
              onChange={(e) => setMolesSolute(e.target.value)}
              placeholder="Enter moles of solute"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Mass of Solvent (kg)</label>
            <input
              type="number"
              value={massSolvent}
              onChange={(e) => setMassSolvent(e.target.value)}
              placeholder="Enter mass of solvent in kg"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Boiling Point Elevation Constant (Kb)</label>
            <input
              type="number"
              value={boilingPointElevationConstant}
              onChange={(e) => setBoilingPointElevationConstant(e.target.value)}
              placeholder="Enter Kb"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Freezing Point Depression Constant (Kf)</label>
            <input
              type="number"
              value={freezingPointDepressionConstant}
              onChange={(e) => setFreezingPointDepressionConstant(e.target.value)}
              placeholder="Enter Kf"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <button
          onClick={calculate}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Calculate
        </button>

        {error && <div className="mt-4 text-red-500">{error}</div>}
        {result && <div className="mt-4 text-green-500 whitespace-pre-line">{result}</div>}
      </CardContent>
    </Card>
  );
};

export default ColligativePropertiesCalculator;