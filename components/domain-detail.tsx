"use client";

import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import type { ConceptualMetaphor } from "@/lib/metaphors";
import { useLanguage } from "@/lib/i18n/language-context";

type DomainDetailProps = {
  corpus: CorpusSummary;
  domain: {
    id: string;
    name: string;
    type: "fuente" | "meta";
    macroCategory: string;
    expressionCount: number;
    metaphorCount: number;
  };
  relatedDomains: {
    type: "hiponimo" | "hiperonimo" | "meronimo" | "holonimo";
    label: string;
    domains: string[];
  }[];
  sourceMetaphors: ConceptualMetaphor[];
  targetMetaphors: ConceptualMetaphor[];
};

export function DomainDetail({
  corpus,
  domain,
  relatedDomains,
  sourceMetaphors,
  targetMetaphors,
}: DomainDetailProps) {
  const { t } = useLanguage();

  const getMacroColor = (category: string) => {
    const norm = category.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    if (norm.includes("fisico") || norm.includes("cuerpo")) return "#8b5a2b";
    if (norm.includes("mental")) return "#3b82f6";
    if (norm.includes("social")) return "#dc2626";
    if (norm.includes("natural")) return "#16a34a";
    return "#6b7280";
  };

  const getRelationColor = (type: string) => {
    const colors: Record<string, string> = {
      hiponimo: "#3b82f6",
      hiperonimo: "#8b5a2b",
      meronimo: "#dc2626",
      holonimo: "#16a34a",
    };
    return colors[type] || "#6b7280";
  };

  const totalRelations = relatedDomains.reduce((sum, r) => sum + r.domains.length, 0);

  // Build ego graph: metaphor-linked domains + semantic relations
  type EgoNode = { name: string; nodeType: "source" | "target" | "semantic"; color: string; x: number; y: number };

  const SOURCE_NODE_COLOR = "#3b5998";
  const TARGET_NODE_COLOR = "#a0522d";
  const SEMANTIC_NODE_COLOR = "#6b7280";

  const rawNodes: Omit<EgoNode, "x" | "y">[] = [
    // Domains from metaphors where this domain is SOURCE → show target domains
    ...sourceMetaphors.map(m => ({ name: m.targetDomain, nodeType: "target" as const, color: TARGET_NODE_COLOR })),
    // Domains from metaphors where this domain is TARGET → show source domains
    ...targetMetaphors.map(m => ({ name: m.sourceDomain, nodeType: "source" as const, color: SOURCE_NODE_COLOR })),
    // Semantic relation domains
    ...relatedDomains.flatMap(rel =>
      rel.domains.map(d => ({ name: d, nodeType: "semantic" as const, color: getRelationColor(rel.type) }))
    ),
  ];

  // Deduplicate by name
  const seen = new Set<string>();
  const uniqueNodes = rawNodes.filter(n => {
    if (seen.has(n.name)) return false;
    seen.add(n.name);
    return true;
  });

  const CX = 150, CY = 150, RADIUS = 105;
  const egoSatellites: EgoNode[] = uniqueNodes.map((n, i) => {
    const angle = (i / uniqueNodes.length) * 2 * Math.PI - Math.PI / 2;
    return { ...n, x: CX + RADIUS * Math.cos(angle), y: CY + RADIUS * Math.sin(angle) };
  });

  return (
    <main className="domain-detail-shell">
      {/* Breadcrumb */}
      <nav className="domain-breadcrumb">
        <Link href={`/corpus/${corpus.slug}/domains`} className="breadcrumb-link">
          {t.domains?.title || "DOMINIOS"}
        </Link>
        {relatedDomains.find(r => r.type === "hiperonimo")?.domains.map((parent) => (
          <span key={parent}>
            <span className="breadcrumb-separator">/</span>
            <Link
              href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(parent)}`}
              className="breadcrumb-link"
            >
              {parent}
            </Link>
          </span>
        ))}
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{domain.name}</span>
      </nav>

      {/* Domain Header */}
      <header className="domain-header">
        <p className="domain-type-label">
          {domain.type === "fuente" ? "DOMINIO FUENTE" : "DOMINIO META"}
        </p>
        <h1 className="domain-title">{domain.name}</h1>
        <div className="domain-badges">
          {domain.macroCategory && (
            <span
              className="domain-badge macro"
              style={{ borderColor: getMacroColor(domain.macroCategory) }}
            >
              {domain.macroCategory.toUpperCase()}
            </span>
          )}
          <span className="domain-badge count">
            {domain.expressionCount} {t.domainDetail?.expressions || "EXPRESIONES"}
          </span>
          <span className="domain-badge count">
            {domain.metaphorCount} {t.domainDetail?.metaphors || "METÁFORAS"}
          </span>
        </div>
      </header>

      {/* Two Column Layout */}
      <div className="domain-content">
        {/* Left Column */}
        <div className="domain-left">
          {/* Semantic Relations */}
          <section className="domain-section">
            <div className="section-header">
              <h2>{t.domainDetail?.semanticRelations || "Relaciones semánticas"}</h2>
              <span className="section-count">{totalRelations} {t.domainDetail?.relations || "relaciones"}</span>
            </div>
            <div className="relations-list">
              {relatedDomains.length === 0 ? (
                <p className="no-relations">{t.domainDetail?.noRelations || "Sin relaciones semánticas registradas"}</p>
              ) : (
                relatedDomains.map((relation) => (
                  <div key={relation.type} className="relation-group">
                    <div
                      className="relation-label"
                      style={{ borderLeftColor: getRelationColor(relation.type) }}
                    >
                      {relation.label}
                    </div>
                    <div className="relation-domains">
                      {relation.domains.map((d) => (
                        <Link
                          key={d}
                          href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(d)}`}
                          className="relation-domain-link"
                        >
                          {d}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Metaphors List */}
          {sourceMetaphors.length > 0 && (
            <section className="domain-section">
              <div className="section-header">
                <h2>
                  {t.domainDetail?.metaphorsWhereSource || "Metáforas donde"} {domain.name}{" "}
                  {t.domainDetail?.isSource || "es fuente"}
                </h2>
              </div>
              <div className="metaphors-list">
                {sourceMetaphors.map((m) => (
                  <Link
                    key={m.id}
                    href={`/corpus/${corpus.slug}/metaphors?id=${m.id}`}
                    className="metaphor-item"
                  >
                    <div className="metaphor-name">{m.formula}</div>
                    <div className="metaphor-meta">
                      {m.expressions} {t.domainDetail?.expr || "expr."} · {getTypologyLabel(m.typology)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {targetMetaphors.length > 0 && (
            <section className="domain-section">
              <div className="section-header">
                <h2>
                  {t.domainDetail?.metaphorsWhereTarget || "Metáforas donde"} {domain.name}{" "}
                  {t.domainDetail?.isTarget || "es meta"}
                </h2>
              </div>
              <div className="metaphors-list">
                {targetMetaphors.map((m) => (
                  <Link
                    key={m.id}
                    href={`/corpus/${corpus.slug}/metaphors?id=${m.id}`}
                    className="metaphor-item"
                  >
                    <div className="metaphor-name">{m.formula}</div>
                    <div className="metaphor-meta">
                      {m.expressions} {t.domainDetail?.expr || "expr."} · {getTypologyLabel(m.typology)}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Ego Graph */}
        <aside className="domain-right">
          <section className="domain-section ego-graph-section">
            <h2>{t.domainDetail?.egoGraph || "Grafo ego-céntrico"}</h2>
            <svg className="ego-graph" viewBox="0 0 300 300">
              {/* Edges */}
              {egoSatellites.map((node, i) => (
                <line
                  key={i}
                  x1={CX} y1={CY}
                  x2={node.x} y2={node.y}
                  stroke={node.color}
                  strokeWidth={1.2}
                  strokeOpacity={0.5}
                />
              ))}

              {/* Satellite nodes */}
              {egoSatellites.map((node, i) => (
                <g key={i}>
                  <circle cx={node.x} cy={node.y} r={16} fill="white" stroke={node.color} strokeWidth={1.5} />
                  <text
                    x={node.x} y={node.y + 4}
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize={6.5}
                    fontWeight={500}
                  >
                    {node.name.length > 9 ? node.name.slice(0, 8) + "…" : node.name}
                  </text>
                </g>
              ))}

              {/* Center node */}
              <circle
                cx={CX} cy={CY} r={28}
                fill={getMacroColor(domain.macroCategory || "")}
                stroke="white" strokeWidth={2}
              />
              <text x={CX} y={CY - 3} textAnchor="middle" fill="white" fontSize={8} fontWeight={700}>
                {domain.name.length > 8 ? domain.name.slice(0, 7) + "…" : domain.name}
              </text>
              <text x={CX} y={CY + 9} textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize={6.5}>
                {domain.type === "fuente" ? "FUENTE" : "META"}
              </text>

              {/* Empty state */}
              {egoSatellites.length === 0 && (
                <text x={CX} y={220} textAnchor="middle" fill="var(--text-faint)" fontSize={9}>
                  Sin conexiones registradas
                </text>
              )}
            </svg>

            {/* Legend */}
            {(sourceMetaphors.length > 0 || targetMetaphors.length > 0) && (
              <div className="ego-legend">
                {targetMetaphors.length > 0 && (
                  <span className="ego-legend-item">
                    <span className="ego-legend-dot" style={{ background: SOURCE_NODE_COLOR }} />
                    dom. fuente
                  </span>
                )}
                {sourceMetaphors.length > 0 && (
                  <span className="ego-legend-item">
                    <span className="ego-legend-dot" style={{ background: TARGET_NODE_COLOR }} />
                    dom. meta
                  </span>
                )}
                {totalRelations > 0 && (
                  <span className="ego-legend-item">
                    <span className="ego-legend-dot" style={{ background: SEMANTIC_NODE_COLOR }} />
                    rel. semántica
                  </span>
                )}
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

function getTypologyLabel(typology: string | null) {
  if (!typology) return "—";
  const norm = typology.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (norm.includes("ESTRUCTURAL")) return "Estructural";
  if (norm.includes("ONTOLOG")) return "Ontológica";
  if (norm.includes("ORIENTAC")) return "Orientacional";
  return typology;
}
