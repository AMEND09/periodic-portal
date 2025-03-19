import React, { useState } from 'react';
import { SolubilityRule, solubilityRules } from '../data/solubilityRules';

interface SolubilityRulesCardProps {
  onClose: () => void;
}

const SolubilityRulesCard: React.FC<SolubilityRulesCardProps> = ({ onClose }) => {
  const [activeRule, setActiveRule] = useState<SolubilityRule | null>(null);
  
  // Determine if we're on mobile
  const isMobile = window.innerWidth < 640;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className={`bg-card m-4 p-6 rounded-lg shadow-xl w-full overflow-y-auto ${
          isMobile ? 'mobile-card max-w-full' : 'max-w-4xl max-h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Solubility Rules</h2>
            <p className="text-sm text-muted-foreground">
              Use these rules to predict whether an ionic compound will dissolve in water
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-2">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2 sm:space-y-3 order-2 lg:order-1">
            {solubilityRules.map((rule) => (
              <div 
                key={rule.id}
                className={`p-2 sm:p-3 border rounded-md cursor-pointer hover:bg-secondary/20 transition-colors ${
                  activeRule?.id === rule.id ? 'bg-secondary/30 border-primary' : 'border-border'
                }`}
                onClick={() => setActiveRule(rule)}
              >
                <p className="font-medium text-sm sm:text-base">{rule.rule}</p>
                {rule.exceptions.length > 0 && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Exceptions: {rule.exceptions.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="border rounded-md p-3 sm:p-4 bg-secondary/10 order-1 lg:order-2">
            {activeRule ? (
              <>
                <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3">{activeRule.rule}</h3>
                
                <p className="text-sm sm:text-base mb-3 sm:mb-4">{activeRule.explanation}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2 text-green-600">Soluble Examples</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {activeRule.examples.soluble.map((example, index) => (
                        <li key={index} className="text-xs sm:text-sm">{example}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {activeRule.examples.insoluble.length > 0 && (
                    <div>
                      <h4 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2 text-red-600">Insoluble Examples</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {activeRule.examples.insoluble.map((example, index) => (
                          <li key={index} className="text-xs sm:text-sm">{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <p className="text-sm sm:text-base">Select a rule to see details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SolubilityRulesCard);
