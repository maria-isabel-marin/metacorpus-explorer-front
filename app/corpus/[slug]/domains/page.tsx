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
  
  const corpus = await getCorpusBySlug(slug);
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
    domains = [];
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

