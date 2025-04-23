import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const MolarityCalculator: React.FC = () => {
  const [molesSolute, setMolesSolute] = useState('');
  const [volumeSolution, setVolumeSolution] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    setResult(null);

    try {
      const moles = parseFloat(molesSolute);
      const volume = parseFloat(volumeSolution);

      if (isNaN(moles) || isNaN(volume) || volume <= 0) {
        throw new Error('Please provide valid inputs. Volume of solution must be greater than zero.');
      }

      const molarity = moles / volume;
      setResult(`Molarity = ${molarity.toFixed(4)} mol/L`);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Molarity Calculator</CardTitle>
        <CardDescription>Calculate molarity using the formula M = moles of solute / volume of solution (L).</CardDescription>
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
            <label className="block text-xs mb-1">Volume of Solution (L)</label>
            <input
              type="number"
              value={volumeSolution}
              onChange={(e) => setVolumeSolution(e.target.value)}
              placeholder="Enter volume of solution in L"
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

export default MolarityCalculator;