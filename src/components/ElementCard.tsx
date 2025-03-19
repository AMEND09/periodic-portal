import React from 'react';
import { Element, getElementColor, getCategoryName } from '../data/elements';
import { formatTemperature, getDiscoveryInfo } from '../utils/elementUtils';

interface ElementCardProps {
  element: Element;
  onClose: () => void;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, onClose }) => {
  // Determine if we're on mobile
  const isMobile = window.innerWidth < 640;
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`bg-card m-4 p-6 rounded-lg shadow-xl w-full overflow-y-auto ${
          isMobile ? 'mobile-card max-w-full' : 'max-w-2xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()} 
        style={{ borderTop: `4px solid ${getElementColor(element.category)}` }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Element #{element.number}</span>
            <h2 className="text-3xl font-bold">{element.name}</h2>
            <div className="flex items-center space-x-2 mt-1 flex-wrap">
              <span className="text-xl font-mono">{element.symbol}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary">
                {getCategoryName(element.category)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm sm:text-base">{element.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Properties</h3>
            <ul className="space-y-1 text-xs sm:text-sm">
              <li><span className="text-muted-foreground">Atomic Mass:</span> {element.atomicMass}</li>
              <li><span className="text-muted-foreground">Period:</span> {element.period}</li>
              <li><span className="text-muted-foreground">Group:</span> {element.group || 'N/A'}</li>
              <li><span className="text-muted-foreground">Block:</span> {element.block}</li>
              <li><span className="text-muted-foreground">Electron Configuration:</span> {element.electronConfiguration}</li>
              <li><span className="text-muted-foreground">Electronegativity:</span> {element.electronegativity || 'N/A'}</li>
              <li><span className="text-muted-foreground">Atomic Radius:</span> {element.atomicRadius ? `${element.atomicRadius} pm` : 'N/A'}</li>
              <li><span className="text-muted-foreground">Ionization Energy:</span> {element.ionizationEnergy ? `${element.ionizationEnergy} eV` : 'N/A'}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Physical Properties</h3>
            <ul className="space-y-1 text-xs sm:text-sm">
              <li><span className="text-muted-foreground">Density:</span> {element.density ? `${element.density} g/cm³` : 'N/A'}</li>
              <li><span className="text-muted-foreground">Melting Point:</span> {formatTemperature(element.meltingPoint)}</li>
              <li><span className="text-muted-foreground">Boiling Point:</span> {formatTemperature(element.boilingPoint)}</li>
              <li><span className="text-muted-foreground">Discovery:</span> {getDiscoveryInfo(element)}</li>
            </ul>
            
            <div className="mt-3 pt-3 border-t border-border">
              <h3 className="font-medium mb-2">Common Compounds</h3>
              <div className="flex flex-wrap gap-1">
                {getCommonCompounds(element.symbol).map((compound, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 rounded-md text-xs">
                    {compound}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate some example compounds for each element
function getCommonCompounds(symbol: string): string[] {
  const commonCompounds: Record<string, string[]> = {
    'H': ['H₂O', 'H₂', 'HCl', 'NH₃', 'CH₄'],
    'O': ['O₂', 'H₂O', 'CO₂', 'SiO₂'],
    'C': ['CO₂', 'CH₄', 'C₆H₁₂O₆', 'CO'],
    'Na': ['NaCl', 'Na₂CO₃', 'NaOH', 'NaHCO₃'],
    'Cl': ['NaCl', 'HCl', 'KCl', 'ClO₂'],
    'Fe': ['Fe₂O₃', 'FeCl₃', 'FeS₂', 'Fe₃O₄'],
    'Au': ['Au(OH)₃', 'AuCl₃'],
    'Ag': ['AgCl', 'Ag₂O', 'AgNO₃'],
    'Cu': ['CuSO₄', 'CuO', 'Cu₂O', 'CuCl₂'],
    // Some default compounds for elements not explicitly listed
    'default': [`${symbol}O`, `${symbol}Cl`, `${symbol}₂O₃`]
  };
  
  return commonCompounds[symbol] || commonCompounds['default'];
}

export default React.memo(ElementCard);
