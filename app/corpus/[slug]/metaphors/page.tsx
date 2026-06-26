import { notFound } from "next/navigation";

import { MetaphorExplorer } from "@/components/metaphor-explorer";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchMetaphorsPaginated, fetchFilterOptions } from "@/lib/api";
import {
  mapApiMetaphorToConceptualMetaphor,
  buildFilterOptions,
  type ConceptualMetaphor,
  type FilterOptions,
} from "@/lib/metaphors";

type MetaphorsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; cat_gramatical?: string; tipologia?: string }>;
};

const PAGE_SIZE = 50;

export default async function MetaphorsPage({ params, searchParams }: MetaphorsPageProps) {
  const { slug } = await params;
  const { page, cat_gramatical, tipologia } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  const corpus = await getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  let metaphors: ConceptualMetaphor[];
  let filterOptions: FilterOptions;
  let total = 0;

  try {
    const [apiData, apiFilters] = await Promise.all([
      fetchMetaphorsPaginated(slug, { page: currentPage, pageSize: PAGE_SIZE, cat_gramatical, tipologia }),
      fetchFilterOptions(slug),
    ]);

    metaphors = apiData.items.map(mapApiMetaphorToConceptualMetaphor);
    total = apiData.total;
    filterOptions = buildFilterOptions(metaphors, apiFilters);
  } catch (error) {
    console.error("[MetaphorsPage] Error fetching metaphors:", error);
    metaphors = [];
    total = 0;
    filterOptions = { typologies: [], sourceDomains: [], targetDomains: [], grammaticalCategories: [] };
  }

  return (
    <MetaphorExplorer
      metaphors={metaphors}
      filters={filterOptions}
      corpusName={corpus.name}
      corpusSlug={slug}
      currentPage={currentPage}
      totalPages={Math.ceil(total / PAGE_SIZE)}
      total={total}
      activeTypology={tipologia ?? ""}
      activeCatGramatical={cat_gramatical ?? ""}
    />
  );
}
