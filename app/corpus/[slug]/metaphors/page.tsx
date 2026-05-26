import { notFound } from "next/navigation";

import { MetaphorExplorer } from "@/components/metaphor-explorer";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchMetaphors, fetchFilterOptions } from "@/lib/api";
import {
  mapApiMetaphorToConceptualMetaphor,
  buildFilterOptions,
  type ConceptualMetaphor,
  type FilterOptions,
} from "@/lib/metaphors";

type MetaphorsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function MetaphorsPage({ params }: MetaphorsPageProps) {
  const { slug } = await params;
  const corpus = getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  let metaphors: ConceptualMetaphor[];
  let filterOptions: FilterOptions;

  try {
    const [apiData, apiFilters] = await Promise.all([
      fetchMetaphors(slug, { limit: 500 }),
      fetchFilterOptions(slug),
    ]);

    metaphors = apiData.items.map(mapApiMetaphorToConceptualMetaphor);
    filterOptions = buildFilterOptions(metaphors, apiFilters);
  } catch {
    metaphors = [];
    filterOptions = { typologies: [], sourceDomains: [], targetDomains: [], grammaticalCategories: [] };
  }

  return (
    <MetaphorExplorer
      metaphors={metaphors}
      filters={filterOptions}
      corpusName={corpus.name}
    />
  );
}
