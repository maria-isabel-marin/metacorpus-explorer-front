"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { downloadCanvasAsPng } from "@/lib/download-svg";

type NetworkGraphProps = {
  metaphors: ConceptualMetaphor[];
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

export function NetworkGraph({ metaphors }: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);
  const [typologyFilter, setTypologyFilter] = useState("all");
  const [exactDegree, setExactDegree] = useState<number | null>(null);
  const [minRelations, setMinRelations] = useState(0);
  const [stabilized, setStabilized] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { nodes, edges, maxOutDegree, degreeOptions } = useMemo(() => {
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
      if (!outDegree.has(s)) outDegree.set(s, new Set());
      outDegree.get(s)!.add(t);
      degreeMap.set(s, (degreeMap.get(s) ?? 0) + m.expressions);
      degreeMap.set(t, (degreeMap.get(t) ?? 0) + m.expressions);
    }

    const maxOut = Math.max(1, ...Array.from(outDegree.values()).map((s) => s.size));

    // Keep only source nodes matching exactDegree (or all if null)
    const allowedSources = new Set(
      Array.from(outDegree.entries())
        .filter(([, s]) => exactDegree === null || s.size === exactDegree)
        .map(([k]) => k)
    );

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
      if (!allowedSources.has(s)) continue;
      // Apply minRelations filter (out-degree of source node)
      const srcDeg = outDegree.get(s)?.size ?? 0;
      if (srcDeg < minRelations) continue;

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

    // Collect the existing degree counts for the button list
    const degreeCounts = new Map<number, number>();
    for (const s of outDegree.values()) {
      degreeCounts.set(s.size, (degreeCounts.get(s.size) ?? 0) + 1);
    }
    const degreeOptions = Array.from(degreeCounts.entries()).sort((a, b) => a[0] - b[0]);

    return { nodes: Array.from(nodeMap.values()), edges: edgeList, maxOutDegree: maxOut, degreeOptions };
  }, [metaphors, typologyFilter, exactDegree, minRelations]);

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
            {f.label}
          </button>
        ))}
        <span className="network-stats">
          {nodes.length} dominios · {edges.length} metáforas
        </span>
      </div>

      {/* Min relations slider */}
      <div className="network-degree-filter">
        <span className="network-degree-label">Mín. relaciones:</span>
        <input
          type="range"
          min="0"
          max={maxOutDegree}
          value={minRelations}
          onChange={(e) => setMinRelations(Number(e.target.value))}
          className="map-range"
          style={{ width: 120, verticalAlign: "middle" }}
        />
        <span className="network-degree-label" style={{ marginLeft: 6 }}>≥ {minRelations} rel.</span>
      </div>

      {/* Exact degree filter */}
      <div className="network-degree-filter">
        <span className="network-degree-label">Relaciones del dominio fuente:</span>
        <div className="network-degree-buttons">
          <button
            className={`network-degree-btn ${exactDegree === null ? "active" : ""}`}
            onClick={() => setExactDegree(null)}
          >
            Todas
          </button>
          {degreeOptions.map(([deg, count]) => (
            <button
              key={deg}
              className={`network-degree-btn ${exactDegree === deg ? "active" : ""}`}
              onClick={() => setExactDegree(deg)}
            >
              {deg}
              <span className="network-degree-count">{count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="network-canvas-wrap chart-download-wrap">
        {stabilized && (
          <button
            className="chart-download-btn"
            onClick={() => {
              const canvas = containerRef.current?.querySelector("canvas");
              if (canvas) downloadCanvasAsPng(canvas, "directed-graph.png");
            }}
            title="PNG"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            PNG
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
