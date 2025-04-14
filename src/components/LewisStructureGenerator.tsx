import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { elements, getElementBySymbol } from '../data/elements';

const LewisStructureGenerator: React.FC = () => {
  const [formula, setFormula] = useState('');
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [structure, setStructure] = useState<{
    atoms: Array<{
      symbol: string;
      valenceElectrons: number;
      position: { x: number, y: number };
      connections: Array<{ to: number, bondType: 'single' | 'double' | 'triple' }>;
      lonePairs: number;
    }>;
    centralAtomIndex: number;
    totalValenceElectrons: number;
  } | null>(null);
  const [showHints, setShowHints] = useState(true);

  // Process the formula and generate the Lewis structure
  const generateStructure = useCallback(() => {
    if (!formula.trim()) {
      setError('Please enter a molecular formula');
      setStructure(null);
      return;
    }

    try {
      setError(null);
      
      // Parse the formula to extract elements and their counts
      const parsedFormula = parseFormula(formula);
      if (Object.keys(parsedFormula).length === 0) {
        throw new Error('Invalid formula format');
      }
      
      // Calculate total valence electrons
      let totalValenceElectrons = 0;
      const atoms: Array<{
        symbol: string;
        valenceElectrons: number;
        position: { x: number, y: number };
        connections: Array<{ to: number, bondType: 'single' | 'double' | 'triple' }>;
        lonePairs: number;
      }> = [];

      // Add all atoms to our structure
      Object.entries(parsedFormula).forEach(([symbol, count]) => {
        const element = getElementBySymbol(symbol);
        if (!element) {
          throw new Error(`Unknown element symbol: ${symbol}`);
        }
        
        // Get valence electrons (approximate by group number)
        const valenceElectrons = getValenceElectrons(element.group);
        totalValenceElectrons += valenceElectrons * count;
        
        // Add atoms to our array
        for (let i = 0; i < count; i++) {
          atoms.push({
            symbol,
            valenceElectrons,
            position: { x: 0, y: 0 }, // Temporary position, will be set later
            connections: [],
            lonePairs: 0
          });
        }
      });
      
      // Determine central atom (typically the least electronegative non-hydrogen)
      const centralAtomIndex = determineCentralAtom(atoms);
      
      // Create structure connections
      createConnections(atoms, centralAtomIndex);
      
      // Calculate positions for atoms
      calculatePositions(atoms, centralAtomIndex);
      
      // Calculate lone pairs
      distributeLonePairs(atoms, totalValenceElectrons);
      
      setStructure({
        atoms,
        centralAtomIndex,
        totalValenceElectrons
      });
      
    } catch (error) {
      setError((error as Error).message);
      setStructure(null);
    }
  }, [formula]);

  // Draw the Lewis structure on canvas
  useEffect(() => {
    if (!structure || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions
    const padding = 50;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    // Draw connections (bonds)
    structure.atoms.forEach((atom, atomIndex) => {
      atom.connections.forEach(connection => {
        const toAtom = structure.atoms[connection.to];
        
        // Calculate actual positions
        const x1 = padding + atom.position.x * width;
        const y1 = padding + atom.position.y * height;
        const x2 = padding + toAtom.position.x * width;
        const y2 = padding + toAtom.position.y * height;
        
        // Draw bond line(s)
        drawBond(ctx, x1, y1, x2, y2, connection.bondType);
      });
    });
    
    // Draw atoms
    structure.atoms.forEach((atom, index) => {
      const x = padding + atom.position.x * width;
      const y = padding + atom.position.y * height;
      
      // Draw atom circle
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fillStyle = index === structure.centralAtomIndex ? '#f0f0ff' : '#f5f5f5';
      ctx.fill();
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw element symbol
      ctx.fillStyle = '#333';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(atom.symbol, x, y);
      
      // Draw lone pairs
      drawLonePairs(ctx, x, y, atom.lonePairs);
    });
    
    // Draw legend
    drawLegend(ctx, canvas.width, canvas.height);
    
  }, [structure]);

  // Parse chemical formula
  const parseFormula = (formula: string): Record<string, number> => {
    const result: Record<string, number> = {};
    let i = 0;
    
    while (i < formula.length) {
      // Match element symbol (1 or 2 characters)
      if (!/[A-Z]/.test(formula[i])) {
        i++;
        continue;
      }
      
      let symbol = formula[i];
      i++;
      
      if (i < formula.length && /[a-z]/.test(formula[i])) {
        symbol += formula[i];
        i++;
      }
      
      // Match count (optional)
      let countStr = '';
      while (i < formula.length && /\d/.test(formula[i])) {
        countStr += formula[i];
        i++;
      }
      
      const count = countStr ? parseInt(countStr, 10) : 1;
      result[symbol] = (result[symbol] || 0) + count;
    }
    
    return result;
  };

  // Get valence electrons based on group number
  const getValenceElectrons = (group?: number): number => {
    if (!group) return 0;
    
    // Handle main group elements
    if (group <= 2) return group;
    if (group >= 13 && group <= 18) return group - 10;
    
    // Transition metals often have variable valence - assume common values
    return 2; // Simplification for this tool
  };

  // Determine the central atom (usually the least electronegative non-hydrogen atom)
  const determineCentralAtom = (atoms: Array<any>): number => {
    // Simple heuristic: non-hydrogen with highest expected connections
    // Usually the element that can form the most bonds
    
    const nonHydrogenIndices = atoms
      .map((atom, index) => ({ index, symbol: atom.symbol }))
      .filter(item => item.symbol !== 'H');
    
    if (nonHydrogenIndices.length === 0) {
      // All hydrogen (e.g., H2)
      return 0;
    }
    
    if (nonHydrogenIndices.length === 1) {
      // Only one non-hydrogen
      return nonHydrogenIndices[0].index;
    }
    
    // Electronegativity order approximation
    // Carbon and Silicon are often central atoms
    const centralAtomCandidates = ['C', 'Si', 'P', 'S', 'N', 'B', 'Al'];
    
    for (const candidate of centralAtomCandidates) {
      const match = nonHydrogenIndices.find(item => item.symbol === candidate);
      if (match) {
        return match.index;
      }
    }
    
    // Default to the first non-hydrogen
    return nonHydrogenIndices[0].index;
  };

  // Create connections between atoms
  const createConnections = (atoms: Array<any>, centralAtomIndex: number): void => {
    // Connect all other atoms to the central atom first
    atoms.forEach((atom, index) => {
      if (index !== centralAtomIndex) {
        // Connect to central atom
        atoms[index].connections.push({
          to: centralAtomIndex,
          bondType: 'single'
        });
        
        atoms[centralAtomIndex].connections.push({
          to: index,
          bondType: 'single'
        });
      }
    });
    
    // Check for known structures and adjust bonds
    adjustBonds(atoms, centralAtomIndex);
  };

  // Adjust bonds based on common molecular structures
  const adjustBonds = (atoms: Array<any>, centralAtomIndex: number): void => {
    const centralAtom = atoms[centralAtomIndex];
    const formula = atoms.reduce((acc, atom) => {
      acc[atom.symbol] = (acc[atom.symbol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // CO2: O=C=O
    if (centralAtom.symbol === 'C' && formula['O'] === 2 && Object.keys(formula).length === 2) {
      // Make all C-O bonds double
      centralAtom.connections.forEach((conn: any, index: number) => {
        centralAtom.connections[index].bondType = 'double';
        
        // Update the corresponding bond from the oxygen atom
        const oxygenIndex = conn.to;
        const oxygenAtom = atoms[oxygenIndex];
        const backConnectionIndex = oxygenAtom.connections.findIndex((c: any) => c.to === centralAtomIndex);
        if (backConnectionIndex >= 0) {
          oxygenAtom.connections[backConnectionIndex].bondType = 'double';
        }
      });
    }
    
    // H2O: H-O-H (no adjustment needed, single bonds are fine)
    
    // NH3: single bonds are fine
    
    // CH4: single bonds are fine
    
    // CO: C≡O (triple bond)
    if (centralAtom.symbol === 'C' && formula['O'] === 1 && 
        formula['C'] === 1 && Object.keys(formula).length === 2) {
      centralAtom.connections[0].bondType = 'triple';
      atoms[centralAtom.connections[0].to].connections[0].bondType = 'triple';
    }
    
    // N2: N≡N (triple bond)
    if (centralAtom.symbol === 'N' && formula['N'] === 2 && Object.keys(formula).length === 1) {
      centralAtom.connections[0].bondType = 'triple';
      atoms[centralAtom.connections[0].to].connections[0].bondType = 'triple';
    }
    
    // O2: O=O (double bond)
    if (centralAtom.symbol === 'O' && formula['O'] === 2 && Object.keys(formula).length === 1) {
      centralAtom.connections[0].bondType = 'double';
      atoms[centralAtom.connections[0].to].connections[0].bondType = 'double';
    }
    
    // NO: N=O (typically N≡O+, but we'll simplify to double bond)
    if ((centralAtom.symbol === 'N' && formula['O'] === 1 && formula['N'] === 1) ||
        (centralAtom.symbol === 'O' && formula['N'] === 1 && formula['O'] === 1)) {
      centralAtom.connections[0].bondType = 'double';
      atoms[centralAtom.connections[0].to].connections[0].bondType = 'double';
    }
    
    // NO2: O=N=O or O-N=O (resonance)
    if (centralAtom.symbol === 'N' && formula['O'] === 2 && Object.keys(formula).length === 2) {
      centralAtom.connections[0].bondType = 'double';
      atoms[centralAtom.connections[0].to].connections[0].bondType = 'double';
    }
    
    // SO2: O=S=O
    if (centralAtom.symbol === 'S' && formula['O'] === 2 && Object.keys(formula).length === 2) {
      centralAtom.connections.forEach((conn: any, index: number) => {
        centralAtom.connections[index].bondType = 'double';
        
        const oxygenIndex = conn.to;
        const oxygenAtom = atoms[oxygenIndex];
        const backConnectionIndex = oxygenAtom.connections.findIndex((c: any) => c.to === centralAtomIndex);
        if (backConnectionIndex >= 0) {
          oxygenAtom.connections[backConnectionIndex].bondType = 'double';
        }
      });
    }
  };

  // Calculate positions for atoms in a 2D layout
  const calculatePositions = (atoms: Array<any>, centralAtomIndex: number): void => {
    const centralAtom = atoms[centralAtomIndex];
    centralAtom.position = { x: 0.5, y: 0.5 }; // Center of the canvas
    
    const connectedAtoms = centralAtom.connections.map((conn: any) => conn.to);
    
    // Position connected atoms around the central atom
    if (connectedAtoms.length === 1) {
      // Single connected atom (place to the right)
      atoms[connectedAtoms[0]].position = { x: 0.7, y: 0.5 };
    } else if (connectedAtoms.length === 2) {
      // Two connected atoms (linear arrangement)
      atoms[connectedAtoms[0]].position = { x: 0.3, y: 0.5 };
      atoms[connectedAtoms[1]].position = { x: 0.7, y: 0.5 };
    } else if (connectedAtoms.length === 3) {
      // Three connected atoms (triangular arrangement)
      atoms[connectedAtoms[0]].position = { x: 0.5, y: 0.3 };
      atoms[connectedAtoms[1]].position = { x: 0.3, y: 0.6 };
      atoms[connectedAtoms[2]].position = { x: 0.7, y: 0.6 };
    } else if (connectedAtoms.length === 4) {
      // Four connected atoms (tetrahedral arrangement flattened to 2D)
      atoms[connectedAtoms[0]].position = { x: 0.5, y: 0.3 };
      atoms[connectedAtoms[1]].position = { x: 0.3, y: 0.5 };
      atoms[connectedAtoms[2]].position = { x: 0.7, y: 0.5 };
      atoms[connectedAtoms[3]].position = { x: 0.5, y: 0.7 };
    } else if (connectedAtoms.length === 5) {
      // Five connected atoms (trigonal bipyramidal arrangement flattened to 2D)
      atoms[connectedAtoms[0]].position = { x: 0.5, y: 0.25 };
      atoms[connectedAtoms[1]].position = { x: 0.3, y: 0.4 };
      atoms[connectedAtoms[2]].position = { x: 0.7, y: 0.4 };
      atoms[connectedAtoms[3]].position = { x: 0.3, y: 0.6 };
      atoms[connectedAtoms[4]].position = { x: 0.7, y: 0.6 };
    } else if (connectedAtoms.length === 6) {
      // Six connected atoms (octahedral arrangement flattened to 2D)
      atoms[connectedAtoms[0]].position = { x: 0.3, y: 0.3 };
      atoms[connectedAtoms[1]].position = { x: 0.7, y: 0.3 };
      atoms[connectedAtoms[2]].position = { x: 0.3, y: 0.7 };
      atoms[connectedAtoms[3]].position = { x: 0.7, y: 0.7 };
      atoms[connectedAtoms[4]].position = { x: 0.2, y: 0.5 };
      atoms[connectedAtoms[5]].position = { x: 0.8, y: 0.5 };
    } else {
      // More than 6 (unlikely in a simple Lewis structure, but handle anyway)
      const radius = 0.25;
      const angleDelta = (2 * Math.PI) / connectedAtoms.length;
      
      connectedAtoms.forEach((atomIndex, i) => {
        const angle = i * angleDelta;
        atoms[atomIndex].position = {
          x: 0.5 + radius * Math.cos(angle),
          y: 0.5 + radius * Math.sin(angle)
        };
      });
    }
  };

  // Distribute lone pairs based on octet rule and bond types
  const distributeLonePairs = (atoms: Array<any>, totalValenceElectrons: number): void => {
    // Calculate electrons used in bonds
    let usedElectrons = 0;
    atoms.forEach(atom => {
      atom.connections.forEach((conn: any) => {
        if (conn.bondType === 'single') usedElectrons += 1;
        else if (conn.bondType === 'double') usedElectrons += 2;
        else if (conn.bondType === 'triple') usedElectrons += 3;
      });
    });
    
    // Each bond is counted twice (once from each connecting atom)
    usedElectrons *= 2;
    
    // Remaining electrons are for lone pairs
    const remainingElectrons = totalValenceElectrons - usedElectrons;
    
    if (remainingElectrons < 0) {
      // This would indicate an invalid structure
      return;
    }
    
    // Distribute lone pairs - this is a simplified algorithm
    // Start with terminal atoms (atoms with just one connection)
    atoms.forEach(atom => {
      if (atom.connections.length === 1) {
        // Calculate how many electrons this atom needs for octet
        const bondElectrons = atom.connections[0].bondType === 'single' ? 2 :
                              atom.connections[0].bondType === 'double' ? 4 : 6;
        
        // How many electrons does this atom need for its octet/duet
        const targetElectrons = atom.symbol === 'H' ? 2 : 8;
        const neededLonePairElectrons = Math.max(0, targetElectrons - bondElectrons);
        
        atom.lonePairs = neededLonePairElectrons / 2;
      }
    });
    
    // Distribute remaining electrons to central atom
    const centralAtom = atoms[atoms.findIndex(a => a.connections.length > 1)];
    if (centralAtom) {
      // Calculate used electrons for central atom
      let centralAtomBondElectrons = 0;
      centralAtom.connections.forEach((conn: any) => {
        centralAtomBondElectrons += conn.bondType === 'single' ? 2 :
                                  conn.bondType === 'double' ? 4 : 6;
      });
      
      // How many electrons does this atom need for its octet/duet/expanded octet
      const targetElectrons = 8; // Simplified - doesn't handle expanded octets
      const neededLonePairElectrons = Math.max(0, targetElectrons - centralAtomBondElectrons);
      
      centralAtom.lonePairs = neededLonePairElectrons / 2;
    }
  };

  // Draw a bond line between two points
  const drawBond = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    bondType: 'single' | 'double' | 'triple'
  ): void => {
    // Calculate normal vector for double/triple bonds
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length;
    const ny = dx / length;
    
    // Adjust start and end points to not overlap with atom circles
    const atomRadius = 16;
    const startRatio = atomRadius / length;
    const endRatio = atomRadius / length;
    
    const startX = x1 + dx * startRatio;
    const startY = y1 + dy * startRatio;
    const endX = x2 - dx * endRatio;
    const endY = y2 - dy * endRatio;
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    
    if (bondType === 'single') {
      // Draw single bond
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    } else if (bondType === 'double') {
      // Draw double bond
      const offset = 4;
      
      ctx.beginPath();
      ctx.moveTo(startX + nx * offset, startY + ny * offset);
      ctx.lineTo(endX + nx * offset, endY + ny * offset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX - nx * offset, startY - ny * offset);
      ctx.lineTo(endX - nx * offset, endY - ny * offset);
      ctx.stroke();
    } else if (bondType === 'triple') {
      // Draw triple bond
      const offset = 5;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX + nx * offset, startY + ny * offset);
      ctx.lineTo(endX + nx * offset, endY + ny * offset);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(startX - nx * offset, startY - ny * offset);
      ctx.lineTo(endX - nx * offset, endY - ny * offset);
      ctx.stroke();
    }
  };

  // Draw lone pairs around an atom
  const drawLonePairs = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    lonePairs: number
  ): void => {
    if (lonePairs <= 0) return;
    
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    
    // Place the lone pairs around the atom
    const radius = 22;
    const angles = [
      Math.PI / 4,      // Top-right
      3 * Math.PI / 4,  // Top-left
      5 * Math.PI / 4,  // Bottom-left
      7 * Math.PI / 4   // Bottom-right
    ];
    
    for (let i = 0; i < Math.min(lonePairs, 4); i++) {
      const loneX = x + radius * Math.cos(angles[i]);
      const loneY = y + radius * Math.sin(angles[i]);
      
      ctx.fillText(':', loneX, loneY);
    }
  };

  // Draw legend
  const drawLegend = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void => {
    if (!showHints) return;
    
    const legendX = 10;
    const legendY = height - 70;
    const lineHeight = 18;
    
    ctx.fillStyle = 'rgba(240, 240, 240, 0.8)';
    ctx.fillRect(legendX, legendY, 250, 65);
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 250, 65);
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('• Atoms are represented by their chemical symbols', legendX + 10, legendY + lineHeight);
    ctx.fillText('• Single, double and triple bonds are shown', legendX + 10, legendY + 2 * lineHeight);
    ctx.fillText('• ":" represents lone pairs of electrons', legendX + 10, legendY + 3 * lineHeight);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lewis Structure Generator</CardTitle>
        <CardDescription>
          Visualize electron arrangements in molecules using Lewis dot structures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Molecular Formula</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Enter a formula (e.g., H2O, CO2, CH4)"
                className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={generateStructure}
                className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
              >
                Generate
              </button>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Works best with simple molecules (e.g., H2O, CO2, CH4, NH3, CH3OH)
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/10 rounded-md text-red-500">
              {error}
            </div>
          )}
          
          <div className="p-4 bg-secondary/5 rounded-md border">
            <div className="w-full flex justify-center">
              <canvas 
                ref={canvasRef} 
                width={500} 
                height={400} 
                className="w-auto h-auto"
                style={{ maxWidth: '100%' }}
              />
            </div>
            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id="showHints"
                checked={showHints}
                onChange={(e) => setShowHints(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showHints" className="text-xs text-muted-foreground">
                Show hints
              </label>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Common Formulas to Try:</h3>
            <div className="flex flex-wrap gap-2">
              {['H2O', 'CO2', 'NH3', 'CH4', 'C2H6', 'C2H4', 'HCN', 'H2CO', 'CH3OH', 'NO2', 'SO2'].map(example => (
                <button
                  key={example}
                  onClick={() => {
                    setFormula(example);
                    generateStructure();
                  }}
                  className="px-2 py-1 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {structure && (
            <div className="p-3 bg-primary/5 rounded-md border border-primary/20">
              <h3 className="text-sm font-medium mb-2">Structure Information:</h3>
              <div className="text-xs space-y-1">
                <p>Total valence electrons: {structure.totalValenceElectrons}</p>
                <p>Central atom: {structure.atoms[structure.centralAtomIndex].symbol}</p>
                <p>
                  Bonds: {structure.atoms.flatMap(a => a.connections).length / 2} 
                  ({
                    structure.atoms.flatMap(a => a.connections)
                      .reduce((acc, conn) => {
                        acc[conn.bondType] = (acc[conn.bondType] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                      .single ? 'single' : ''
                  }
                  {
                    structure.atoms.flatMap(a => a.connections)
                      .some(conn => conn.bondType === 'double') ? ', double' : ''
                  }
                  {
                    structure.atoms.flatMap(a => a.connections)
                      .some(conn => conn.bondType === 'triple') ? ', triple' : ''
                  })
                </p>
                <p>Lone pairs: {structure.atoms.reduce((acc, atom) => acc + atom.lonePairs, 0)}</p>
              </div>
            </div>
          )}
          
          <div className="text-xs space-y-2 text-muted-foreground">
            <p>
              <strong>Lewis structures</strong> show how electrons are arranged around atoms in molecules.
              They help visualize bonding patterns and predict molecular geometry.
            </p>
            <p>
              <strong>Notes:</strong> This tool generates simplified 2D representations and uses basic rules
              to determine electron distribution. For complex molecules or resonance structures, 
              consult reference materials.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(LewisStructureGenerator);