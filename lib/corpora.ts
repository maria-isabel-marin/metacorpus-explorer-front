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

export const corpusCatalog: CorpusSummary[] = [
  {
    slug: "tdg-betancur-villegas-2025",
    name: "Tomo Mi cuerpo es la verdad — Informe Final CEV",
    shortCode: "Corpus · 01",
    description:
      "Corpus resultante del trabajo de grado de pregrado \"Conceptualización de las mujeres y del conflicto armado colombiano a través de las metáforas conceptuales en el Informe Final de la Comisión de la Verdad\".",
    expressions: 0,
    metaphors: 0,
    sourceDomains: 0,
    targetDomains: 0,
    textualSources: 0,
    typologies: 0,
    language: "ES",
    version: "1.0.0",
    license: "CC-BY-4.0",
    publicationDate: "2025-01-01",
    highlightedTopic: "Mujeres, conflicto armado y verdad",
  },
  {
    slug: "phdthesis-marinmorales-2026",
    name: "Informe Final de la Comisión de la Verdad de Colombia",
    shortCode: "Corpus · 02",
    description:
      "Corpus resultante de la Tesis Doctoral \"Can an AI-enabled system help us understand how cultural narratives are configured, and how do they prime social mobilization?\".",
    expressions: 0,
    metaphors: 0,
    sourceDomains: 0,
    targetDomains: 0,
    textualSources: 0,
    typologies: 0,
    language: "ES",
    version: "1.0.0",
    license: "CC-BY-4.0",
    publicationDate: "2026-01-01",
    highlightedTopic: "Narrativas culturales y movilización social",
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
