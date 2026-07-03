# Tarea 05: Explorador Completo de Dominios y Visualizaciones

## Objetivo

Completar el explorador de dominios con visualizaciones interactivas y páginas de detalle, permitiendo a los usuarios navegar la jerarquía de dominios semánticos, explorar sus relaciones y visualizar el mapa conceptual de metáforas.

---

## Alcance de la tarea

### 1. Explorador de dominios (`/corpus/[slug]/domains`)

**Funcionalidades implementadas:**
- **Vista tabular** con:
  - Lista de dominios fuente y meta
  - Indicador de color por macro-categoría
  - Filtro de texto en tiempo real
  - Índice alfabético clickeable
  - Ordenamiento por frecuencia (descendente)
  - Links a página de detalle de cada dominio

- **Vista jerárquica (árbol)** con:
  - Estructura expandible/contraíble
  - Indicadores visuales de profundidad
  - Frecuencias en cada nodo
  - Navegación por macro-dominios

- **API integration:**
  - `fetchDomains()` - obtiene lista de dominios del corpus
  - `fetchDomainRelations()` - obtiene relaciones semánticas entre dominios
  - `buildDomainTree()` - construye estructura jerárquica desde datos planos

### 2. Mapa radial de metáforas (`/corpus/[slug]/map`)

**Visualización implementada:**
- Layout circular con:
  - Dominios fuente en semi-círculo izquierdo
  - Dominios meta en semi-círculo derecho
  - Aristas conectando dominios relacionados
  
- Controles interactivos:
  - Filtro por tipología (Estructural/Ontológica/Orientacional)
  - Slider de mínimo de expresiones
  - Leyenda de colores por tipología
  - Botón de descarga SVG
  
- Optimizaciones visuales:
  - Limitación a 30 dominios máximo (15 fuente + 15 meta más frecuentes)
  - Truncado inteligente de nombres largos en límites de palabra
  - Labels visibles solo en hover o nodos conectados
  - Radio ampliado (320px) para mejor espaciado

### 3. Página de detalle de dominio (`/corpus/[slug]/domains/[domainId]`)

**Estructura de la página:**
- **Breadcrumb navegable:**
  ```
  DOMINIOS / [HIPERÓNIMO] / DOMINIO_ACTUAL
  ```

- **Header informativo:**
  - Tipo de dominio (fuente/meta)
  - Nombre del dominio (título grande)
  - Macro-categoría (badge coloreado)
  - Contadores: expresiones y metáforas asociadas

- **Relaciones semánticas:**
  - Hiperónimos (es-un-tipo-de)
  - Hipónimos (tiene-como-subtipo)
  - Merónimos (tiene-como-parte)
  - Cada relación es un link a su dominio correspondiente

- **Listas de metáforas:**
  - Metáforas donde el dominio es fuente
  - Metáforas donde el dominio es meta
  - Cada item muestra: fórmula, cantidad de expresiones, tipología

- **Grafo ego-céntrico:**
  - Nodo central representando el dominio actual
  - Nodos orbitales para dominios relacionados
  - Diferentes tipos de líneas según relación (sólida/punteada)

### 4. Internacionalización

**Traducciones agregadas:**

- Sección `domains`:
  - Título, descripción, filtros, tipos de vista
  - Labels de tabla (dominio, tipo, expresiones, metáforas)
  
- Sección `map`:
  - Título, descripción, leyendas
  - Tipologías y categorías macro
  - Estadísticas visibles
  
- Sección `domainDetail`:
  - Contadores y metadatos
  - Títulos de secciones (relaciones, metáforas, grafo)
  - Estados vacíos (sin relaciones)

---

## Componentes creados/modificados

### Nuevos componentes

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `DomainsExplorer` | `components/domains-explorer.tsx` | UI principal del explorador con tabs tabla/árbol |
| `MetaphorMap` | `components/metaphor-map.tsx` | Visualización SVG radial interactiva |
| `DomainDetail` | `components/domain-detail.tsx` | Página de detalle con relaciones y grafo |

### Páginas creadas

| Ruta | Server/Client | Función |
|------|---------------|---------|
| `/corpus/[slug]/domains` | Server | Carga datos de dominios, renderiza `DomainsExplorer` |
| `/corpus/[slug]/domains/[domainId]` | Server | Carga datos del dominio, metáforas relacionadas, renderiza `DomainDetail` |
| `/corpus/[slug]/map` | Server | Carga metáforas para visualización, renderiza `MetaphorMap` |

### API y tipos extendidos

```typescript
// lib/api.ts
interface ApiDomain {
  id: string;
  nombre: string;
  tipo: "fuente" | "meta";
  macrodominio: string;
  frecuencia: number;
  padre_id?: string | null;
}

interface ApiDomainRelation {
  dominio_origen_id: string;
  dominio_destino_id: string;
  tipo_relacion: "hiponimo" | "hiperonimo" | "meronimo" | "holonimo";
}

fetchDomains(corpusSlug: string): Promise<PaginatedResponse<ApiDomain>>
fetchDomainRelations(corpusSlug: string): Promise<PaginatedResponse<ApiDomainRelation>>
buildDomainTree(domains: ApiDomain[]): TreeNode[]
```

---

## Dependencias

- `next` (App Router con rutas dinámicas anidadas)
- `react` (hooks: useState, useMemo para cálculo de posiciones)
- `lucide-react` (íconos de UI)
- Sistema de i18n existente (`useLanguage` hook)

---

## Notas de implementación

### Optimización de visualización

El mapa radial implementa varias estrategias para evitar saturación:

```typescript
// Limitar dominios mostrados
const sourceDomains = allDomains
  .filter(d => d.type === "source")
  .sort((a, b) => b.count - a.count)
  .slice(0, 15);

// Truncado inteligente de nombres
const truncateDomainName = (name: string, maxLen = 18) => {
  if (name.length <= maxLen) return name;
  const truncated = name.slice(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 10) {
    return truncated.slice(0, lastSpace) + "...";
  }
  return truncated + "...";
};
```

### Jerarquía de dominios

El árbol jerárquico se construye desde datos planos usando referencias `padre_id`:

```typescript
type TreeNode = ApiDomain & {
  children: TreeNode[];
  depth: number;
};
```

### Relaciones semánticas

Actualmente usa datos mock para demostración. En producción, el endpoint `/api/v1/domain-relations` proveería:
- Hiperonimia (CONSTRUCCIÓN → EDIFICIO)
- Hiponimia (EDIFICIO → CIMENTO)
- Meronimia (EDIFICIO → PUERTA, VENTANA)

---

## Estado

**Completado:** ✅
- Explorador de dominios con tabla y árbol
- Mapa radial con controles y leyenda
- Página de detalle con breadcrumb, relaciones, metáforas
- Internacionalización completa

**Pendiente mejora futura:**
- Integración real de API de relaciones semánticas (actualmente mock)
- Paginación en listas de metáforas del detalle
- Búsqueda dentro del árbol jerárquico

---

## Referencias

- Diseño inspirado en [Mapping Metaphor (Glasgow)](https://mappingmetaphor.arts.gla.ac.uk/)
- Colores de tipología alineados con estándar MIPVU
- Estructura de rutas sigue convención RESTful `/corpus/{slug}/domains/{id}`
