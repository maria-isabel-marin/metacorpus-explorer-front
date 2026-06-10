"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { useState } from "react";

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

// Placeholder honestos para visualizaciones que requieren endpoint dedicado
function ChartComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="chart-coming-soon">
      <div className="chart-header">
        <span className="chart-title">{title}</span>
      </div>
      <div className="chart-coming-soon-body">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-4 4 4 4-4" />
        </svg>
        <p>{description}</p>
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
            <ChartComingSoon
              title="Densidad metafórica por Orden"
              description="Requiere endpoint de expresiones con campo orden. Disponible en próxima versión."
            />
          </div>
        </div>

        {/* Fourth Row: Scatter and Heatmap */}
        <div className="stats-row two-columns">
          <div className="stats-card">
            <ChartComingSoon
              title="Scatter de proximidad"
              description="Requiere agrupación de expresiones por metáfora y orden textual."
            />
          </div>
          <div className="stats-card">
            <ChartComingSoon
              title="Heatmap fuente × meta"
              description="Requiere conteo de co-ocurrencias entre dominios fuente y meta."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
