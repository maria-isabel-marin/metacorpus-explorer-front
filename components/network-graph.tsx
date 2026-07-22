"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { downloadSvgMarkup } from "@/lib/download-svg";
import { useLanguage } from "@/lib/i18n/language-context";

type NetworkGraphProps = {
  metaphors: ConceptualMetaphor[];
  focusRole: "source" | "target";
};

const TYPOLOGY_COLORS: Record<string, string> = {
  ESTRUCTURAL: "#64748b",
  ONTOLOGICA: "#dc2626",
  ORIENTACIONAL: "#16a34a",
  OTRA: "#8b5cf6",
};

const TYPOLOGY_FILTERS = [
  { key: "all", label: "Todas" },
  { key: "ESTRUCTURAL", label: "Estructural" },
  { key: "ONTOLOGICA", label: "Ontológica" },
  { key: "ORIENTACIONAL", label: "Orientacional" },
];

export function NetworkGraph({ metaphors, focusRole }: NetworkGraphProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [typologyFilter, setTypologyFilter] = useState("all");
  const [minRelations, setMinRelations] = useState(0);
  const [maxRelations, setMaxRelations] = useState(100);
  const [stabilized, setStabilized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { nodes, edges, maxOutDegree } = useMemo(() => {
    const filtered =
      typologyFilter === "all"
        ? metaphors
        : metaphors.filter(
            (m) => (m.typology ?? "OTRA").toUpperCase() === typologyFilter
          );

    // Count out-degree (# distinct target domains) per source node
    const outDegree = new Map<string, Set<string>>();
    // Count total expressions per domain for node sizing
    const degreeMap = new Map<string, number>();

    for (const m of filtered) {
      const s = m.sourceDomain;
      const t = m.targetDomain;
      if (!s || s === "—" || !t || t === "—") continue;
      const focusDomain = focusRole === "source" ? s : t;
      const connectedDomain = focusRole === "source" ? t : s;
      if (!outDegree.has(focusDomain)) outDegree.set(focusDomain, new Set());
      outDegree.get(focusDomain)!.add(connectedDomain);
      degreeMap.set(s, (degreeMap.get(s) ?? 0) + m.expressions);
      degreeMap.set(t, (degreeMap.get(t) ?? 0) + m.expressions);
    }

    const maxOut = Math.max(1, ...Array.from(outDegree.values()).map((s) => s.size));
    const effectiveMax = Math.min(maxRelations, maxOut);
    const effectiveMin = Math.min(minRelations, effectiveMax);

    const nodeMap = new Map<
      string,
      { id: string; label: string; value: number; group: string }
    >();
    const edgeList: { from: string; to: string; color: string; width: number }[] = [];
    const edgeSeen = new Set<string>();

    for (const m of filtered) {
      const s = m.sourceDomain;
      const t = m.targetDomain;
      if (!s || s === "—" || !t || t === "—") continue;
      // Apply relations range filter (out-degree of source node)
      const focusDomain = focusRole === "source" ? s : t;
      const focusDegree = outDegree.get(focusDomain)?.size ?? 0;
      if (focusDegree < effectiveMin || focusDegree > effectiveMax) continue;

      if (!nodeMap.has(s)) {
        nodeMap.set(s, { id: s, label: s, value: degreeMap.get(s) ?? 1, group: "source" });
      }
      if (!nodeMap.has(t)) {
        nodeMap.set(t, { id: t, label: t, value: degreeMap.get(t) ?? 1, group: "target" });
      }

      const edgeKey = `${s}→${t}`;
      if (!edgeSeen.has(edgeKey)) {
        edgeSeen.add(edgeKey);
        const color = TYPOLOGY_COLORS[(m.typology ?? "OTRA").toUpperCase()] ?? TYPOLOGY_COLORS.OTRA;
        edgeList.push({ from: s, to: t, color, width: Math.max(1, Math.min(5, m.expressions)) });
      }
    }

    return { nodes: Array.from(nodeMap.values()), edges: edgeList, maxOutDegree: maxOut };
  }, [metaphors, typologyFilter, minRelations, maxRelations, focusRole]);

  useEffect(() => {
    if (!containerRef.current) return;

    setStabilized(false);
    setProgress(0);
    setSelectedNode(null);

    // Destroy previous instance
    if (networkRef.current) {
      networkRef.current.destroy();
      networkRef.current = null;
    }

    // Dynamic import to avoid SSR issues
    Promise.all([import("vis-network"), import("vis-data")]).then(([{ Network }, { DataSet }]) => {
      const visNodes = new DataSet(
        nodes.map((n) => ({
          id: n.id,
          label: n.label.length > 28 ? n.label.slice(0, 26) + "…" : n.label,
          title: n.label, // full label on hover
          value: n.value,
          color: {
            background: n.group === "source" ? "#3b82f6" : "#f59e0b",
            border: n.group === "source" ? "#1d4ed8" : "#b45309",
            highlight: {
              background: n.group === "source" ? "#60a5fa" : "#fbbf24",
              border: n.group === "source" ? "#1d4ed8" : "#b45309",
            },
          },
          font: { color: "#1e293b", size: 11 },
          shape: "dot",
          scaling: { min: 8, max: 30 },
        }))
      );

      const visEdges = new DataSet(
        edges.map((e, i) => ({
          id: i,
          from: e.from,
          to: e.to,
          arrows: "to",
          color: { color: e.color, opacity: 0.6, highlight: e.color },
          width: e.width,
          smooth: { type: "dynamic", enabled: true, roundness: 0.5 },
        }))
      );

      const options = {
        configure: { enabled: false },
        interaction: {
          hover: true,
          tooltipDelay: 100,
          navigationButtons: false,
          dragNodes: true,
          zoomView: true,
        },
        physics: {
          enabled: true,
          solver: "repulsion",
          repulsion: {
            centralGravity: 0.1,
            nodeDistance: 180,
            springLength: 180,
            springConstant: 0.05,
            damping: 0.09,
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 50,
            fit: true,
          },
        },
        edges: {
          smooth: { enabled: true, type: "dynamic", roundness: 0.5 },
          arrows: { to: { enabled: true, scaleFactor: 0.6 } },
        },
        nodes: {
          scaling: { min: 8, max: 30 },
        },
      };

      const net = new Network(
        containerRef.current!,
        { nodes: visNodes, edges: visEdges },
        options
      );

      net.on("stabilizationProgress", (params: any) => {
        setProgress(Math.round((params.iterations / params.total) * 100));
      });

      net.once("stabilizationIterationsDone", () => {
        setProgress(100);
        setTimeout(() => setStabilized(true), 400);
        // Keep physics alive with very low force for continuous organic movement
        net.setOptions({
          physics: {
            enabled: true,
            solver: "repulsion",
            repulsion: {
              centralGravity: 0.02,
              nodeDistance: 180,
              springLength: 180,
              springConstant: 0.005,
              damping: 0.5,
            },
            stabilization: { enabled: false },
          },
        });
      });

      net.on("click", (params: any) => {
        if (params.nodes.length > 0) {
          setSelectedNode(params.nodes[0]);
        } else {
          setSelectedNode(null);
        }
      });

      networkRef.current = net;
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges]);

  // Selected node info
  const nodeInfo = useMemo(() => {
    if (!selectedNode) return null;
    const outgoing = edges
      .filter((e) => e.from === selectedNode)
      .map((e) => e.to);
    const incoming = edges
      .filter((e) => e.to === selectedNode)
      .map((e) => e.from);
    return { outgoing, incoming };
  }, [selectedNode, edges]);

  const downloadNetworkSvg = () => {
    const network = networkRef.current;
    const container = containerRef.current;
    if (!network || !container) return;

    const positions = network.getPositions() as Record<string, { x: number; y: number }>;
    const plottedPositions = nodes
      .map((node) => positions[node.id])
      .filter((position): position is { x: number; y: number } => Boolean(position));
    if (plottedPositions.length === 0) return;

    const minX = Math.min(...plottedPositions.map((position) => position.x));
    const maxX = Math.max(...plottedPositions.map((position) => position.x));
    const minY = Math.min(...plottedPositions.map((position) => position.y));
    const maxY = Math.max(...plottedPositions.map((position) => position.y));
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const padding = Math.max(40, Math.max(spanX, spanY) * 0.1);
    const viewBoxX = minX - padding;
    const viewBoxY = minY - padding;
    const viewBoxWidth = spanX + padding * 2;
    const viewBoxHeight = spanY + padding * 2;
    const width = 1600;
    const height = Math.max(900, Math.round(width * (viewBoxHeight / viewBoxWidth)));
    const showLabels = nodes.length <= 60;
    const nodeRadius = nodes.length > 100 ? 8 : nodes.length > 60 ? 10 : 14;
    const escapeXml = (value: string) => value.replace(/[<>&"']/g, (character) => ({
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    }[character] ?? character));
    const nodeMarkup = nodes.map((node) => {
      const position = positions[node.id];
      if (!position) return "";
      const fill = node.group === "source" ? "#3b82f6" : "#f59e0b";
      const stroke = node.group === "source" ? "#1d4ed8" : "#b45309";
      const label = node.label.length > 28 ? `${node.label.slice(0, 26)}…` : node.label;
      const text = showLabels
        ? `<text x="${position.x}" y="${position.y + 4}" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" fill="#1e293b">${escapeXml(label)}</text>`
        : "";
      return `<g><title>${escapeXml(node.label)}</title><circle cx="${position.x}" cy="${position.y}" r="${nodeRadius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${text}</g>`;
    }).join("");
    const edgeMarkup = edges.map((edge) => {
      const from = positions[edge.from];
      const to = positions[edge.to];
      if (!from || !to) return "";
      return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${edge.color}" stroke-width="${edge.width}" stroke-opacity="0.6" marker-end="url(#arrow)"/>`;
    }).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}" preserveAspectRatio="xMidYMid meet"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/></marker></defs><rect x="${viewBoxX}" y="${viewBoxY}" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="#ffffff"/>${edgeMarkup}${nodeMarkup}</svg>`;
    downloadSvgMarkup(svg, "directed-graph.svg");
  };

  return (
    <div className="network-wrapper">
      {/* Typology filter */}
      <div className="sankey-filter-tabs">
        {TYPOLOGY_FILTERS.map((f) => (
          <button
            key={f.key}
            className={`sankey-filter-tab ${typologyFilter === f.key ? "active" : ""}`}
            onClick={() => setTypologyFilter(f.key)}
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
        <span className="network-stats">
          {nodes.length} {t.map?.domains || "dominios"} · {edges.length} {t.map?.metaphors || "metáforas"}
        </span>
      </div>

      {/* Relations range filter */}
      <div className="network-degree-filter">
        <span className="network-degree-label">{t.map?.connectionsOf || "Relaciones del dominio"} {focusRole === "source" ? (t.map?.sourceDomain || "fuente") : (t.map?.targetDomain || "meta")}:</span>
        <input
          type="range"
          min="0"
          max={maxOutDegree}
          value={Math.min(minRelations, maxOutDegree)}
          onChange={(e) => {
            const val = Number(e.target.value);
            setMinRelations(Math.min(val, Math.min(maxRelations, maxOutDegree)));
          }}
          className="map-range"
          style={{ width: 120, verticalAlign: "middle" }}
        />
        <span className="network-degree-label" style={{ marginLeft: 6, marginRight: 12 }}>
          ≥ {Math.min(minRelations, maxOutDegree)} rel.
        </span>
        <input
          type="range"
          min="0"
          max={maxOutDegree}
          value={Math.min(maxRelations, maxOutDegree)}
          onChange={(e) => {
            const val = Number(e.target.value);
            setMaxRelations(Math.max(val, Math.min(minRelations, maxOutDegree)));
          }}
          className="map-range"
          style={{ width: 120, verticalAlign: "middle" }}
        />
        <span className="network-degree-label" style={{ marginLeft: 6 }}>
          ≤ {Math.min(maxRelations, maxOutDegree)} rel.
        </span>
      </div>

      <div className="network-canvas-wrap chart-download-wrap">
        {stabilized && (
          <button
            className="chart-download-btn"
            onClick={downloadNetworkSvg}
            title="SVG"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            SVG
          </button>
        )}
        {/* Loading overlay */}
        {!stabilized && (
          <div className="network-loading">
            <div className="network-loading-bar-track">
              <div
                className="network-loading-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="network-loading-label">
              Calculando layout… {progress}%
            </span>
          </div>
        )}

        {/* vis-network canvas */}
        <div ref={containerRef} className="network-canvas" />

        {/* Selected node panel */}
        {selectedNode && nodeInfo && (
          <div className="network-info-panel">
            <div className="network-info-title">{selectedNode}</div>
            {nodeInfo.outgoing.length > 0 && (
              <>
                <div className="network-info-section">→ Dominio meta</div>
                <ul className="network-info-list">
                  {nodeInfo.outgoing.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </>
            )}
            {nodeInfo.incoming.length > 0 && (
              <>
                <div className="network-info-section">← Dominio fuente</div>
                <ul className="network-info-list">
                  {nodeInfo.incoming.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="network-legend">
        <span className="network-legend-item">
          <span className="network-legend-dot" style={{ background: "#3b82f6" }} />
          Dominio fuente
        </span>
        <span className="network-legend-item">
          <span className="network-legend-dot" style={{ background: "#f59e0b" }} />
          Dominio meta
        </span>
        {Object.entries(TYPOLOGY_COLORS).map(([k, c]) => (
          <span key={k} className="network-legend-item">
            <span
              className="network-legend-line"
              style={{ background: c }}
            />
            {k.charAt(0) + k.slice(1).toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
