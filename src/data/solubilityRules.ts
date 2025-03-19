export interface SolubilityRule {
  id: string;
  rule: string;
  exceptions: string[];
  examples: {
    soluble: string[];
    insoluble: string[];
  };
  explanation: string;
}

export const solubilityRules: SolubilityRule[] = [
  {
    id: "rule1",
    rule: "All compounds containing alkali metal ions (Li⁺, Na⁺, K⁺, Rb⁺, Cs⁺) are soluble.",
    exceptions: [],
    examples: {
      soluble: ["NaCl", "KBr", "Li₂SO₄", "Na₂CO₃", "KNO₃"],
      insoluble: []
    },
    explanation: "Alkali metals form ionic compounds that dissociate easily in water due to the weak attraction between the alkali metal cation and anions, as well as strong ion-dipole interactions with water molecules."
  },
  {
    id: "rule2",
    rule: "All compounds containing the ammonium ion (NH₄⁺) are soluble.",
    exceptions: [],
    examples: {
      soluble: ["NH₄Cl", "(NH₄)₂SO₄", "NH₄NO₃", "NH₄HCO₃", "(NH₄)₃PO₄"],
      insoluble: []
    },
    explanation: "Ammonium compounds are generally soluble because the ammonium ion forms hydrogen bonds with water molecules, facilitating dissolution."
  },
  {
    id: "rule3",
    rule: "All nitrates (NO₃⁻), acetates (CH₃COO⁻), and perchlorates (ClO₄⁻) are soluble.",
    exceptions: [],
    examples: {
      soluble: ["Ca(NO₃)₂", "Fe(NO₃)₃", "Pb(CH₃COO)₂", "KClO₄", "Mg(ClO₄)₂"],
      insoluble: []
    },
    explanation: "These anions form compounds with high solubility because they have delocalized charges and can form strong ion-dipole interactions with water molecules."
  },
  {
    id: "rule4",
    rule: "All chlorides (Cl⁻), bromides (Br⁻), and iodides (I⁻) are soluble.",
    exceptions: ["AgCl", "PbCl₂", "Hg₂Cl₂", "AgBr", "PbBr₂", "HgBr₂", "AgI", "PbI₂", "HgI₂"],
    examples: {
      soluble: ["NaCl", "KBr", "CaCl₂", "FeCl₃", "MgI₂"],
      insoluble: ["AgCl", "PbCl₂", "AgBr", "AgI"]
    },
    explanation: "Most halides are soluble due to their favorable ion-dipole interactions with water. The exceptions (silver, lead, and mercury(I) halides) have strong ionic lattices that are difficult to break."
  },
  {
    id: "rule5",
    rule: "All sulfates (SO₄²⁻) are soluble.",
    exceptions: ["BaSO₄", "PbSO₄", "CaSO₄", "SrSO₄", "Hg₂SO₄", "Ag₂SO₄"],
    examples: {
      soluble: ["Na₂SO₄", "K₂SO₄", "MgSO₄", "CuSO₄", "(NH₄)₂SO₄"],
      insoluble: ["BaSO₄", "PbSO₄", "CaSO₄"]
    },
    explanation: "Most sulfates are soluble because the sulfate ion forms strong hydrogen bonds with water. The exceptions form particularly stable crystal lattices due to the combination of doubly charged sulfate ions with large or doubly charged cations."
  },
  {
    id: "rule6",
    rule: "All hydroxides (OH⁻) are insoluble.",
    exceptions: ["NaOH", "KOH", "Ca(OH)₂", "Sr(OH)₂", "Ba(OH)₂"],
    examples: {
      soluble: ["NaOH", "KOH", "Ba(OH)₂"],
      insoluble: ["Al(OH)₃", "Fe(OH)₃", "Cu(OH)₂", "Zn(OH)₂", "Mg(OH)₂"]
    },
    explanation: "Most metal hydroxides are insoluble because they form strong hydrogen-bonded networks. The alkali metal hydroxides and some alkaline earth metal hydroxides are soluble due to the lower charge density of these cations."
  },
  {
    id: "rule7",
    rule: "All carbonates (CO₃²⁻), phosphates (PO₄³⁻), and sulfides (S²⁻) are insoluble.",
    exceptions: ["Na₂CO₃", "K₂CO₃", "(NH₄)₂CO₃", "Na₃PO₄", "K₃PO₄", "(NH₄)₃PO₄", "Na₂S", "K₂S", "(NH₄)₂S"],
    examples: {
      soluble: ["Na₂CO₃", "K₃PO₄", "(NH₄)₂S"],
      insoluble: ["CaCO₃", "BaCO₃", "Ca₃(PO₄)₂", "FeS", "CuS", "ZnS"]
    },
    explanation: "These anions form insoluble compounds with most cations due to their high charges and strong ionic bonds in the crystal lattice. The exceptions are compounds with alkali metals and ammonium, which tend to be soluble due to the low charge density of these cations."
  },
  {
    id: "rule8",
    rule: "All chromates (CrO₄²⁻) are insoluble.",
    exceptions: ["Na₂CrO₄", "K₂CrO₄", "(NH₄)₂CrO₄"],
    examples: {
      soluble: ["Na₂CrO₄", "K₂CrO₄", "(NH₄)₂CrO₄"],
      insoluble: ["PbCrO₄", "BaCrO₄", "SrCrO₄", "AgCrO₄"]
    },
    explanation: "Chromate salts are generally insoluble due to the strong ionic lattice formed by the doubly charged chromate anion. Exceptions include compounds with alkali metals and ammonium, which form soluble salts."
  }
];

// Index for faster lookups
export const solubilityRulesById: Record<string, SolubilityRule> = {};

// Build index
solubilityRules.forEach(rule => {
  solubilityRulesById[rule.id] = rule;
});

// Get solubility rule by ID
export const getSolubilityRuleById = (id: string): SolubilityRule | undefined => {
  return solubilityRulesById[id];
};

// Search solubility rules
export const searchSolubilityRules = (query: string): SolubilityRule[] => {
  const lowercaseQuery = query.toLowerCase().trim();
  
  if (!lowercaseQuery) return [];
  
  return solubilityRules.filter(rule => 
    rule.rule.toLowerCase().includes(lowercaseQuery) || 
    rule.explanation.toLowerCase().includes(lowercaseQuery) ||
    rule.examples.soluble.some(ex => ex.toLowerCase().includes(lowercaseQuery)) ||
    rule.examples.insoluble.some(ex => ex.toLowerCase().includes(lowercaseQuery))
  );
};
