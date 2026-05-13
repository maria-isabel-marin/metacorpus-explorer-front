# Tarea 02 - Explorador de Metáforas Conceptuales

## Resumen

Esta tarea corresponde a la implementación del **explorador de metáforas conceptuales** para MetaCorpus Explorer. Se construyó una interfaz completa que permite explorar, filtrar y descargar metáforas conceptuales en formato X ES Y, incluyendo sus dominios fuente y meta, tipologías, y número de expresiones asociadas.

La implementación sigue la arquitectura **Next.js 14 + TypeScript + App Router** y mantiene la consistencia visual con el sistema de diseño previamente establecido (paleta blancos y azules, tipografía editorial/académica).

## Objetivo funcional

El objetivo de esta tarea fue resolver los siguientes puntos:

- mostrar un listado de metáforas conceptuales del corpus activo
- permitir filtrar metáforas por tipología (ESTRUCTURAL, ONTOLÓGICA, ORIENTACIONAL, OTRA)
- permitir filtrar por dominio fuente y dominio meta mediante dropdowns
- incluir filtros por categoría gramatical del foco metafórico
- ofrecer alternancia entre vista de tabla y vista de tarjetas
- permitir descargar los resultados filtrados en formato CSV
- mantener el contexto del corpus activo en la barra superior persistente

## Alcance implementado

### 1. Página del explorador

Se implementó la ruta `/corpus/[slug]/metaphors` que muestra el explorador de metáforas para el corpus seleccionado.

**Características:**
- breadcrumb implícito mediante la barra de corpus activo
- título "Metáforas conceptuales" con conteo total
- subtítulo explicativo sobre el tipo de fórmulas (X ES Y normalizadas)
- indicador de resultados filtrados con opción de limpiar filtros

### 2. Panel de filtros lateral

Se implementó un panel de filtros en la columna izquierda con las siguientes opciones:

**Tipología:**
- filtros checkbox para cada tipología
- conteo de metáforas por tipología
- tipos soportados: ESTRUCTURAL, ONTOLÓGICA, ORIENTACIONAL, OTRA

**Dominio fuente:**
- dropdown con lista de dominios fuente únicos del corpus
- opción "Cualquiera" para no filtrar

**Dominio meta:**
- dropdown con lista de dominios meta únicos del corpus
- opción "Cualquiera" para no filtrar

**Categoría gramatical foco:**
- filtros checkbox para categorías gramaticales
- sustantivo, verbo, adjetivo, adverbio
- incluye conteo mock para cada categoría

### 3. Tabla de metáforas

Se implementó una tabla con las siguientes columnas:

- **Metáfora conceptual**: fórmula completa X ES Y
- **Dominio fuente**: badge con el dominio fuente
- **Dominio meta**: badge con el dominio meta
- **Tipología**: badge codificado por color según tipología
- **Expresiones**: número de expresiones instancia

**Características de la tabla:**
- ordenación implícita por número de expresiones (descendente)
- hover en filas con cambio de fondo
- badges de dominio con estilos diferenciados (fuente en gris, meta en azul)
- badges de tipología con colores distintivos:
  - ESTRUCTURAL: azul claro
  - ONTOLÓGICA: púrpura claro
  - ORIENTACIONAL: ámbar claro
  - OTRA: gris neutro

### 4. Vista de tarjetas alternativa

Se implementó una vista de tarjetas como alternativa a la tabla:

- cada tarjeta muestra la fórmula completa
- dominios fuente y meta con etiquetas
- tipología con badge codificado
- número de expresiones
- diseño responsivo con grid auto-fill

### 5. Controles de vista y descarga

Se implementaron controles en el header:

- **Toggle de vistas**: botones para alternar entre "Tabla" y "Tarjetas"
- **Descarga CSV**: botón para exportar los resultados filtrados
- nombre de archivo dinámico basado en el corpus activo

### 6. Datos mock de metáforas

Se crearon datos mock en `lib/metaphors.ts` con las siguientes características:

**Para CEV - Conflicto Armado Colombiano (22 metáforas):**
- metáforas relacionadas con conflicto, memoria, verdad, reconciliación
- ejemplos: "EL CONFLICTO SOCIAL ES GUERRA", "LA MEMORIA ES UNA HERIDA"
- distribución por tipologías realista

**Para Prensa Política Colombiana (6 metáforas):**
- metáforas sobre economía, política, estado
- ejemplos: "LA POLÍTICA ES UN JUEGO", "LA ECONOMÍA ES UN ORGANISMO"

## Criterios de aceptación cubiertos

Esta implementación cubre los criterios de la tarea:

- listado de metáforas conceptuales con fórmulas X ES Y
- filtros por tipología funcionales
- filtros por dominio fuente y dominio meta
- filtros por categoría gramatical (mock)
- vista alternativa (tabla/tarjetas)
- descarga CSV de resultados
- diseño consistente con el sistema visual existente
- integración con el layout de corpus activo

## Estructura de archivos creada

```text
app/
  corpus/[slug]/
    metaphors/
      page.tsx          # Página del explorador
components/
  metaphor-explorer.tsx   # Componente principal con estado
  metaphor-filters.tsx    # Panel lateral de filtros
  metaphor-table.tsx      # Tabla de metáforas
lib/
  metaphors.ts            # Tipos, datos mock y funciones
```

## Decisiones técnicas

### Client Component para estado interactivo

Se utilizó `"use client"` en `metaphor-explorer.tsx` y `metaphor-filters.tsx` para manejar el estado de filtros y cambios de vista sin recargar la página.

### Filtros en cliente

Los filtros se aplican en el cliente usando `useMemo` para evitar cálculos innecesarios y mantener la interfaz responsiva.

### Datos mock vinculados a corpus

Los datos de metáforas se organizan por `slug` de corpus en un `Record<string, ConceptualMetaphor[]>`, permitiendo escalabilidad a múltiples corpus.

### Exportación CSV en cliente

La generación y descarga del CSV se realiza completamente en el cliente mediante `Blob` y `URL.createObjectURL`, sin requerir backend.

### Estilos por tipología

Se definieron clases CSS específicas para cada tipología con colores diferenciados que facilitan la identificación visual rápida.

## Limitaciones actuales

Esta tarea no incluye todavía:

- conexión con backend real para datos de metáforas
- paginación (actualmente muestra todas las metáforas)
- ordenación interactiva por columnas
- búsqueda full-text dentro de metáforas
- filtros combinados complejos (AND/OR avanzado)
- persistencia de filtros en URL (para compartir búsquedas)
- autenticación o control de acceso
- categorías gramaticales reales (actualmente son mock)

## Próximos pasos sugeridos

Las siguientes iteraciones podrían enfocarse en:

- conectar los datos de metáforas a una API read-only
- agregar paginación con controles de página
- implementar búsqueda full-text en tiempo real
- persistir filtros en query params para URLs compartibles
- crear el explorador de dominios fuente/meta
- implementar vista de expresiones instancia al hacer clic en una metáfora
- agregar mapa radial de dominios (como se ve en la primera captura)

## Estado final de la tarea

La tarea queda **cumplida para su alcance inicial**, dejando operativo un explorador completo de metáforas conceptuales que permite:

- explorar metáforas del corpus seleccionado
- filtrar por múltiples criterios simultáneamente
- alternar entre vistas de tabla y tarjetas
- exportar resultados filtrados a CSV
- mantener contexto visual del corpus activo

Esta implementación proporciona una base sólida para conectar datos reales y agregar funcionalidades avanzadas en iteraciones futuras.
