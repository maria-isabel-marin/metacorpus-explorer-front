import { notFound } from "next/navigation";

import { DashboardOverview } from "@/components/dashboard-overview";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchMetaphors } from "@/lib/api";
import { mapApiMetaphorToConceptualMetaphor } from "@/lib/metaphors";
import type { ConceptualMetaphor } from "@/lib/metaphors";

type DashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;
  const corpus = getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  let topMetaphors: ConceptualMetaphor[] = [];
  try {
    const data = await fetchMetaphors(slug, { limit: 100 });
    topMetaphors = data.items
      .map(mapApiMetaphorToConceptualMetaphor)
      .sort((a, b) => b.expressions - a.expressions)
      .slice(0, 6);
  } catch {
    topMetaphors = [];
  }

  return <DashboardOverview corpus={corpus} topMetaphors={topMetaphors} />;
}
