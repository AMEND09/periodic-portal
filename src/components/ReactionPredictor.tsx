import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ReactionType {
  id: string;
  name: string;
  description: string;
  examples: string[];
}

const ReactionPredictor: React.FC = () => {
  const [reactants, setReactants] = useState('');
  const [selectedReactionType, setSelectedReactionType] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define common reaction types
  const reactionTypes: ReactionType[] = [
    {
      id: 'combustion',
      name: 'Combustion',
      description: 'Reaction of a hydrocarbon with oxygen to form carbon dioxide and water',
      examples: ['CH4 + O2', 'C3H8 + O2', 'C2H5OH + O2']
    },
    {
      id: 'neutralization',
      name: 'Acid-Base Neutralization',
      description: 'Reaction between an acid and a base to form water and a salt',
      examples: ['HCl + NaOH', 'H2SO4 + Ca(OH)2', 'CH3COOH + NH3']
    },
    {
      id: 'precipitation',
      name: 'Precipitation',
      description: 'Formation of an insoluble solid from a solution of ionic compounds',
      examples: ['AgNO3 + NaCl', 'BaCl2 + Na2SO4', 'Pb(NO3)2 + KI']
    },
    {
      id: 'redox',
      name: 'Redox Reaction',
      description: 'Electron transfer between reactants, changing oxidation states',
      examples: ['Fe + CuSO4', 'Zn + HCl', 'H2 + O2']
    },
    {
      id: 'synthesis',
      name: 'Synthesis (Combination)',
      description: 'Two or more substances combine to form a single product',
      examples: ['N2 + H2', 'Na + Cl2', 'CaO + H2O']
    },
    {
      id: 'decomposition',
      name: 'Decomposition',
      description: 'A single compound breaks down into multiple simpler substances',
      examples: ['CaCO3', 'H2O2', 'NH4NO3']
    },
    {
      id: 'single-replacement',
      name: 'Single Replacement',
      description: 'One element replaces another in a compound',
      examples: ['Zn + HCl', 'Al + CuSO4', 'Na + H2O']
    },
    {
      id: 'double-replacement',
      name: 'Double Replacement',
      description: 'Exchange of ions between two compounds',
      examples: ['NaCl + AgNO3', 'HCl + NaOH', 'BaCl2 + Na2SO4']
    }
  ];

  // Reset all states to default
  const resetStates = () => {
    setResult(null);
    setExplanation(null);
    setError(null);
  };

  // Handle reaction type change
  const handleReactionTypeChange = (typeId: string) => {
    setSelectedReactionType(typeId);
    resetStates();
    
    // Auto-fill with an example
    const selectedType = reactionTypes.find(r => r.id === typeId);
    if (selectedType && selectedType.examples.length > 0) {
      setReactants(selectedType.examples[0]);
    }
  };

  // Predict reaction products
  const predictReaction = useCallback(() => {
    resetStates();
    
    if (!reactants.trim()) {
      setError('Please enter reactants');
      return;
    }
    
    if (!selectedReactionType) {
      setError('Please select a reaction type');
      return;
    }
    
    try {
      // Parse reactants
      const reactantsFormatted = reactants.trim().replace(/\s+/g, '');
      
      switch (selectedReactionType) {
        case 'combustion':
          predictCombustion(reactantsFormatted);
          break;
        case 'neutralization':
          predictNeutralization(reactantsFormatted);
          break;
        case 'precipitation':
          predictPrecipitation(reactantsFormatted);
          break;
        case 'redox':
          predictRedox(reactantsFormatted);
          break;
        case 'synthesis':
          predictSynthesis(reactantsFormatted);
          break;
        case 'decomposition':
          predictDecomposition(reactantsFormatted);
          break;
        case 'single-replacement':
          predictSingleReplacement(reactantsFormatted);
          break;
        case 'double-replacement':
          predictDoubleReplacement(reactantsFormatted);
          break;
        default:
          setError('Unknown reaction type');
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [reactants, selectedReactionType]);

  // Predict combustion reaction (CxHy + O2 → CO2 + H2O)
  const predictCombustion = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    if (parts.length !== 2) {
      throw new Error('Combustion reactions need a hydrocarbon and oxygen');
    }
    
    // Check if one part contains O2
    const oxygenIndex = parts.findIndex(p => p.includes('O2'));
    if (oxygenIndex === -1) {
      throw new Error('Combustion requires oxygen (O2)');
    }
    
    // The other part should be the hydrocarbon
    const hydrocarbonIndex = oxygenIndex === 0 ? 1 : 0;
    const hydrocarbon = parts[hydrocarbonIndex];
    
    // Extract carbon and hydrogen from hydrocarbon
    const carbonMatch = hydrocarbon.match(/C(\d*)/);
    const hydrogenMatch = hydrocarbon.match(/H(\d*)/);
    
    if (!carbonMatch || !hydrogenMatch) {
      throw new Error('Invalid hydrocarbon format. Expected format like CH4, C2H6, etc.');
    }
    
    const carbonCount = carbonMatch[1] ? parseInt(carbonMatch[1]) : 1;
    const hydrogenCount = hydrogenMatch[1] ? parseInt(hydrogenMatch[1]) : 1;
    
    // Check for other elements that might complicate combustion
    const containsOxygen = hydrocarbon.match(/O(\d*)/);
    const oxygenCount = containsOxygen && containsOxygen[1] ? parseInt(containsOxygen[1]) : 0;
    
    // Balance the equation
    // CxHyOz + (x + y/4 - z/2)O2 → xCO2 + (y/2)H2O
    const oxygenNeeded = carbonCount + hydrogenCount / 4 - oxygenCount / 2;
    
    // Create balanced equation
    const balancedEquation = `${hydrocarbon} + ${oxygenNeeded % 1 === 0 ? oxygenNeeded : oxygenNeeded.toFixed(2)}O2 → ${carbonCount}CO2 + ${hydrogenCount / 2}H2O`;
    
    setResult(balancedEquation);
    setExplanation(`Combustion of ${hydrocarbon} with oxygen produces carbon dioxide and water. Each carbon atom forms one CO2 molecule, and each pair of hydrogen atoms forms one H2O molecule.`);
  };

  // Predict neutralization reaction (acid + base → salt + water)
  const predictNeutralization = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    if (parts.length !== 2) {
      throw new Error('Neutralization reactions need an acid and a base');
    }
    
    // Identify acid and base
    let acid = '';
    let base = '';
    
    // Common acids and their formulas
    const acids = ['HCl', 'H2SO4', 'HNO3', 'H3PO4', 'CH3COOH', 'H2CO3'];
    // Common bases and their formulas
    const bases = ['NaOH', 'KOH', 'Ca(OH)2', 'Mg(OH)2', 'NH3', 'NH4OH'];
    
    // Try to identify acid and base from input
    for (const part of parts) {
      if (acids.some(a => part.includes(a))) {
        acid = part;
      } else if (bases.some(b => part.includes(b))) {
        base = part;
      }
    }
    
    if (!acid || !base) {
      throw new Error('Could not identify an acid and a base in the reactants');
    }
    
    // Simplified product prediction based on common formulas
    let salt = '';
    let explanation = '';
    
    if (acid === 'HCl' && base === 'NaOH') {
      salt = 'NaCl';
      explanation = 'The H+ from HCl combines with OH- from NaOH to form water, while Na+ and Cl- ions combine to form NaCl.';
    } else if (acid === 'HCl' && base === 'KOH') {
      salt = 'KCl';
      explanation = 'The H+ from HCl combines with OH- from KOH to form water, while K+ and Cl- ions combine to form KCl.';
    } else if (acid === 'H2SO4' && base === 'NaOH') {
      salt = 'Na2SO4';
      explanation = 'Each H2SO4 molecule reacts with 2 NaOH molecules. The H+ ions combine with OH- ions to form water, while Na+ and SO4(2-) ions form Na2SO4.';
    } else if (acid === 'H2SO4' && base === 'Ca(OH)2') {
      salt = 'CaSO4';
      explanation = 'H2SO4 and Ca(OH)2 react in a 1:1 ratio. The H+ ions combine with OH- ions to form water, while Ca(2+) and SO4(2-) ions form CaSO4.';
    } else if (acid === 'CH3COOH' && base === 'NaOH') {
      salt = 'CH3COONa';
      explanation = 'The H+ from acetic acid (CH3COOH) combines with OH- from NaOH to form water, while Na+ and CH3COO- ions form sodium acetate.';
    } else if (acid === 'CH3COOH' && base === 'NH3') {
      salt = 'CH3COONH4';
      explanation = 'Acetic acid donates H+ to ammonia, forming ammonium acetate.';
    } else {
      // Generic prediction based on acid-base chemistry
      
      // Extract acid cation and anion (simplified)
      const acidCation = 'H';
      let acidAnion = acid.replace(/H\d*/, '');
      if (acidAnion.startsWith('(') && acidAnion.endsWith(')')) {
        acidAnion = acidAnion.substring(1, acidAnion.length - 1);
      }
      
      // Extract base cation and anion (simplified)
      let baseCation = base.replace(/\(OH\)\d*|OH$/, '');
      const baseAnion = 'OH';
      
      if (baseCation === '') {
        baseCation = 'Na'; // Default case
      }
      
      salt = `${baseCation}${acidAnion}`;
      explanation = `In this acid-base neutralization, the hydrogen from the acid combines with the hydroxide from the base to form water, while the remaining ions form ${salt}.`;
    }
    
    setResult(`${acid} + ${base} → ${salt} + H2O`);
    setExplanation(explanation);
  };

  // Predict precipitation reactions
  const predictPrecipitation = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    if (parts.length !== 2) {
      throw new Error('Precipitation reactions typically involve two ionic compounds');
    }
    
    // Define some common insoluble precipitates
    const insolubleCompounds = [
      { ions: ['Ag+', 'Cl-'], formula: 'AgCl', name: 'silver chloride' },
      { ions: ['Ag+', 'Br-'], formula: 'AgBr', name: 'silver bromide' },
      { ions: ['Ag+', 'I-'], formula: 'AgI', name: 'silver iodide' },
      { ions: ['Pb2+', 'Cl-'], formula: 'PbCl2', name: 'lead(II) chloride' },
      { ions: ['Pb2+', 'I-'], formula: 'PbI2', name: 'lead(II) iodide' },
      { ions: ['Ba2+', 'SO42-'], formula: 'BaSO4', name: 'barium sulfate' },
      { ions: ['Ca2+', 'CO32-'], formula: 'CaCO3', name: 'calcium carbonate' },
      { ions: ['Ca2+', 'SO42-'], formula: 'CaSO4', name: 'calcium sulfate' },
      { ions: ['Fe2+', 'S2-'], formula: 'FeS', name: 'iron(II) sulfide' },
      { ions: ['Fe3+', 'OH-'], formula: 'Fe(OH)3', name: 'iron(III) hydroxide' },
      { ions: ['Cu2+', 'S2-'], formula: 'CuS', name: 'copper(II) sulfide' }
    ];
    
    // Common soluble ionic compounds and their ions
    const solubleCompounds = [
      { formula: 'NaCl', cation: 'Na+', anion: 'Cl-' },
      { formula: 'KCl', cation: 'K+', anion: 'Cl-' },
      { formula: 'NaNO3', cation: 'Na+', anion: 'NO3-' },
      { formula: 'KNO3', cation: 'K+', anion: 'NO3-' },
      { formula: 'AgNO3', cation: 'Ag+', anion: 'NO3-' },
      { formula: 'Na2SO4', cation: 'Na+', anion: 'SO42-' },
      { formula: 'BaCl2', cation: 'Ba2+', anion: 'Cl-' },
      { formula: 'CaCl2', cation: 'Ca2+', anion: 'Cl-' },
      { formula: 'Pb(NO3)2', cation: 'Pb2+', anion: 'NO3-' },
      { formula: 'NaOH', cation: 'Na+', anion: 'OH-' },
      { formula: 'KI', cation: 'K+', anion: 'I-' },
      { formula: 'Na2S', cation: 'Na+', anion: 'S2-' },
      { formula: 'Na2CO3', cation: 'Na+', anion: 'CO32-' }
    ];
    
    // Example: AgNO3 + NaCl -> AgCl↓ + NaNO3
    let compound1Ions: { cation: string, anion: string } | undefined;
    let compound2Ions: { cation: string, anion: string } | undefined;
    
    // Try to match input compounds to known soluble compounds
    for (const compound of solubleCompounds) {
      if (parts[0].includes(compound.formula)) {
        compound1Ions = { cation: compound.cation, anion: compound.anion };
      }
      if (parts[1].includes(compound.formula)) {
        compound2Ions = { cation: compound.cation, anion: compound.anion };
      }
    }
    
    if (!compound1Ions || !compound2Ions) {
      // Special cases
      if ((parts[0] === 'AgNO3' && parts[1] === 'NaCl') || (parts[1] === 'AgNO3' && parts[0] === 'NaCl')) {
        setResult('AgNO3 + NaCl → AgCl↓ + NaNO3');
        setExplanation('When silver nitrate and sodium chloride solutions are mixed, silver chloride precipitates as a white solid. This is a classic double replacement reaction where Ag+ and Cl- ions combine to form an insoluble compound.');
        return;
      } else if ((parts[0] === 'BaCl2' && parts[1] === 'Na2SO4') || (parts[1] === 'BaCl2' && parts[0] === 'Na2SO4')) {
        setResult('BaCl2 + Na2SO4 → BaSO4↓ + 2NaCl');
        setExplanation('When barium chloride and sodium sulfate solutions are mixed, barium sulfate precipitates as a white solid. This is a classic double replacement reaction where Ba2+ and SO42- ions combine to form an insoluble compound.');
        return;
      } else if ((parts[0] === 'Pb(NO3)2' && parts[1] === 'KI') || (parts[1] === 'Pb(NO3)2' && parts[0] === 'KI')) {
        setResult('Pb(NO3)2 + 2KI → PbI2↓ + 2KNO3');
        setExplanation('When lead(II) nitrate and potassium iodide solutions are mixed, lead(II) iodide precipitates as a yellow solid. This double replacement reaction is often used as a demonstration of precipitation reactions.');
        return;
      }
      
      throw new Error('Could not determine the ions in the reactants. Try using commonly recognized ionic compounds.');
    }
    
    // Check for possible precipitates
    let precipitate = null;
    for (const insoluble of insolubleCompounds) {
      if ((insoluble.ions.includes(compound1Ions.cation) && insoluble.ions.includes(compound2Ions.anion)) ||
          (insoluble.ions.includes(compound1Ions.anion) && insoluble.ions.includes(compound2Ions.cation))) {
        precipitate = insoluble;
        break;
      }
    }
    
    if (!precipitate) {
      setResult(`${parts[0]} + ${parts[1]} → No precipitation occurs`);
      setExplanation('The ions present do not form an insoluble compound, so all products remain dissolved in solution.');
      return;
    }
    
    // Determine the other product (the soluble salt)
    let otherProduct = '';
    if (precipitate.ions.includes(compound1Ions.cation)) {
      // Precipitate forms from cation of compound1 and anion of compound2
      otherProduct = compound2Ions.cation + compound1Ions.anion;
    } else {
      // Precipitate forms from anion of compound1 and cation of compound2
      otherProduct = compound1Ions.cation + compound2Ions.anion;
    }
    
    setResult(`${parts[0]} + ${parts[1]} → ${precipitate.formula}↓ + ${otherProduct}`);
    setExplanation(`When these solutions mix, ${precipitate.name} precipitates as an insoluble solid. The downward arrow (↓) indicates a precipitate forming. The other product remains dissolved in solution.`);
  };

  // Predict redox reactions
  const predictRedox = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    
    // Handle specific common redox reactions
    if ((parts[0] === 'Fe' && parts[1] === 'CuSO4') || (parts[1] === 'Fe' && parts[0] === 'CuSO4')) {
      setResult('Fe + CuSO4 → FeSO4 + Cu');
      setExplanation('Iron replaces copper in copper sulfate because iron is more reactive than copper. Iron is oxidized (loses electrons) to Fe2+, while Cu2+ is reduced (gains electrons) to Cu. This is a single replacement redox reaction.');
      return;
    }
    
    if ((parts[0] === 'Zn' && parts[1] === 'HCl') || (parts[1] === 'Zn' && parts[0] === 'HCl')) {
      setResult('Zn + 2HCl → ZnCl2 + H2');
      setExplanation('Zinc reacts with hydrochloric acid to produce zinc chloride and hydrogen gas. Zinc is oxidized to Zn2+, while H+ ions are reduced to H2 gas. This is a single replacement redox reaction.');
      return;
    }
    
    if ((parts[0] === 'H2' && parts[1] === 'O2') || (parts[1] === 'H2' && parts[0] === 'O2')) {
      setResult('2H2 + O2 → 2H2O');
      setExplanation('Hydrogen gas reacts with oxygen gas to form water. Hydrogen is oxidized from 0 to +1 oxidation state, while oxygen is reduced from 0 to -2 oxidation state. This is a synthesis redox reaction and an example of combustion.');
      return;
    }
    
    if ((parts[0] === 'Cu' && parts[1] === 'AgNO3') || (parts[1] === 'Cu' && parts[0] === 'AgNO3')) {
      setResult('Cu + 2AgNO3 → Cu(NO3)2 + 2Ag');
      setExplanation('Copper metal displaces silver ions from silver nitrate solution, forming copper(II) nitrate and silver metal. Copper is oxidized from 0 to +2 oxidation state, while silver ions are reduced from +1 to 0 oxidation state.');
      return;
    }
    
    if ((parts[0] === 'Zn' && parts[1] === 'CuSO4') || (parts[1] === 'Zn' && parts[0] === 'CuSO4')) {
      setResult('Zn + CuSO4 → ZnSO4 + Cu');
      setExplanation('Zinc metal displaces copper ions from copper sulfate solution, forming zinc sulfate and copper metal. Zinc is oxidized from 0 to +2 oxidation state, while copper ions are reduced from +2 to 0 oxidation state.');
      return;
    }

    throw new Error('Could not predict this specific redox reaction. Try one of the examples provided or select a different reaction type.');
  };

  // Predict synthesis reactions
  const predictSynthesis = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    
    // Handle specific common synthesis reactions
    if ((parts[0] === 'N2' && parts[1] === 'H2') || (parts[1] === 'N2' && parts[0] === 'H2')) {
      setResult('N2 + 3H2 → 2NH3');
      setExplanation('Nitrogen gas combines with hydrogen gas to form ammonia. This is the Haber process, one of the most important industrial chemical reactions for producing ammonia fertilizer.');
      return;
    }
    
    if ((parts[0] === 'Na' && parts[1] === 'Cl2') || (parts[1] === 'Na' && parts[0] === 'Cl2')) {
      setResult('2Na + Cl2 → 2NaCl');
      setExplanation('Sodium metal reacts with chlorine gas to form sodium chloride (table salt). This is a synthesis reaction involving an active metal and a halogen.');
      return;
    }
    
    if ((parts[0] === 'CaO' && parts[1] === 'H2O') || (parts[1] === 'CaO' && parts[0] === 'H2O')) {
      setResult('CaO + H2O → Ca(OH)2');
      setExplanation('Calcium oxide (quicklime) reacts with water to form calcium hydroxide (slaked lime). This is an exothermic synthesis reaction often used in construction and water treatment.');
      return;
    }
    
    if ((parts[0] === 'SO3' && parts[1] === 'H2O') || (parts[1] === 'SO3' && parts[0] === 'H2O')) {
      setResult('SO3 + H2O → H2SO4');
      setExplanation('Sulfur trioxide combines with water to form sulfuric acid. This is the final step in the contact process for industrial production of sulfuric acid.');
      return;
    }
    
    throw new Error('Could not predict this specific synthesis reaction. Try one of the examples provided or select a different reaction type.');
  };

  // Predict decomposition reactions
  const predictDecomposition = (input: string) => {
    // Handle specific common decomposition reactions
    if (input === 'CaCO3') {
      setResult('CaCO3 → CaO + CO2');
      setExplanation('Calcium carbonate decomposes upon heating to form calcium oxide (quicklime) and carbon dioxide. This thermal decomposition reaction is used in the production of lime for cement and other applications.');
      return;
    }
    
    if (input === 'H2O2') {
      setResult('2H2O2 → 2H2O + O2');
      setExplanation('Hydrogen peroxide decomposes to form water and oxygen gas. This decomposition can be catalyzed by various substances including manganese dioxide, and is responsible for the foaming when hydrogen peroxide is applied to a wound.');
      return;
    }
    
    if (input === 'NH4NO3') {
      setResult('NH4NO3 → N2O + 2H2O');
      setExplanation('Ammonium nitrate decomposes upon heating to form nitrous oxide (laughing gas) and water. This reaction can be explosive under certain conditions, which is why ammonium nitrate is used in some explosives.');
      return;
    }
    
    if (input === 'NaHCO3') {
      setResult('2NaHCO3 → Na2CO3 + H2O + CO2');
      setExplanation('Sodium bicarbonate (baking soda) decomposes upon heating to form sodium carbonate, water, and carbon dioxide. This decomposition reaction is responsible for the leavening action in baking.');
      return;
    }
    
    if (input === 'KClO3') {
      setResult('2KClO3 → 2KCl + 3O2');
      setExplanation('Potassium chlorate decomposes upon strong heating to form potassium chloride and oxygen gas. This reaction can be catalyzed by manganese dioxide and was historically used as a source of oxygen.');
      return;
    }
    
    throw new Error('Could not predict this specific decomposition reaction. Try one of the examples provided or select a different reaction type.');
  };

  // Predict single replacement reactions
  const predictSingleReplacement = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    
    // Handle specific common single replacement reactions
    if ((parts[0] === 'Zn' && parts[1] === 'HCl') || (parts[1] === 'Zn' && parts[0] === 'HCl')) {
      setResult('Zn + 2HCl → ZnCl2 + H2');
      setExplanation('Zinc metal replaces hydrogen in hydrochloric acid, forming zinc chloride and hydrogen gas. This is a single replacement reaction where zinc is more reactive than hydrogen.');
      return;
    }
    
    if ((parts[0] === 'Al' && parts[1] === 'CuSO4') || (parts[1] === 'Al' && parts[0] === 'CuSO4')) {
      setResult('2Al + 3CuSO4 → Al2(SO4)3 + 3Cu');
      setExplanation('Aluminum metal replaces copper in copper sulfate solution, forming aluminum sulfate and copper metal. This single replacement reaction occurs because aluminum is more reactive than copper.');
      return;
    }
    
    if ((parts[0] === 'Na' && parts[1] === 'H2O') || (parts[1] === 'Na' && parts[0] === 'H2O')) {
      setResult('2Na + 2H2O → 2NaOH + H2');
      setExplanation('Sodium metal reacts with water to form sodium hydroxide and hydrogen gas. This vigorous reaction demonstrates the high reactivity of alkali metals with water.');
      return;
    }
    
    if ((parts[0] === 'Fe' && parts[1] === 'CuSO4') || (parts[1] === 'Fe' && parts[0] === 'CuSO4')) {
      setResult('Fe + CuSO4 → FeSO4 + Cu');
      setExplanation('Iron metal replaces copper in copper sulfate solution, forming iron(II) sulfate and copper metal. This single replacement reaction occurs because iron is more reactive than copper.');
      return;
    }
    
    throw new Error('Could not predict this specific single replacement reaction. Try one of the examples provided or select a different reaction type.');
  };

  // Predict double replacement reactions
  const predictDoubleReplacement = (input: string) => {
    // Split by + to get reactants
    const parts = input.split('+');
    
    // Handle specific common double replacement reactions
    if ((parts[0] === 'NaCl' && parts[1] === 'AgNO3') || (parts[1] === 'NaCl' && parts[0] === 'AgNO3')) {
      setResult('NaCl + AgNO3 → AgCl↓ + NaNO3');
      setExplanation('Sodium chloride reacts with silver nitrate to form silver chloride precipitate and sodium nitrate. This is a classic double replacement reaction resulting in a precipitate.');
      return;
    }
    
    if ((parts[0] === 'HCl' && parts[1] === 'NaOH') || (parts[1] === 'HCl' && parts[0] === 'NaOH')) {
      setResult('HCl + NaOH → NaCl + H2O');
      setExplanation('Hydrochloric acid reacts with sodium hydroxide to form sodium chloride and water. This is a neutralization reaction, which is a type of double replacement reaction.');
      return;
    }
    
    if ((parts[0] === 'BaCl2' && parts[1] === 'Na2SO4') || (parts[1] === 'BaCl2' && parts[0] === 'Na2SO4')) {
      setResult('BaCl2 + Na2SO4 → BaSO4↓ + 2NaCl');
      setExplanation('Barium chloride reacts with sodium sulfate to form barium sulfate precipitate and sodium chloride. This double replacement reaction is often used to test for the presence of sulfate ions.');
      return;
    }
    
    if ((parts[0] === 'CaCl2' && parts[1] === 'Na2CO3') || (parts[1] === 'CaCl2' && parts[0] === 'Na2CO3')) {
      setResult('CaCl2 + Na2CO3 → CaCO3↓ + 2NaCl');
      setExplanation('Calcium chloride reacts with sodium carbonate to form calcium carbonate precipitate and sodium chloride. This double replacement reaction is used in water treatment to reduce water hardness.');
      return;
    }
    
    throw new Error('Could not predict this specific double replacement reaction. Try one of the examples provided or select a different reaction type.');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reaction Predictor</CardTitle>
        <CardDescription>
          Predict products of common chemical reactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reaction Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {reactionTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleReactionTypeChange(type.id)}
                  className={`px-3 py-2 rounded-md text-xs text-left transition-colors ${
                    selectedReactionType === type.id 
                      ? 'bg-primary/20 text-primary' 
                      : 'bg-secondary/20 hover:bg-secondary/30'
                  }`}
                >
                  <span className="font-medium">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {selectedReactionType && (
            <div className="p-3 bg-blue-500/10 rounded-md">
              <p className="text-sm">
                {reactionTypes.find(r => r.id === selectedReactionType)?.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-xs text-muted-foreground">Examples: </span>
                {reactionTypes.find(r => r.id === selectedReactionType)?.examples.map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setReactants(example)}
                    className="text-xs bg-blue-500/20 px-1.5 py-0.5 rounded hover:bg-blue-500/30"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Reactant(s)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reactants}
                onChange={(e) => setReactants(e.target.value)}
                placeholder="Enter reactants (e.g., H2 + O2)"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={predictReaction}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
              >
                Predict
              </button>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Use '+' to separate multiple reactants
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 rounded-md text-red-500">
              {error}
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-green-500/10 rounded-md">
              <h3 className="font-medium mb-2">Predicted Reaction:</h3>
              <div className="text-center p-2 bg-secondary/10 rounded-md font-medium text-lg">
                {result}
              </div>
              {explanation && (
                <div className="mt-3 text-sm">
                  <h4 className="font-medium mb-1">Explanation:</h4>
                  <p>{explanation}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground space-y-2">
            <p><strong>Note:</strong> This predictor works for common reaction types with typical reactants. For complex or unusual reactions, consult reference materials or laboratory tests.</p>
            <p>The reaction predictor uses pattern matching to identify reaction types and predict products. It may not correctly handle all variations of chemical formulas or unusual reaction conditions.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ReactionPredictor);