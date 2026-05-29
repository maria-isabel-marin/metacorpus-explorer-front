# Tarea 04 - Gestión y visualización del idioma de la interfaz

## Resumen

Esta tarea implementa el **soporte bilingüe (español/inglés)** completo de la interfaz de MetaCorpus Explorer. El usuario puede cambiar el idioma desde un selector visible en todas las páginas, y la preferencia se persiste en `localStorage` para futuras sesiones.

## Objetivo funcional

- La aplicación debe estar disponible en español e inglés
- Si el usuario tiene configurado español, la interfaz se muestra en español
- Si el usuario tiene configurado inglés, la interfaz se muestra en inglés
- El usuario puede cambiar el idioma desde un selector visible
- El cambio aplica a menús, botones, etiquetas, formularios, mensajes y textos informativos
- La preferencia se guarda y mantiene en futuras sesiones
- Si no hay preferencia, se usa el idioma del navegador (con fallback a español)

## Arquitectura implementada

### Sistema de traducción

Se implementó un sistema i18n **sin dependencias externas**, basado en:

1. **Diccionarios JSON** (`lib/i18n/es.json`, `lib/i18n/en.json`) — un archivo por idioma
2. **Módulo central** (`lib/i18n/index.ts`) — exporta tipos, locales disponibles y función `getDictionary`
3. **React Context** (`lib/i18n/language-context.tsx`) — `LanguageProvider` + hook `useLanguage()`
4. **Componente selector** (`components/language-selector.tsx`) — UI para cambiar idioma

### Flujo de idioma

```text
1. Al cargar la app:
   - LanguageProvider lee localStorage("metacorpus-lang")
   - Si no existe, detecta navigator.language
   - Si es "en", usa inglés; cualquier otro caso → español (default)

2. Al cambiar idioma:
   - setLocale() actualiza el state
   - Guarda en localStorage
   - Actualiza document.documentElement.lang
   - Todos los componentes se re-renderizan con el nuevo diccionario

3. En futuras sesiones:
   - localStorage tiene la preferencia guardada
   - Se aplica automáticamente al arrancar
```

## Componentes traducidos

| Componente | Sección del diccionario |
|---|---|
| `corpus-selector.tsx` | `landing.*` |
| `active-corpus-bar.tsx` | `activeCorpusBar.*` |
| `dashboard-overview.tsx` | `dashboard.*` |
| `metaphor-explorer.tsx` | `explorer.*` |
| `metaphor-filters.tsx` | `filters.*` |
| `metaphor-table.tsx` | `table.*` |
| `not-found.tsx` | `notFound.*` |
| `language-selector.tsx` | `language.*` |

## Estructura de archivos creada/modificada

```text
lib/i18n/
  index.ts                  # Tipos, locales, getDictionary
  language-context.tsx      # LanguageProvider + useLanguage hook
  es.json                   # Diccionario español (completo)
  en.json                   # Diccionario inglés (completo)
components/
  language-selector.tsx     # Selector dropdown con ícono globo
```

**Archivos modificados:**
- `app/layout.tsx` — envuelve children con `<LanguageProvider>`
- `app/not-found.tsx` — convertido a client component con i18n
- `app/globals.css` — estilos para `.language-selector`, `.selector-hero-top`, `.active-corpus-actions`
- `components/corpus-selector.tsx` — convertido a client component con i18n
- `components/active-corpus-bar.tsx` — convertido a client component con i18n
- `components/dashboard-overview.tsx` — integrado `useLanguage()`
- `components/metaphor-explorer.tsx` — integrado `useLanguage()`
- `components/metaphor-filters.tsx` — integrado `useLanguage()`
- `components/metaphor-table.tsx` — convertido a client component con i18n

## Ubicación del selector de idioma

El selector aparece en **dos ubicaciones**:

1. **Landing page** — en la esquina superior derecha del hero, junto al título
2. **Barra de corpus activo** — junto al enlace "Cambiar corpus", visible en todas las páginas de exploración

## Decisiones técnicas

### Sin librería externa (next-intl, react-i18next)

Se optó por una solución propia ligera porque:
- Solo hay 2 idiomas
- No se requiere routing por locale (`/en/...`, `/es/...`)
- El contenido de datos (metáforas, dominios) no se traduce — solo la UI
- Minimiza dependencias y peso del bundle

### Persistencia en localStorage

- Clave: `metacorpus-lang`
- Valores posibles: `"es"` | `"en"`
- Se lee una vez al montar el `LanguageProvider`

### Detección automática de idioma

Si no hay preferencia guardada:
1. Se lee `navigator.language` (ej. `"en-US"`, `"es-CO"`)
2. Se toma el prefijo de 2 caracteres
3. Si es `"en"` → inglés; cualquier otro → español (idioma por defecto)

### Formateo de números y fechas

Los formatos de `Intl.NumberFormat` e `Intl.DateTimeFormat` también cambian según el locale activo:
- Español: locale `"es-CO"` (separador de miles: punto)
- Inglés: locale `"en-US"` (separador de miles: coma)

### Interpolación simple

Para textos con variables dinámicas se usa `.replace("{placeholder}", value)`:
```typescript
t.explorer.subtitle.replace("{count}", String(totalCount))
t.explorer.showing.replace("{filtered}", String(filteredCount)).replace("{total}", String(totalCount))
```

## Criterios de aceptación cubiertos

- [x] Aplicación disponible en inglés y español
- [x] Si el usuario tiene configurado español, la interfaz se muestra en español
- [x] Si el usuario tiene configurado inglés, la interfaz se muestra en inglés
- [x] El usuario puede cambiar el idioma desde un selector visible
- [x] El cambio aplica a menús, botones, etiquetas, mensajes y textos informativos
- [x] La preferencia se guarda y mantiene en futuras sesiones
- [x] Si no hay preferencia definida, se usa idioma por defecto (español)

## Limitaciones actuales

- Los datos de los corpus (nombres de metáforas, dominios, expresiones) no se traducen — provienen de la API en el idioma original del corpus
- El atributo `<html lang="es">` está hardcodeado en el Server Component (`layout.tsx`); el provider actualiza `document.documentElement.lang` en el cliente tras la hidratación
- No hay soporte para más de 2 idiomas (sería fácil de agregar añadiendo un nuevo `.json` y registrando el locale en `index.ts`)

## Estado final

La tarea queda **completada**. La interfaz es completamente bilingüe, con un selector de idioma accesible, persistencia de preferencia y detección automática del idioma del navegador.
