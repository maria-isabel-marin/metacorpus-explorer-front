const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type ApiMetaphor = {
  id: string;
  nombre: string;
  tipologia: string | null;
  dominio_fuente: { id: string; nombre: string } | null;
  dominio_meta: { id: string; nombre: string } | null;
  total_expresiones: number;
};

export type ApiMetaphorsResponse = {
  total: number;
  limit: number;
  offset: number;
  items: ApiMetaphor[];
};

type RawApiResponse = {
  data: ApiMetaphorsResponse;
};

export type ApiFilterOptions = {
  typologies: string[];
  sourceDomains: string[];
  targetDomains: string[];
  grammaticalCategories: { nombre: string; abreviatura: string }[];
};

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${path}`);
  }
  return res.json() as Promise<T>;
}

async function fetchMetaphorsPage(
  slug: string,
  params: {
    limit: number;
    offset: number;
    dominio_fuente?: string;
    dominio_meta?: string;
    tipologia?: string;
  }
): Promise<ApiMetaphorsResponse> {
  const qs = new URLSearchParams();
  qs.set("limit", String(params.limit));
  qs.set("offset", String(params.offset));
  if (params.dominio_fuente) qs.set("dominio_fuente", params.dominio_fuente);
  if (params.dominio_meta) qs.set("dominio_meta", params.dominio_meta);
  if (params.tipologia) qs.set("tipologia", params.tipologia);

  const raw = await apiFetch<RawApiResponse>(
    `/api/v1/corpora/${slug}/metaphors?${qs.toString()}`
  );
  return raw.data;
}

export async function fetchMetaphors(
  slug: string,
  params: {
    limit?: number;
    dominio_fuente?: string;
    dominio_meta?: string;
    tipologia?: string;
  } = {}
): Promise<ApiMetaphorsResponse> {
  const PAGE = 100;
  const maxItems = params.limit ?? 500;

  const first = await fetchMetaphorsPage(slug, { ...params, limit: Math.min(PAGE, maxItems), offset: 0 });
  const allItems = [...first.items];

  const pages = Math.ceil(Math.min(first.total, maxItems) / PAGE);
  for (let p = 1; p < pages; p++) {
    const page = await fetchMetaphorsPage(slug, { ...params, limit: PAGE, offset: p * PAGE });
    allItems.push(...page.items);
  }

  return { total: first.total, limit: maxItems, offset: 0, items: allItems };
}

export type ApiCorpusStats = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  idioma: string;
  version: string;
  licencia: string | null;
  fecha_publicacion: string | null;
  estadisticas_agregadas: {
    numero_registros: number;
    fuentes_textuales: number;
    dominios: number;
    dominios_por_tipo: Record<string, number>;
    metaforas_conceptuales: number;
    relaciones_semanticas: number;
    categorias_gramaticales: number;
  };
};

export type DomainType = "fuente" | "meta";

export type ApiDomain = {
  id: string;
  nombre: string;
  tipo: DomainType;
  macrodominio: string | null;
  frecuencia: number;
  descripcion: string | null;
  dominio_padre_id: string | null;
  nivel_jerarquico: number;
};

export type ApiDomainRelation = {
  dominio_id: string;
  dominio_nombre: string;
  relacionado_con_id: string;
  relacionado_con_nombre: string;
  tipo_relacion: "hiperonimia" | "hiponimia" | "meronimia" | "cohiperonimia" | "sinonimia";
};

export type ApiDomainsResponse = {
  total: number;
  items: ApiDomain[];
};

export type ApiDomainRelationsResponse = {
  total: number;
  items: ApiDomainRelation[];
};

export async function fetchCorpusStats(
  slug: string
): Promise<ApiCorpusStats> {
  const raw = await apiFetch<{ data: ApiCorpusStats }>(
    `/api/v1/corpora/${slug}`
  );
  return raw.data;
}

export async function fetchDomains(
  slug: string,
  tipo?: DomainType
): Promise<ApiDomainsResponse> {
  const qs = tipo ? `?tipo=${tipo}` : "";
  const raw = await apiFetch<{ data: ApiDomainsResponse }>(
    `/api/v1/corpora/${slug}/domains${qs}`
  );
  return raw.data;
}

export async function fetchDomainRelations(
  slug: string
): Promise<ApiDomainRelationsResponse> {
  const raw = await apiFetch<{ data: ApiDomainRelationsResponse }>(
    `/api/v1/corpora/${slug}/domain-relations`
  );
  return raw.data;
}

// Build domain hierarchy tree from flat domain list
export function buildDomainTree(domains: ApiDomain[]): TreeNode[] {
  const domainMap = new Map<string, TreeNode>();
  
  // First pass: create nodes
  for (const d of domains) {
    domainMap.set(d.id, {
      id: d.id,
      nombre: d.nombre,
      tipo: d.tipo,
      macrodominio: d.macrodominio,
      frecuencia: d.frecuencia,
      nivel: d.nivel_jerarquico,
      children: [],
      expanded: d.nivel_jerarquico === 0 || d.nivel_jerarquico === 1,
    });
  }
  
  // Second pass: build tree
  const roots: TreeNode[] = [];
  for (const d of domains) {
    const node = domainMap.get(d.id)!;
    if (d.dominio_padre_id && domainMap.has(d.dominio_padre_id)) {
      const parent = domainMap.get(d.dominio_padre_id)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  
  return roots;
}

export type TreeNode = {
  id: string;
  nombre: string;
  tipo: DomainType;
  macrodominio: string | null;
  frecuencia: number;
  nivel: number;
  children: TreeNode[];
  expanded: boolean;
};

export async function fetchFilterOptions(
  slug: string
): Promise<ApiFilterOptions> {
  const data = await fetchMetaphors(slug, { limit: 500 });

  const typologySet = new Set<string>();
  const sourceDomainSet = new Set<string>();
  const targetDomainSet = new Set<string>();

  for (const m of data.items) {
    if (m.tipologia) typologySet.add(m.tipologia);
    if (m.dominio_fuente) sourceDomainSet.add(m.dominio_fuente.nombre);
    if (m.dominio_meta) targetDomainSet.add(m.dominio_meta.nombre);
  }

  return {
    typologies: [...typologySet].sort(),
    sourceDomains: [...sourceDomainSet].sort(),
    targetDomains: [...targetDomainSet].sort(),
    grammaticalCategories: [],
  };
}
