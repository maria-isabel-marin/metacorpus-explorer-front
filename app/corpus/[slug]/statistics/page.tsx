import { notFound } from "next/navigation";

import { StatisticsDashboard } from "@/components/statistics-dashboard";
import { getCorpusBySlug } from "@/lib/corpora";
import {
  fetchCorpusStats,
  fetchDomains,
  fetchMetaphors,
  fetchDensityData,
  fetchProximityData,
  fetchDomainMatrix,
  fetchFilterOptions,
  type DensityData,
  type ProximityData,
  type DomainMatrixData,
} from "@/lib/api";

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
  let densityData: DensityData | null = null;
  let proximityData: ProximityData | null = null;
  let domainMatrix: DomainMatrixData | null = null;

  try {
    const [stats, domainsSource, domainsTarget, metaphors, density, proximity, matrix, filterOpts] = await Promise.all([
      fetchCorpusStats(slug),
      fetchDomains(slug, "fuente"),
      fetchDomains(slug, "meta"),
      fetchMetaphors(slug, { limit: 10000 }),
      fetchDensityData(slug, 100),
      fetchProximityData(slug, 50, 1000),
      fetchDomainMatrix(slug, 1, 30),
      fetchFilterOptions(slug),
    ]);

    corpusStats = stats;
    sourceDomains = domainsSource.items
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .map(d => ({ nombre: d.nombre, frecuencia: d.frecuencia }));
    targetDomains = domainsTarget.items
      .sort((a, b) => b.frecuencia - a.frecuencia)
      .map(d => ({ nombre: d.nombre, frecuencia: d.frecuencia }));
    allMetaphors = metaphors.items
      .sort((a, b) => b.total_expresiones - a.total_expresiones)
      .map(m => ({
        nombre: m.nombre,
        total_expresiones: m.total_expresiones,
        dominio_fuente: m.dominio_fuente,
        dominio_meta: m.dominio_meta,
      }));

    typologyDistribution = filterOpts.typologies.map((t) => ({
      nombre: t.name,
      total: t.count,
    }));

    densityData = density;
    proximityData = proximity;
    domainMatrix = matrix;
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
      densityData={densityData}
      proximityData={proximityData}
      domainMatrix={domainMatrix}
    />
  );
}
