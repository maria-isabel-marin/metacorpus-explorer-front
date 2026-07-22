import type { ApiCorpusListItem } from "@/lib/api";
import { fetchAllCorpora, fetchCorpusStats } from "@/lib/api";

export type CorpusSummary = {
  slug: string;
  name: string;
  shortCode: string;
  description: string;
  expressions: number;
  metaphors: number;
  sourceDomains: number;
  targetDomains: number;
  textualSources: number;
  typologies: number;
  language: string;
  version: string;
  license: string;
  publicationDate: string;
  highlightedTopic: string;
};

export function apiCorpusToSummary(item: ApiCorpusListItem, index: number): CorpusSummary {
  return {
    slug: item.slug,
    name: item.nombre,
    shortCode: `Corpus · ${String(index + 1).padStart(2, "0")}`,
    description: item.descripcion ?? "",
    expressions: item.numero_registros,
    metaphors: 0,
    sourceDomains: 0,
    targetDomains: 0,
    textualSources: 0,
    typologies: 0,
    language: item.idioma.toUpperCase(),
    version: item.version,
    license: item.licencia ?? "",
    publicationDate: item.fecha_publicacion ?? new Date().toISOString().slice(0, 10),
    highlightedTopic: "",
  };
}

export function buildCorpusSummaryFallback(slug: string): CorpusSummary {
  return {
    slug,
    name: slug,
    shortCode: "Corpus",
    description: "",
    expressions: 0,
    metaphors: 0,
    sourceDomains: 0,
    targetDomains: 0,
    textualSources: 0,
    typologies: 0,
    language: "",
    version: "",
    license: "",
    publicationDate: new Date().toISOString().slice(0, 10),
    highlightedTopic: "",
  };
}

export async function getAllCorpora(): Promise<CorpusSummary[]> {
  try {
    const items = await fetchAllCorpora();
    return items.map((item, index) => apiCorpusToSummary(item, index));
  } catch {
    return [];
  }
}

export async function getCorpusBySlug(slug: string, index?: number): Promise<CorpusSummary | null> {
  try {
    const stats = await fetchCorpusStats(slug);
    const shortCode = index !== undefined
      ? `Corpus · ${String(index + 1).padStart(2, "0")}`
      : "Corpus";
    const summary: CorpusSummary = {
      slug: stats.slug,
      name: stats.nombre,
      shortCode,
      description: stats.descripcion ?? "",
      expressions: stats.estadisticas_agregadas.numero_registros,
      metaphors: stats.estadisticas_agregadas.metaforas_conceptuales,
      sourceDomains: stats.estadisticas_agregadas.dominios_por_tipo?.FUENTE ?? 0,
      targetDomains: stats.estadisticas_agregadas.dominios_por_tipo?.META ?? 0,
      textualSources: stats.estadisticas_agregadas.fuentes_textuales,
      typologies: stats.estadisticas_agregadas.categorias_gramaticales,
      language: stats.idioma.toUpperCase(),
      version: stats.version,
      license: stats.licencia ?? "",
      publicationDate: stats.fecha_publicacion ?? new Date().toISOString().slice(0, 10),
      highlightedTopic: "",
    };
    return summary;
  } catch {
    return null;
  }
}

export async function getCorpusCount(): Promise<number> {
  try {
    const items = await fetchAllCorpora();
    return items.length;
  } catch {
    return 0;
  }
}
