import { notFound } from "next/navigation";

import { ConcordanceExplorer } from "@/components/concordance-explorer";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchExpressions, fetchFilterOptions } from "@/lib/api";

type ConcordancePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ 
    q?: string;
    tipologia?: string;
    page?: string;
    sort?: "orden" | "foco" | "contexto";
  }>;
};

export default async function ConcordancePage({
  params,
  searchParams,
}: ConcordancePageProps) {
  const { slug } = await params;
  const { q, tipologia, page, sort } = await searchParams;

  const corpus = await getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  const offset = page ? (parseInt(page, 10) - 1) * 50 : 0;

  let expressionsData: { items: []; total: 0; limit: 50; offset: 0 } | Awaited<ReturnType<typeof fetchExpressions>> = { items: [], total: 0, limit: 50, offset: 0 };
  let filterOptions: Awaited<ReturnType<typeof fetchFilterOptions>> = { typologies: [], sourceDomains: [], targetDomains: [], grammaticalCategories: [] };

  try {
    const [expressionsResult, filterResult] = await Promise.all([
      fetchExpressions(slug, {
        limit: 50,
        offset,
        search: q,
        tipologia,
        orden: "asc",
      }),
      fetchFilterOptions(slug),
    ]);
    expressionsData = expressionsResult;
    filterOptions = filterResult;
  } catch (error) {
    console.error("Error fetching concordance data:", error);
  }

  return (
    <ConcordanceExplorer
      corpus={corpus}
      expressions={expressionsData.items}
      total={expressionsData.total}
      currentPage={page ? parseInt(page, 10) : 1}
      pageSize={50}
      searchQuery={q ?? ""}
      activeTypology={tipologia ?? "all"}
      filterOptions={filterOptions}
      sortBy={sort ?? "orden"}
    />
  );
}
