import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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
        <CardDescription>Calculate dilution using the formula C1V1 = C2V2.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs mb-1">Initial Concentration (C1)</label>
            <input
              type="number"
              value={initialConcentration}
              onChange={(e) => setInitialConcentration(e.target.value)}
              placeholder="Enter C1"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Initial Volume (V1)</label>
            <input
              type="number"
              value={initialVolume}
              onChange={(e) => setInitialVolume(e.target.value)}
              placeholder="Enter V1"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Final Concentration (C2)</label>
            <input
              type="number"
              value={finalConcentration}
              onChange={(e) => setFinalConcentration(e.target.value)}
              placeholder="Enter C2"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Final Volume (V2)</label>
            <input
              type="number"
              value={finalVolume}
              onChange={(e) => setFinalVolume(e.target.value)}
              placeholder="Enter V2"
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

export default DilutionCalculator;