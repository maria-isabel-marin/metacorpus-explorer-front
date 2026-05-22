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
  grammaticalCategories: { name: string; count: number }[];
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
  metaphors: ConceptualMetaphor[],
  apiFilters: ApiFilterOptions
): FilterOptions {
  const typologyCounts = new Map<string, number>();
  for (const m of metaphors) {
    typologyCounts.set(m.typology, (typologyCounts.get(m.typology) ?? 0) + 1);
  }

  const typologies = [...typologyCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return {
    typologies,
    sourceDomains: apiFilters.sourceDomains,
    targetDomains: apiFilters.targetDomains,
    grammaticalCategories: apiFilters.grammaticalCategories.map((c) => ({
      name: c.abreviatura,
      count: 0,
    })),
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
