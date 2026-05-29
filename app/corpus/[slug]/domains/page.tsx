import { notFound } from "next/navigation";

import { DomainsExplorer } from "@/components/domains-explorer";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchDomains, fetchDomainRelations, buildDomainTree } from "@/lib/api";
import type { ApiDomain, ApiDomainRelation } from "@/lib/api";

type DomainsPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tipo?: string }>;
};

export default async function DomainsPage({ params, searchParams }: DomainsPageProps) {
  const { slug } = await params;
  const { tipo } = await searchParams;
  
  const corpus = getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  let domains: ApiDomain[] = [];
  let relations: ApiDomainRelation[] = [];
  
  try {
    const tipoFilter = tipo === "fuente" || tipo === "meta" ? tipo : undefined;
    const domainsData = await fetchDomains(slug, tipoFilter);
    domains = domainsData.items;
    
    const relationsData = await fetchDomainRelations(slug);
    relations = relationsData.items;
  } catch {
    // Fallback: generate mock domains from existing metaphor data
    domains = generateMockDomains(corpus);
    relations = [];
  }

  const treeData = buildDomainTree(domains);
  
  const counts = {
    total: domains.length,
    fuente: domains.filter(d => d.tipo === "fuente").length,
    meta: domains.filter(d => d.tipo === "meta").length,
  };

  return (
    <DomainsExplorer
      corpus={corpus}
      domains={domains}
      treeData={treeData}
      relations={relations}
      counts={counts}
      activeTab={tipo || "todos"}
    />
  );
}

// Fallback mock data generator when API is not available
function generateMockDomains(corpus: { sourceDomains: number; targetDomains: number }): ApiDomain[] {
  const sourceDomainNames = [
    "CONSTRUCCIÓN", "EDIFICIO", "CIMENTO", "PUENTE", "CAMINO", "VIAJE",
    "GUERRA", "HERIDA", "CUERPO", "ESPEJO", "LUZ", "OSCURIDAD",
    "AGUA", "RÍO", "TORMENTA", "PLANTA", "SEMILLA", "RAÍZ",
    "FAMILIA", "JUEGO", "MERCADO", "MÁQUINA"
  ];
  
  const targetDomainNames = [
    "MEMORIA", "VIOLENCIA", "PAZ", "CONFLICTO", "DOLOR", "VERDAD",
    "JUSTICIA", "TESTIMONIO", "NACIÓN", "ESPERANZA", "PERDÓN", "ACCIÓN",
    "ESTADO", "MONIO"
  ];
  
  const macroCategories: Record<string, string> = {
    "CONSTRUCCIÓN": "Cuerpo y mundo físico",
    "EDIFICIO": "Cuerpo y mundo físico",
    "CIMENTO": "Cuerpo y mundo físico",
    "PUENTE": "Cuerpo y mundo físico",
    "CAMINO": "Cuerpo y mundo físico",
    "VIAJE": "Cuerpo y mundo físico",
    "GUERRA": "Mundo social",
    "HERIDA": "Mundo social",
    "CUERPO": "Cuerpo y mundo físico",
    "ESPEJO": "Cuerpo y mundo físico",
    "LUZ": "Mundo natural",
    "OSCURIDAD": "Mundo natural",
    "AGUA": "Mundo natural",
    "RÍO": "Mundo natural",
    "TORMENTA": "Mundo natural",
    "PLANTA": "Mundo natural",
    "SEMILLA": "Mundo natural",
    "RAÍZ": "Mundo natural",
    "FAMILIA": "Mundo social",
    "JUEGO": "Mundo social",
    "MERCADO": "Mundo social",
    "MÁQUINA": "Cuerpo y mundo físico",
    "MEMORIA": "Mundo mental",
    "VIOLENCIA": "Mundo social",
    "PAZ": "Mundo mental",
    "CONFLICTO": "Mundo social",
    "DOLOR": "Mundo mental",
    "VERDAD": "Mundo mental",
    "JUSTICIA": "Mundo social",
    "TESTIMONIO": "Mundo mental",
    "NACIÓN": "Mundo social",
    "ESPERANZA": "Mundo mental",
    "PERDÓN": "Mundo mental",
    "ACCIÓN": "Mundo social",
    "ESTADO": "Mundo social",
    "MONIO": "Mundo social",
  };

  const domains: ApiDomain[] = [];
  
  // Source domains
  sourceDomainNames.forEach((name, i) => {
    domains.push({
      id: `source-${i}`,
      nombre: name,
      tipo: "fuente",
      macrodominio: macroCategories[name] || "Otro",
      frecuencia: Math.floor(Math.random() * 200) + 20,
      descripcion: null,
      dominio_padre_id: null,
      nivel_jerarquico: 0,
    });
  });
  
  // Target domains
  targetDomainNames.forEach((name, i) => {
    domains.push({
      id: `target-${i}`,
      nombre: name,
      tipo: "meta",
      macrodominio: macroCategories[name] || "Otro",
      frecuencia: Math.floor(Math.random() * 250) + 50,
      descripcion: null,
      dominio_padre_id: null,
      nivel_jerarquico: 0,
    });
  });
  
  return domains;
}
