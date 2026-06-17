"use client";

import type { CorpusSummary } from "@/lib/corpora";
import { useLanguage } from "@/lib/i18n/language-context";

type Endpoint = {
  method: "GET";
  path: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
};

function buildEndpoints(slug: string): Endpoint[] {
  return [
    {
      method: "GET",
      path: `/api/v1/corpora`,
      description: "Lista todos los corpus activos con sus contadores básicos.",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}`,
      description: "Detalle completo del corpus: estadísticas, principios FAIR, licencia, autores y cómo citar.",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/expressions`,
      description: "Lista paginada de expresiones metafóricas del corpus.",
      params: [
        { name: "limit", type: "integer", required: false, description: "Número de resultados (default 20, max 100)" },
        { name: "offset", type: "integer", required: false, description: "Desplazamiento para paginación" },
        { name: "metafora", type: "string", required: false, description: "Filtro parcial por nombre de metáfora" },
        { name: "dominio_fuente", type: "string", required: false, description: "Filtro por nombre de dominio fuente" },
        { name: "dominio_meta", type: "string", required: false, description: "Filtro por nombre de dominio meta" },
        { name: "tipologia", type: "string", required: false, description: "Filtro por tipología" },
        { name: "cat_gramatical", type: "string", required: false, description: "Filtro por categoría gramatical" },
        { name: "fuente", type: "string", required: false, description: "Filtro por fuente textual" },
        { name: "sort", type: "orden|id", required: false, description: "Campo de ordenamiento" },
        { name: "order", type: "asc|desc", required: false, description: "Dirección de ordenamiento" },
      ],
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/expressions/:id`,
      description: "Detalle completo de una expresión metafórica por su UUID.",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/metaphors`,
      description: "Lista paginada de metáforas conceptuales del corpus.",
      params: [
        { name: "limit", type: "integer", required: false, description: "Número de resultados (default 20, max 100)" },
        { name: "offset", type: "integer", required: false, description: "Desplazamiento para paginación" },
        { name: "dominio_fuente", type: "string", required: false, description: "Filtro por nombre de dominio fuente" },
        { name: "dominio_meta", type: "string", required: false, description: "Filtro por nombre de dominio meta" },
        { name: "tipologia", type: "string", required: false, description: "Filtro por tipología" },
      ],
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/metaphors/:id`,
      description: "Detalle de una metáfora conceptual: estadísticas, correspondencias y muestra de expresiones.",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/metaphors/:id/expressions`,
      description: "Expresiones asociadas a una metáfora conceptual (paginadas).",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/metaphors/:id/related`,
      description: "Metáforas relacionadas por dominios compartidos o adyacentes.",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/domains`,
      description: "Lista de dominios semánticos del corpus con frecuencia y nivel jerárquico.",
      params: [
        { name: "tipo", type: "fuente|meta", required: false, description: "Filtrar por tipo de dominio" },
      ],
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/domain-relations`,
      description: "Relaciones semánticas entre dominios (hiperonimia, hiponimia, meronimia, etc.).",
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/stats/density`,
      description: "Densidad metafórica por orden: distribución de expresiones en buckets según posición en texto.",
      params: [
        { name: "bucket", type: "integer", required: false, description: "Tamaño del bucket (default 100, min 10, max 1000)" },
      ],
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/stats/proximity`,
      description: "Datos para scatter plot de proximidad textual: expresiones cercanas en el texto.",
      params: [
        { name: "range", type: "integer", required: false, description: "Ventana de proximidad (default 50, min 10, max 200)" },
        { name: "limit", type: "integer", required: false, description: "Máximo de puntos (default 1000, min 100, max 5000)" },
      ],
    },
    {
      method: "GET",
      path: `/api/v1/corpora/${slug}/stats/domain-matrix`,
      description: "Matriz de co-ocurrencia dominio fuente × dominio meta para heatmap.",
      params: [
        { name: "minCount", type: "integer", required: false, description: "Mínimo de expresiones (default 1, min 1, max 100)" },
        { name: "limit", type: "integer", required: false, description: "Máximo de dominios (default 50, min 10, max 100)" },
      ],
    },
  ];
}

function EndpointCard({ endpoint }: { endpoint: Endpoint }) {
  return (
    <div className="api-endpoint-card">
      <div className="api-endpoint-header">
        <span className="api-method">{endpoint.method}</span>
        <code className="api-path">{endpoint.path}</code>
      </div>
      <p className="api-description">{endpoint.description}</p>
      {endpoint.params && endpoint.params.length > 0 && (
        <div className="api-params">
          <p className="api-params-title">Parámetros de consulta</p>
          <table className="api-params-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Requerido</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {endpoint.params.map((p) => (
                <tr key={p.name}>
                  <td><code>{p.name}</code></td>
                  <td><span className="api-param-type">{p.type}</span></td>
                  <td>{p.required ? "Sí" : "No"}</td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

type ApiExplorerProps = {
  corpus: CorpusSummary;
};

export function ApiExplorer({ corpus }: ApiExplorerProps) {
  const { } = useLanguage();
  const endpoints = buildEndpoints(corpus.slug);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  return (
    <div className="api-page">
      <header className="api-header">
        <span className="section-tag">DESARROLLADORES</span>
        <h1>API REST</h1>
        <p className="subtitle">
          Endpoints disponibles para el corpus <strong>{corpus.name}</strong>. Todos los endpoints devuelven JSON y no requieren autenticación.
        </p>
        <div className="api-base-url">
          <span className="api-base-label">Base URL</span>
          <code className="api-base-value">{apiBase}</code>
        </div>
      </header>

      <div className="api-endpoints-list">
        {endpoints.map((ep) => (
          <EndpointCard key={ep.path + ep.method} endpoint={ep} />
        ))}
      </div>

      <section className="api-notes">
        <h2>Notas de uso</h2>
        <ul>
          <li>Todas las respuestas tienen la forma <code>{"{ \"data\": { ... } }"}</code>.</li>
          <li>Los listados incluyen <code>total</code>, <code>limit</code>, <code>offset</code> e <code>items</code>.</li>
          <li>Los errores devuelven <code>{"{ \"error\": \"mensaje\" }"}</code> con código HTTP apropiado.</li>
          <li>La documentación interactiva OpenAPI está disponible en <code>{apiBase}/api/v1/openapi.json</code>.</li>
        </ul>
      </section>
    </div>
  );
}
