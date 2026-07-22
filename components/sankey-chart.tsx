"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";
import { downloadSvgElement } from "@/lib/download-svg";

type SankeyChartProps = {
  metaphors: ConceptualMetaphor[];
  focusRole: "source" | "target";
};

type SankeyNode = {
  id: string;
  label: string;
  side: "source" | "target";
  value: number;
  isOther: boolean;
  y: number;
  height: number;
  color: string;
  x: number;
};

type SankeyLink = {
  source: string;
  target: string;
  value: number;
  typology: string;
  sourceY: number;
  targetY: number;
  thickness: number;
};

const TYPOLOGY_COLORS: Record<string, string> = {
  ESTRUCTURAL: "#64748b",
  ONTOLOGICA: "#dc2626",
  ORIENTACIONAL: "#16a34a",
  OTRA: "#8b5cf6",
};

const TYPOLOGY_LABELS: Record<string, string> = {
  ESTRUCTURAL: "Estructural",
  ONTOLOGICA: "Ontológica",
  ORIENTACIONAL: "Orientacional",
  OTRA: "Otra",
};

const SOURCE_COLOR = "#3b82f6";
const TARGET_COLOR = "#f59e0b";
const OTHER_COLOR = "#94a3b8";

const NODE_WIDTH = 16;
const NODE_GAP = 14;
const LABEL_GAP = 8;
const PADDING_TOP = 38; // extra room for SVG column headers
const PADDING_BOTTOM = 20;
const PADDING_H = 40; // chart bars pushed to the edges; labels flow inward
const NODE_H = 28; // fixed height per node

function typologyKey(typology?: string): string {
  return (typology ?? "OTRA")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function buildSankey(
  metaphors: ConceptualMetaphor[],
  typologyFilter: string,
  focusRole: "source" | "target",
  minConnections: number,
  width: number
): { nodes: SankeyNode[]; links: SankeyLink[]; height: number; maxConnections: number } {
  const filtered =
    (typologyFilter === "all"
      ? metaphors
      : metaphors.filter((m) => typologyKey(m.typology) === typologyFilter))
      .filter((m) => m.sourceDomain && m.sourceDomain !== "—" && m.targetDomain && m.targetDomain !== "—");
  const connectionMap = new Map<string, Set<string>>();

  for (const metaphor of filtered) {
    const focusDomain = focusRole === "source" ? metaphor.sourceDomain : metaphor.targetDomain;
    const connectedDomain = focusRole === "source" ? metaphor.targetDomain : metaphor.sourceDomain;
    if (!connectionMap.has(focusDomain)) connectionMap.set(focusDomain, new Set());
    connectionMap.get(focusDomain)!.add(connectedDomain);
  }

  const maxConnections = Math.max(0, ...Array.from(connectionMap.values()).map((connections) => connections.size));
  const visibleMetaphors = filtered.filter((metaphor) => {
    const focusDomain = focusRole === "source" ? metaphor.sourceDomain : metaphor.targetDomain;
    return (connectionMap.get(focusDomain)?.size ?? 0) >= minConnections;
  });

  const flowMap = new Map<string, { value: number; typology: string }>();
  const sourceValues = new Map<string, number>();
  const targetValues = new Map<string, number>();

  for (const m of visibleMetaphors) {
    const s = m.sourceDomain;
    const tgt = m.targetDomain;
    if (!s || s === "—" || !tgt || tgt === "—") continue;
    const key = `${s}||${tgt}`;
    const existing = flowMap.get(key);
    flowMap.set(key, {
      value: (existing?.value ?? 0) + m.expressions,
      typology: m.typology ?? "OTRA",
    });
    sourceValues.set(s, (sourceValues.get(s) ?? 0) + m.expressions);
    targetValues.set(tgt, (targetValues.get(tgt) ?? 0) + m.expressions);
  }

  if (sourceValues.size === 0) return { nodes: [], links: [], height: 400, maxConnections };

  const totalValue = Array.from(sourceValues.values()).reduce((a, b) => a + b, 0);

  // All nodes sorted by value desc — no grouping
  const sortedSource = Array.from(sourceValues.entries()).sort((a, b) => b[1] - a[1]);
  const sortedTarget = Array.from(targetValues.entries()).sort((a, b) => b[1] - a[1]);

  const maxNodes = Math.max(sortedSource.length, sortedTarget.length);
  const height = PADDING_TOP + PADDING_BOTTOM + maxNodes * (NODE_H + NODE_GAP);

  const sourceX = focusRole === "source" ? PADDING_H : width - PADDING_H - NODE_WIDTH;
  const targetX = focusRole === "source" ? width - PADDING_H - NODE_WIDTH : PADDING_H;

  const buildNodes = (
    entries: [string, number][],
    side: "source" | "target",
    x: number,
    color: string
  ): SankeyNode[] => {
    let cursor = PADDING_TOP;
    return entries.map(([name, value]) => {
      const node: SankeyNode = {
        id: `${side === "source" ? "s" : "t"}:${name}`,
        label: name,
        side,
        value,
        isOther: false,
        y: cursor,
        height: NODE_H,
        color,
        x,
      };
      cursor += NODE_H + NODE_GAP;
      return node;
    });
  };

  const sourceNodes = buildNodes(sortedSource, "source", sourceX, SOURCE_COLOR);
  const targetNodes = buildNodes(sortedTarget, "target", targetX, TARGET_COLOR);

  const sourceOffsets = new Map<string, number>(sourceNodes.map((n) => [n.id, n.y]));
  const targetOffsets = new Map<string, number>(targetNodes.map((n) => [n.id, n.y]));

  const links: SankeyLink[] = [];
  const sortedFlows = Array.from(flowMap.entries()).sort((a, b) => b[1].value - a[1].value);

  for (const [key, { value, typology }] of sortedFlows) {
    const [s, tgt] = key.split("||");
    const sNode = sourceNodes.find((n) => n.label === s);
    const tNode = targetNodes.find((n) => n.label === tgt);
    if (!sNode || !tNode || value === 0) continue;

    const thickness = Math.max(1.5, (value / totalValue) * (height - PADDING_TOP - PADDING_BOTTOM));
    const sOff = sourceOffsets.get(sNode.id) ?? sNode.y;
    const tOff = targetOffsets.get(tNode.id) ?? tNode.y;

    links.push({
      source: sNode.id,
      target: tNode.id,
      value,
      typology,
      sourceY: sOff + thickness / 2,
      targetY: tOff + thickness / 2,
      thickness,
    });

    sourceOffsets.set(sNode.id, sOff + thickness);
    targetOffsets.set(tNode.id, tOff + thickness);
  }

  return { nodes: [...sourceNodes, ...targetNodes], links, height, maxConnections };
}

function linkPath(
  sx: number,
  sy: number,
  tx: number,
  ty: number,
  thickness: number
): string {
  const cx1 = sx + (tx - sx) * 0.45;
  const cx2 = tx - (tx - sx) * 0.45;
  const half = thickness / 2;
  return [
    `M ${sx} ${sy - half}`,
    `C ${cx1} ${sy - half}, ${cx2} ${ty - half}, ${tx} ${ty - half}`,
    `L ${tx} ${ty + half}`,
    `C ${cx2} ${ty + half}, ${cx1} ${sy + half}, ${sx} ${sy + half}`,
    "Z",
  ].join(" ");
}

const TYPOLOGY_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "ESTRUCTURAL", label: "Estructural" },
  { key: "ONTOLOGICA", label: "Ontológica" },
  { key: "ORIENTACIONAL", label: "Orientacional" },
];

type TooltipData = {
  nodeId: string;
  label: string;
  connections: { label: string; value: number; side: "source" | "target" }[];
  x: number;
  y: number;
};

export function SankeyChart({ metaphors, focusRole }: SankeyChartProps) {
  const { t } = useLanguage();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [typologyFilter, setTypologyFilter] = useState("all");
  const [minConnections, setMinConnections] = useState(0);
  const [containerWidth, setContainerWidth] = useState(860);
  const containerRef = useRef<HTMLDivElement>(null);
  const sankeySvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 300) setContainerWidth(Math.floor(w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const WIDTH = containerWidth;

  const { nodes, links, height, maxConnections } = useMemo(
    () => buildSankey(metaphors, typologyFilter, focusRole, minConnections, WIDTH),
    [metaphors, typologyFilter, focusRole, minConnections, WIDTH]
  );

  const sourceEdgeX = focusRole === "source" ? PADDING_H + NODE_WIDTH : WIDTH - PADDING_H - NODE_WIDTH;
  const targetEdgeX = focusRole === "source" ? WIDTH - PADDING_H - NODE_WIDTH : PADDING_H + NODE_WIDTH;

  const getNodeConnections = (nodeId: string) => {
    const isSource = nodeId.startsWith("s:");
    return links
      .filter((l) => (isSource ? l.source === nodeId : l.target === nodeId))
      .sort((a, b) => b.value - a.value)
      .map((l) => ({
        label: isSource ? l.target.replace("t:", "") : l.source.replace("s:", ""),
        value: l.value,
        side: (isSource ? "target" : "source") as "source" | "target",
      }));
  };

  const handleNodeEnter = (node: SankeyNode, e: React.MouseEvent) => {
    setHoveredNode(node.id);
    setTooltip({
      nodeId: node.id,
      label: node.label,
      connections: getNodeConnections(node.id),
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
    setTooltip(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip) {
      setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
    }
  };

  const handleTypologyFilterChange = (filter: string) => {
    setHoveredLink(null);
    setHoveredNode(null);
    setTooltip(null);
    setTypologyFilter(filter);
  };

  return (
    <div className="sankey-wrapper">
      {/* Typology filter tabs */}
      <div className="sankey-filter-tabs">
        {TYPOLOGY_FILTERS.map((f) => (
          <button
            key={f.key}
            className={`sankey-filter-tab ${typologyFilter === f.key ? "active" : ""}`}
            onClick={() => handleTypologyFilterChange(f.key)}
          >
            {f.key !== "all" && (
              <span
                className="sankey-filter-dot"
                style={{ backgroundColor: TYPOLOGY_COLORS[f.key] }}
              />
            )}
            {f.key === "all"
              ? (t.map?.all || "Todas")
              : f.key === "ESTRUCTURAL"
                ? (t.map?.structuralFull || "Estructural")
                : f.key === "ONTOLOGICA"
                  ? (t.map?.ontologicalFull || "Ontológica")
                  : (t.map?.orientationalFull || "Orientacional")}
          </button>
        ))}
      </div>

      <div className="sankey-connection-filter">
        <label htmlFor="sankey-min-connections">
          {t.map?.connectionsOf || "Conexiones del dominio"} {focusRole === "source" ? (t.map?.sourceDomain || "fuente") : (t.map?.targetDomain || "meta")}
        </label>
        <input
          id="sankey-min-connections"
          type="range"
          min="0"
          max={maxConnections}
          value={Math.min(minConnections, maxConnections)}
          onChange={(event) => setMinConnections(Number(event.target.value))}
          className="map-range"
        />
        <span>≥ {Math.min(minConnections, maxConnections)} {t.map?.connections || "conexiones"}</span>
      </div>

      {nodes.length === 0 ? (
        <div className="sankey-empty">
          <p>No hay datos de dominio disponibles para mostrar.</p>
        </div>
      ) : (
        <>
      {/* HTML tooltip — fixed position following mouse */}
      {tooltip && (
        <div
          className="sankey-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          <div className="sankey-tooltip-title">{tooltip.label}</div>
          <div className="sankey-tooltip-label">
            {tooltip.nodeId.startsWith("s:") ? "Dominios meta:" : "Dominios fuente:"}
          </div>
          <ul className="sankey-tooltip-list">
            {tooltip.connections.map((c, i) => (
              <li key={i}>
                <span className="sankey-tooltip-bar" style={{ width: `${Math.max(4, (c.value / tooltip.connections[0].value) * 80)}px` }} />
                <span className="sankey-tooltip-name">{c.label}</span>
                <span className="sankey-tooltip-count">{c.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="sankey-svg-container chart-download-wrap" ref={containerRef}>
        <div className="sankey-download-toolbar">
          <button
            className="chart-download-btn sankey-download-btn"
          onClick={() => {
            if (sankeySvgRef.current) downloadSvgElement(sankeySvgRef.current, "sankey-chart.svg");
          }}
          title="SVG"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            SVG
          </button>
        </div>
        <svg
          ref={sankeySvgRef}
          viewBox={`0 0 ${WIDTH} ${height}`}
          width="100%"
          height={height}
          className="sankey-svg"
          preserveAspectRatio="none"
        >
          {/* Column headers at the far left/right edges so the chart itself reaches the edges */}
          <text
            x={0}
            y={22}
            textAnchor="start"
            fontSize={11}
            fontWeight={700}
            letterSpacing="0.08em"
            fill="var(--text-faint)"
          >
            {focusRole === "source" ? (t.map?.sankeySource || "DOMINIO FUENTE") : (t.map?.sankeyTarget || "DOMINIO META")}
          </text>
          <text
            x={WIDTH}
            y={22}
            textAnchor="end"
            fontSize={11}
            fontWeight={700}
            letterSpacing="0.08em"
            fill="var(--text-faint)"
          >
            {focusRole === "source" ? (t.map?.sankeyTarget || "DOMINIO META") : (t.map?.sankeySource || "DOMINIO FUENTE")}
          </text>

          <defs>
            {links.map((l, i) => {
              const color =
                TYPOLOGY_COLORS[l.typology?.toUpperCase()] ?? TYPOLOGY_COLORS.OTRA;
              return (
                <linearGradient key={i} id={`lg-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={SOURCE_COLOR} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Links */}
          {links.map((l, i) => {
            const path = linkPath(sourceEdgeX, l.sourceY, targetEdgeX, l.targetY, l.thickness);
            const linkKey = `${l.source}:${l.target}`;
            const isActive =
              hoveredLink === linkKey ||
              hoveredNode === l.source ||
              hoveredNode === l.target;
            return (
              <path
                key={i}
                d={path}
                fill={`url(#lg-${i})`}
                opacity={hoveredLink || hoveredNode ? (isActive ? 0.85 : 0.05) : 0.45}
                className="sankey-link"
                onMouseEnter={() => !hoveredNode && setHoveredLink(linkKey)}
                onMouseLeave={() => setHoveredLink(null)}
                style={{ pointerEvents: hoveredNode ? "none" : "all" }}
              />
            );
          })}

          {/* Nodes — rendered above links so hit areas work */}
          {nodes.map((node) => {
            const isActive = hoveredNode === node.id;
            const dim = !!hoveredNode && !isActive;
            const isLeftColumn = node.x < WIDTH / 2;
            const labelX = isLeftColumn
              ? node.x + NODE_WIDTH + LABEL_GAP
              : node.x - LABEL_GAP;
            const hitX = isLeftColumn ? node.x : node.x - PADDING_H + NODE_WIDTH + LABEL_GAP;
            return (
              <g
                key={node.id}
                onMouseEnter={(e) => handleNodeEnter(node, e)}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleNodeLeave}
                className="sankey-node-group"
                style={{ cursor: "default" }}
              >
                {/* Invisible wide hit area covering bar + label */}
                <rect
                  x={isLeftColumn ? node.x : node.x - (PADDING_H - NODE_WIDTH - LABEL_GAP)}
                  y={node.y - 2}
                  width={PADDING_H - LABEL_GAP}
                  height={node.height + 4}
                  fill="transparent"
                />
                <rect
                  x={node.x}
                  y={node.y}
                  width={NODE_WIDTH}
                  height={node.height}
                  fill={node.color}
                  opacity={dim ? 0.2 : 0.9}
                  rx={3}
                />
                <text
                  x={labelX}
                  y={node.y + node.height / 2}
                  textAnchor={isLeftColumn ? "start" : "end"}
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={isActive ? 700 : 400}
                  fill={isActive ? "var(--primary)" : dim ? "var(--text-faint)" : "var(--text)"}
                  className="sankey-label"
                >
                  {node.label.length > 26 ? node.label.slice(0, 24) + "…" : node.label}
                  {" "}
                  <tspan fontSize={9} fill={isActive ? "var(--primary)" : "var(--text-faint)"}>
                    ({node.value})
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>
        </>
      )}
    </div>
  );
}
