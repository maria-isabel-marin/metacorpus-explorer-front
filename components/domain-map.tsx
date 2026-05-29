"use client";

import { useMemo, useState } from "react";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";

type DomainMapProps = {
  metaphors: ConceptualMetaphor[];
};

type DomainNode = {
  id: string;
  label: string;
  type: "source" | "target" | "both";
  weight: number;
  x: number;
  y: number;
  angle: number;
};

type DomainEdge = {
  source: string;
  target: string;
  weight: number;
};

const SOURCE_COLOR = "#2563eb";
const TARGET_COLOR = "#d97706";
const BOTH_COLOR = "#7c3aed";
const EDGE_COLOR = "#94a3b8";

export function DomainMap({ metaphors }: DomainMapProps) {
  const { t } = useLanguage();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  const { nodes, edges, maxWeight } = useMemo(() => {
    const sourceSet = new Map<string, number>();
    const targetSet = new Map<string, number>();
    const edgeMap = new Map<string, number>();

    for (const m of metaphors) {
      const s = m.sourceDomain;
      const tgt = m.targetDomain;
      if (s === "—" || tgt === "—") continue;

      sourceSet.set(s, (sourceSet.get(s) ?? 0) + m.expressions);
      targetSet.set(tgt, (targetSet.get(tgt) ?? 0) + m.expressions);

      const edgeKey = `${s}|||${tgt}`;
      edgeMap.set(edgeKey, (edgeMap.get(edgeKey) ?? 0) + m.expressions);
    }

    const allDomains = new Set([...sourceSet.keys(), ...targetSet.keys()]);
    const domainArray = [...allDomains];

    const cx = 300;
    const cy = 300;
    const radius = 230;

    const domainNodes: DomainNode[] = domainArray.map((name, i) => {
      const angle = (i / domainArray.length) * 2 * Math.PI - Math.PI / 2;
      const isSource = sourceSet.has(name);
      const isTarget = targetSet.has(name);
      const weight = (sourceSet.get(name) ?? 0) + (targetSet.get(name) ?? 0);

      return {
        id: name,
        label: name,
        type: isSource && isTarget ? "both" : isSource ? "source" : "target",
        weight,
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle,
      };
    });

    const domainEdges: DomainEdge[] = [...edgeMap.entries()].map(([key, weight]) => {
      const [source, target] = key.split("|||");
      return { source, target, weight };
    });

    const maxW = Math.max(...domainNodes.map((n) => n.weight), 1);

    return { nodes: domainNodes, edges: domainEdges, maxWeight: maxW };
  }, [metaphors]);

  if (nodes.length === 0) {
    return (
      <div className="domain-map-empty">
        <p>{t.dashboard.domainMap}</p>
      </div>
    );
  }

  const svgSize = 600;
  const cx = 300;
  const cy = 300;

  const maxEdgeWeight = Math.max(...edges.map((e) => e.weight), 1);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const connectedToHovered = new Set<string>();
  if (hoveredNode) {
    for (const e of edges) {
      if (e.source === hoveredNode) connectedToHovered.add(e.target);
      if (e.target === hoveredNode) connectedToHovered.add(e.source);
    }
  }

  function getNodeColor(node: DomainNode) {
    if (node.type === "both") return BOTH_COLOR;
    if (node.type === "source") return SOURCE_COLOR;
    return TARGET_COLOR;
  }

  function getNodeRadius(node: DomainNode) {
    const minR = 3;
    const maxR = 8;
    return minR + (node.weight / maxWeight) * (maxR - minR);
  }

  function isNodeHighlighted(nodeId: string) {
    if (!hoveredNode) return true;
    return nodeId === hoveredNode || connectedToHovered.has(nodeId);
  }

  function isEdgeHighlighted(edge: DomainEdge) {
    if (!hoveredNode) return true;
    return edge.source === hoveredNode || edge.target === hoveredNode;
  }

  function truncateLabel(label: string, maxLen: number = 16) {
    return label.length > maxLen ? label.slice(0, maxLen) + "…" : label;
  }

  return (
    <div className="domain-map-container">
      <svg
        className="domain-map-svg"
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <circle cx={cx} cy={cy} r="240" fill="url(#centerGlow)" />

        {/* Orbit rings */}
        <circle cx={cx} cy={cy} r="230" fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,6" opacity="0.5" />
        <circle cx={cx} cy={cy} r="155" fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,8" opacity="0.3" />
        <circle cx={cx} cy={cy} r="80" fill="none" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="2,8" opacity="0.2" />

        {/* Edges — curved bezier paths */}
        {edges.map((edge, idx) => {
          const from = nodeMap.get(edge.source);
          const to = nodeMap.get(edge.target);
          if (!from || !to) return null;

          const highlighted = isEdgeHighlighted(edge);
          const strokeW = 0.5 + (edge.weight / maxEdgeWeight) * 2.5;
          const opacity = highlighted ? (hoveredNode ? 0.6 : 0.25) : 0.04;

          // Curved path through center offset
          const midX = cx + (from.x + to.x - 2 * cx) * 0.15;
          const midY = cy + (from.y + to.y - 2 * cy) * 0.15;

          return (
            <path
              key={idx}
              d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
              fill="none"
              stroke={highlighted && hoveredNode ? getNodeColor(from) : EDGE_COLOR}
              strokeWidth={strokeW}
              opacity={opacity}
              style={{ transition: "opacity 0.3s, stroke 0.3s" }}
            />
          );
        })}

        {/* Central hub */}
        <circle cx={cx} cy={cy} r="6" fill="var(--primary)" opacity="0.3" />
        <circle cx={cx} cy={cy} r="3" fill="var(--primary)" opacity="0.6" />

        {/* Nodes */}
        {nodes.map((node) => {
          const highlighted = isNodeHighlighted(node.id);
          const r = getNodeRadius(node);
          const color = getNodeColor(node);

          return (
            <g
              key={node.id}
              style={{ cursor: "pointer", transition: "opacity 0.3s" }}
              opacity={highlighted ? 1 : 0.15}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer glow ring */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r + 3}
                fill={color}
                opacity={hoveredNode === node.id ? 0.25 : 0}
                style={{ transition: "opacity 0.3s" }}
              />
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={r}
                fill={color}
                stroke="white"
                strokeWidth="1.5"
                filter={hoveredNode === node.id ? "url(#glow)" : undefined}
              />
              {/* Label — visible on hover for this node and its connected nodes */}
              {(hoveredNode === node.id || (hoveredNode && connectedToHovered.has(node.id))) && (
                <>
                  <rect
                    x={node.x + (node.angle > Math.PI / 2 && node.angle < (3 * Math.PI) / 2 ? -(truncateLabel(node.label, 24).length * 5.5 + 12) : r + 4)}
                    y={node.y - 8}
                    width={truncateLabel(node.label, 24).length * 5.5 + 10}
                    height={16}
                    rx={4}
                    fill="var(--surface)"
                    stroke="var(--border)"
                    strokeWidth="0.5"
                    opacity="0.92"
                  />
                  <text
                    x={node.x + (node.angle > Math.PI / 2 && node.angle < (3 * Math.PI) / 2 ? -(r + 6) : r + 8)}
                    y={node.y + 4}
                    textAnchor={node.angle > Math.PI / 2 && node.angle < (3 * Math.PI) / 2 ? "end" : "start"}
                    className="domain-map-label"
                    fill={hoveredNode === node.id ? "var(--primary)" : "var(--text)"}
                  >
                    {truncateLabel(node.label, 24)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="domain-map-legend">
        <span className="domain-map-legend-item">
          <span className="domain-map-legend-dot" style={{ background: SOURCE_COLOR }} />
          {t.explorer.source.replace(":", "")}
        </span>
        <span className="domain-map-legend-item">
          <span className="domain-map-legend-dot" style={{ background: TARGET_COLOR }} />
          {t.explorer.target.replace(":", "")}
        </span>
        <span className="domain-map-legend-item">
          <span className="domain-map-legend-dot" style={{ background: BOTH_COLOR }} />
          {t.explorer.source.replace(":", "")} + {t.explorer.target.replace(":", "")}
        </span>
      </div>
    </div>
  );
}
