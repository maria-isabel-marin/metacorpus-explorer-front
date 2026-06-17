import { notFound } from "next/navigation";

import { MetaphorDetail } from "@/components/metaphor-detail";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchMetaphorById, fetchMetaphorExpressions, fetchRelatedMetaphors } from "@/lib/api";

type MetaphorDetailPageProps = {
  params: Promise<{ slug: string; metaphorId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 20;

export default async function MetaphorDetailPage({ params, searchParams }: MetaphorDetailPageProps) {
  const { slug, metaphorId } = await params;
  const { page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  const corpus = await getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  // Fetch metaphor details
  const metaphor = await fetchMetaphorById(slug, metaphorId);
  if (!metaphor) {
    return notFound();
  }

  // Fetch paginated expressions for this metaphor
  const expressionsData = await fetchMetaphorExpressions(slug, metaphorId, {
    limit: PAGE_SIZE,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  // Fetch related metaphors
  const relatedMetaphors = await fetchRelatedMetaphors(slug, metaphorId);

  return (
    <MetaphorDetail
      corpus={corpus}
      metaphor={metaphor}
      expressions={expressionsData.items}
      totalExpressions={expressionsData.total}
      currentPage={currentPage}
      totalPages={Math.ceil(expressionsData.total / PAGE_SIZE)}
      relatedMetaphors={relatedMetaphors}
    />
  );
}
