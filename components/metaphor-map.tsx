"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";

type MetaphorMapProps = {
  corpus: CorpusSummary;
  metaphors: ConceptualMetaphor[];
  stats: {
    domains: number;
    metaphors: number;
    edges: number;
  };
  activeTypology: string;
};

type ViewType = "radial" | "chord" | "force";

const typologyColors: Record<string, string> = {
  "ESTRUCTURAL": "#64748b", // slate
  "ONTOLOGICA": "#dc2626", // red
  "ORIENTACIONAL": "#16a34a", // green
  "OTRA": "#8b5cf6", // purple
};

export function MetaphorMap({ corpus, metaphors, stats, activeTypology }: MetaphorMapProps) {
  const { t } = useLanguage();
  const [viewType, setViewType] = useState<ViewType>("radial");
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Extract unique domains and build connections - LIMIT to top domains
  const { domains, connections } = useMemo(() => {
    const domainSet = new Map<string, { 
      name: string; 
      type: "source" | "target"; 
      count: number;
      macroCategory: string;
    }>();
    const connMap = new Map<string, { 
      source: string; 
      target: string; 
      count: number;
      typology: string;
    }>();

    for (const m of metaphors) {
      // Add source domain
      if (m.sourceDomain && m.sourceDomain !== "—") {
        const existing = domainSet.get(`s:${m.sourceDomain}`);
        domainSet.set(`s:${m.sourceDomain}`, {
          name: m.sourceDomain,
          type: "source",
          count: (existing?.count || 0) + m.expressions,
          macroCategory: "Cuerpo y mundo físico",
        });
      }

      // Add target domain
      if (m.targetDomain && m.targetDomain !== "—") {
        const existing = domainSet.get(`t:${m.targetDomain}`);
        domainSet.set(`t:${m.targetDomain}`, {
          name: m.targetDomain,
          type: "target",
          count: (existing?.count || 0) + m.expressions,
          macroCategory: "Mundo mental",
        });
      }

      // Add connection
      if (m.sourceDomain && m.targetDomain && m.sourceDomain !== "—" && m.targetDomain !== "—") {
        const key = `${m.sourceDomain}|||${m.targetDomain}`;
        const existing = connMap.get(key);
        connMap.set(key, {
          source: m.sourceDomain,
          target: m.targetDomain,
          count: (existing?.count || 0) + m.expressions,
          typology: m.typology,
        });
      }
    }

    // Sort by count and take top 15 of each type to avoid saturation
    const allDomains = Array.from(domainSet.values());
    const sourceDomains = allDomains
      .filter(d => d.type === "source")
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    const targetDomains = allDomains
      .filter(d => d.type === "target")
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
    
    const selectedDomainNames = new Set([...sourceDomains, ...targetDomains].map(d => d.name));

    // Filter connections to only include selected domains
    const filteredConnections = Array.from(connMap.values())
      .filter(c => selectedDomainNames.has(c.source) && selectedDomainNames.has(c.target));

    return {
      domains: [...sourceDomains, ...targetDomains],
      connections: filteredConnections,
    };
  }, [metaphors]);

  // Position domains in a circle
  const positionedDomains = useMemo(() => {
    const sourceDomains = domains.filter(d => d.type === "source");
    const targetDomains = domains.filter(d => d.type === "target");
    
    const cx = 400;
    const cy = 350;
    const radius = 320; // Increased radius for better spacing
    
    const positioned: Array<{
      name: string;
      type: "source" | "target";
      count: number;
      macroCategory: string;
      x: number;
      y: number;
      angle: number;
    }> = [];
    
    // Position source domains on left side
    sourceDomains.forEach((d, i) => {
      const angle = Math.PI + (Math.PI / 2) * ((i + 0.5) / sourceDomains.length) - Math.PI / 4;
      positioned.push({
        name: d.name,
        type: d.type,
        count: d.count,
        macroCategory: d.macroCategory,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle,
      });
    });
    
    // Position target domains on right side
    targetDomains.forEach((d, i) => {
      const angle = (Math.PI / 2) * ((i + 0.5) / targetDomains.length) - Math.PI / 4;
      positioned.push({
        name: d.name,
        type: d.type,
        count: d.count,
        macroCategory: d.macroCategory,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle,
      });
    });
    
    return positioned;
  }, [domains]);

  const domainPositions = new Map(positionedDomains.map(d => [d.name, d]));

  const downloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `metaphor-map-${corpus.slug}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const truncateDomainName = (name: string, maxLen = 18) => {
    if (name.length <= maxLen) return name;
    // Try to break at word boundary
    const truncated = name.slice(0, maxLen);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 10) {
      return truncated.slice(0, lastSpace) + "...";
    }
    return truncated + "...";
  };

  const getTypologyShort = (typology: string) => {
    const map: Record<string, string> = {
      "ESTRUCTURAL": "ESTR",
      "ONTOLOGICA": "ONTO",
      "ORIENTACIONAL": "ORIE",
      "OTRA": "OTRA",
    };
    return map[typology] || typology.slice(0, 4);
  };

  return (
    <main className="map-shell">
      {/* Header */}
      <header className="map-header">
        <p className="map-eyebrow">{t.map?.eyebrow || "VISUALIZACIÓN"}</p>
        <h1 className="map-title">
          {t.map?.title || "Mapa de"} <em>metáforas</em>
        </h1>
        <p className="map-description">
          {t.map?.description ||
            "Conexiones dominio-fuente ↔ dominio-meta. Inspirado en Mapping Metaphor (Glasgow). Pasa el cursor sobre un dominio para resaltar sus conexiones."}
        </p>
      </header>

      {/* Controls */}
      <div className="map-controls">
        <div className="map-view-tabs">
          {["radial", "chord", "force"].map((view) => (
            <button
              key={view}
              className={`map-view-tab ${viewType === view ? "active" : ""}`}
              onClick={() => setViewType(view as ViewType)}
            >
              {view.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="map-filter-tabs">
          {[
            { key: "todas", label: t.map?.all || "TODAS" },
            { key: "estr", label: t.map?.structural || "ESTR" },
            { key: "onto", label: t.map?.ontological || "ONTO" },
            { key: "orie", label: t.map?.orientational || "ORIE" },
          ].map((filter) => (
            <Link
              key={filter.key}
              href={`/corpus/${corpus.slug}/map${filter.key === "todas" ? "" : `?tipo=${filter.key}`}`}
              className={`map-filter-tab ${activeTypology === filter.key ? "active" : ""}`}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <div className="map-macro-legend">
          <span className="map-macro-item">
            <span className="map-macro-dot" style={{ background: "#8b5a2b" }} />
            {t.map?.physical || "CUERPO Y MUNDO FÍSICO"}
          </span>
          <span className="map-macro-item">
            <span className="map-macro-dot" style={{ background: "#3b82f6" }} />
            {t.map?.mental || "MUNDO MENTAL"}
          </span>
          <span className="map-macro-item">
            <span className="map-macro-dot" style={{ background: "#dc2626" }} />
            {t.map?.social || "MUNDO SOCIAL"}
          </span>
          <span className="map-macro-item">
            <span className="map-macro-dot" style={{ background: "#16a34a" }} />
            {t.map?.natural || "MUNDO NATURAL"}
          </span>
        </div>

        <button className="map-download-btn" onClick={downloadSVG}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          SVG
        </button>
      </div>

      {/* Visualization */}
      <div className="map-visualization">
        <svg
          ref={svgRef}
          className="map-svg"
          viewBox="0 0 800 700"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="map-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width="800" height="700" fill="transparent" />

          {/* Connection lines */}
          {connections.map((conn, idx) => {
            const sourcePos = domainPositions.get(conn.source);
            const targetPos = domainPositions.get(conn.target);
            if (!sourcePos || !targetPos) return null;

            const isHighlighted = 
              !hoveredDomain || 
              hoveredDomain === conn.source || 
              hoveredDomain === conn.target;

            const color = typologyColors[conn.typology] || "#94a3b8";

            return (
              <line
                key={idx}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={color}
                strokeWidth={1 + Math.log(conn.count + 1) * 0.5}
                opacity={isHighlighted ? 0.4 : 0.05}
                style={{ transition: "opacity 0.3s" }}
              />
            );
          })}

          {/* Domain nodes */}
          {positionedDomains.map((domain) => {
            const isHovered = hoveredDomain === domain.name;
            const hasConnection = connections.some(
              c => c.source === domain.name || c.target === domain.name
            );
            
            // Color based on macro category (simplified)
            const macroColors: Record<string, string> = {
              "Cuerpo y mundo físico": "#8b5a2b",
              "Mundo mental": "#3b82f6",
              "Mundo social": "#dc2626",
              "Mundo natural": "#16a34a",
            };
            const color = macroColors[domain.macroCategory] || "#64748b";

            return (
              <g
                key={domain.name}
                onMouseEnter={() => setHoveredDomain(domain.name)}
                onMouseLeave={() => setHoveredDomain(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Node circle */}
                <circle
                  cx={domain.x}
                  cy={domain.y}
                  r={6 + Math.log(domain.count + 1)}
                  fill={color}
                  stroke="white"
                  strokeWidth={isHovered ? 3 : 2}
                  filter={isHovered ? "url(#map-glow)" : undefined}
                  opacity={!hoveredDomain || isHovered || hasConnection ? 1 : 0.2}
                  style={{ transition: "all 0.3s" }}
                />
                
                {/* Label - always visible but highlighted on hover */}
                <text
                  x={domain.x + (domain.x < 400 ? -12 : 12)}
                  y={domain.y + 4}
                  textAnchor={domain.x < 400 ? "end" : "start"}
                  className="map-domain-label"
                  fill={isHovered ? "var(--primary)" : "var(--text)"}
                  fontWeight={isHovered ? 600 : 500}
                  fontSize={isHovered ? 12 : 10}
                  opacity={!hoveredDomain || isHovered || hasConnection ? 1 : 0.3}
                  style={{ transition: "all 0.3s" }}
                >
                  {truncateDomainName(domain.name)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Side panel with stats and legend */}
        <div className="map-sidebar">
          <div className="map-typology-legend">
            <h4>{t.map?.edgeLegend || "LEYENDA DE ARISTAS"}</h4>
            <div className="map-typology-items">
              <span className="map-typology-item">
                <span className="map-edge-line" style={{ background: typologyColors["ESTRUCTURAL"] }} />
                {t.map?.structuralFull || "Estructural"}
              </span>
              <span className="map-typology-item">
                <span className="map-edge-line" style={{ background: typologyColors["ONTOLOGICA"] }} />
                {t.map?.ontologicalFull || "Ontológica"}
              </span>
              <span className="map-typology-item">
                <span className="map-edge-line" style={{ background: typologyColors["ORIENTACIONAL"] }} />
                {t.map?.orientationalFull || "Orientacional"}
              </span>
            </div>
          </div>

          <div className="map-expressions-control">
            <h4>{t.map?.minExpressions || "MÍN. EXPRESIONES"}</h4>
            <input type="range" min="0" max="100" defaultValue="0" className="map-range" />
            <span className="map-range-value">≥ 0 exp.</span>
          </div>

          <div className="map-stats">
            <h4>{t.map?.statistics || "ESTADÍSTICAS"}</h4>
            <div className="map-stat-items">
              <div className="map-stat-item">
                <span>{t.map?.domains || "Dominios"}</span>
                <strong>{stats.domains}</strong>
              </div>
              <div className="map-stat-item">
                <span>{t.map?.metaphors || "Metáforas"}</span>
                <strong>{stats.metaphors}</strong>
              </div>
              <div className="map-stat-item">
                <span>{t.map?.visibleEdges || "Aristas visibles"}</span>
                <strong>{stats.edges}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
