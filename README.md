# MetaCorpus Explorer Front

Frontend inicial de **MetaCorpus Explorer**, construido con **Next.js 14 + TypeScript + App Router**.

Esta primera entrega implementa la base de navegación **multi-corpus** y una interfaz inicial inspirada en el mockup editorial compartido para el proyecto.

## Objetivo de esta versión

Esta versión resuelve la primera tarea funcional del frontend:

- selección de corpus desde una landing page
- soporte para múltiples corpus con datos mock
- navegación por rutas compartibles usando `slug`
- layout persistente con indicador del corpus activo
- redirección automática cuando solo exista un corpus

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

## Estructura del proyecto

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

## Dónde editar los corpus mock

Los corpus de prueba están definidos en:

```text
lib/corpora.ts
```

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

Actualmente este repositorio contiene una **base frontend inicial**. Aún no incluye:

- conexión con backend real
- autenticación
- filtros avanzados
- exploradores completos de metáforas y dominios
- visualizaciones analíticas conectadas a datos reales

## Documentación adicional

La documentación específica de esta tarea está en:
 
```text
docs/tarea-01-base-multi-corpus.md
```
