export interface PolyatomicIon {
  id: string;
  formula: string;
  name: string;
  charge: number;
  atomicStructure: string[];
  description: string;
  commonUses: string[];
}

export const polyatomicIons: PolyatomicIon[] = [
  {
    id: "ammonium",
    formula: "NH₄⁺",
    name: "Ammonium",
    charge: 1,
    atomicStructure: ["N", "H", "H", "H", "H"],
    description: "A positively charged polyatomic ion with a nitrogen atom at its center surrounded by four hydrogen atoms.",
    commonUses: ["Fertilizers", "Cleaning products", "Food additives"]
  },
  {
    id: "hydroxide",
    formula: "OH⁻",
    name: "Hydroxide",
    charge: -1,
    atomicStructure: ["O", "H"],
    description: "A negatively charged ion consisting of an oxygen atom bonded to a hydrogen atom.",
    commonUses: ["Bases and alkalis", "Cleaning products", "Water treatment"]
  },
  {
    id: "nitrate",
    formula: "NO₃⁻",
    name: "Nitrate",
    charge: -1,
    atomicStructure: ["N", "O", "O", "O"],
    description: "A polyatomic ion with one nitrogen atom and three oxygen atoms.",
    commonUses: ["Fertilizers", "Explosives", "Food preservatives"]
  },
  {
    id: "nitrite",
    formula: "NO₂⁻",
    name: "Nitrite",
    charge: -1,
    atomicStructure: ["N", "O", "O"],
    description: "A polyatomic ion with one nitrogen atom and two oxygen atoms.",
    commonUses: ["Food preservatives", "Medicine", "Chemistry reagents"]
  },
  {
    id: "sulfate",
    formula: "SO₄²⁻",
    name: "Sulfate",
    charge: -2,
    atomicStructure: ["S", "O", "O", "O", "O"],
    description: "A polyatomic ion with one sulfur atom and four oxygen atoms.",
    commonUses: ["Fertilizers", "Chemicals", "Construction materials"]
  },
  {
    id: "sulfite",
    formula: "SO₃²⁻",
    name: "Sulfite",
    charge: -2,
    atomicStructure: ["S", "O", "O", "O"],
    description: "A polyatomic ion with one sulfur atom and three oxygen atoms.",
    commonUses: ["Food preservatives", "Wine making", "Pulp and paper industry"]
  },
  {
    id: "hydrogen-sulfate",
    formula: "HSO₄⁻",
    name: "Hydrogen sulfate",
    charge: -1,
    atomicStructure: ["H", "S", "O", "O", "O", "O"],
    description: "A polyatomic ion with a hydrogen atom, a sulfur atom, and four oxygen atoms.",
    commonUses: ["Acidic cleaning agents", "Chemical manufacturing", "Laboratory reagents"]
  },
  {
    id: "carbonate",
    formula: "CO₃²⁻",
    name: "Carbonate",
    charge: -2,
    atomicStructure: ["C", "O", "O", "O"],
    description: "A polyatomic ion with one carbon atom and three oxygen atoms.",
    commonUses: ["Glass manufacturing", "Baking soda", "Water treatment"]
  },
  {
    id: "hydrogen-carbonate",
    formula: "HCO₃⁻",
    name: "Hydrogen carbonate",
    charge: -1,
    atomicStructure: ["H", "C", "O", "O", "O"],
    description: "Also known as bicarbonate, a polyatomic ion with a hydrogen atom, a carbon atom, and three oxygen atoms.",
    commonUses: ["Baking", "Antacids", "Fire extinguishers"]
  },
  {
    id: "phosphate",
    formula: "PO₄³⁻",
    name: "Phosphate",
    charge: -3,
    atomicStructure: ["P", "O", "O", "O", "O"],
    description: "A polyatomic ion with one phosphorus atom and four oxygen atoms.",
    commonUses: ["Fertilizers", "Detergents", "Food additives"]
  },
  {
    id: "dihydrogen-phosphate",
    formula: "H₂PO₄⁻",
    name: "Dihydrogen phosphate",
    charge: -1,
    atomicStructure: ["H", "H", "P", "O", "O", "O", "O"],
    description: "A polyatomic ion with two hydrogen atoms, one phosphorus atom, and four oxygen atoms.",
    commonUses: ["Buffers", "Fertilizers", "Food additives"]
  },
  {
    id: "hydrogen-phosphate",
    formula: "HPO₄²⁻",
    name: "Hydrogen phosphate",
    charge: -2,
    atomicStructure: ["H", "P", "O", "O", "O", "O"],
    description: "A polyatomic ion with one hydrogen atom, one phosphorus atom, and four oxygen atoms.",
    commonUses: ["Buffers", "Food additives", "Pharmaceuticals"]
  },
  {
    id: "acetate",
    formula: "CH₃COO⁻",
    name: "Acetate",
    charge: -1,
    atomicStructure: ["C", "H", "H", "H", "C", "O", "O"],
    description: "A polyatomic ion derived from acetic acid.",
    commonUses: ["Vinegar", "Solvents", "Textile production"]
  },
  {
    id: "chlorate",
    formula: "ClO₃⁻",
    name: "Chlorate",
    charge: -1,
    atomicStructure: ["Cl", "O", "O", "O"],
    description: "A polyatomic ion with one chlorine atom and three oxygen atoms.",
    commonUses: ["Herbicides", "Explosives", "Match production"]
  },
  {
    id: "perchlorate",
    formula: "ClO₄⁻",
    name: "Perchlorate",
    charge: -1,
    atomicStructure: ["Cl", "O", "O", "O", "O"],
    description: "A polyatomic ion with one chlorine atom and four oxygen atoms.",
    commonUses: ["Rocket propellants", "Fireworks", "Explosives"]
  },
  {
    id: "chlorite",
    formula: "ClO₂⁻",
    name: "Chlorite",
    charge: -1,
    atomicStructure: ["Cl", "O", "O"],
    description: "A polyatomic ion with one chlorine atom and two oxygen atoms.",
    commonUses: ["Water treatment", "Disinfectants", "Bleaching agents"]
  },
  {
    id: "hypochlorite",
    formula: "ClO⁻",
    name: "Hypochlorite",
    charge: -1,
    atomicStructure: ["Cl", "O"],
    description: "A polyatomic ion with one chlorine atom and one oxygen atom.",
    commonUses: ["Bleach", "Water disinfection", "Cleaning products"]
  },
  {
    id: "chromate",
    formula: "CrO₄²⁻",
    name: "Chromate",
    charge: -2,
    atomicStructure: ["Cr", "O", "O", "O", "O"],
    description: "A polyatomic ion with one chromium atom and four oxygen atoms.",
    commonUses: ["Dyes", "Pigments", "Metal finishing"]
  },
  {
    id: "dichromate",
    formula: "Cr₂O₇²⁻",
    name: "Dichromate",
    charge: -2,
    atomicStructure: ["Cr", "Cr", "O", "O", "O", "O", "O", "O", "O"],
    description: "A polyatomic ion with two chromium atoms and seven oxygen atoms.",
    commonUses: ["Oxidizing agents", "Leather tanning", "Photography"]
  },
  {
    id: "permanganate",
    formula: "MnO₄⁻",
    name: "Permanganate",
    charge: -1,
    atomicStructure: ["Mn", "O", "O", "O", "O"],
    description: "A polyatomic ion with one manganese atom and four oxygen atoms.",
    commonUses: ["Disinfectants", "Water treatment", "Chemical synthesis"]
  },
  {
    id: "cyanide",
    formula: "CN⁻",
    name: "Cyanide",
    charge: -1,
    atomicStructure: ["C", "N"],
    description: "A polyatomic ion with one carbon atom and one nitrogen atom.",
    commonUses: ["Gold extraction", "Electroplating", "Chemical synthesis"]
  },
  {
    id: "thiocyanate",
    formula: "SCN⁻",
    name: "Thiocyanate",
    charge: -1,
    atomicStructure: ["S", "C", "N"],
    description: "A polyatomic ion with one sulfur atom, one carbon atom, and one nitrogen atom.",
    commonUses: ["Analytical chemistry", "Photography", "Herbicides"]
  },
  {
    id: "peroxide",
    formula: "O₂²⁻",
    name: "Peroxide",
    charge: -2,
    atomicStructure: ["O", "O"],
    description: "A polyatomic ion with two oxygen atoms.",
    commonUses: ["Bleaching agents", "Disinfectants", "Rocket propellants"]
  },
  {
    id: "oxalate",
    formula: "C₂O₄²⁻",
    name: "Oxalate",
    charge: -2,
    atomicStructure: ["C", "C", "O", "O", "O", "O"],
    description: "A polyatomic ion with two carbon atoms and four oxygen atoms.",
    commonUses: ["Cleaning agents", "Rust removal", "Laboratory reagents"]
  },
  {
    id: "bromate",
    formula: "BrO₃⁻",
    name: "Bromate",
    charge: -1,
    atomicStructure: ["Br", "O", "O", "O"],
    description: "A polyatomic ion with one bromine atom and three oxygen atoms.",
    commonUses: ["Food additives", "Oxidizing agents", "Chemical synthesis"]
  },
  {
    id: "iodate",
    formula: "IO₃⁻",
    name: "Iodate",
    charge: -1,
    atomicStructure: ["I", "O", "O", "O"],
    description: "A polyatomic ion with one iodine atom and three oxygen atoms.",
    commonUses: ["Disinfectants", "Animal feed", "Analytical chemistry"]
  },
  {
    id: "periodate",
    formula: "IO₄⁻",
    name: "Periodate",
    charge: -1,
    atomicStructure: ["I", "O", "O", "O", "O"],
    description: "A polyatomic ion with one iodine atom and four oxygen atoms.",
    commonUses: ["Oxidizing agents", "Analytical chemistry", "Organic synthesis"]
  },
  {
    id: "silicate",
    formula: "SiO₃²⁻",
    name: "Silicate",
    charge: -2,
    atomicStructure: ["Si", "O", "O", "O"],
    description: "A polyatomic ion with one silicon atom and three oxygen atoms.",
    commonUses: ["Glass manufacturing", "Ceramics", "Detergents"]
  },
  {
    id: "thiosulfate",
    formula: "S₂O₃²⁻",
    name: "Thiosulfate",
    charge: -2,
    atomicStructure: ["S", "S", "O", "O", "O"],
    description: "A polyatomic ion with two sulfur atoms and three oxygen atoms.",
    commonUses: ["Photography", "Water treatment", "Analytical chemistry"]
  },
  {
    id: "aluminate",
    formula: "AlO₂⁻",
    name: "Aluminate",
    charge: -1,
    atomicStructure: ["Al", "O", "O"],
    description: "A polyatomic ion with one aluminum atom and two oxygen atoms.",
    commonUses: ["Water treatment", "Paper manufacturing", "Construction materials"]
  },
  {
    id: "arsenate",
    formula: "AsO₄³⁻",
    name: "Arsenate",
    charge: -3,
    atomicStructure: ["As", "O", "O", "O", "O"],
    description: "A polyatomic ion with one arsenic atom and four oxygen atoms.",
    commonUses: ["Wood preservatives", "Pesticides", "Glass manufacturing"]
  },
  {
    id: "borate",
    formula: "BO₃³⁻",
    name: "Borate",
    charge: -3,
    atomicStructure: ["B", "O", "O", "O"],
    description: "A polyatomic ion with one boron atom and three oxygen atoms.",
    commonUses: ["Detergents", "Glass manufacturing", "Flame retardants"]
  },
  {
    id: "citrate",
    formula: "C₆H₅O₇³⁻",
    name: "Citrate",
    charge: -3,
    atomicStructure: ["C", "C", "C", "C", "C", "C", "H", "H", "H", "H", "H", "O", "O", "O", "O", "O", "O", "O"],
    description: "A polyatomic ion derived from citric acid.",
    commonUses: ["Food additives", "Buffering agents", "Chelating agents"]
  },
  {
    id: "formate",
    formula: "HCO₂⁻",
    name: "Formate",
    charge: -1,
    atomicStructure: ["H", "C", "O", "O"],
    description: "A polyatomic ion derived from formic acid.",
    commonUses: ["Preservatives", "Leather tanning", "Chemical synthesis"]
  },
  {
    id: "benzoate",
    formula: "C₇H₅O₂⁻",
    name: "Benzoate",
    charge: -1,
    atomicStructure: ["C", "C", "C", "C", "C", "C", "C", "H", "H", "H", "H", "H", "O", "O"],
    description: "A polyatomic ion derived from benzoic acid.",
    commonUses: ["Food preservatives", "Cosmetics", "Pharmaceuticals"]
  },
  {
    id: "cyanate",
    formula: "OCN⁻",
    name: "Cyanate",
    charge: -1,
    atomicStructure: ["O", "C", "N"],
    description: "A polyatomic ion with one oxygen atom, one carbon atom, and one nitrogen atom.",
    commonUses: ["Chemical synthesis", "Agriculture", "Laboratory reagents"]
  },
  {
    id: "lactate",
    formula: "C₃H₅O₃⁻",
    name: "Lactate",
    charge: -1,
    atomicStructure: ["C", "C", "C", "H", "H", "H", "H", "H", "O", "O", "O"],
    description: "A polyatomic ion derived from lactic acid.",
    commonUses: ["Food additives", "Cosmetics", "Pharmaceuticals"]
  },
  {
    id: "nitride",
    formula: "N³⁻",
    name: "Nitride",
    charge: -3,
    atomicStructure: ["N"],
    description: "A monatomic ion of nitrogen with a -3 charge.",
    commonUses: ["Semiconductors", "Steel production", "Ceramics"]
  },
  {
    id: "hydrazinium",
    formula: "N₂H₅⁺",
    name: "Hydrazinium",
    charge: 1,
    atomicStructure: ["N", "N", "H", "H", "H", "H", "H"],
    description: "A polyatomic ion derived from hydrazine.",
    commonUses: ["Rocket fuel", "Pharmaceuticals", "Chemical synthesis"]
  },
  {
    id: "methylammonium",
    formula: "CH₃NH₃⁺",
    name: "Methylammonium",
    charge: 1,
    atomicStructure: ["C", "H", "H", "H", "N", "H", "H", "H"],
    description: "A polyatomic ion derived from methylamine.",
    commonUses: ["Solar cells", "Organic synthesis", "Laboratory reagents"]
  },
  {
    id: "dimethylammonium",
    formula: "(CH₃)₂NH₂⁺",
    name: "Dimethylammonium",
    charge: 1,
    atomicStructure: ["C", "H", "H", "H", "C", "H", "H", "H", "N", "H", "H"],
    description: "A polyatomic ion derived from dimethylamine.",
    commonUses: ["Pharmaceuticals", "Pesticides", "Chemical synthesis"]
  },
  {
    id: "trimethylammonium",
    formula: "(CH₃)₃NH⁺",
    name: "Trimethylammonium",
    charge: 1,
    atomicStructure: ["C", "H", "H", "H", "C", "H", "H", "H", "C", "H", "H", "H", "N", "H"],
    description: "A polyatomic ion derived from trimethylamine.",
    commonUses: ["Quaternary ammonium compounds", "Surfactants", "Disinfectants"]
  },
  {
    id: "tetramethylammonium",
    formula: "(CH₃)₄N⁺",
    name: "Tetramethylammonium",
    charge: 1,
    atomicStructure: ["C", "H", "H", "H", "C", "H", "H", "H", "C", "H", "H", "H", "C", "H", "H", "H", "N"],
    description: "A polyatomic ion derived from tetramethylamine.",
    commonUses: ["Phase transfer catalysts", "Biochemistry", "Electrochemistry"]
  },
  {
    id: "phosphonium",
    formula: "PH₄⁺",
    name: "Phosphonium",
    charge: 1,
    atomicStructure: ["P", "H", "H", "H", "H"],
    description: "A polyatomic ion with a phosphorus atom at its center surrounded by four hydrogen atoms.",
    commonUses: ["Flame retardants", "Organic synthesis", "Catalysts"]
  },
  {
    id: "pyrophosphate",
    formula: "P₂O₇⁴⁻",
    name: "Pyrophosphate",
    charge: -4,
    atomicStructure: ["P", "P", "O", "O", "O", "O", "O", "O", "O"],
    description: "A polyatomic ion with two phosphorus atoms and seven oxygen atoms.",
    commonUses: ["Detergents", "Food additives", "Water treatment"]
  },
  {
    id: "oxonium",
    formula: "H₃O⁺",
    name: "Oxonium",
    charge: 1,
    atomicStructure: ["H", "H", "H", "O"],
    description: "Also known as hydronium, a polyatomic ion with three hydrogen atoms bonded to an oxygen atom.",
    commonUses: ["Acid solutions", "Chemical reactions", "pH balance"]
  },
  {
    id: "hydrogen-sulfite",
    formula: "HSO₃⁻",
    name: "Hydrogen sulfite",
    charge: -1,
    atomicStructure: ["H", "S", "O", "O", "O"],
    description: "Also known as bisulfite, a polyatomic ion with a hydrogen atom, a sulfur atom, and three oxygen atoms.",
    commonUses: ["Food preservatives", "Brewing", "Pulp and paper industry"]
  },
  {
    id: "thiocarbonate",
    formula: "CS₃²⁻",
    name: "Thiocarbonate",
    charge: -2,
    atomicStructure: ["C", "S", "S", "S"],
    description: "A polyatomic ion with one carbon atom and three sulfur atoms.",
    commonUses: ["Mining", "Chemical synthesis", "Laboratory reagents"]
  },
  {
    id: "tartrate",
    formula: "C₄H₄O₆²⁻",
    name: "Tartrate",
    charge: -2,
    atomicStructure: ["C", "C", "C", "C", "H", "H", "H", "H", "O", "O", "O", "O", "O", "O"],
    description: "A polyatomic ion derived from tartaric acid.",
    commonUses: ["Food additives", "Wine making", "Baking powder"]
  },
  {
    id: "zincate",
    formula: "ZnO₂²⁻",
    name: "Zincate",
    charge: -2,
    atomicStructure: ["Zn", "O", "O"],
    description: "A polyatomic ion with one zinc atom and two oxygen atoms.",
    commonUses: ["Electroplating", "Corrosion protection", "Chemical synthesis"]
  }
];

// Indexes for faster lookups
export const polyatomicIonsById: Record<string, PolyatomicIon> = {};
export const polyatomicIonsByFormula: Record<string, PolyatomicIon> = {};
export const polyatomicIonsByCharge: Record<number, PolyatomicIon[]> = {};

// Build indexes
polyatomicIons.forEach(ion => {
  polyatomicIonsById[ion.id] = ion;
  polyatomicIonsByFormula[ion.formula] = ion;
  
  if (!polyatomicIonsByCharge[ion.charge]) {
    polyatomicIonsByCharge[ion.charge] = [];
  }
  polyatomicIonsByCharge[ion.charge].push(ion);
});

// Get polyatomic ion by ID
export const getPolyatomicIonById = (id: string): PolyatomicIon | undefined => {
  return polyatomicIonsById[id];
};

// Get polyatomic ion by formula
export const getPolyatomicIonByFormula = (formula: string): PolyatomicIon | undefined => {
  return polyatomicIonsByFormula[formula];
};

// Search polyatomic ions
export const searchPolyatomicIons = (query: string): PolyatomicIon[] => {
  const lowercaseQuery = query.toLowerCase().trim();
  
  if (!lowercaseQuery) return [];
  
  return polyatomicIons.filter(ion => 
    ion.name.toLowerCase().includes(lowercaseQuery) ||
    ion.formula.toLowerCase().includes(lowercaseQuery) ||
    ion.id.toLowerCase().includes(lowercaseQuery)
  );
};
