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
    const colors: Record<string, string> = {
      "Cuerpo y mundo físico": "#8b5a2b",
      "Mundo mental": "#3b82f6",
      "Mundo social": "#dc2626",
      "Mundo natural": "#16a34a",
    };
    return colors[category] || "#6b7280";
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

  // Build ego graph nodes
  const egoNodes = [
    { name: domain.name, type: "center", x: 150, y: 150 },
    ...relatedDomains.flatMap((rel, relIdx) =>
      rel.domains.map((d, i) => ({
        name: d,
        type: rel.type,
        x: 150 + 100 * Math.cos(((relIdx * 2 + i) * Math.PI) / 3),
        y: 150 + 100 * Math.sin(((relIdx * 2 + i) * Math.PI) / 3),
      }))
    ),
  ];

  const totalRelations = relatedDomains.reduce((sum, r) => sum + r.domains.length, 0);

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
          <span
            className="domain-badge macro"
            style={{ borderColor: getMacroColor(domain.macroCategory) }}
          >
            {domain.macroCategory.toUpperCase()}
          </span>
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
              {egoNodes.slice(1).map((node, i) => (
                <line
                  key={i}
                  x1={150}
                  y1={150}
                  x2={node.x}
                  y2={node.y}
                  stroke={getRelationColor(node.type)}
                  strokeWidth={1.5}
                  strokeDasharray={node.type === "hiponimo" ? "4,2" : undefined}
                />
              ))}
              
              {/* Center node */}
              <circle
                cx={150}
                cy={150}
                r={28}
                fill={getMacroColor(domain.macroCategory)}
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={150}
                y={155}
                textAnchor="middle"
                fill="white"
                fontSize={9}
                fontWeight={600}
              >
                {domain.name.slice(0, 8)}
              </text>

              {/* Related nodes */}
              {egoNodes.slice(1).map((node, i) => (
                <g key={i}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    fill="var(--surface)"
                    stroke={getRelationColor(node.type)}
                    strokeWidth={1.5}
                  />
                  <text
                    x={node.x}
                    y={node.y + 3}
                    textAnchor="middle"
                    fill="var(--text)"
                    fontSize={7}
                  >
                    {node.name.slice(0, 10)}
                  </text>
                </g>
              ))}
            </svg>
          </section>
        </aside>
      </div>
    </main>
  );
}

function getTypologyLabel(typology: string | null) {
  const labels: Record<string, string> = {
    "ESTRUCTURAL": "Estructural",
    "ONTOLOGICA": "Ontológica",
    "ORIENTACIONAL": "Orientacional",
  };
  return labels[typology || ""] || typology || "—";
}
