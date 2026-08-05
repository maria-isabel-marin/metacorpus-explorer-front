"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";
import { SankeyChart } from "./sankey-chart";
import { NetworkGraph } from "./network-graph";
import { downloadSvgElement } from "@/lib/download-svg";

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

type TopView = "map" | "sankey" | "graph";
type FocusRole = "source" | "target";

const typologyColors: Record<string, string> = {
  "ESTRUCTURAL": "#64748b", // slate
  "ONTOLOGICA": "#dc2626", // red
  "ORIENTACIONAL": "#16a34a", // green
  "OTRA": "#8b5cf6", // purple
};

export function MetaphorMap({ corpus, metaphors, stats, activeTypology }: MetaphorMapProps) {
  const { t } = useLanguage();
  const [topView, setTopView] = useState<TopView>("map");
  const [focusRole, setFocusRole] = useState<FocusRole>("source");
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);
  const [minExpressions, setMinExpressions] = useState(0);
  const [sourceColor, setSourceColor] = useState("#3b82f6");
  const [targetColor, setTargetColor] = useState("#f59e0b");
  const [connectionColor, setConnectionColor] = useState("#334155");
  const [showArrows, setShowArrows] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  // Extract unique domains and build connections - LIMIT to top domains
  const { domains, connections, maxCount } = useMemo(() => {
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
    
    // Apply minExpressions filter
    const filteredSourceDomains = sourceDomains.filter(d => d.count >= minExpressions);
    const filteredTargetDomains = targetDomains.filter(d => d.count >= minExpressions);

    const selectedDomainNames = new Set([...filteredSourceDomains, ...filteredTargetDomains].map(d => d.name));

    // Filter connections to only include selected domains
    const filteredConnections = Array.from(connMap.values())
      .filter(c => selectedDomainNames.has(c.source) && selectedDomainNames.has(c.target));

    // Compute max expression count across top domains (before filter) for slider range
    const maxCount = Math.max(1, ...sourceDomains.map(d => d.count), ...targetDomains.map(d => d.count));

    return {
      domains: [...filteredSourceDomains, ...filteredTargetDomains],
      connections: filteredConnections,
      maxCount,
    };
  }, [metaphors, minExpressions]);

  // Position domains in a circle
  const positionedDomains = useMemo(() => {
    const sourceDomains = domains.filter(d => d.type === "source");
    const targetDomains = domains.filter(d => d.type === "target");
    const primaryDomains = focusRole === "source" ? sourceDomains : targetDomains;
    const secondaryDomains = focusRole === "source" ? targetDomains : sourceDomains;
    
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
    primaryDomains.forEach((d, i) => {
      const angle = Math.PI + (Math.PI / 2) * ((i + 0.5) / primaryDomains.length) - Math.PI / 4;
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
    secondaryDomains.forEach((d, i) => {
      const angle = (Math.PI / 2) * ((i + 0.5) / secondaryDomains.length) - Math.PI / 4;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains, focusRole]);

  const domainPositions = new Map(positionedDomains.map(d => [d.name, d]));

  const downloadSVG = () => {
    if (svgRef.current) downloadSvgElement(svgRef.current, `metaphor-map-${corpus.slug}.svg`);
  };

  const getNodeRadius = (count: number) => 6 + Math.log(count + 1);

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
          {topView === "sankey"
            ? (t.map?.sankeyDescription || "Flujo de dominio fuente a dominio meta.")
            : (t.map?.description || "Conexiones dominio-fuente ↔ dominio-meta.")}
        </p>
      </header>

      {/* Top-level view tabs */}
      <div className="map-top-tabs">
        <button
          className={`map-top-tab ${topView === "map" ? "active" : ""}`}
          onClick={() => setTopView("map")}
        >
          {t.map?.viewMap || "Mapa radial"}
        </button>
        <button
          className={`map-top-tab ${topView === "sankey" ? "active" : ""}`}
          onClick={() => setTopView("sankey")}
        >
          {t.map?.viewSankey || "Sankey"}
        </button>
        <button
          className={`map-top-tab ${topView === "graph" ? "active" : ""}`}
          onClick={() => setTopView("graph")}
        >
          {t.map?.viewGraph || "Grafo dirigido"}
        </button>
      </div>

      <div className="visualization-focus-control">
        <span>{t.map?.focus || "Enfocar en"}</span>
        <button
          className={focusRole === "source" ? "active" : ""}
          onClick={() => setFocusRole("source")}
        >
          {t.map?.sourceDomain || "Dominio fuente"}
        </button>
        <button
          className={focusRole === "target" ? "active" : ""}
          onClick={() => setFocusRole("target")}
        >
          {t.map?.targetDomain || "Dominio meta"}
        </button>
      </div>

      {topView === "sankey" && <SankeyChart metaphors={metaphors} focusRole={focusRole} />}
      {topView === "graph" && <NetworkGraph metaphors={metaphors} focusRole={focusRole} />}

      {topView === "map" && <div className="map-controls">
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

        <div className="map-arrow-toggle">
          <span>{t.map?.arrowheads || "Punta de flecha"}</span>
          <button
            className={!showArrows ? "active" : ""}
            onClick={() => setShowArrows(false)}
          >
            {t.map?.noArrowhead || "Sin punta"}
          </button>
          <button
            className={showArrows ? "active" : ""}
            onClick={() => setShowArrows(true)}
          >
            {t.map?.withArrowhead || "Con flecha"}
          </button>
        </div>

        <div className="map-color-controls">
          <label className="map-color-control">
            <span>{t.map?.source || "Fuente"}</span>
            <input type="color" value={sourceColor} onChange={(event) => setSourceColor(event.target.value)} />
          </label>
          <label className="map-color-control">
            <span>{t.map?.target || "Meta"}</span>
            <input type="color" value={targetColor} onChange={(event) => setTargetColor(event.target.value)} />
          </label>
          <label className="map-color-control">
            <span>{t.map?.connectionColor || "Conexiones"}</span>
            <input type="color" value={connectionColor} onChange={(event) => setConnectionColor(event.target.value)} />
          </label>
        </div>

      </div>}

      {topView === "map" && <div className="map-visualization">
        <div className="chart-download-wrap">
        <button
          className="chart-download-btn"
          onClick={downloadSVG}
          title="SVG"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          SVG
        </button>
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
            <marker
              id="arrow-custom"
              markerWidth="10"
              markerHeight="10"
              refX="0"
              refY="5"
              orient="auto"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={connectionColor} />
            </marker>
          </defs>

          {/* Background */}
          <rect width="800" height="700" fill="transparent" />

          {/* Domain nodes - circles first */}
          {positionedDomains.map((domain) => {
            const isHovered = hoveredDomain === domain.name;
            const hasConnection = connections.some(
              c => c.source === domain.name || c.target === domain.name
            );
            
            const color = domain.type === "source" ? sourceColor : targetColor;

            return (
              <circle
                key={`node-${domain.name}`}
                cx={domain.x}
                cy={domain.y}
                r={6 + Math.log(domain.count + 1)}
                fill={color}
                stroke="white"
                strokeWidth={isHovered ? 3 : 2}
                filter={isHovered ? "url(#map-glow)" : undefined}
                opacity={!hoveredDomain || isHovered || hasConnection ? 1 : 0.2}
                style={{ cursor: "pointer", transition: "all 0.3s" }}
                onMouseEnter={() => setHoveredDomain(domain.name)}
                onMouseLeave={() => setHoveredDomain(null)}
              />
            );
          })}

          {/* Connection lines - drawn after nodes so arrowheads are visible */}
          {connections.map((conn, idx) => {
            const sourcePos = domainPositions.get(conn.source);
            const targetPos = domainPositions.get(conn.target);
            if (!sourcePos || !targetPos) return null;

            const isHighlighted =
              !hoveredDomain ||
              hoveredDomain === conn.source ||
              hoveredDomain === conn.target;

            let x1 = sourcePos.x;
            let y1 = sourcePos.y;
            let x2 = targetPos.x;
            let y2 = targetPos.y;

            if (showArrows) {
              const dx = targetPos.x - sourcePos.x;
              const dy = targetPos.y - sourcePos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > 0) {
                const ux = dx / dist;
                const uy = dy / dist;
                const sourceR = getNodeRadius(sourcePos.count);
                const targetR = getNodeRadius(targetPos.count);
                const gap = 2;
                x1 = sourcePos.x + ux * (sourceR + gap);
                y1 = sourcePos.y + uy * (sourceR + gap);
                x2 = targetPos.x - ux * (targetR + gap);
                y2 = targetPos.y - uy * (targetR + gap);
              }
            }

            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={connectionColor}
                strokeWidth={1 + Math.log(conn.count + 1) * 0.5}
                opacity={isHighlighted ? 0.4 : 0.05}
                markerEnd={showArrows ? "url(#arrow-custom)" : undefined}
                style={{ transition: "opacity 0.3s" }}
              />
            );
          })}

          {/* Domain node labels - drawn last to stay on top */}
          {positionedDomains.map((domain) => {
            const isHovered = hoveredDomain === domain.name;
            const hasConnection = connections.some(
              c => c.source === domain.name || c.target === domain.name
            );
            
            return (
              <text
                key={`label-${domain.name}`}
                x={domain.x + (domain.x < 400 ? -12 : 12)}
                y={domain.y + 4}
                textAnchor={domain.x < 400 ? "end" : "start"}
                className="map-domain-label"
                fill={isHovered ? "var(--primary)" : "var(--text)"}
                fontWeight={isHovered ? 600 : 500}
                fontSize={isHovered ? 12 : 10}
                opacity={!hoveredDomain || isHovered || hasConnection ? 1 : 0.3}
                style={{ transition: "all 0.3s", pointerEvents: "none" }}
              >
                {truncateDomainName(domain.name)}
              </text>
            );
          })}
        </svg>
        </div>

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
            <input
              type="range"
              min="0"
              max={maxCount}
              value={minExpressions}
              onChange={(e) => setMinExpressions(Number(e.target.value))}
              className="map-range"
            />
            <span className="map-range-value">≥ {minExpressions} exp.</span>
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
      </div>}
    </main>
  );
}
