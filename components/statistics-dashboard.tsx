"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import type { DensityData, ProximityData, DomainMatrixData } from "@/lib/api";

// Types for statistics data
type DomainStat = {
  nombre: string;
  frecuencia: number;
};

type MetaphorStat = {
  nombre: string;
  total_expresiones: number;
  dominio_fuente?: { nombre: string } | null;
  dominio_meta?: { nombre: string } | null;
};

type CorpusStats = {
  estadisticas_agregadas: {
    numero_registros: number;
    fuentes_textuales: number;
    dominios: number;
    dominios_por_tipo: Record<string, number>;
    metaforas_conceptuales: number;
    relaciones_semanticas: number;
    categorias_gramaticales: number;
  };
};

type TypologyStat = {
  nombre: string;
  total: number;
};

type StatisticsDashboardProps = {
  corpus: {
    slug: string;
    nombre: string;
  };
  stats: CorpusStats | null;
  sourceDomains: DomainStat[];
  targetDomains: DomainStat[];
  topMetaphors: MetaphorStat[];
  typologyDistribution: TypologyStat[];
  densityData?: DensityData | null;
  proximityData?: ProximityData | null;
  domainMatrix?: DomainMatrixData | null;
};

// Colors for charts
const SOURCE_COLOR = "#3b5998";
const TARGET_COLOR = "#a0522d";
const TYPOLOGY_COLORS = {
  RETRA: "#3b5998",
  PEDAL: "#a0522d",
  ORIG: "#4a7c59",
  RECI: "#d4a574",
};

// Horizontal Bar Chart Component
function HorizontalBarChart({
  data,
  color,
  label,
}: {
  data: DomainStat[];
  color: string;
  label: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.frecuencia), 1);

  return (
    <div className="bar-chart">
      <div className="chart-header">
        <span className="chart-title">{label}</span>
        <span className="chart-subtitle">frecuencia</span>
      </div>
      <div className="bar-list">
        {data.map((item, index) => (
          <div key={item.nombre} className="bar-item">
            <span className="bar-label" title={item.nombre}>
              {item.nombre}
            </span>
            <div className="bar-wrapper">
              <div
                className="bar"
                style={{
                  width: `${(item.frecuencia / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="bar-value">{item.frecuencia}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Metaphor Bar Chart (with colored bars based on source/target domain)
function MetaphorBarChart({
  data,
  label,
}: {
  data: MetaphorStat[];
  label: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.total_expresiones), 1);

  return (
    <div className="bar-chart metaphor-chart">
      <div className="chart-header">
        <span className="chart-title">{label}</span>
        <span className="chart-subtitle">por número de expresiones</span>
      </div>
      <div className="bar-list">
        {data.map((item) => {
          // Determine color based on domain types
          const hasSource = item.dominio_fuente?.nombre;
          const hasTarget = item.dominio_meta?.nombre;
          let barColor = SOURCE_COLOR;
          if (hasSource && hasTarget) {
            barColor = TARGET_COLOR;
          } else if (!hasSource && hasTarget) {
            barColor = TARGET_COLOR;
          }

          return (
            <div key={item.nombre} className="bar-item">
              <span className="bar-label metaphor-name" title={item.nombre}>
                {item.nombre}
              </span>
              <div className="bar-wrapper">
                <div
                  className="bar"
                  style={{
                    width: `${(item.total_expresiones / maxValue) * 100}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              <span className="bar-value">{item.total_expresiones}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const PALETTE = ["#3b5998", "#a0522d", "#4a7c59", "#d4a574", "#6b7280", "#9333ea", "#0891b2", "#dc2626"];

// Donut Chart Component for Typology — datos reales
function DonutChart({
  data,
  total,
  label,
}: {
  data: TypologyStat[];
  total: number;
  label: string;
}) {
  if (data.length === 0) {
    return (
      <div className="donut-chart-container">
        <div className="chart-header">
          <span className="chart-title">{label}</span>
          <span className="chart-subtitle">distribución</span>
        </div>
        <p className="chart-empty">Sin datos de tipología</p>
      </div>
    );
  }

  const colored = data.map((d, i) => ({ ...d, color: PALETTE[i % PALETTE.length] }));
  const totalValue = colored.reduce((s, d) => s + d.total, 0);
  let currentAngle = 0;

  return (
    <div className="donut-chart-container">
      <div className="chart-header">
        <span className="chart-title">{label}</span>
        <span className="chart-subtitle">distribución</span>
      </div>
      <div className="donut-wrapper">
        <svg viewBox="0 0 100 100" className="donut-svg">
          {colored.map((slice) => {
            const sliceAngle = (slice.total / totalValue) * 360;
            const startAngle = currentAngle;
            currentAngle += sliceAngle;
            const endAngle = currentAngle;
            const startRad = ((startAngle - 90) * Math.PI) / 180;
            const endRad = ((endAngle - 90) * Math.PI) / 180;
            const x1 = 50 + 40 * Math.cos(startRad);
            const y1 = 50 + 40 * Math.sin(startRad);
            const x2 = 50 + 40 * Math.cos(endRad);
            const y2 = 50 + 40 * Math.sin(endRad);
            const largeArc = sliceAngle > 180 ? 1 : 0;
            const pathData = [`M 50 50`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`, `Z`].join(" ");
            return (
              <path key={slice.nombre} d={pathData} fill={slice.color} stroke="white" strokeWidth="0.5" />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="white" />
          <text x="50" y="48" textAnchor="middle" className="donut-center-value">
            {total.toLocaleString()}
          </text>
          <text x="50" y="58" textAnchor="middle" className="donut-center-label">expresiones</text>
        </svg>
      </div>
      <div className="donut-legend">
        {colored.map((item) => (
          <div key={item.nombre} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: item.color }} />
            <span className="legend-label" title={item.nombre}>{item.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Density Chart Component - Barras apiladas por tipología
function DensityChart({ data }: { data: DensityData | null | undefined }) {
  if (!data || data.buckets.length === 0) {
    return (
      <div className="chart-coming-soon">
        <div className="chart-header">
          <span className="chart-title">Densidad metafórica por Orden</span>
        </div>
        <div className="chart-coming-soon-body">
          <p>Sin datos de densidad disponibles</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.buckets.map(b => b.count), 1);
  
  // Colores actualizados con mejor contraste
  const typologyColors: Record<string, string> = {
    "Estructural": "#2563eb",    // Azul más brillante
    "Ontologica": "#dc2626",     // Rojo más brillante  
    "Orientacional": "#16a34a",  // Verde más brillante
    "OTRA": "#6b7280"            // Gris neutro
  };

  // Orden fijo de tipologías para consistencia visual
  const typologyOrder = ["Estructural", "Ontologica", "Orientacional", "OTRA"];

  return (
    <div className="density-chart">
      <div className="chart-header">
        <span className="chart-title">Densidad metafórica por Orden</span>
        <span className="chart-subtitle">{data.total_expressions} expresiones en {data.buckets.length} buckets</span>
      </div>
      <div className="density-bars">
        {data.buckets.map((bucket) => {
          const height = bucket.count > 0 ? (bucket.count / maxCount) * 150 : 2;
          return (
            <div key={bucket.range} className="density-bar-wrapper" title={`${bucket.range}: ${bucket.count} expresiones`}>
              <div className="density-bar-stack" style={{ height: `${Math.max(height, 2)}px` }}>
                {typologyOrder.map((tipo) => {
                  const count = bucket.byTypology[tipo] || 0;
                  if (count === 0) return null;
                  const tipoHeight = (count / bucket.count) * height;
                  return (
                    <div
                      key={tipo}
                      className="density-bar-segment"
                      style={{
                        height: `${Math.max(tipoHeight, 1)}px`,
                        backgroundColor: typologyColors[tipo] || "#6b7280",
                        minHeight: "2px"
                      }}
                      title={`${tipo}: ${count}`}
                    />
                  );
                })}
              </div>
              {bucket.count > 0 && (
                <span className="density-bar-value">{bucket.count}</span>
              )}
              <span className="density-bar-label">{bucket.start}</span>
            </div>
          );
        })}
      </div>
      <div className="density-legend">
        {typologyOrder.map((tipo) => (
          <div key={tipo} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: typologyColors[tipo] }} />
            <span className="legend-label">{tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Proximity Histogram - Más interpretable: muestra densidad móvil de metáforas
function ScatterChart({ data }: { data: ProximityData | null | undefined }) {
  if (!data || data.data.length === 0) {
    return (
      <div className="chart-coming-soon">
        <div className="chart-header">
          <span className="chart-title">Distribución de metáforas en el texto</span>
        </div>
        <div className="chart-coming-soon-body">
          <p>Sin datos disponibles</p>
        </div>
      </div>
    );
  }

  // Crear histograma de densidad: agrupar por rangos de orden
  const numBins = 30;
  const maxX = Math.max(...data.data.map(d => d.x), 1);
  const binSize = Math.ceil(maxX / numBins);
  
  const bins: { start: number; end: number; count: number; byTypology: Record<string, number> }[] = [];
  
  for (let i = 0; i < numBins; i++) {
    const start = i * binSize;
    const end = (i + 1) * binSize;
    const pointsInBin = data.data.filter(p => p.x >= start && p.x < end);
    
    const byTypology: Record<string, number> = {};
    pointsInBin.forEach(p => {
      const tipo = p.typology || 'OTRA';
      byTypology[tipo] = (byTypology[tipo] || 0) + 1;
    });
    
    bins.push({ start, end, count: pointsInBin.length, byTypology });
  }
  
  const maxCount = Math.max(...bins.map(b => b.count), 1);
  
  const typologyColors: Record<string, string> = {
    "Estructural": "#2563eb",
    "Ontologica": "#dc2626",
    "Orientacional": "#16a34a",
    "OTRA": "#6b7280"
  };

  return (
    <div className="proximity-histogram">
      <div className="chart-header">
        <span className="chart-title">Distribución de metáforas en el texto</span>
        <span className="chart-subtitle">{data.total_points.toLocaleString()} expresiones · ventana ±{data.range}</span>
      </div>
      <div className="histogram-container">
        <div className="histogram-bars">
          {bins.map((bin, i) => {
            const height = bin.count > 0 ? (bin.count / maxCount) * 200 : 2;
            return (
              <div key={i} className="histogram-bar-wrapper" title={`Posición ${bin.start}-${bin.end}: ${bin.count} expresiones`}>
                <div className="histogram-bar" style={{ height: `${Math.max(height, 2)}px` }}>
                  {Object.entries(bin.byTypology).map(([tipo, count]) => {
                    const segmentHeight = (count / bin.count) * height;
                    return (
                      <div
                        key={tipo}
                        className="histogram-bar-segment"
                        style={{
                          height: `${Math.max(segmentHeight, 1)}px`,
                          backgroundColor: typologyColors[tipo] || "#6b7280"
                        }}
                        title={`${tipo}: ${count}`}
                      />
                    );
                  })}
                </div>
                <span className="histogram-bar-label">{bin.start}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="histogram-x-axis">
        <span>← Posición en el texto (progresión del corpus) →</span>
      </div>
      <div className="histogram-legend">
        {Object.entries(typologyColors).map(([tipo, color]) => (
          <div key={tipo} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: color }} />
            <span className="legend-label">{tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Heatmap Chart Component - Dominio fuente × meta
function HeatmapChart({ data }: { data: DomainMatrixData | null | undefined }) {
  if (!data || data.source_domains.length === 0 || data.target_domains.length === 0) {
    return (
      <div className="chart-coming-soon">
        <div className="chart-header">
          <span className="chart-title">Heatmap fuente × meta</span>
        </div>
        <div className="chart-coming-soon-body">
          <p>Sin datos de matriz disponibles</p>
        </div>
      </div>
    );
  }

  // Filtrar solo dominios que tienen al menos una conexión para aprovechar espacio
  const sourcesWithData = data.source_domains.filter(s => 
    data.target_domains.some(t => (data.matrix[s]?.[t]?.count || 0) > 0)
  );
  const targetsWithData = data.target_domains.filter(t =>
    sourcesWithData.some(s => (data.matrix[s]?.[t]?.count || 0) > 0)
  );
  
  // Mostrar más dominios aprovechando el espacio
  const maxDisplay = 40;
  const displaySources = sourcesWithData.slice(0, maxDisplay);
  const displayTargets = targetsWithData.slice(0, maxDisplay);
  
  const maxCount = Math.max(
    ...displaySources.flatMap(s =>
      displayTargets.map(t => data.matrix[s]?.[t]?.count || 0)
    ),
    1
  );

  const getColor = (count: number) => {
    if (count === 0) return "#f1f5f9"; // Gris muy claro para vacíos
    const intensity = count / maxCount;
    // Escala de azul
    return `rgba(37, 99, 235, ${0.2 + intensity * 0.8})`;
  };

  return (
    <div className="heatmap-chart">
      <div className="chart-header">
        <span className="chart-title">Co-ocurrencia dominios</span>
        <span className="chart-subtitle">{sourcesWithData.length} fuente × {targetsWithData.length} meta (con datos)</span>
      </div>
      <div className="heatmap-matrix">
        {/* Header row with target domain labels */}
        <div className="heatmap-corner"></div>
        <div className="heatmap-x-header">
          <span className="x-axis-title">Dominios Meta →</span>
          <div className="heatmap-x-labels">
            {displayTargets.map((t, i) => (
              <span key={i} className="x-label" title={t}>{t.length > 10 ? t.slice(0, 10) + "…" : t}</span>
            ))}
          </div>
        </div>
        
        {/* Body with Y labels and grid */}
        <div className="heatmap-y-header">
          <span className="y-axis-title">← Dominios Fuente</span>
          <div className="heatmap-y-labels">
            {displaySources.map((s, i) => (
              <span key={i} className="y-label" title={s}>{s.length > 14 ? s.slice(0, 14) + "…" : s}</span>
            ))}
          </div>
        </div>
        
        <div className="heatmap-container">
          <div className="heatmap-grid" style={{ gridTemplateColumns: `repeat(${displayTargets.length}, 1fr)` }}>
            {displaySources.map(source =>
              displayTargets.map(target => {
                const cell = data.matrix[source]?.[target];
                const count = cell?.count || 0;
                return (
                  <div
                    key={`${source}-${target}`}
                    className={`heatmap-cell ${count > 0 ? 'has-value' : ''}`}
                    style={{ backgroundColor: getColor(count) }}
                    title={`${source} → ${target}: ${count} expresiones`}
                  >
                    {count > 0 && <span className="cell-count">{count}</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      <div className="heatmap-legend">
        <span className="legend-min">0</span>
        <div className="heatmap-gradient" />
        <span className="legend-max">{maxCount}</span>
      </div>
    </div>
  );
}

// Main Statistics Dashboard Component
export function StatisticsDashboard({
  corpus,
  stats,
  sourceDomains,
  targetDomains,
  topMetaphors,
  typologyDistribution,
  densityData,
  proximityData,
  domainMatrix,
}: StatisticsDashboardProps) {
  const { t } = useLanguage();
  const totalExpressions = stats?.estadisticas_agregadas?.numero_registros ?? 0;

  return (
    <div className="statistics-page">
      <header className="statistics-header">
        <span className="section-tag">ANALÍTICA</span>
        <h1>Estadísticas y gráficos</h1>
        <p className="subtitle">
          Ocho visualizaciones incluyendo densidad metafórica por Orden y scatter
          de proximidad textual.
        </p>
      </header>

      <div className="statistics-grid">
        {/* Top Row: Source and Target Domains */}
        <div className="stats-row two-columns">
          <div className="stats-card">
            <HorizontalBarChart
              data={sourceDomains}
              color={SOURCE_COLOR}
              label="Top dominios fuente"
            />
          </div>
          <div className="stats-card">
            <HorizontalBarChart
              data={targetDomains}
              color={TARGET_COLOR}
              label="Top dominios meta"
            />
          </div>
        </div>

        {/* Second Row: Top Metaphors and Typology */}
        <div className="stats-row two-columns">
          <div className="stats-card">
            <MetaphorBarChart
              data={topMetaphors}
              label="Top 10 metáforas conceptuales"
            />
          </div>
          <div className="stats-card">
            <DonutChart
              data={typologyDistribution}
              total={totalExpressions}
              label="Tipología"
            />
          </div>
        </div>

        {/* Third Row: Density Chart (full width) */}
        <div className="stats-row full-width">
          <div className="stats-card">
            <DensityChart data={densityData} />
          </div>
        </div>

        {/* Fourth Row: Scatter Chart (full width) */}
        <div className="stats-row full-width">
          <div className="stats-card">
            <ScatterChart data={proximityData} />
          </div>
        </div>

        {/* Fifth Row: Heatmap Chart (full width) */}
        <div className="stats-row full-width">
          <div className="stats-card">
            <HeatmapChart data={domainMatrix} />
          </div>
        </div>
      </div>
    </div>
  );
}
