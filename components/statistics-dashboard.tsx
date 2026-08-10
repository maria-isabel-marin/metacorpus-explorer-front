"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { DensityData, ProximityData, DomainMatrixData } from "@/lib/api";
import { downloadHtmlAsSvg } from "@/lib/download-svg";

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
const DEFAULT_SOURCE_COLOR = "#3b5998";
const DEFAULT_TARGET_COLOR = "#a0522d";
const DEFAULT_DENSITY_TYPOLOGY_COLORS: Record<string, string> = {
  Estructural: "#2563eb",
  Ontologica: "#dc2626",
  Orientacional: "#16a34a",
  OTRA: "#6b7280",
};
const DEFAULT_PALETTE = ["#3b5998", "#a0522d", "#4a7c59", "#d4a574", "#6b7280", "#9333ea", "#0891b2", "#dc2626"];
const DEFAULT_HEATMAP_COLOR = "#2563eb";
const DEFAULT_METAPHOR_COLOR = "#ea580c";

// Deterministic color for a typology slice beyond the seed palette
function getPaletteColor(index: number): string {
  if (index < DEFAULT_PALETTE.length) return DEFAULT_PALETTE[index];
  const hue = (index * 47) % 360;
  return `hsl(${hue}, 65%, 50%)`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

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
  const { t } = useLanguage();
  const maxValue = Math.max(...data.map((d) => d.frecuencia), 1);

  return (
    <div className="bar-chart">
      <div className="chart-header">
        <span className="chart-title">{label}</span>
        <span className="chart-subtitle">{t.statistics?.frequency || "frecuencia"}</span>
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

// Metaphor Bar Chart — coloreado por número de expresiones (un solo color)
function MetaphorBarChart({
  data,
  label,
  color,
}: {
  data: MetaphorStat[];
  label: string;
  color: string;
}) {
  const { t } = useLanguage();
  const maxValue = Math.max(...data.map((d) => d.total_expresiones), 1);

  return (
    <div className="bar-chart metaphor-chart">
      <div className="chart-header">
        <span className="chart-title">{label}</span>
        <span className="chart-subtitle">{t.statistics?.byExpressions || "por número de expresiones"}</span>
      </div>
      <div className="bar-list">
        {data.map((item) => (
          <div key={item.nombre} className="bar-item">
            <span className="bar-label metaphor-name" title={item.nombre}>
              {item.nombre}
            </span>
            <div className="bar-wrapper">
              <div
                className="bar"
                style={{
                  width: `${(item.total_expresiones / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <span className="bar-value">{item.total_expresiones}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Donut Chart Component for Typology — colores dinámicos por tipología real
function DonutChart({
  data,
  total,
  label,
  colors,
}: {
  data: TypologyStat[];
  total: number;
  label: string;
  colors: Record<string, string>;
}) {
  const { t } = useLanguage();
  if (data.length === 0) {
    return (
      <div className="donut-chart-container">
        <div className="chart-header">
          <span className="chart-title">{label}</span>
          <span className="chart-subtitle">{t.statistics?.distribution || "distribución"}</span>
        </div>
        <p className="chart-empty">{t.statistics?.noTypologyData || "Sin datos de tipología"}</p>
      </div>
    );
  }

  const colored = data.map((d) => ({ ...d, color: colors[d.nombre] || "#6b7280" }));
  const totalValue = colored.reduce((s, d) => s + d.total, 0);
  let currentAngle = 0;

  return (
    <div className="donut-chart-container">
      <div className="chart-header">
        <span className="chart-title">{label}</span>
        <span className="chart-subtitle">{t.statistics?.distribution || "distribución"}</span>
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
          <text x="50" y="58" textAnchor="middle" className="donut-center-label">{t.statistics?.expressions || "expresiones"}</text>
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
function DensityChart({ data, typologyColors }: { data: DensityData | null | undefined; typologyColors: Record<string, string> }) {
  const { t } = useLanguage();
  if (!data || data.buckets.length === 0) {
    return (
      <div className="chart-coming-soon">
        <div className="chart-header">
          <span className="chart-title">{t.statistics?.densityTitle || "Densidad metafórica por orden"}</span>
        </div>
        <div className="chart-coming-soon-body">
          <p>{t.statistics?.noDensityData || "Sin datos de densidad disponibles"}</p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.buckets.map(b => b.count), 1);

  // Orden fijo de tipologías para consistencia visual
  const typologyOrder = ["Estructural", "Ontologica", "Orientacional", "OTRA"];
  const typologyLabels: Record<string, string> = {
    Estructural: t.map?.structuralFull || "Estructural",
    Ontologica: t.map?.ontologicalFull || "Ontológica",
    Orientacional: t.map?.orientationalFull || "Orientacional",
    OTRA: t.statistics?.other || "Otra",
  };

  return (
    <div className="density-chart">
      <div className="chart-header">
        <span className="chart-title">{t.statistics?.densityTitle || "Densidad metafórica por orden"}</span>
        <span className="chart-subtitle">{data.total_expressions} {t.statistics?.expressions || "expresiones"} · {data.buckets.length} {t.statistics?.buckets || "intervalos"}</span>
      </div>
      <div className="density-bars">
        {data.buckets.map((bucket) => {
          const height = bucket.count > 0 ? (bucket.count / maxCount) * 150 : 2;
          return (
            <div key={bucket.range} className="density-bar-wrapper" title={`${bucket.range}: ${bucket.count} ${t.statistics?.expressions || "expresiones"}`}>
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
            <span className="legend-label">{typologyLabels[tipo] || tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Proximity Histogram - Más interpretable: muestra densidad móvil de metáforas
function ScatterChart({ data, typologyColors }: { data: ProximityData | null | undefined; typologyColors: Record<string, string> }) {
  const { t } = useLanguage();
  if (!data || data.data.length === 0) {
    return (
      <div className="chart-coming-soon">
        <div className="chart-header">
          <span className="chart-title">{t.statistics?.textDistribution || "Distribución de metáforas en el texto"}</span>
        </div>
        <div className="chart-coming-soon-body">
          <p>{t.statistics?.noData || "Sin datos disponibles"}</p>
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

  const typologyLabels: Record<string, string> = {
    Estructural: t.map?.structuralFull || "Estructural",
    Ontologica: t.map?.ontologicalFull || "Ontológica",
    Orientacional: t.map?.orientationalFull || "Orientacional",
    OTRA: t.statistics?.other || "Otra",
  };

  return (
    <div className="proximity-histogram">
      <div className="chart-header">
        <span className="chart-title">{t.statistics?.textDistribution || "Distribución de metáforas en el texto"}</span>
        <span className="chart-subtitle">{data.total_points.toLocaleString()} {t.statistics?.expressions || "expresiones"} · {t.statistics?.window || "ventana"} ±{data.range}</span>
      </div>
      <div className="histogram-container">
        <div className="histogram-bars">
          {bins.map((bin, i) => {
            const height = bin.count > 0 ? (bin.count / maxCount) * 200 : 2;
            return (
              <div key={i} className="histogram-bar-wrapper" title={`${t.statistics?.position || "Posición"} ${bin.start}-${bin.end}: ${bin.count} ${t.statistics?.expressions || "expresiones"}`}>
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
        <span>← {t.statistics?.textPosition || "Posición en el texto (progresión del corpus)"} →</span>
      </div>
      <div className="histogram-legend">
        {Object.entries(typologyColors).map(([tipo, color]) => (
          <div key={tipo} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: color }} />
            <span className="legend-label">{typologyLabels[tipo] || tipo}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Heatmap Chart Component - Dominio fuente × meta
function HeatmapChart({ data, baseColor }: { data: DomainMatrixData | null | undefined; baseColor: string }) {
  const { t } = useLanguage();
  if (!data || data.source_domains.length === 0 || data.target_domains.length === 0) {
    return (
      <div className="chart-coming-soon">
        <div className="chart-header">
          <span className="chart-title">{t.statistics?.heatmapTitle || "Heatmap fuente × meta"}</span>
        </div>
        <div className="chart-coming-soon-body">
          <p>{t.statistics?.noMatrixData || "Sin datos de matriz disponibles"}</p>
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

  const { r, g, b } = hexToRgb(baseColor);
  const getColor = (count: number) => {
    if (count === 0) return "#f1f5f9"; // Gris muy claro para vacíos
    const intensity = count / maxCount;
    return `rgba(${r}, ${g}, ${b}, ${0.2 + intensity * 0.8})`;
  };

  return (
    <div className="heatmap-chart">
      <div className="chart-header">
        <span className="chart-title">{t.statistics?.cooccurrenceDomains || "Coocurrencia de dominios"}</span>
        <span className="chart-subtitle">{sourcesWithData.length} {t.statistics?.sourceDomains || "fuente"} × {targetsWithData.length} {t.statistics?.targetDomains || "meta"} ({t.statistics?.withData || "con datos"})</span>
      </div>
      <div className="heatmap-matrix">
        {/* Header row with target domain labels */}
        <div className="heatmap-corner"></div>
        <div className="heatmap-x-header">
          <span className="x-axis-title">{t.statistics?.targetDomainsAxis || "Dominios meta"} →</span>
          <div className="heatmap-x-labels">
            {displayTargets.map((t, i) => (
              <span key={i} className="x-label" title={t}>{t.length > 10 ? t.slice(0, 10) + "…" : t}</span>
            ))}
          </div>
        </div>
        
        {/* Body with Y labels and grid */}
        <div className="heatmap-y-header">
          <span className="y-axis-title">← {t.statistics?.sourceDomainsAxis || "Dominios fuente"}</span>
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
                    title={`${source} → ${target}: ${count} ${t.statistics?.expressions || "expresiones"}`}
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

function ExportableStatsCard({
  children,
  filename,
  controls,
}: {
  children: ReactNode;
  filename: string;
  controls?: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={cardRef} className="stats-card chart-download-wrap">
      <button
        className="chart-download-btn"
        data-chart-download
        onClick={() => {
          if (cardRef.current) downloadHtmlAsSvg(cardRef.current, filename);
        }}
        title="SVG"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        SVG
      </button>
      {controls && (
        <div className="chart-own-controls" data-chart-download>
          {controls}
        </div>
      )}
      {children}
    </div>
  );
}

const TOP_LIMITS = [5, 10, 20] as const;

// Per-chart "Top N" selector
function TopSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useLanguage();

  const handleCustom = (raw: string) => {
    const limit = Number(raw);
    if (Number.isSafeInteger(limit) && limit > 0) {
      onChange(limit);
    }
  };

  return (
    <div className="chart-top-selector">
      <span className="chart-top-label">{t.statistics?.show || "Mostrar"}</span>
      <div className="chart-top-buttons">
        {TOP_LIMITS.map((limit) => (
          <button
            key={limit}
            type="button"
            className={value === limit ? "active" : ""}
            onClick={() => onChange(limit)}
          >
            Top {limit}
          </button>
        ))}
      </div>
      <label className="chart-top-custom">
        <span>{t.statistics?.customTop || "Top personalizado"}</span>
        <input
          type="number"
          min="1"
          step="1"
          value={value}
          onChange={(event) => handleCustom(event.target.value)}
          aria-label={t.statistics?.customTop || "Top personalizado"}
        />
      </label>
    </div>
  );
}

// Per-chart color swatch control
function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="sankey-color-control">
      <span>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
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
  const [topLimitSource, setTopLimitSource] = useState(10);
  const [topLimitTarget, setTopLimitTarget] = useState(10);
  const [topLimitMetaphors, setTopLimitMetaphors] = useState(10);
  const totalExpressions = stats?.estadisticas_agregadas?.numero_registros ?? 0;
  const [sourceColor, setSourceColor] = useState(DEFAULT_SOURCE_COLOR);
  const [targetColor, setTargetColor] = useState(DEFAULT_TARGET_COLOR);
  const [typologyColors, setTypologyColors] = useState<Record<string, string>>(DEFAULT_DENSITY_TYPOLOGY_COLORS);
  const [typologyPaletteOverrides, setTypologyPaletteOverrides] = useState<Record<string, string>>({});
  const [heatmapColor, setHeatmapColor] = useState(DEFAULT_HEATMAP_COLOR);
  const [metaphorColor, setMetaphorColor] = useState(DEFAULT_METAPHOR_COLOR);

  const setTypologyColor = (key: string, color: string) => {
    setTypologyColors((prev) => ({ ...prev, [key]: color }));
  };

  // Paleta dinámica: una entrada por tipología realmente presente en los datos
  const typologyPalette = useMemo(() => {
    const map: Record<string, string> = {};
    typologyDistribution.forEach((item, index) => {
      map[item.nombre] = typologyPaletteOverrides[item.nombre] ?? getPaletteColor(index);
    });
    return map;
  }, [typologyDistribution, typologyPaletteOverrides]);

  const setTypologyPaletteColor = (nombre: string, color: string) => {
    setTypologyPaletteOverrides((prev) => ({ ...prev, [nombre]: color }));
  };

  const typologyLabels: Record<string, string> = {
    Estructural: t.map?.structuralFull || "Estructural",
    Ontologica: t.map?.ontologicalFull || "Ontológica",
    Orientacional: t.map?.orientationalFull || "Orientacional",
    OTRA: t.statistics?.other || "Otra",
  };

  return (
    <div className="statistics-page">
      <header className="statistics-header">
        <span className="section-tag">{t.statistics?.eyebrow || "ANALÍTICA"}</span>
        <h1>{t.statistics?.title || "Estadísticas y gráficos"}</h1>
        <p className="subtitle">{t.statistics?.description || "Siete visualizaciones de la estructura metafórica del corpus."}</p>
      </header>

      <div className="statistics-grid">
        {/* Top Row: Source and Target Domains */}
        <div className="stats-row two-columns">
          <ExportableStatsCard
            filename="top-source-domains.svg"
            controls={
              <>
                <TopSelector value={topLimitSource} onChange={setTopLimitSource} />
                <div className="chart-color-controls">
                  <ColorControl label={t.map?.sourceDomain || "Fuente"} value={sourceColor} onChange={setSourceColor} />
                </div>
              </>
            }
          >
            <HorizontalBarChart
              data={sourceDomains.slice(0, topLimitSource)}
              color={sourceColor}
              label={`Top ${topLimitSource} ${t.statistics?.sourceDomains || "dominios fuente"}`}
            />
          </ExportableStatsCard>
          <ExportableStatsCard
            filename="top-target-domains.svg"
            controls={
              <>
                <TopSelector value={topLimitTarget} onChange={setTopLimitTarget} />
                <div className="chart-color-controls">
                  <ColorControl label={t.map?.targetDomain || "Meta"} value={targetColor} onChange={setTargetColor} />
                </div>
              </>
            }
          >
            <HorizontalBarChart
              data={targetDomains.slice(0, topLimitTarget)}
              color={targetColor}
              label={`Top ${topLimitTarget} ${t.statistics?.targetDomains || "dominios meta"}`}
            />
          </ExportableStatsCard>
        </div>

        {/* Second Row: Top Metaphors and Typology */}
        <div className="stats-row two-columns">
          <ExportableStatsCard
            filename="top-conceptual-metaphors.svg"
            controls={
              <>
                <TopSelector value={topLimitMetaphors} onChange={setTopLimitMetaphors} />
                <div className="chart-color-controls">
                  <ColorControl label={t.statistics?.conceptualMetaphors || "Metáforas"} value={metaphorColor} onChange={setMetaphorColor} />
                </div>
              </>
            }
          >
            <MetaphorBarChart
              data={topMetaphors.slice(0, topLimitMetaphors)}
              label={`Top ${topLimitMetaphors} ${t.statistics?.conceptualMetaphors || "metáforas conceptuales"}`}
              color={metaphorColor}
            />
          </ExportableStatsCard>
          <ExportableStatsCard
            filename="typology-distribution.svg"
            controls={
              <div className="chart-color-controls">
                {typologyDistribution.map((item) => (
                  <ColorControl
                    key={item.nombre}
                    label={item.nombre}
                    value={typologyPalette[item.nombre]}
                    onChange={(value) => setTypologyPaletteColor(item.nombre, value)}
                  />
                ))}
              </div>
            }
          >
            <DonutChart
              data={typologyDistribution}
              total={totalExpressions}
              label={t.statistics?.typology || "Tipología"}
              colors={typologyPalette}
            />
          </ExportableStatsCard>
        </div>

        {/* Third Row: Density Chart (full width) */}
        <div className="stats-row full-width">
          <ExportableStatsCard
            filename="metaphorical-density.svg"
            controls={
              <div className="chart-color-controls">
                {Object.entries(typologyColors).map(([key, color]) => (
                  <ColorControl
                    key={key}
                    label={typologyLabels[key] || key}
                    value={color}
                    onChange={(value) => setTypologyColor(key, value)}
                  />
                ))}
              </div>
            }
          >
            <DensityChart data={densityData} typologyColors={typologyColors} />
          </ExportableStatsCard>
        </div>

        {/* Fourth Row: Scatter Chart (full width) */}
        <div className="stats-row full-width">
          <ExportableStatsCard
            filename="metaphor-distribution.svg"
            controls={
              <div className="chart-color-controls">
                {Object.entries(typologyColors).map(([key, color]) => (
                  <ColorControl
                    key={key}
                    label={typologyLabels[key] || key}
                    value={color}
                    onChange={(value) => setTypologyColor(key, value)}
                  />
                ))}
              </div>
            }
          >
            <ScatterChart data={proximityData} typologyColors={typologyColors} />
          </ExportableStatsCard>
        </div>

        {/* Fifth Row: Heatmap Chart (full width) */}
        <div className="stats-row full-width">
          <ExportableStatsCard
            filename="domain-cooccurrence.svg"
            controls={
              <div className="chart-color-controls">
                <ColorControl label="Heatmap" value={heatmapColor} onChange={setHeatmapColor} />
              </div>
            }
          >
            <HeatmapChart data={domainMatrix} baseColor={heatmapColor} />
          </ExportableStatsCard>
        </div>
      </div>
    </div>
  );
}
