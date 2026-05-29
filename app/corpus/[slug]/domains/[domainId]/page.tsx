import { notFound } from "next/navigation";

import { DomainDetail } from "@/components/domain-detail";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchDomains, fetchMetaphors } from "@/lib/api";
import { mapApiMetaphorToConceptualMetaphor } from "@/lib/metaphors";

type DomainDetailPageProps = {
  params: Promise<{ slug: string; domainId: string }>;
};

export default async function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { slug, domainId } = await params;
  
  const corpus = getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  // Fetch domain info
  let domainName = decodeURIComponent(domainId).toUpperCase();
  let domainType: "fuente" | "meta" = "fuente";
  let macroCategory = "Cuerpo y mundo físico";
  let expressionCount = 0;
  let metaphorCount = 0;

  try {
    const domainsData = await fetchDomains(slug);
    const domain = domainsData.items.find(
      d => d.nombre.toUpperCase() === domainName || d.id === domainId
    );
    if (domain) {
      domainName = domain.nombre;
      domainType = domain.tipo;
      macroCategory = domain.macrodominio || macroCategory;
      expressionCount = domain.frecuencia;
    }
  } catch {
    // Use decoded ID as fallback
  }

  // Fetch metaphors where this domain is source or target
  let sourceMetaphors: ReturnType<typeof mapApiMetaphorToConceptualMetaphor>[] = [];
  let targetMetaphors: ReturnType<typeof mapApiMetaphorToConceptualMetaphor>[] = [];

  try {
    const allData = await fetchMetaphors(slug, { limit: 500 });
    const allMetaphors = allData.items.map(mapApiMetaphorToConceptualMetaphor);
    
    sourceMetaphors = allMetaphors.filter(
      m => m.sourceDomain?.toUpperCase() === domainName.toUpperCase()
    );
    targetMetaphors = allMetaphors.filter(
      m => m.targetDomain?.toUpperCase() === domainName.toUpperCase()
    );
    
    metaphorCount = sourceMetaphors.length + targetMetaphors.length;
    if (expressionCount === 0) {
      expressionCount = [...sourceMetaphors, ...targetMetaphors].reduce(
        (sum, m) => sum + m.expressions, 0
      );
    }
  } catch {
    // Fallback to empty
  }

  // Build semantic relations from other domains
  // (This would come from API in production)
  const relatedDomains = buildMockRelations(domainName, domainType);

  return (
    <DomainDetail
      corpus={corpus}
      domain={{
        id: domainId,
        name: domainName,
        type: domainType,
        macroCategory,
        expressionCount,
        metaphorCount,
      }}
      relatedDomains={relatedDomains}
      sourceMetaphors={sourceMetaphors.slice(0, 10)}
      targetMetaphors={targetMetaphors.slice(0, 10)}
    />
  );
}

// Mock relations builder - would be replaced with API data
function buildMockRelations(domainName: string, type: "fuente" | "meta") {
  const relations: {
    type: "hiponimo" | "hiperonimo" | "meronimo" | "holonimo";
    label: string;
    domains: string[];
  }[] = [];

  // Define some hierarchical relationships
  const hierarchy: Record<string, { parent?: string; children?: string[]; parts?: string[] }> = {
    "CONSTRUCCIÓN": { children: ["EDIFICIO", "CIMENTO", "PUENTE"] },
    "EDIFICIO": { parent: "CONSTRUCCIÓN", parts: ["CIMENTO"], children: [] },
    "CIMENTO": { parent: "EDIFICIO" },
    "PLANTA": { children: ["SEMILLA", "RAÍZ"] },
    "AGUA": { children: ["RÍO"] },
  };

  const info = hierarchy[domainName];
  
  if (info?.parent) {
    relations.push({
      type: "hiperonimo",
      label: "HIPERÓNIMOS (ES-UN-TIPO-DE)",
      domains: [info.parent],
    });
  }
  
  if (info?.children && info.children.length > 0) {
    relations.push({
      type: "hiponimo",
      label: "HIPÓNIMOS (TIENE-COMO-SUBTIPO)",
      domains: info.children,
    });
  }
  
  if (info?.parts && info.parts.length > 0) {
    relations.push({
      type: "meronimo",
      label: "MERÓNIMOS (TIENE-COMO-PARTE)",
      domains: info.parts,
    });
  }

  return relations;
}
