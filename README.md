# MetaCorpus Explorer Front

Frontend inicial de **MetaCorpus Explorer**, construido con **Next.js 14 + TypeScript + App Router**.

Este proyecto implementa la base de navegación **multi-corpus**, el explorador de metáforas conceptuales y la conexión con datos reales a través de la API REST del backend.

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

**Tarea 3 - Datos reales en Metaphor Explorer:**
- conexión del frontend con la API REST del backend
- ingesta de datos reales de 2 corpus desde archivos Excel
- landing page y dashboard con estadísticas reales desde la API
- eliminación de mock data en favor de datos de producción

**Tarea 4 - Gestión y visualización del idioma de la interfaz:**
- soporte bilingüe completo: español e inglés
- selector de idioma accesible en la landing y la barra de corpus
- persistencia de preferencia en localStorage
- detección automática del idioma del navegador
- todos los textos de interfaz traducidos mediante diccionarios JSON

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Backend `metacorpus-explorer-back` corriendo (default: `http://localhost:3001`)

## Instalación

```bash
npm install
```

## Variables de entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Ejecución en desarrollo

Primero asegurarse de que el backend esté corriendo, luego:

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
  api.ts
  corpora.ts
  metaphors.ts
  i18n/
    index.ts
    language-context.tsx
    es.json
    en.json
```

## Fuentes de datos

Los datos se obtienen en tiempo real desde la API del backend:

- **Estadísticas de corpus**: `GET /api/v1/corpora/:slug`
- **Metáforas conceptuales**: `GET /api/v1/corpora/:slug/metaphors`
- **Expresiones metafóricas**: `GET /api/v1/corpora/:slug/expressions`

La capa de acceso a la API está en `lib/api.ts`.

Los metadatos estáticos de cada corpus (slug, nombre, descripción) se mantienen en `lib/corpora.ts` como catálogo de referencia.

## Comportamiento actual

- Si existe más de un corpus, la raíz `/` muestra el selector.
- Si existe un solo corpus, la raíz redirige directamente a su dashboard.
- El `slug` del corpus queda visible en la URL para compartir enlaces.
- Dentro de `/corpus/[slug]/...` se mantiene una barra persistente con el corpus activo.

## Estado del proyecto

Actualmente este repositorio contiene:

**Implementado:**
- base frontend multi-corpus con selector
- dashboard inicial del corpus con estadísticas reales
- explorador de metáforas conceptuales con filtros y descarga CSV
- conexión con API REST del backend (datos reales)
- ingesta de 2 corpus reales desde archivos Excel
- internacionalización (ES/EN) con selector de idioma y persistencia
- explorador completo de dominios (tabla, árbol jerárquico, página de detalle)
- mapa radial de metáforas con visualización interactiva dominio-fuente ↔ dominio-meta
- relaciones semánticas entre dominios (hiperónimos, hipónimos, merónimos)

**Pendiente:**
- autenticación
- concordancia KWIC
- paginación en explorador de metáforas
- dashboard analítico con estadísticas dinámicas

## Documentación adicional

La documentación específica de cada tarea está en:

```text
docs/tarea-01-base-multi-corpus.md
docs/tarea-02-explorador-metaforas.md
docs/tarea-03-datos-reales-metaphor-explorer.md
docs/tarea-04-internacionalizacion.md
docs/tarea-05-explorador-dominios.md
```
