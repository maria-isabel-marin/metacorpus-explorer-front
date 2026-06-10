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
  id?: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  idioma: string;
  version: string;
  licencia: string | null;
  fecha_publicacion: string | null;
  doi?: string | null;
  autores?: unknown;
  metadatos_extra?: unknown;
  como_citar?: string;
  fair?: {
    findable: { slug: string; doi: string | null; identificadores: string[] };
    accessible: { activo: boolean; licencia: string | null };
    interoperable: { idioma: string; formato_api: string; version_api: string };
    reusable: { licencia: string | null; version: string; fecha_publicacion: string | null; autores: unknown };
  };
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

export type ApiCorpusListItem = {
  nombre: string;
  slug: string;
  descripcion: string | null;
  idioma: string;
  version: string;
  licencia: string | null;
  fecha_publicacion: string | null;
  numero_registros: number;
};

export async function fetchAllCorpora(): Promise<ApiCorpusListItem[]> {
  const raw = await apiFetch<{ data: ApiCorpusListItem[] }>("/api/v1/corpora");
  return raw.data;
}

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

// ========== EXPRESSIONS (CONCORDANCE) ==========

export type ApiExpression = {
  id: string;
  id_registro: string;
  orden: number;
  expresion_metaforica: string;
  contexto: string | null;
  foco: string | null;
  foco_lematizado: string | null;
  significado_contextual: string | null;
  significado_basico: string | null;
  tipologia: string | null;
  // Backend returns dominios nested in metafora_conceptual
  dominio_fuente: { id: string; nombre: string } | null;
  dominio_meta: { id: string; nombre: string } | null;
  metafora_conceptual: {
    id: string;
    nombre: string;
    tipologia?: string;
    dominio_fuente?: { id: string; nombre: string; tipo?: string };
    dominio_meta?: { id: string; nombre: string; tipo?: string };
  } | null;
  corresp_ontologicas: string | null;
  corresp_epistemicas: string | null;
  // Legacy aliases
  correspondencias_ontologicas?: string | null;
  correspondencias_epistemicas?: string | null;
  observaciones: string | null;
  fuente_textual: {
    id: string;
    titulo_1: string;
    titulo_2: string | null;
    titulo_3: string | null;
    autor: string | null;
    anio: number | null;
    referencia_bib: string | null;
  };
  categoria_gramatical: { id: string; nombre: string; abreviatura: string } | null;
  cat_gramatical?: { id: string; nombre: string; abreviatura: string } | null;
  pagina: number | null;
};

export type ApiExpressionsResponse = {
  total: number;
  limit: number;
  offset: number;
  items: ApiExpression[];
};

export async function fetchExpressions(
  slug: string,
  params: {
    limit?: number;
    offset?: number;
    search?: string;
    dominio_fuente?: string;
    dominio_meta?: string;
    tipologia?: string;
    orden?: "asc" | "desc";
  } = {}
): Promise<ApiExpressionsResponse> {
  const qs = new URLSearchParams();
  qs.set("limit", String(params.limit ?? 50));
  qs.set("offset", String(params.offset ?? 0));
  if (params.search) qs.set("search", params.search);
  if (params.dominio_fuente) qs.set("dominio_fuente", params.dominio_fuente);
  if (params.dominio_meta) qs.set("dominio_meta", params.dominio_meta);
  if (params.tipologia) qs.set("tipologia", params.tipologia);
  if (params.orden) qs.set("orden", params.orden);

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/corpora/${slug}/expressions?${qs.toString()}`,
      { cache: "no-store" }
    );
    
    if (!res.ok) {
      // Return empty response if API endpoint doesn't exist yet
      if (res.status === 404) {
        return { total: 0, limit: params.limit ?? 50, offset: params.offset ?? 0, items: [] };
      }
      throw new Error(`API error ${res.status}`);
    }
    
    const raw = await res.json();
    // Handle both { data: {...} } and direct response formats
    const data = raw.data ?? raw;
    return {
      total: data.total ?? 0,
      limit: data.limit ?? params.limit ?? 50,
      offset: data.offset ?? params.offset ?? 0,
      items: data.items ?? [],
    };
  } catch (error) {
    console.error("fetchExpressions error:", error);
    // Return empty response on error to prevent UI crash
    return { total: 0, limit: params.limit ?? 50, offset: params.offset ?? 0, items: [] };
  }
}

export async function fetchExpressionById(
  slug: string,
  id: string
): Promise<ApiExpression | null> {
  try {
    const res = await fetch(
      `${API_BASE}/api/v1/corpora/${slug}/expressions/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const raw = await res.json();
    return raw.data ?? raw ?? null;
  } catch {
    return null;
  }
}

// Fetch expressions near a specific order (±5)
export async function fetchNearbyExpressions(
  slug: string,
  expressionId: string,
  sourceId: string,
  orden: number,
  range: number = 5
): Promise<ApiExpression[]> {
  const params = new URLSearchParams();
  params.set("fuente_textual_id", sourceId);
  params.set("orden_min", String(Math.max(0, orden - range)));
  params.set("orden_max", String(orden + range));
  params.set("limit", String(range * 2 + 1));

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/corpora/${slug}/expressions?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const raw = await res.json();
    const data = raw.data ?? raw;
    const items = data.items ?? [];
    // Exclude the current expression
    return items.filter((e: ApiExpression) => e.id !== expressionId);
  } catch {
    return [];
  }
}
