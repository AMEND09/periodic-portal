import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

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
          <div className="space-y-1.5">
            <Label htmlFor="moles-solute">Moles of Solute</Label>
            <Input
              id="moles-solute"
              type="number"
              value={molesSolute}
              onChange={(e) => setMolesSolute(e.target.value)}
              placeholder="Enter moles of solute"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="volume-solution">Volume of Solution (L)</Label>
            <Input
              id="volume-solution"
              type="number"
              value={volumeSolution}
              onChange={(e) => setVolumeSolution(e.target.value)}
              placeholder="Enter volume of solution in L"
            />
          </div>
        </div>
        <Button
          onClick={calculate}
          className="w-full"
        >
          Calculate
        </Button>

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
      </CardContent>
    </Card>
  );
};

export default MolarityCalculator;