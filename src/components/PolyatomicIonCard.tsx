import React from 'react';
import { PolyatomicIon } from '../data/polyatomicIons';

interface PolyatomicIonCardProps {
  ion: PolyatomicIon;
  onClose: () => void;
}

const PolyatomicIonCard: React.FC<PolyatomicIonCardProps> = ({ ion, onClose }) => {
  const chargeDisplay = ion.charge > 0 
    ? `+${ion.charge}` 
    : ion.charge.toString();
  
  // Determine if we're on mobile
  const isMobile = window.innerWidth < 640;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`bg-card m-4 p-6 rounded-lg shadow-xl w-full overflow-y-auto ${
          isMobile ? 'mobile-card max-w-full' : 'max-w-2xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()} 
        style={{ borderTop: `4px solid ${ion.charge > 0 ? '#9c27b0' : '#2196f3'}` }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Charge: {chargeDisplay}</span>
            <h2 className="text-3xl font-bold">{ion.name}</h2>
            <div className="flex items-center space-x-2 mt-1 flex-wrap">
              <span className="text-xl font-mono">{ion.formula}</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-secondary">
                Polyatomic Ion
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm sm:text-base">{ion.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Composition</h3>
            <div className="flex flex-wrap gap-1 mb-3">
              {Object.entries(
                ion.atomicStructure.reduce((acc: Record<string, number>, atom) => {
                  acc[atom] = (acc[atom] || 0) + 1;
                  return acc;
                }, {})
              ).map(([atom, count], index) => (
                <span 
                  key={index} 
                  className="px-2 py-0.5 bg-secondary/40 rounded-md text-sm"
                >
                  {atom}: {count}
                </span>
              ))}
            </div>
            
            <h3 className="font-medium mb-2">Common Uses</h3>
            <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
              {ion.commonUses.map((use, index) => (
                <li key={index}>{use}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-secondary/20 p-3 rounded-md">
            <h3 className="font-medium mb-2">Chemistry Notes</h3>
            <ul className="space-y-1 text-xs sm:text-sm">
              <li><span className="text-muted-foreground">Ion Type:</span> {ion.charge > 0 ? 'Cation' : 'Anion'}</li>
              <li><span className="text-muted-foreground">Charge:</span> {chargeDisplay}</li>
              <li><span className="text-muted-foreground">Total Atoms:</span> {ion.atomicStructure.length}</li>
              <li className="mt-3">
                <span className="text-muted-foreground block mb-1">Chemical Behavior:</span>
                <p className="text-sm">
                  {ion.charge > 0 
                    ? "This positively charged ion typically bonds with anions to form ionic compounds."
                    : "This negatively charged ion typically bonds with cations to form ionic compounds."}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PolyatomicIonCard);
