import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense, lazy } from 'react';
import { Element, elements, getElementColor, isPlaceholder } from '../data/elements';
import { PolyatomicIon } from '../data/polyatomicIons';
import SearchBar from './SearchBar';
import { searchElements, shouldHighlightElement } from '../utils/elementUtils';
import MolarMassCalculator from './MolarMassCalculator';
import EquationBalancer from './EquationBalancer';
import ChemicalNamer from './ChemicalNamer';
import Stoichiometry from './Stoichiometry';
import GasLawCalculator from './GasLawCalculator';
import ToolsMenu, { Tool } from './ToolsMenu';
import ActiveToolTags from './ActiveToolTags';
import SigFigCalculator from './SigFigCalculator';
import LewisStructureGenerator from './LewisStructureGenerator';
import ReactionPredictor from './ReactionPredictor';
import ScientificCalculator from './ScientificCalculator';
import UnitConverter from './UnitConverter';
import DilutionCalculator from './DilutionCalculator';
import MolalityCalculator from './MolalityCalculator';
import MolarityCalculator from './MolarityCalculator';
import ColligativePropertiesCalculator from './ColligativePropertiesCalculator';

// Lazy load heavy components to improve initial load time
const ElementCard = lazy(() => import('./ElementCard'));
const PolyatomicIonCard = lazy(() => import('./PolyatomicIonCard'));
const SolubilityRulesCard = lazy(() => import('./SolubilityRulesCard'));

// Memoize the element tile to prevent unnecessary re-renders
const ElementTile = React.memo(({ 
  element, 
  isHighlighted, 
  onClick 
}: { 
  element: Element; 
  isHighlighted: boolean; 
  onClick: (element: Element) => void 
}) => {
  return (
    <div
      className={`element-tile cursor-pointer ${isHighlighted ? 'highlighted' : ''}`}
      style={{ backgroundColor: `${getElementColor(element.category)}20` }}
      onClick={() => onClick(element)}
    >
      <div className="flex justify-between items-start text-xs">
        <span>{element.number}</span>
        <span className="opacity-70">{element.atomicMass}</span>
      </div>
      <div className="text-center my-1">
        <div className="text-xl font-bold">{element.symbol}</div>
        <div className="text-xs truncate">{element.name}</div>
      </div>
    </div>
  );
});
ElementTile.displayName = 'ElementTile';

const PeriodicTable: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [selectedPolyatomicIon, setSelectedPolyatomicIon] = useState<PolyatomicIon | null>(null);
  const [showSolubilityRules, setShowSolubilityRules] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Element[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [activeTools, setActiveTools] = useState<string[]>([]);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ startRow: 0, endRow: 7, startCol: 0, endCol: 18 });

  const tools = useMemo<Tool[]>(() => [
    {
      id: 'MolarMassCalculator',
      name: 'Molar Mass Calculator',
      description: 'Calculate the molar mass of chemical compounds',
      icon: 'calculate',
      component: <MolarMassCalculator />,
      color: 'bg-green-600'
    },
    {
      id: 'EquationBalancer',
      name: 'Equation Balancer',
      description: 'Balance chemical equations automatically',
      icon: 'balance',
      component: <EquationBalancer />,
      color: 'bg-blue-600'
    },
    {
      id: 'ChemicalNamer',
      name: 'Chemical Namer',
      description: 'Convert between chemical names and formulas',
      icon: 'text_format',
      component: <ChemicalNamer />,
      color: 'bg-purple-600'
    },
    {
      id: 'Stoichiometry',
      name: 'Stoichiometry Calculator',
      description: 'Perform stoichiometric calculations',
      icon: 'scale',
      component: <Stoichiometry />,
      color: 'bg-amber-600'
    },
    {
      id: 'GasLawCalculator',
      name: 'Gas Laws Calculator',
      description: 'Calculate using various gas laws',
      icon: 'gas_meter',
      component: <GasLawCalculator />,
      color: 'bg-cyan-600'
    },
    {
      id: 'DilutionCalculator',
      name: 'Dilution Calculator',
      description: 'Solve dilution problems using C₁V₁ = C₂V₂',
      icon: 'water_drop',
      component: <DilutionCalculator />,
      color: 'bg-sky-600'
    },
    {
      id: 'MolalityCalculator',
      name: 'Molality Calculator',
      description: 'Calculate molality of solutions',
      icon: 'science',
      component: <MolalityCalculator />,
      color: 'bg-emerald-600'
    },
    {
      id: 'MolarityCalculator',
      name: 'Molarity Calculator',
      description: 'Calculate molarity of solutions',
      icon: 'opacity',
      component: <MolarityCalculator />,
      color: 'bg-violet-600'
    },
    {
      id: 'ColligativePropertiesCalculator',
      name: 'Colligative Properties',
      description: 'Calculate boiling point elevation and freezing point depression',
      icon: 'ac_unit',
      component: <ColligativePropertiesCalculator />,
      color: 'bg-pink-600'
    },
    {
      id: 'SigFigCalculator',
      name: 'Significant Figures Calculator',
      description: 'Calculate with precise significant figures',
      icon: 'exposure',
      component: <SigFigCalculator />,
      color: 'bg-orange-600'
    },
    {
      id: 'LewisStructureGenerator',
      name: 'Lewis Structure Generator',
      description: 'Visualize electron arrangements in molecules',
      icon: 'bubble_chart',
      component: <LewisStructureGenerator />,
      color: 'bg-indigo-600'
    },
    {
      id: 'ReactionPredictor',
      name: 'Reaction Predictor',
      description: 'Predict products of common chemical reactions',
      icon: 'science',
      component: <ReactionPredictor />,
      color: 'bg-rose-600'
    },
    {
      id: 'ScientificCalculator',
      name: 'Scientific Calculator',
      description: 'Perform complex mathematical calculations',
      icon: 'calculate',
      component: <ScientificCalculator />,
      color: 'bg-teal-600'
    },
    {
      id: 'UnitConverter',
      name: 'Unit Converter',
      description: 'Convert between different units of measurement',
      icon: 'swap_horiz',
      component: <UnitConverter />,
      color: 'bg-yellow-600'
    }
  ], []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Virtualization - only render elements in the visible viewport
  useEffect(() => {
    if (!tableContainerRef.current) return;
    
    const updateVisibleRange = () => {
      const container = tableContainerRef.current;
      if (!container) return;
      
      // Calculate the visible range based on scroll position
      const { scrollTop, scrollLeft, clientHeight, clientWidth } = container;
      
      // Estimate how many rows/columns are visible
      const tileSize = isMobile ? 30 : 60; // Approximate tile size
      const visibleRows = Math.ceil(clientHeight / tileSize) + 2; // +2 for buffer
      const visibleCols = Math.ceil(clientWidth / tileSize) + 2;
      
      // Calculate start and end indices
      const startRow = Math.max(0, Math.floor(scrollTop / tileSize));
      const endRow = Math.min(7, startRow + visibleRows);
      const startCol = Math.max(0, Math.floor(scrollLeft / tileSize));
      const endCol = Math.min(18, startCol + visibleCols);
      
      setVisibleRange({ startRow, endRow, startCol, endCol });
    };
    
    updateVisibleRange();
    const container = tableContainerRef.current;
    container.addEventListener('scroll', updateVisibleRange);
    window.addEventListener('resize', updateVisibleRange);
    
    return () => {
      container.removeEventListener('scroll', updateVisibleRange);
      window.removeEventListener('resize', updateVisibleRange);
    };
  }, [isMobile]);

  // Handle zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  // Create a memoized element map for faster lookups
  const elementMap = useMemo(() => {
    const map: Record<string, Element> = {};
    elements.forEach(element => {
      if (element.group && element.period) {
        const key = `${element.period}-${element.group}`;
        map[key] = element;
      }
    });
    return map;
  }, []);

  // Memoize special row elements to avoid recalculation
  const specialRows = useMemo(() => ({
    lanthanides: elements.filter(el => el.category === 'lanthanide'),
    actinides: elements.filter(el => el.category === 'actinide')
  }), []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = searchElements(query, elements);
    setSearchResults(results);
    
    // When results are found on mobile, show the first result directly
    if (results.length > 0 && isMobile && window.innerWidth < 480) {
      setSelectedElement(results[0]);
    }
  }, [isMobile]);

  const handleElementClick = useCallback((element: Element) => {
    setSelectedElement(element);
    setSelectedPolyatomicIon(null);
    setShowSolubilityRules(false);
  }, []);

  const handlePolyatomicIonSelect = useCallback((ion: PolyatomicIon) => {
    setSelectedPolyatomicIon(ion);
    setSelectedElement(null);
    setShowSolubilityRules(false);
  }, []);

  const handleSolubilityClick = useCallback(() => {
    setShowSolubilityRules(true);
    setSelectedElement(null);
    setSelectedPolyatomicIon(null);
  }, []);

  const toggleTableVisibility = useCallback(() => {
    setIsTableVisible(prev => !prev);
  }, []);

  const toggleTool = useCallback((tool: string) => {
    setActiveTools(prev => {
      if (prev.includes(tool)) {
        return prev.filter(t => t !== tool);
      } else {
        return [...prev, tool];
      }
    });
  }, []);

  // Memoize the main table structure to avoid recalculation
  // Using virtualization to only render visible elements
  const mainTableRows = useMemo(() => {
    const rows = [];
    
    for (let rowIndex = visibleRange.startRow; rowIndex < visibleRange.endRow; rowIndex++) {
      const row = rowIndex + 1; // 1-indexed for period
      const cols = [];
      
      for (let colIndex = visibleRange.startCol; colIndex < visibleRange.endCol; colIndex++) {
        const col = colIndex + 1; // 1-indexed for group
        const key = `${row}-${col}`;
        const element = elementMap[key];
        const placeholderInfo = isPlaceholder(row, col);
        
        if (element) {
          const isHighlighted = shouldHighlightElement(element, searchResults);
          cols.push(
            <ElementTile 
              key={element.number}
              element={element} 
              isHighlighted={isHighlighted} 
              onClick={handleElementClick} 
            />
          );
        } else if (placeholderInfo) {
          if (placeholderInfo.type === 'empty') {
            cols.push(<div key={key} className="element-tile opacity-0"></div>);
          } else {
            cols.push(
              <div
                key={key}
                className="element-tile bg-secondary/50 flex items-center justify-center text-xs text-muted-foreground"
              >
                {placeholderInfo.text}
              </div>
            );
          }
        } else {
          cols.push(<div key={key} className="element-tile"></div>);
        }
      }
      
      rows.push(
        <React.Fragment key={`row-${row}`}>
          {cols}
        </React.Fragment>
      );
    }
    
    return rows;
  }, [elementMap, searchResults, handleElementClick, visibleRange]);

  // Memoize the special rows rendering
  const specialRowsComponent = useMemo(() => (
    <div className="mt-4">
      <div className="grid grid-cols-15 gap-1 mb-1">
        <div className="col-span-2 flex items-center justify-center text-sm">
          Lanthanides
        </div>
        {specialRows.lanthanides.map(element => {
          const isHighlighted = shouldHighlightElement(element, searchResults);
          return (
            <ElementTile 
              key={element.number}
              element={element} 
              isHighlighted={isHighlighted} 
              onClick={handleElementClick} 
            />
          );
        })}
      </div>
      <div className="grid grid-cols-15 gap-1">
        <div className="col-span-2 flex items-center justify-center text-sm">
          Actinides
        </div>
        {specialRows.actinides.map(element => {
          const isHighlighted = shouldHighlightElement(element, searchResults);
          return (
            <ElementTile 
              key={element.number}
              element={element} 
              isHighlighted={isHighlighted} 
              onClick={handleElementClick} 
            />
          );
        })}
      </div>
    </div>
  ), [specialRows, searchResults, handleElementClick]);

  return (
    <div className="p-2 sm:p-4 max-w-full">
      <div className={`search-section ${isMobile ? 'mobile-search-focus' : ''}`}>
        <SearchBar 
          onSearch={handleSearch} 
          onElementSelect={handleElementClick}
          onPolyatomicSelect={handlePolyatomicIonSelect}
        />

        {searchResults.length > 0 && (
          <div className="mb-4 text-center text-sm">
            <span className="px-3 py-1 bg-primary/10 rounded-full">
              Found {searchResults.length} element{searchResults.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-2 my-3 sm:my-4">
          <button
            onClick={handleSolubilityClick}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-primary/10 hover:bg-primary/20 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-colors"
          >
            <span className="material-icons text-sm sm:text-base">science</span>
            Solubility Rules
          </button>
          
          <button
            onClick={toggleTableVisibility}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-colors"
          >
            <span className="material-icons text-sm sm:text-base">
              {isTableVisible ? 'visibility_off' : 'visibility'}
            </span>
            {isTableVisible ? 'Hide Table' : 'Show Table'}
          </button>
          
          <ToolsMenu 
            tools={tools}
            activeTools={activeTools}
            onToggleTool={toggleTool}
          />
          
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              window.open('https://en.wikipedia.org/wiki/Periodic_table', '_blank');
            }}
            className="px-3 py-1 sm:px-4 sm:py-2 bg-secondary/20 hover:bg-secondary/30 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 transition-colors"
          >
            <span className="material-icons text-sm sm:text-base">menu_book</span>
            Learn More
          </a>
        </div>
        
        {/* Display active tool tags below the main buttons */}
        <ActiveToolTags
          tools={tools}
          activeTools={activeTools}
          onToggleTool={toggleTool}
        />
      </div>

      {activeTools.includes('MolarMassCalculator') && (
        <div className="my-4">
          <MolarMassCalculator />
        </div>
      )}

      {activeTools.includes('EquationBalancer') && (
        <div className="my-4">
          <EquationBalancer />
        </div>
      )}

      {activeTools.includes('ChemicalNamer') && (
        <div className="my-4">
          <ChemicalNamer />
        </div>
      )}

      {activeTools.includes('Stoichiometry') && (
        <div className="my-4">
          <Stoichiometry />
        </div>
      )}
      
      {activeTools.includes('GasLawCalculator') && (
        <div className="my-4">
          <GasLawCalculator />
        </div>
      )}
      
      {activeTools.includes('SigFigCalculator') && (
        <div className="my-4">
          <SigFigCalculator />
        </div>
      )}
      
      {activeTools.includes('LewisStructureGenerator') && (
        <div className="my-4">
          <LewisStructureGenerator />
        </div>
      )}
      
      {activeTools.includes('ReactionPredictor') && (
        <div className="my-4">
          <ReactionPredictor />
        </div>
      )}

      {activeTools.includes('ScientificCalculator') && (
        <div className="my-4">
          <ScientificCalculator />
        </div>
      )}
      
      {activeTools.includes('UnitConverter') && (
        <div className="my-4">
          <UnitConverter />
        </div>
      )}
      
      {activeTools.includes('DilutionCalculator') && (
        <div className="my-4">
          <DilutionCalculator />
        </div>
      )}
      
      {activeTools.includes('MolalityCalculator') && (
        <div className="my-4">
          <MolalityCalculator />
        </div>
      )}
      
      {activeTools.includes('MolarityCalculator') && (
        <div className="my-4">
          <MolarityCalculator />
        </div>
      )}
      
      {activeTools.includes('ColligativePropertiesCalculator') && (
        <div className="my-4">
          <ColligativePropertiesCalculator />
        </div>
      )}

      {isTableVisible && (
        <div 
          ref={tableContainerRef}
          className={`pinch-zoom-container ${isMobile ? 'mobile-table-container' : ''}`}
        >
          <div 
            className="element-grid-container"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              transition: 'transform 0.2s ease'
            }}
          >
            <div className="element-grid overflow-x-auto pb-2">
              {mainTableRows}
            </div>

            {specialRowsComponent}
          </div>
        </div>
      )}

      {isTableVisible && (
        <div className="zoom-controls">
          <button className="zoom-button" onClick={handleZoomIn}>+</button>
          <button className="zoom-button" onClick={handleZoomOut}>-</button>
        </div>
      )}

      <Suspense fallback={<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">Loading...</div>}>
        {selectedElement && (
          <ElementCard
            element={selectedElement}
            onClose={() => setSelectedElement(null)}
          />
        )}

        {selectedPolyatomicIon && (
          <PolyatomicIonCard
            ion={selectedPolyatomicIon}
            onClose={() => setSelectedPolyatomicIon(null)}
          />
        )}

        {showSolubilityRules && (
          <SolubilityRulesCard
            onClose={() => setShowSolubilityRules(false)}
          />
        )}
      </Suspense>
    </div>
  );
};

export default React.memo(PeriodicTable);
