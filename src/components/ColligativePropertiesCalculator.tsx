import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

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
            <Label htmlFor="mass-solvent">Mass of Solvent (kg)</Label>
            <Input
              id="mass-solvent"
              type="number"
              value={massSolvent}
              onChange={(e) => setMassSolvent(e.target.value)}
              placeholder="Enter mass of solvent in kg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kb-constant">Boiling Point Elevation Constant (Kb)</Label>
            <Input
              id="kb-constant"
              type="number"
              value={boilingPointElevationConstant}
              onChange={(e) => setBoilingPointElevationConstant(e.target.value)}
              placeholder="Enter Kb"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kf-constant">Freezing Point Depression Constant (Kf)</Label>
            <Input
              id="kf-constant"
              type="number"
              value={freezingPointDepressionConstant}
              onChange={(e) => setFreezingPointDepressionConstant(e.target.value)}
              placeholder="Enter Kf"
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
            <div className="text-xl font-bold whitespace-pre-line">{result}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ColligativePropertiesCalculator;