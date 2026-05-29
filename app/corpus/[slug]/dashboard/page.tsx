import { notFound } from "next/navigation";

import { DashboardOverview } from "@/components/dashboard-overview";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchMetaphors, fetchCorpusStats } from "@/lib/api";
import { mapApiMetaphorToConceptualMetaphor } from "@/lib/metaphors";
import type { ConceptualMetaphor } from "@/lib/metaphors";

type DashboardPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { slug } = await params;
  let corpus = getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  try {
    const stats = await fetchCorpusStats(slug);
    const s = stats.estadisticas_agregadas;
    corpus = {
      ...corpus,
      expressions: s.numero_registros,
      metaphors: s.metaforas_conceptuales,
      sourceDomains: s.dominios_por_tipo?.FUENTE ?? 0,
      targetDomains: s.dominios_por_tipo?.META ?? 0,
      textualSources: s.fuentes_textuales,
      typologies: s.categorias_gramaticales,
    };
  } catch {
    // keep static fallback
  }

  let allMetaphors: ConceptualMetaphor[] = [];
  try {
    const data = await fetchMetaphors(slug, { limit: 100 });
    allMetaphors = data.items
      .map(mapApiMetaphorToConceptualMetaphor)
      .sort((a, b) => b.expressions - a.expressions);
  } catch {
    allMetaphors = [];
  }

  const topMetaphors = allMetaphors.slice(0, 6);

  return <DashboardOverview corpus={corpus} topMetaphors={topMetaphors} allMetaphors={allMetaphors} />;
}
