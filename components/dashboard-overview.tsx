"use client";

import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import type { ConceptualMetaphor } from "@/lib/metaphors";

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

type DashboardOverviewProps = {
  corpus: CorpusSummary;
  topMetaphors: ConceptualMetaphor[];
};

export function DashboardOverview({ corpus, topMetaphors }: DashboardOverviewProps) {

  return (
    <main className="dashboard-shell">
      {/* Header Section */}
      <section className="dashboard-header-section">
        <div className="dashboard-header-content">
          <p className="dashboard-eyebrow">CORPUS ACTIVO</p>
          <h1 className="dashboard-title">{corpus.name}</h1>
          <p className="dashboard-description">{corpus.description}</p>
        </div>

        <div className="dashboard-header-actions">
          <button className="dashboard-action-btn dashboard-action-btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Exportar corpus
          </button>
          <button className="dashboard-action-btn dashboard-action-btn-primary">
            Cómo citar
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <section className="dashboard-search-section">
        <div className="dashboard-search-box">
          <svg className="dashboard-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Buscar metáforas, dominios, focos, expresiones..."
            className="dashboard-search-input"
          />
          <button className="dashboard-search-shortcut">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Stats Grid - 6 metrics */}
      <section className="dashboard-stats-grid" aria-label="Estadísticas del corpus">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">EXPRESIONES</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.expressions)}</strong>
          <span className="dashboard-stat-subtitle">MIPVU · 20 campos</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">METÁFORAS CONC.</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.metaphors)}</strong>
          <span className="dashboard-stat-subtitle">fórmulas X ES Y</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">DOMINIOS FUENTE</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.sourceDomains)}</strong>
          <span className="dashboard-stat-subtitle">normalizados</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">DOMINIOS META</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.targetDomains)}</strong>
          <span className="dashboard-stat-subtitle">normalizados</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">FUENTES TEXTUALES</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.textualSources)}</strong>
          <span className="dashboard-stat-subtitle">documentos</span>
        </article>

        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">TIPOLOGÍAS</p>
          <strong className="dashboard-stat-value">{formatNumber(corpus.typologies)}</strong>
          <span className="dashboard-stat-subtitle">estructural, ont., ...</span>
        </article>
      </section>

      {/* Main Content - Map and Featured Metaphors */}
      <section className="dashboard-main-content">
        {/* Domain Map */}
        <article className="dashboard-map-card">
          <div className="dashboard-map-header">
            <h2>Mapa de dominios</h2>
            <Link href={`/corpus/${corpus.slug}/map`} className="dashboard-map-link">
              Abrir mapa completo →
            </Link>
          </div>
          <div className="dashboard-map-visualization">
            <RadialDomainMap />
          </div>
        </article>

        {/* Featured Metaphors */}
        <article className="dashboard-metaphors-card">
          <div className="dashboard-metaphors-header">
            <h2>Metáforas destacadas</h2>
            <span className="dashboard-metaphors-subtitle">ordenadas por frecuencia</span>
          </div>
          <ul className="dashboard-metaphors-list">
            {topMetaphors.map((metaphor) => (
              <li key={metaphor.id} className="dashboard-metaphor-item">
                <Link
                  href={`/corpus/${corpus.slug}/metaphors`}
                  className="dashboard-metaphor-link"
                >
                  <span className="dashboard-metaphor-formula">{metaphor.formula}</span>
                  <span className="dashboard-metaphor-count">{metaphor.expressions} expr.</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Bottom Cards */}
      <section className="dashboard-bottom-cards">
        <Link href={`/corpus/${corpus.slug}/metaphors?filter=source`} className="dashboard-explore-card">
          <div className="dashboard-explore-content">
            <h3>Explorar por dominio fuente</h3>
            <p>{corpus.sourceDomains} dominios</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link href={`/corpus/${corpus.slug}/metaphors?filter=target`} className="dashboard-explore-card">
          <div className="dashboard-explore-content">
            <h3>Explorar por dominio meta</h3>
            <p>{corpus.targetDomains} dominios</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>

        <Link href={`/corpus/${corpus.slug}/concordance`} className="dashboard-explore-card">
          <div className="dashboard-explore-content">
            <h3>Concordancia KWIC</h3>
            <p>búsqueda contextual</p>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </section>
    </main>
  );
}

// Placeholder Radial Domain Map Component
function RadialDomainMap() {
  // Generate placeholder nodes in a circle
  const nodeCount = 24;
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * 2 * Math.PI;
    const radius = 120;
    const x = 150 + radius * Math.cos(angle);
    const y = 150 + radius * Math.sin(angle);
    const colors = ["#8B4513", "#2E8B57", "#1E90FF", "#A0522D"];
    const color = colors[i % 4];
    return { id: i, x, y, color, angle };
  });

  // Generate connections between nodes
  const connections = [];
  for (let i = 0; i < nodeCount; i++) {
    for (let j = i + 1; j < nodeCount; j++) {
      if (Math.random() > 0.85) {
        connections.push({ from: i, to: j });
      }
    }
  }

  return (
    <svg className="radial-map-svg" viewBox="0 0 300 300">
      {/* Background circle */}
      <circle cx="150" cy="150" r="40" fill="none" stroke="#e0e0e0" strokeWidth="1" strokeDasharray="4,4" />

      {/* Connection lines */}
      {connections.map((conn, idx) => (
        <line
          key={idx}
          x1={nodes[conn.from].x}
          y1={nodes[conn.from].y}
          x2={nodes[conn.to].x}
          y2={nodes[conn.to].y}
          stroke="#d0d0d0"
          strokeWidth="1"
          opacity="0.6"
        />
      ))}

      {/* Central hub */}
      <circle cx="150" cy="150" r="8" fill="#666" />

      {/* Radial lines from center */}
      {nodes.map((node) => (
        <line
          key={`line-${node.id}`}
          x1="150"
          y1="150"
          x2={node.x}
          y2={node.y}
          stroke="#e0e0e0"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}

      {/* Domain nodes */}
      {nodes.map((node) => (
        <circle
          key={node.id}
          cx={node.x}
          cy={node.y}
          r="6"
          fill={node.color}
          stroke="white"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}
