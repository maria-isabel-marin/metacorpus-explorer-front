---
title: Implementacion de Funcionalidades Frontend
autor: Equipo MetaCorpus Explorer
fecha: 2026-06-16
version: 1.0.0
---

## 1. Resumen de Funcionalidades Implementadas

### 1.1 Paginacion en MetaphorExplorer

**Archivos modificados:**
- `lib/api.ts`: Agregada funcion `fetchMetaphorsPaginated()`
- `app/corpus/[slug]/metaphors/page.tsx`: Soporte para parametro `page` en URL
- `components/metaphor-explorer.tsx`: Controles de paginacion UI
- `components/metaphor-table.tsx`: Links al detalle de metáfora

**Caracteristicas:**
- 50 metáforas por pagina
- Controles "Anterior" / "Siguiente" con info de pagina actual
- Indicador "X-Y de Z metáforas"
- Integracion con URL (`?page=N`)

### 1.2 Vista de Detalle de Metáfora

**Archivos creados:**
- `app/corpus/[slug]/metaphors/[metaphorId]/page.tsx`: Pagina de detalle
- `components/metaphor-detail.tsx`: Componente de visualizacion

**Caracteristicas:**
- Informacion completa de la metáfora (nombre, descripcion, tipologia)
- Dominios fuente y meta con links
- Estadisticas (expresiones, correspondencias ontológicas/epistémicas)
- Lista de correspondencias agrupadas
- Expresiones asociadas con paginacion
- Metáforas relacionadas

**APIs utilizadas:**
- `GET /api/v1/corpora/{slug}/metaphors/{id}`
- `GET /api/v1/corpora/{slug}/metaphors/{id}/expressions`
- `GET /api/v1/corpora/{slug}/metaphors/{id}/related`

### 1.3 Mejoras en Dashboard

**Archivos modificados:**
- `components/dashboard-overview.tsx`: Funcionalidades de dashboard

**Caracteristicas implementadas:**

**Cómo citar:**
- Link a pagina "Acerca" (`/corpus/{slug}/about`)

**Exportar corpus:**
- Descarga CSV con todas las metáforas
- Usa funcion `downloadMetaphorsAsCSV()` de `lib/metaphors`

**Barra de busqueda:**
- Redirige a concordancia con termino de busqueda
- Parametro URL: `?q={termino}`
- Permite buscar metáforas, dominios, focos, expresiones

**Links corregidos:**
- Metáforas destacadas → link a detalle de metáfora
- Explorar por dominio fuente → `/domains?tipo=fuente`
- Explorar por dominio meta → `/domains?tipo=meta`

### 1.4 Filtrado en DomainsExplorer

**Archivos modificados:**
- `components/domains-explorer.tsx`: Agregado filtrado por tipo de dominio
- `app/corpus/[slug]/domains/page.tsx`: Soporte para parametro `tipo`

**Caracteristicas:**
- Filtrado por pestaña activa (todos, fuente, meta)
- Parametro URL: `?tipo=fuente` o `?tipo=meta`
- Persistencia de filtro al navegar

### 1.5 Busqueda en Concordancia

**Archivos modificados:**
- `lib/api.ts`: `fetchExpressions()` usa endpoint `/expressions/search` cuando hay termino de busqueda
- `components/concordance-explorer.tsx`: Manejo de parametro `q`
- `app/corpus/[slug]/concordance/page.tsx`: Soporte para parametro `q`

**Caracteristicas:**
- Busqueda full-text sobre expresiones, contexto y foco
- Redireccion desde dashboard con termino predefinido
- Filtros combinables (busqueda + tipologia)

## 2. Preparacion para Graficos Avanzados

**Archivos modificados:**
- `lib/api.ts`: Agregadas funciones y tipos para estadisticas avanzadas

**Nuevas APIs (backend):**
- `fetchDensityData()` → `GET /api/v1/corpora/{slug}/stats/density`
- `fetchProximityData()` → `GET /api/v1/corpora/{slug}/stats/proximity`
- `fetchDomainMatrix()` → `GET /api/v1/corpora/{slug}/stats/domain-matrix`

**Tipos definidos:**
- `DensityData`: Datos para grafico de densidad por orden
- `ProximityData`: Datos para scatter de proximidad
- `DomainMatrixData`: Datos para heatmap de dominios

## 3. Estilos CSS Agregados

**Archivo:** `app/globals.css`

**Secciones nuevas:**
- Paginacion de metáforas (`.metaphor-pagination-wrapper`, `.metaphor-pagination`)
- Vista de detalle de metáfora (`.metaphor-detail-shell`, `.metaphor-detail-header`, etc.)
- Links en tablas (`.metaphor-formula-link`, `.metaphor-card-link`)

## 4. Rutas Implementadas

| Ruta | Descripcion |
|------|-------------|
| `/corpus/[slug]/metaphors` | Lista paginada de metáforas |
| `/corpus/[slug]/metaphors/[metaphorId]` | Detalle de metáfora |
| `/corpus/[slug]/domains?tipo=fuente` | Dominios fuente filtrados |
| `/corpus/[slug]/domains?tipo=meta` | Dominios meta filtrados |
| `/corpus/[slug]/concordance?q={termino}` | Concordancia con busqueda |

## 5. Proximos Pasos

Implementar componentes visuales para los graficos avanzados:
- DensityChart con datos reales de `/stats/density`
- ScatterChart con datos reales de `/stats/proximity`
- HeatmapChart con datos reales de `/stats/domain-matrix`
