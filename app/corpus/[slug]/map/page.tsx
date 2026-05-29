import { notFound } from "next/navigation";

import { MetaphorMap } from "@/components/metaphor-map";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchMetaphors } from "@/lib/api";
import { mapApiMetaphorToConceptualMetaphor } from "@/lib/metaphors";
import type { ConceptualMetaphor } from "@/lib/metaphors";

type MapPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string }>;
};

export default async function MapPage({ params, searchParams }: MapPageProps) {
  const { slug } = await params;
  const { tipo } = await searchParams;
  
  const corpus = getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  let metaphors: ConceptualMetaphor[] = [];
  
  try {
    const data = await fetchMetaphors(slug, { limit: 200 });
    metaphors = data.items
      .map(mapApiMetaphorToConceptualMetaphor)
      .sort((a: ConceptualMetaphor, b: ConceptualMetaphor) => b.expressions - a.expressions);
  } catch {
    // Fallback: empty data
    metaphors = [];
  }

  // Filter by typology if specified
  const activeTypology = tipo || "todas";
  const filteredMetaphors = activeTypology === "todas" 
    ? metaphors 
    : metaphors.filter(m => {
        if (tipo === "estr") return m.typology === "ESTRUCTURAL";
        if (tipo === "onto") return m.typology === "ONTOLOGICA";
        if (tipo === "orie") return m.typology === "ORIENTACIONAL";
        return true;
      });

  // Calculate statistics
  const uniqueSourceDomains = new Set(filteredMetaphors.map(m => m.sourceDomain));
  const uniqueTargetDomains = new Set(filteredMetaphors.map(m => m.targetDomain));
  
  const stats = {
    domains: uniqueSourceDomains.size + uniqueTargetDomains.size,
    metaphors: filteredMetaphors.length,
    edges: filteredMetaphors.filter(m => m.sourceDomain !== "—" && m.targetDomain !== "—").length,
  };

  return (
    <MetaphorMap
      corpus={corpus}
      metaphors={filteredMetaphors}
      stats={stats}
      activeTypology={activeTypology}
    />
  );
}
