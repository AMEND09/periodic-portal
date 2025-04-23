import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const MolalityCalculator: React.FC = () => {
  const [molesSolute, setMolesSolute] = useState('');
  const [massSolvent, setMassSolvent] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    setResult(null);

    try {
      const moles = parseFloat(molesSolute);
      const mass = parseFloat(massSolvent);

      if (isNaN(moles) || isNaN(mass) || mass <= 0) {
        throw new Error('Please provide valid inputs. Mass of solvent must be greater than zero.');
      }

      const molality = moles / mass;
      setResult(`Molality = ${molality.toFixed(4)} mol/kg`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Molality Calculator</CardTitle>
        <CardDescription>Calculate molality using the formula m = moles of solute / mass of solvent (kg).</CardDescription>
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
        </div>
        <button
          onClick={calculate}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Calculate
        </button>

        {error && <div className="mt-4 text-red-500">{error}</div>}
        {result && <div className="mt-4 text-green-500">{result}</div>}
      </CardContent>
    </Card>
  );
};

export default MolalityCalculator;