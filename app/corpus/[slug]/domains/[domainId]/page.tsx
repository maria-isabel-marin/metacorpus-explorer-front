import { notFound } from "next/navigation";

import { DomainDetail } from "@/components/domain-detail";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchDomains, fetchMetaphors, fetchDomainRelations } from "@/lib/api";
import { mapApiMetaphorToConceptualMetaphor } from "@/lib/metaphors";

type DomainDetailPageProps = {
  params: Promise<{ slug: string; domainId: string }>;
};

export default async function DomainDetailPage({ params }: DomainDetailPageProps) {
  const { slug, domainId } = await params;
  
  const corpus = await getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  // Fetch domain info
  let domainName = decodeURIComponent(domainId).toUpperCase();
  let domainType: "fuente" | "meta" = "fuente";
  let macroCategory: string | null = null;
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
      macroCategory = domain.macrodominio ?? null;
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

  // Fetch real semantic relations from API
  type RelatedDomain = {
    type: "hiponimo" | "hiperonimo" | "meronimo" | "holonimo";
    label: string;
    domains: string[];
  };

  const relatedDomains: RelatedDomain[] = [];
  try {
    const relationsData = await fetchDomainRelations(slug);
    const relTypeMap: Record<string, RelatedDomain["type"]> = {
      hiperonimia: "hiperonimo",
      hiponimia: "hiponimo",
      meronimia: "meronimo",
      holonimia: "holonimo",
    };
    const relLabelMap: Record<string, string> = {
      hiperonimia: "HIPERÓNIMOS (ES-UN-TIPO-DE)",
      hiponimia: "HIPÓNIMOS (TIENE-COMO-SUBTIPO)",
      meronimia: "MERÓNIMOS (TIENE-COMO-PARTE)",
      holonimia: "HOLÓNIMOS (ES-PARTE-DE)",
    };
    const grouped = new Map<string, string[]>();
    for (const rel of relationsData.items) {
      if (rel.dominio_nombre.toUpperCase() === domainName.toUpperCase()) {
        const key = rel.tipo_relacion.toLowerCase();
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(rel.relacionado_con_nombre);
      }
    }
    for (const [tipo, domains] of grouped.entries()) {
      const mappedType = relTypeMap[tipo];
      if (mappedType) {
        relatedDomains.push({
          type: mappedType,
          label: relLabelMap[tipo] ?? tipo.toUpperCase(),
          domains,
        });
      }
    }
  } catch {
    // Fallback to empty relations
  }

  return (
    <DomainDetail
      corpus={corpus}
      domain={{
        id: domainId,
        name: domainName,
        type: domainType,
        macroCategory: macroCategory ?? "",
        expressionCount,
        metaphorCount,
      }}
      relatedDomains={relatedDomains}
      sourceMetaphors={sourceMetaphors.slice(0, 10)}
      targetMetaphors={targetMetaphors.slice(0, 10)}
    />
  );
}
