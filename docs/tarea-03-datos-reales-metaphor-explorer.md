# Tarea 03 - Montar datos reales a Metaphor Explorer

## Resumen

Esta tarea conecta el frontend de MetaCorpus Explorer con la API REST del backend, reemplazando todos los datos mock por datos reales ingestados desde archivos Excel. Incluye la ingesta de 2 corpus reales y la adaptación del script de ingesta para reconocer los nuevos formatos de columnas.

## Objetivo funcional

- Ingestar datos reales de 2 corpus desde archivos `.xlsx` a la base de datos PostgreSQL del backend
- Conectar el frontend (Next.js) a la API REST del backend para mostrar datos reales
- Mostrar estadísticas reales (expresiones, metáforas, dominios, fuentes) en la landing page y dashboard
- Eliminar dependencia de mock data en el explorador de metáforas

## Corpus ingestados

### Corpus 1: `tdg-betancur-villegas-2025`

| Campo | Valor |
|-------|-------|
| **Nombre** | Tomo Mi cuerpo es la verdad, sección mujeres - Informe Final de la Comisión de la Verdad de Colombia |
| **Slug** | `tdg-betancur-villegas-2025` |
| **Idioma** | ES |
| **Versión** | 1.0.0 |
| **Licencia** | CC-BY-4.0 |
| **Archivos** | Registros Corpus 1 - DOC1.xlsx |

### Corpus 2: `phdthesis-marinmorales-2026`

| Campo | Valor |
|-------|-------|
| **Nombre** | Informe Final de la Comisión de la Verdad de Colombia |
| **Slug** | `phdthesis-marinmorales-2026` |
| **Idioma** | ES |
| **Versión** | 1.0.0 |
| **Licencia** | CC-BY-4.0 |
| **Archivos** | Registros Corpus 2 - DOC1.xlsx, Registros Corpus 2 - DOC2.xlsx |

## Cambios realizados

### Backend (`metacorpus-explorer-back`)

#### `scripts/ingest.ts` — Aliases de columnas actualizados

Se agregaron aliases para mapear los headers de los nuevos archivos Excel al esquema de la base de datos:

| Header en Excel | Alias agregado | Campo destino |
|-----------------|---------------|---------------|
| `custom_id` | id | id_registro |
| `order` | orden | orden |
| `document` | titulo1 | titulo_1 |
| `heading_2` | titulo2 | titulo_2 |
| `heading_3` | titulo3 | titulo_3 |
| `page` | pagina | pagina |
| `metaphorical_expression` | expresionMetaforica | expresion_metaforica |
| `context` | contexto | contexto |
| `focus` | foco | foco |
| `focus_lemma` | focoLematizado | foco_lematizado |
| `focus_pos` | categoriaGramatical | cat_gramatical |
| `contextual_meaning` | significadoContextual | significado_contextual |
| `basic_meaning` | significadoBasico | significado_basico |
| `conceptual_metaphor` | metaforaConceptual | metafora_conceptual |
| `source_domain` | dominioFuente | dominio_fuente |
| `target_domain` | dominioMeta | dominio_meta |
| `ontological_correspondences` | correspOntologicas | corresp_ontologicas |
| `epistemic_correspondences` | correspEpistemicas | corresp_epistemicas |
| `novelty_type` | tipologia | tipologia |
| `comments` | observaciones | observaciones |

**Campos ignorados** (no tienen equivalente en el esquema):
- `heading_4`, `heading_5`, `heading_6`
- `function_type`

### Frontend (`metacorpus-explorer-front`)

#### Nuevo archivo: `lib/api.ts`

Capa de acceso a la API del backend con las siguientes funciones:

- `fetchMetaphors(slug, params)` — obtiene metáforas conceptuales con paginación automática (max 100 por página en la API)
- `fetchFilterOptions(slug)` — genera opciones de filtro a partir de las metáforas reales
- `fetchCorpusStats(slug)` — obtiene estadísticas agregadas del corpus

#### Modificado: `lib/metaphors.ts`

- Eliminados todos los datos mock (arrays hardcodeados)
- Eliminadas funciones `getMetaphorsByCorpusSlug` y `getFilterOptionsByCorpusSlug`
- Nuevas funciones: `mapApiMetaphorToConceptualMetaphor()` y `buildFilterOptions()`
- Los tipos `ConceptualMetaphor` y `FilterOptions` se mantienen para compatibilidad

#### Modificado: `lib/corpora.ts`

- Actualizados slugs reales: `tdg-betancur-villegas-2025` y `phdthesis-marinmorales-2026`
- Nombres y descripciones reales
- Conteos en 0 como fallback (se enriquecen desde la API en tiempo de renderizado)

#### Modificado: `app/page.tsx`

- Convertido a `async` Server Component
- Enriquece cada corpus con estadísticas reales llamando a `fetchCorpusStats`
- Muestra conteos reales de expresiones, metáforas, dominios, etc.

#### Modificado: `app/corpus/[slug]/metaphors/page.tsx`

- Convertido a `async` Server Component
- Llama a `fetchMetaphors` y `fetchFilterOptions` desde la API
- Mapea respuesta con `mapApiMetaphorToConceptualMetaphor`
- Fallback a arrays vacíos si la API no responde

#### Modificado: `app/corpus/[slug]/dashboard/page.tsx`

- Convertido a `async` Server Component
- Enriquece corpus con stats reales desde `fetchCorpusStats`
- Pasa `topMetaphors` como prop al componente cliente

#### Modificado: `components/dashboard-overview.tsx`

- Eliminado import de `getMetaphorsByCorpusSlug`
- Recibe `topMetaphors: ConceptualMetaphor[]` como prop del Server Component padre

## Configuración requerida

### Variable de entorno (frontend)

Archivo `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Comandos de ingesta ejecutados

```bash
# Desde metacorpus-explorer-back/

# Corpus 1
npx ts-node scripts/ingest.ts --file "ARCHIVOS CORPUS/Registros Corpus 1 - DOC1.xlsx" --corpus "tdg-betancur-villegas-2025" --name "..." --description "..." --license "CC-BY-4.0"

# Corpus 2 - DOC1
npx ts-node scripts/ingest.ts --file "ARCHIVOS CORPUS/Registros Corpus 2 - DOC1.xlsx" --corpus "phdthesis-marinmorales-2026" --name "..." --description "..." --license "CC-BY-4.0"

# Corpus 2 - DOC2
npx ts-node scripts/ingest.ts --file "ARCHIVOS CORPUS/Registros Corpus 2 - DOC2.xlsx" --corpus "phdthesis-marinmorales-2026" --license "CC-BY-4.0"
```

## Arquitectura de la conexión

```text
┌─────────────────────────────┐
│   Next.js (Server Components)│
│   app/page.tsx (async)       │
│   app/corpus/[slug]/...      │
│                              │
│   lib/api.ts ────────────────┼──── fetch() ────► Backend API
│   (fetchMetaphors,           │                   (Express + Prisma)
│    fetchCorpusStats,         │                   localhost:3001
│    fetchFilterOptions)       │
└─────────────────────────────┘
                                                   ┌──────────────┐
                                                   │  PostgreSQL   │
                                                   │  (Prisma ORM) │
                                                   └──────────────┘
```

## Decisiones técnicas

### Server Components para data fetching

Todas las páginas que necesitan datos de la API (`page.tsx`, `dashboard/page.tsx`, `metaphors/page.tsx`) son **async Server Components**. Esto permite:
- Fetch directo sin exponer la URL de la API al cliente
- No se requiere `useEffect` ni estado de carga en el cliente
- Los componentes de presentación (`"use client"`) reciben datos como props

### Paginación automática

La API limita a 100 items por request. `fetchMetaphors` pagina automáticamente haciendo múltiples requests secuenciales hasta obtener todos los resultados solicitados.

### Fallback graceful

Si la API no responde, las páginas renderizan con datos vacíos o los valores estáticos de `corpusCatalog`. No se produce error 500.

### Separación de responsabilidades

- `lib/api.ts` — comunicación con el backend (tipos de respuesta, fetch, paginación)
- `lib/metaphors.ts` — mapeo de datos API → tipos del frontend, lógica de filtrado
- `lib/corpora.ts` — catálogo estático de referencia con metadatos de cada corpus

## Estado final

La tarea queda **completada**:

- Los 2 corpus reales están ingestados en la base de datos
- El frontend muestra datos reales en la landing page (conteos), dashboard (stats + top metáforas) y explorador de metáforas (listado completo con filtros)
- No quedan dependencias de datos mock en la aplicación
- La conexión frontend-backend funciona correctamente mediante Server Components + fetch
