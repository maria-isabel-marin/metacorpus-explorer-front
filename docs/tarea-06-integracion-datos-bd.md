# Tarea 06: Integración de Datos desde la Base de Datos

## Objetivo

Eliminar todos los datos hardcodeados y mock del front-end y reemplazarlos con datos dinámicos obtenidos desde la API del back-end, garantizando que toda la información mostrada provenga exclusivamente de la base de datos.

---

## Alcance de la tarea

### 1. Catálogo de corpus (`lib/corpora.ts`)

**Antes:** array `corpusCatalog` con 2 entradas completamente hardcodeadas (nombre, descripción, idioma, versión, fechas, contadores).

**Después:** funciones async que consultan la API:

- `getAllCorpora()` → llama `GET /api/v1/corpora`, mapea la respuesta a `CorpusSummary[]`.
- `getCorpusBySlug(slug)` → llama `GET /api/v1/corpora/:slug`, construye `CorpusSummary` con todos los contadores reales de la BD.
- `getCorpusCount()` → llama `GET /api/v1/corpora` y devuelve el largo del array.

Las funciones `getAllCorpora()` y `getCorpusOrThrow()` síncronas fueron eliminadas.

### 2. Página principal (`app/page.tsx`)

**Antes:** cargaba corpus desde el catálogo local; luego enriquecía cada entrada con una llamada extra a `fetchCorpusStats`.

**Después:** una sola llamada a `getAllCorpora()` que ya devuelve los datos completos desde la API. Se eliminaron las llamadas redundantes a `fetchCorpusStats`.

### 3. Layout de corpus (`app/corpus/[slug]/layout.tsx`)

**Antes:** función síncrona, `getCorpusBySlug` sin `await`.

**Después:** función `async`, `params` tipado como `Promise<{ slug: string }>`, `getCorpusBySlug` con `await`.

### 4. Todas las páginas de corpus

Las siguientes páginas usaban `getCorpusBySlug` de forma síncrona. Todas fueron actualizadas para usar `await`:

| Página | Ruta |
|--------|------|
| `dashboard/page.tsx` | `/corpus/[slug]/dashboard` |
| `about/page.tsx` | `/corpus/[slug]/about` |
| `metaphors/page.tsx` | `/corpus/[slug]/metaphors` |
| `statistics/page.tsx` | `/corpus/[slug]/statistics` |
| `map/page.tsx` | `/corpus/[slug]/map` |
| `concordance/page.tsx` | `/corpus/[slug]/concordance` |
| `concordance/[expressionId]/page.tsx` | `/corpus/[slug]/concordance/[expressionId]` |
| `domains/page.tsx` | `/corpus/[slug]/domains` |
| `domains/[domainId]/page.tsx` | `/corpus/[slug]/domains/[domainId]` |

### 5. Explorador de dominios (`app/corpus/[slug]/domains/page.tsx`)

**Antes:** si la llamada a `fetchDomains` fallaba, generaba datos mock con la función `generateMockDomains` (dominios con nombres hardcodeados como CONSTRUCCIÓN, EDIFICIO, MEMORIA, PAZ, etc.).

**Después:** se eliminó `generateMockDomains` por completo. En caso de error, se devuelven arrays vacíos.

### 6. Detalle de dominio (`app/corpus/[slug]/domains/[domainId]/page.tsx`)

**Antes:** las relaciones semánticas (hiperónimos, hipónimos, merónimos) se construían con `buildMockRelations`, función con una jerarquía hardcodeada de 5 dominios.

**Después:** se eliminó `buildMockRelations`. Las relaciones reales se obtienen desde `fetchDomainRelations(slug)` y se agrupan por tipo. Los tipos del enum del back (`hiperonimia`, `hiponimia`, `meronimia`, `holonimia`) se mapean a los tipos del componente `DomainDetail`.

---

## Archivos creados/modificados

### Modificados

| Archivo | Cambio |
|---------|--------|
| `lib/corpora.ts` | Eliminado catálogo hardcodeado; funciones reemplazadas por versiones async que consultan la API |
| `lib/api.ts` | Añadidos `ApiCorpusListItem`, `fetchAllCorpora()`; ampliado `ApiCorpusStats` con `doi`, `autores`, `fair`, `como_citar` |
| `app/page.tsx` | Simplificado: usa `getAllCorpora()` directo, sin enriquecimiento adicional |
| `app/corpus/[slug]/layout.tsx` | Convertido a async; `params` como `Promise` |
| `app/corpus/[slug]/dashboard/page.tsx` | `await getCorpusBySlug`; eliminado bloque redundante de `fetchCorpusStats` |
| `app/corpus/[slug]/about/page.tsx` | `await getCorpusBySlug`; mapeo de `CorpusSummary` al formato que espera `AboutDashboard` |
| `app/corpus/[slug]/metaphors/page.tsx` | `await getCorpusBySlug` |
| `app/corpus/[slug]/statistics/page.tsx` | `await getCorpusBySlug`; mapeo `corpus.name → corpus.nombre` para `StatisticsDashboard` |
| `app/corpus/[slug]/map/page.tsx` | `await getCorpusBySlug` |
| `app/corpus/[slug]/concordance/page.tsx` | `await getCorpusBySlug` |
| `app/corpus/[slug]/concordance/[expressionId]/page.tsx` | `await getCorpusBySlug` |
| `app/corpus/[slug]/domains/page.tsx` | `await getCorpusBySlug`; eliminada `generateMockDomains` |
| `app/corpus/[slug]/domains/[domainId]/page.tsx` | `await getCorpusBySlug`; eliminada `buildMockRelations`; relaciones desde API |

---

## Tipos nuevos en `lib/api.ts`

```typescript
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

export async function fetchAllCorpora(): Promise<ApiCorpusListItem[]>
```

`ApiCorpusStats` fue ampliado con campos opcionales que el endpoint `/api/v1/corpora/:slug` ya devolvía pero no estaban tipados:

```typescript
doi?: string | null;
autores?: unknown;
metadatos_extra?: unknown;
como_citar?: string;
fair?: { findable, accessible, interoperable, reusable };
```

---

## Notas de implementación

### Incompatibilidad de campo `nombre` vs `name`

Los componentes `AboutDashboard` y `StatisticsDashboard` esperan `corpus.nombre`, mientras que `CorpusSummary` usa `corpus.name`. En las páginas correspondientes se hace el mapeo explícito:

```typescript
// statistics/page.tsx
corpus={{ slug: corpus.slug, nombre: corpus.name }}

// about/page.tsx
const corpusForComponent = {
  slug: corpus.slug,
  nombre: corpus.name,
  descripcion: corpus.description || null,
};
```

### Comportamiento con base de datos vacía

Si la base de datos no tiene corpus activos, `getAllCorpora()` devuelve `[]` y la página principal muestra el selector vacío. `getCorpusBySlug()` devuelve `null` en caso de error o corpus inexistente, lo que activa `notFound()` en cada página.

---

## Estado

**Completado:** ✅

- Eliminado catálogo hardcodeado de corpus
- Eliminada función `generateMockDomains`
- Eliminada función `buildMockRelations`
- Todas las páginas obtienen datos de la API
- Relaciones semánticas de dominio provienen de la base de datos

**Pendiente mejora futura:**

- El campo `macrodominio` en dominios siempre es `null` (no existe en el schema actual); se podría agregar al modelo `Domain` en una tarea futura
- El campo `shortCode` en `CorpusSummary` se genera por índice de posición en el listado; podría ser un campo explícito en la BD

---

## Referencias

- API back-end: `GET /api/v1/corpora`, `GET /api/v1/corpora/:slug`
- Nuevos endpoints documentados en `metacorpus-explorer-back/docs/implementacion-api-dominios.md`
