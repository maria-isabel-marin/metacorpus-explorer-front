# MetaCorpus Explorer Front

Frontend inicial de **MetaCorpus Explorer**, construido con **Next.js 14 + TypeScript + App Router**.

Esta primera entrega implementa la base de navegación **multi-corpus** y una interfaz inicial inspirada en el mockup editorial compartido para el proyecto.

## Objetivo de esta versión

Esta versión resuelve las siguientes tareas funcionales del frontend:

**Tarea 1 - Base multi-corpus:**
- selección de corpus desde una landing page
- soporte para múltiples corpus con datos mock
- navegación por rutas compartibles usando `slug`
- layout persistente con indicador del corpus activo
- redirección automática cuando solo exista un corpus

**Tarea 2 - Explorador de metáforas conceptuales:**
- listado de metáforas conceptuales con fórmulas X ES Y
- filtros por tipología (ESTRUCTURAL, ONTOLÓGICA, ORIENTACIONAL)
- filtros por dominio fuente y dominio meta
- vista en tabla y tarjetas
- descarga CSV de resultados filtrados

## Requisitos

- Node.js 18 o superior
- npm 9 o superior

## Instalación

```bash
npm install
```

## Ejecución en desarrollo

```bash
npm run dev
```

Luego abre en el navegador:

```bash
http://localhost:3000
```

## Build de producción

```bash
npm run build
```

## Ejecutar build de producción

```bash
npm run start
```

## Lint

```bash
npm run lint
```

## Rutas implementadas

- `/`
  - landing page con selector de corpus
- `/corpus/[slug]`
  - redirección al dashboard del corpus
- `/corpus/[slug]/dashboard`
  - dashboard inicial del corpus activo
- `/corpus/[slug]/metaphors`
  - explorador de metáforas conceptuales con filtros y descarga CSV

## Estructura del proyecto

```text
app/
  corpus/[slug]/
    dashboard/page.tsx
    metaphors/page.tsx
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
  metaphor-explorer.tsx
  metaphor-filters.tsx
  metaphor-table.tsx
lib/
  corpora.ts
  metaphors.ts
```

## Dónde editar los datos mock

Los corpus de prueba están definidos en:

```text
lib/corpora.ts
```

Las metáforas conceptuales de prueba están en:

```text
lib/metaphors.ts
```

Cada metáfora incluye:

- `id` y `formula` (X ES Y)
- `sourceDomain` y `targetDomain`
- `typology` (ESTRUCTURAL, ONTOLÓGICA, ORIENTACIONAL, OTRA)
- `expressions` (número de expresiones instancia)

Cada corpus incluye:

- `slug`
- `name`
- `description`
- métricas base
- metadatos de idioma, versión, licencia y fecha

## Comportamiento actual

- Si existe más de un corpus, la raíz `/` muestra el selector.
- Si existe un solo corpus, la raíz redirige directamente a su dashboard.
- El `slug` del corpus queda visible en la URL para compartir enlaces.
- Dentro de `/corpus/[slug]/...` se mantiene una barra persistente con el corpus activo.

## Estado del proyecto

Actualmente este repositorio contiene:

**Implementado:**
- base frontend multi-corpus con selector
- dashboard inicial del corpus
- **explorador de metáforas conceptuales** con filtros y descarga CSV

**Pendiente:**
- conexión con backend real
- autenticación
- explorador completo de dominios
- visualizaciones analíticas (mapas radiales, estadísticas dinámicas)
- concordancia KWIC

## Documentación adicional

La documentación específica de cada tarea está en:
 
```text
docs/tarea-01-base-multi-corpus.md
docs/tarea-02-explorador-metaforas.md
```
