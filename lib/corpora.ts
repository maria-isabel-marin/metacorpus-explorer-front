export type CorpusSummary = {
  slug: string;
  name: string;
  shortCode: string;
  description: string;
  expressions: number;
  metaphors: number;
  sourceDomains: number;
  targetDomains: number;
  language: string;
  version: string;
  license: string;
  publicationDate: string;
  highlightedTopic: string;
};

export const corpusCatalog: CorpusSummary[] = [
  {
    slug: "cev-conflicto-armado-colombiano",
    name: "CEV — Conflicto Armado Colombiano",
    shortCode: "Corpus · 01",
    description:
      "Corpus de metáforas conceptuales extraídas de textos del conflicto armado colombiano, con anotación MIPVU y foco en memoria, testimonio, reconciliación y verdad.",
    expressions: 3148,
    metaphors: 412,
    sourceDomains: 187,
    targetDomains: 94,
    language: "ES",
    version: "1.0.0",
    license: "CC-BY-4.0",
    publicationDate: "2026-03-12",
    highlightedTopic: "Memoria, verdad y reconciliación",
  },
  {
    slug: "prensa-politica-colombiana-2018-2024",
    name: "Prensa Política Colombiana 2018–2024",
    shortCode: "Corpus · 02",
    description:
      "Editoriales y columnas de opinión de medios nacionales, orientadas al análisis de metáforas sobre gobernanza, economía, institucionalidad y procesos electorales.",
    expressions: 1842,
    metaphors: 256,
    sourceDomains: 121,
    targetDomains: 63,
    language: "ES",
    version: "0.8.2",
    license: "CC-BY-4.0",
    publicationDate: "2026-01-30",
    highlightedTopic: "Gobernanza, economía y debate público",
  },
];

export function getAllCorpora() {
  return corpusCatalog;
}

export function getCorpusBySlug(slug: string) {
  return corpusCatalog.find((corpus) => corpus.slug === slug);
}

export function getCorpusOrThrow(slug: string) {
  const corpus = getCorpusBySlug(slug);

  if (!corpus) {
    throw new Error(`Corpus not found for slug: ${slug}`);
  }

  return corpus;
}

export function getCorpusCount() {
  return corpusCatalog.length;
}
