import type { ApiMetaphor, ApiFilterOptions } from "./api";

export type MetaphorTypology = string;

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
  typologies: { name: string; count: number }[];
  sourceDomains: string[];
  targetDomains: string[];
  grammaticalCategories: { name: string; abbr?: string; count: number }[];
};

export function mapApiMetaphorToConceptualMetaphor(
  m: ApiMetaphor
): ConceptualMetaphor {
  return {
    id: m.id,
    formula: m.nombre,
    sourceDomain: m.dominio_fuente?.nombre ?? "—",
    targetDomain: m.dominio_meta?.nombre ?? "—",
    typology: m.tipologia ?? "OTRA",
    expressions: m.total_expresiones ?? 0,
    sourceDomainNormalized: (m.dominio_fuente?.nombre ?? "").toLowerCase(),
    targetDomainNormalized: (m.dominio_meta?.nombre ?? "").toLowerCase(),
  };
}

export function buildFilterOptions(
  _metaphors: ConceptualMetaphor[],
  apiFilters: ApiFilterOptions
): FilterOptions {
  // Las tipologías y sus counts vienen calculados desde fetchFilterOptions (500 metáforas)
  const typologies = apiFilters.typologies.map((t) => ({
    name: normalizeTypologyName(t.name),
    count: t.count,
  }));

  return {
    typologies,
    sourceDomains: apiFilters.sourceDomains,
    targetDomains: apiFilters.targetDomains,
    grammaticalCategories: apiFilters.grammaticalCategories.map((c) => ({
      name: c.nombre,
      abbr: c.abreviatura,
      count: c.count ?? 0,
    })),
  };
}

function normalizeTypologyName(raw: string): string {
  const map: Record<string, string> = {
    "ESTRUCTURAL": "Estructural",
    "Estructural": "Estructural",
    "estructural": "Estructural",
    "ONTOLOGICA": "Ontologica",
    "ONTOLÓGICA": "Ontologica",
    "Ontologica": "Ontologica",
    "Ontológica": "Ontologica",
    "ontologica": "Ontologica",
    "ORIENTACIONAL": "Orientacional",
    "Orientacional": "Orientacional",
    "orientacional": "Orientacional",
    "OTRA": "Otra",
    "Otra": "Otra",
    "otra": "Otra",
  };
  return map[raw] ?? raw;
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
    if (filters.typologies && filters.typologies.length > 0) {
      const normalized = normalizeTypologyName(m.typology);
      if (!filters.typologies.includes(normalized)) return false;
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
