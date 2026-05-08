# Tarea 01 - Base multi-corpus para MetaCorpus Explorer

## Resumen

Esta tarea correspondió a la construcción de la **base inicial del frontend** para MetaCorpus Explorer, con foco en habilitar una experiencia multi-corpus desde el primer ingreso al sistema.

Se implementó una interfaz inicial en **Next.js 14 + TypeScript + App Router**, usando datos mock para representar corpus disponibles y permitiendo navegación por URLs compartibles a partir de un `slug`.

## Objetivo funcional

El objetivo de esta tarea fue resolver los siguientes puntos:

- permitir que un usuario vea una landing con varios corpus disponibles
- permitir la selección de un corpus desde esa landing
- mantener el corpus activo como contexto visible en la interfaz
- garantizar que cada corpus tenga una ruta propia y compartible
- dejar una base lista para conectar vistas futuras como dashboard, exploradores y visualizaciones

## Alcance implementado

### 1. Landing page de selección de corpus

Se implementó una página raíz en `/` que actúa como selector de corpus.

Características:

- muestra tarjetas por cada corpus disponible
- presenta nombre, descripción, metadatos y métricas básicas
- usa un estilo visual editorial inspirado en el mockup base compartido
- adapta la estética original hacia una paleta de blancos y azules

### 2. Modelo inicial de corpus

Se definió un catálogo mock en `lib/corpora.ts` con dos corpus de ejemplo.

Cada corpus contiene:

- `slug`
- `name`
- `shortCode`
- `description`
- `expressions`
- `metaphors`
- `sourceDomains`
- `targetDomains`
- `language`
- `version`
- `license`
- `publicationDate`
- `highlightedTopic`

### 3. Navegación multi-corpus por URL

Se implementó la convención de rutas:

- `/corpus/[slug]`
- `/corpus/[slug]/dashboard`

Esto permite:

- compartir enlaces que preservan el contexto del corpus
- escalar a nuevas vistas manteniendo el `slug` como namespace
- preparar la aplicación para consumir backend por corpus en iteraciones futuras

### 4. Layout persistente del corpus activo

Se creó un layout específico para `/corpus/[slug]/...` que incorpora una barra superior persistente.

La barra muestra:

- nombre del corpus activo
- versión del corpus
- acceso para volver al selector y cambiar de corpus

### 5. Redirección automática con corpus único

La raíz `/` redirige automáticamente al dashboard cuando solo existe un corpus en el catálogo.

Este comportamiento responde al criterio funcional de simplificar la entrada al sistema en escenarios de corpus único.

## Criterios de aceptación cubiertos

Esta implementación cubre los criterios base de la tarea:

- landing page para seleccionar corpus
- soporte para múltiples corpus
- corpus identificables por `slug`
- barras o contexto persistente del corpus activo
- redirección automática en caso de corpus único

## Estructura principal creada

```text
app/
  corpus/[slug]/
    dashboard/page.tsx
    layout.tsx
    page.tsx
  globals.css
  layout.tsx
  not-found.tsx
  page.tsx
components/
  active-corpus-bar.tsx
  corpus-selector.tsx
  dashboard-overview.tsx
lib/
  corpora.ts
```

## Decisiones técnicas

### Next.js con App Router

Se eligió App Router porque encaja naturalmente con la segmentación por corpus y permite montar layouts persistentes por rama de rutas.

### Datos mock en una capa simple

Los corpus se dejaron en `lib/corpora.ts` para evitar acoplar esta primera entrega a un backend todavía no integrado.

### `slug` como identificador principal

El `slug` se usa como identificador navegable y compartible porque es legible, estable y útil para futuras integraciones con API.

### Diseño editorial sobrio

La interfaz conserva el tono académico/editorial del HTML de referencia, pero trasladado a una identidad más limpia en blancos y azules para esta versión inicial del producto.

## Limitaciones actuales

Esta tarea no incluye todavía:

- integración con backend real
- autenticación o control de acceso
- filtros de búsqueda avanzados
- explorador completo de metáforas
- explorador completo de dominios
- mapas o visualizaciones analíticas conectadas a datos reales
- persistencia de estado del usuario entre sesiones

## Próximos pasos sugeridos

Las siguientes iteraciones podrían enfocarse en:

- conectar el catálogo de corpus a una API read-only
- reemplazar el dashboard mock por datos reales
- agregar navegación lateral o tabs para módulos internos
- implementar explorador de metáforas y dominios
- añadir búsqueda full-text y vista KWIC
- preparar visualizaciones como mapa radial y métricas agregadas

## Estado final de la tarea

La tarea queda **cumplida para su alcance inicial**, dejando lista la base frontend multi-corpus sobre la que pueden construirse los siguientes módulos funcionales del proyecto.
