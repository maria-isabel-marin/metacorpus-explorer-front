import { notFound } from "next/navigation";

import { StatisticsDashboard } from "@/components/statistics-dashboard";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchCorpusStats, fetchDomains, fetchMetaphors } from "@/lib/api";

type StatisticsPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function StatisticsPage({ params }: StatisticsPageProps) {
  const { slug } = await params;
  const corpus = await getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  // Fetch all data needed for statistics
  let corpusStats = null;
  let sourceDomains: { nombre: string; frecuencia: number }[] = [];
  let targetDomains: { nombre: string; frecuencia: number }[] = [];
  let allMetaphors: { nombre: string; total_expresiones: number; dominio_fuente?: { nombre: string } | null; dominio_meta?: { nombre: string } | null }[] = [];
  let typologyDistribution: { nombre: string; total: number }[] = [];

  try {
    const [stats, domainsSource, domainsTarget, metaphors] = await Promise.all([
      fetchCorpusStats(slug),
      fetchDomains(slug, "fuente"),
      fetchDomains(slug, "meta"),
      fetchMetaphors(slug, { limit: 100 }),
    ]);

    corpusStats = stats;
    sourceDomains = domainsSource.items
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 10)
      .map(d => ({ nombre: d.nombre, frecuencia: d.frecuencia }));
    targetDomains = domainsTarget.items
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .slice(0, 10)
      .map(d => ({ nombre: d.nombre, frecuencia: d.frecuencia }));
    allMetaphors = metaphors.items
      .sort((a, b) => b.total_expresiones - a.total_expresiones)
      .slice(0, 10)
      .map(m => ({
        nombre: m.nombre,
        total_expresiones: m.total_expresiones,
        dominio_fuente: m.dominio_fuente,
        dominio_meta: m.dominio_meta,
      }));

    const typoMap = new Map<string, number>();
    for (const m of metaphors.items) {
      const key = m.tipologia ?? "Sin tipología";
      typoMap.set(key, (typoMap.get(key) ?? 0) + m.total_expresiones);
    }
    typologyDistribution = [...typoMap.entries()]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);
  } catch (error) {
    console.error("Error fetching statistics:", error);
  }

  return (
    <StatisticsDashboard
      corpus={{ slug: corpus.slug, nombre: corpus.name }}
      stats={corpusStats}
      sourceDomains={sourceDomains}
      targetDomains={targetDomains}
      topMetaphors={allMetaphors}
      typologyDistribution={typologyDistribution}
    />
  );
}
