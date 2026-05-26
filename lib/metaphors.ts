export type MetaphorTypology = "ESTRUCTURAL" | "ONTOLÓGICA" | "ORIENTACIONAL" | "OTRA";

export type ConceptualMetaphor = {
  id: string;
  formula: string;
  sourceDomain: string;
  targetDomain: string;
  typology: MetaphorTypology;
  expressions: number;
  sourceDomainNormalized: string;
  targetDomainNormalized: string;
};

export type FilterOptions = {
  typologies: { name: MetaphorTypology; count: number }[];
  sourceDomains: string[];
  targetDomains: string[];
  grammaticalCategories: { name: string; count: number }[];
};

// Mock data for CEV corpus metaphors
const cevMetaphors: ConceptualMetaphor[] = [
  { id: "1", formula: "EL CONFLICTO SOCIAL ES GUERRA", sourceDomain: "GUERRA", targetDomain: "CONFLICTO", typology: "ESTRUCTURAL", expressions: 89, sourceDomainNormalized: "guerra", targetDomainNormalized: "conflicto" },
  { id: "2", formula: "LA JUSTICIA ES UN CAMINO", sourceDomain: "CAMINO", targetDomain: "JUSTICIA", typology: "ESTRUCTURAL", expressions: 72, sourceDomainNormalized: "camino", targetDomainNormalized: "justicia" },
  { id: "3", formula: "LA NACIÓN ES UN CUERPO", sourceDomain: "CUERPO", targetDomain: "NACIÓN", typology: "ONTOLÓGICA", expressions: 67, sourceDomainNormalized: "cuerpo", targetDomainNormalized: "nación" },
  { id: "4", formula: "LA MEMORIA ES UNA HERIDA", sourceDomain: "HERIDA", targetDomain: "MEMORIA", typology: "ONTOLÓGICA", expressions: 63, sourceDomainNormalized: "herida", targetDomainNormalized: "memoria" },
  { id: "5", formula: "LA PAZ ES UN EDIFICIO", sourceDomain: "EDIFICIO", targetDomain: "PAZ", typology: "ESTRUCTURAL", expressions: 58, sourceDomainNormalized: "edificio", targetDomainNormalized: "paz" },
  { id: "6", formula: "LA BÚSQUEDA DE LA VERDAD ES UN VIAJE", sourceDomain: "VIAJE", targetDomain: "VERDAD", typology: "ESTRUCTURAL", expressions: 54, sourceDomainNormalized: "viaje", targetDomainNormalized: "verdad" },
  { id: "7", formula: "EL DOLOR ES AGUA", sourceDomain: "AGUA", targetDomain: "DOLOR", typology: "ONTOLÓGICA", expressions: 52, sourceDomainNormalized: "agua", targetDomainNormalized: "dolor" },
  { id: "8", formula: "LA RECONCILIACIÓN ES UN PUENTE", sourceDomain: "PUENTE", targetDomain: "RECONCILIACIÓN", typology: "ESTRUCTURAL", expressions: 48, sourceDomainNormalized: "puente", targetDomainNormalized: "reconciliación" },
  { id: "9", formula: "LA VERDAD ES LUZ", sourceDomain: "LUZ", targetDomain: "VERDAD", typology: "ONTOLÓGICA", expressions: 47, sourceDomainNormalized: "luz", targetDomainNormalized: "verdad" },
  { id: "10", formula: "LA NACIÓN ES UNA FAMILIA", sourceDomain: "FAMILIA", targetDomain: "NACIÓN", typology: "ESTRUCTURAL", expressions: 46, sourceDomainNormalized: "familia", targetDomainNormalized: "nación" },
  { id: "11", formula: "LA MEMORIA ES UN TEJIDO", sourceDomain: "TEJIDO", targetDomain: "MEMORIA", typology: "ONTOLÓGICA", expressions: 44, sourceDomainNormalized: "tejido", targetDomainNormalized: "memoria" },
  { id: "12", formula: "LA CONFIANZA ES UN EDIFICIO", sourceDomain: "EDIFICIO", targetDomain: "CONFIANZA", typology: "ESTRUCTURAL", expressions: 42, sourceDomainNormalized: "edificio", targetDomainNormalized: "confianza" },
  { id: "13", formula: "LA PAZ ES UNA PLANTA", sourceDomain: "PLANTA", targetDomain: "PAZ", typology: "ONTOLÓGICA", expressions: 41, sourceDomainNormalized: "planta", targetDomainNormalized: "paz" },
  { id: "14", formula: "LA HISTORIA ES UN RÍO", sourceDomain: "RÍO", targetDomain: "HISTORIA", typology: "ONTOLÓGICA", expressions: 38, sourceDomainNormalized: "río", targetDomainNormalized: "historia" },
  { id: "15", formula: "EL TIEMPO ES DINERO", sourceDomain: "DINERO", targetDomain: "TIEMPO", typology: "ESTRUCTURAL", expressions: 35, sourceDomainNormalized: "dinero", targetDomainNormalized: "tiempo" },
  { id: "16", formula: "LAS IDEAS SON ALIMENTOS", sourceDomain: "ALIMENTOS", targetDomain: "IDEAS", typology: "ONTOLÓGICA", expressions: 32, sourceDomainNormalized: "alimentos", targetDomainNormalized: "ideas" },
  { id: "17", formula: "LA DEMOCRACIA ES UN JARDÍN", sourceDomain: "JARDÍN", targetDomain: "DEMOCRACIA", typology: "ESTRUCTURAL", expressions: 29, sourceDomainNormalized: "jardín", targetDomainNormalized: "democracia" },
  { id: "18", formula: "EL FUTURO ESTÁ DELANTE", sourceDomain: "DELANTE", targetDomain: "FUTURO", typology: "ORIENTACIONAL", expressions: 12, sourceDomainNormalized: "delante", targetDomainNormalized: "futuro" },
  { id: "19", formula: "LA ESPERANZA ES UN PÁJARO", sourceDomain: "PÁJARO", targetDomain: "ESPERANZA", typology: "ONTOLÓGICA", expressions: 28, sourceDomainNormalized: "pájaro", targetDomainNormalized: "esperanza" },
  { id: "20", formula: "LAS EMOCIONES SON FUERZAS DE LA NATURALEZA", sourceDomain: "FUERZAS", targetDomain: "EMOCIONES", typology: "ESTRUCTURAL", expressions: 24, sourceDomainNormalized: "fuerzas", targetDomainNormalized: "emociones" },
  { id: "21", formula: "EL CONOCIMIENTO ES UNA CONSTRUCCIÓN", sourceDomain: "CONSTRUCCIÓN", targetDomain: "CONOCIMIENTO", typology: "ESTRUCTURAL", expressions: 22, sourceDomainNormalized: "construcción", targetDomainNormalized: "conocimiento" },
  { id: "22", formula: "LA SOCIEDAD ES UNA MÁQUINA", sourceDomain: "MÁQUINA", targetDomain: "SOCIEDAD", typology: "ONTOLÓGICA", expressions: 19, sourceDomainNormalized: "máquina", targetDomainNormalized: "sociedad" },
];

// Mock data for Prensa Política corpus metaphors
const prensaMetaphors: ConceptualMetaphor[] = [
  { id: "23", formula: "LA ECONOMÍA ES UN ORGANISMO", sourceDomain: "ORGANISMO", targetDomain: "ECONOMÍA", typology: "ONTOLÓGICA", expressions: 45, sourceDomainNormalized: "organismo", targetDomainNormalized: "economía" },
  { id: "24", formula: "LA POLÍTICA ES UN JUEGO", sourceDomain: "JUEGO", targetDomain: "POLÍTICA", typology: "ESTRUCTURAL", expressions: 62, sourceDomainNormalized: "juego", targetDomainNormalized: "política" },
  { id: "25", formula: "EL ESTADO ES UNA EMPRESA", sourceDomain: "EMPRESA", targetDomain: "ESTADO", typology: "ONTOLÓGICA", expressions: 38, sourceDomainNormalized: "empresa", targetDomainNormalized: "estado" },
  { id: "26", formula: "LA OPINIÓN PÚBLICA ES UN VOLCÁN", sourceDomain: "VOLCÁN", targetDomain: "OPINIÓN", typology: "ONTOLÓGICA", expressions: 31, sourceDomainNormalized: "volcán", targetDomainNormalized: "opinión" },
  { id: "27", formula: "LAS REFORMAS SON MEDICINAS", sourceDomain: "MEDICINA", targetDomain: "REFORMAS", typology: "ESTRUCTURAL", expressions: 27, sourceDomainNormalized: "medicina", targetDomainNormalized: "reformas" },
  { id: "28", formula: "LA CORRUPCIÓN ES UNA ENFERMEDAD", sourceDomain: "ENFERMEDAD", targetDomain: "CORRUPCIÓN", typology: "ONTOLÓGICA", expressions: 53, sourceDomainNormalized: "enfermedad", targetDomainNormalized: "corrupción" },
];

const metaphorsByCorpus: Record<string, ConceptualMetaphor[]> = {
  "cev-conflicto-armado-colombiano": cevMetaphors,
  "prensa-politica-colombiana-2018-2024": prensaMetaphors,
};

export function getMetaphorsByCorpusSlug(slug: string): ConceptualMetaphor[] {
  return metaphorsByCorpus[slug] || [];
}

export function getFilterOptionsByCorpusSlug(slug: string): FilterOptions {
  const metaphors = getMetaphorsByCorpusSlug(slug);
  
  // Calculate typology counts
  const typologyCounts: Record<MetaphorTypology, number> = {
    "ESTRUCTURAL": 0,
    "ONTOLÓGICA": 0,
    "ORIENTACIONAL": 0,
    "OTRA": 0,
  };
  
  metaphors.forEach(m => {
    typologyCounts[m.typology]++;
  });
  
  const typologies = Object.entries(typologyCounts)
    .map(([name, count]) => ({ name: name as MetaphorTypology, count }))
    .filter(t => t.count > 0);
  
  // Get unique domains
  const sourceDomains = [...new Set(metaphors.map(m => m.sourceDomain))].sort();
  const targetDomains = [...new Set(metaphors.map(m => m.targetDomain))].sort();
  
  // Grammatical categories (mock data)
  const grammaticalCategories = [
    { name: "sustantivo", count: 89 },
    { name: "verbo", count: 64 },
    { name: "adjetivo", count: 72 },
    { name: "adverbio", count: 12 },
  ];
  
  return {
    typologies,
    sourceDomains,
    targetDomains,
    grammaticalCategories,
  };
}

export function filterMetaphors(
  metaphors: ConceptualMetaphor[],
  filters: {
    typologies?: MetaphorTypology[];
    sourceDomain?: string;
    targetDomain?: string;
    grammaticalCategory?: string;
  }
): ConceptualMetaphor[] {
  return metaphors.filter(m => {
    if (filters.typologies && filters.typologies.length > 0 && !filters.typologies.includes(m.typology)) {
      return false;
    }
    if (filters.sourceDomain && filters.sourceDomain !== "all" && m.sourceDomain !== filters.sourceDomain) {
      return false;
    }
    if (filters.targetDomain && filters.targetDomain !== "all" && m.targetDomain !== filters.targetDomain) {
      return false;
    }
    // Grammatical category filtering would require additional data
    return true;
  });
}

export function downloadMetaphorsAsCSV(metaphors: ConceptualMetaphor[]): string {
  const headers = ["ID", "Fórmula", "Dominio Fuente", "Dominio Meta", "Tipología", "Expresiones"];
  const rows = metaphors.map(m => [
    m.id,
    m.formula,
    m.sourceDomain,
    m.targetDomain,
    m.typology,
    m.expressions.toString(),
  ]);
  
  return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
}
