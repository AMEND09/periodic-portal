import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

const DilutionCalculator: React.FC = () => {
  const [initialConcentration, setInitialConcentration] = useState('');
  const [initialVolume, setInitialVolume] = useState('');
  const [finalConcentration, setFinalConcentration] = useState('');
  const [finalVolume, setFinalVolume] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculate = () => {
    setError(null);
    setResult(null);

    try {
      const c1 = parseFloat(initialConcentration);
      const v1 = parseFloat(initialVolume);
      const c2 = parseFloat(finalConcentration);
      const v2 = parseFloat(finalVolume);

      if (!isNaN(c1) && !isNaN(v1) && !isNaN(c2)) {
        const calculatedV2 = (c1 * v1) / c2;
        setResult(`Final Volume = ${calculatedV2.toFixed(4)} units`);
      } else if (!isNaN(c1) && !isNaN(v1) && !isNaN(v2)) {
        const calculatedC2 = (c1 * v1) / v2;
        setResult(`Final Concentration = ${calculatedC2.toFixed(4)} units`);
      } else {
        throw new Error('Please provide at least three values to calculate the fourth.');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dilution Calculator</CardTitle>
        <CardDescription>Calculate dilution using the formula C₁V₁ = C₂V₂.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="space-y-1.5">
            <Label htmlFor="initial-concentration">Initial Concentration (C₁)</Label>
            <Input
              id="initial-concentration"
              type="number"
              value={initialConcentration}
              onChange={(e) => setInitialConcentration(e.target.value)}
              placeholder="Enter C₁"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="initial-volume">Initial Volume (V₁)</Label>
            <Input
              id="initial-volume"
              type="number"
              value={initialVolume}
              onChange={(e) => setInitialVolume(e.target.value)}
              placeholder="Enter V₁"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="final-concentration">Final Concentration (C₂)</Label>
            <Input
              id="final-concentration"
              type="number"
              value={finalConcentration}
              onChange={(e) => setFinalConcentration(e.target.value)}
              placeholder="Enter C₂"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="final-volume">Final Volume (V₂)</Label>
            <Input
              id="final-volume"
              type="number"
              value={finalVolume}
              onChange={(e) => setFinalVolume(e.target.value)}
              placeholder="Enter V₂"
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

export default DilutionCalculator;