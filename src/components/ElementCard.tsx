
import React from 'react';
import { X } from 'lucide-react';
import { Element, getCategoryName, getElementColor } from '../data/elements';
import { 
  formatAtomicMass, 
  formatWithUnit, 
  formatTemperature,
  getDiscoveryInfo
} from '../utils/elementUtils';

interface ElementCardProps {
  element: Element;
  onClose: () => void;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 flex items-center justify-center overflow-y-auto p-4">
      <div 
        className="element-details-card animate-scale-in"
        style={{ 
          backgroundColor: `${getElementColor(element.category)}15`,
          borderColor: `${getElementColor(element.category)}70`
        }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label="Close element details"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-start mb-6">
          <div 
            className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-3xl font-bold rounded-lg mr-4"
            style={{ backgroundColor: getElementColor(element.category) }}
          >
            {element.symbol}
          </div>
          
          <div>
            <span className="inline-block px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs mb-1">
              {getCategoryName(element.category)}
            </span>
            <h2 className="text-2xl font-bold">{element.name}</h2>
            <p className="text-muted-foreground">Atomic Number: {element.number}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Basic Properties</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Atomic Mass:</span>
                  <span className="font-medium">{formatAtomicMass(element.atomicMass)} u</span>
                </li>
                <li className="flex justify-between">
                  <span>Period:</span>
                  <span className="font-medium">{element.period}</span>
                </li>
                <li className="flex justify-between">
                  <span>Group:</span>
                  <span className="font-medium">{element.group || 'N/A'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Block:</span>
                  <span className="font-medium">{element.block}</span>
                </li>
                <li className="flex justify-between">
                  <span>Electron Configuration:</span>
                  <span className="font-medium">{element.electronConfiguration}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Physical Properties</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Density:</span>
                  <span className="font-medium">{formatWithUnit(element.density, 'g/cm³')}</span>
                </li>
                <li className="flex justify-between">
                  <span>Melting Point:</span>
                  <span className="font-medium">{formatTemperature(element.meltingPoint)}</span>
                </li>
                <li className="flex justify-between">
                  <span>Boiling Point:</span>
                  <span className="font-medium">{formatTemperature(element.boilingPoint)}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Atomic Properties</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Electronegativity:</span>
                  <span className="font-medium">{element.electronegativity ?? 'Unknown'}</span>
                </li>
                <li className="flex justify-between">
                  <span>Atomic Radius:</span>
                  <span className="font-medium">{formatWithUnit(element.atomicRadius, 'pm')}</span>
                </li>
                <li className="flex justify-between">
                  <span>Ionization Energy:</span>
                  <span className="font-medium">{formatWithUnit(element.ionizationEnergy, 'eV')}</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Historical Information</h3>
              <p className="mb-2">{getDiscoveryInfo(element)}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p className="text-sm">{element.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementCard;
