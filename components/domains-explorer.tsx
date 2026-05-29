"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";
import type { ApiDomain, ApiDomainRelation, TreeNode, DomainType } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/language-context";

type DomainsExplorerProps = {
  corpus: CorpusSummary;
  domains: ApiDomain[];
  treeData: TreeNode[];
  relations: ApiDomainRelation[];
  counts: {
    total: number;
    fuente: number;
    meta: number;
  };
  activeTab: string;
};

export function DomainsExplorer({
  corpus,
  domains,
  treeData,
  relations,
  counts,
  activeTab,
}: DomainsExplorerProps) {
  const { t } = useLanguage();
  const [filterText, setFilterText] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const filteredDomains = useMemo(() => {
    if (!filterText.trim()) return domains;
    const search = filterText.toLowerCase();
    return domains.filter(
      (d) =>
        d.nombre.toLowerCase().includes(search) ||
        (d.macrodominio && d.macrodominio.toLowerCase().includes(search))
    );
  }, [domains, filterText]);

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getMacroColor = (macro: string | null) => {
    const colors: Record<string, string> = {
      "Cuerpo y mundo físico": "#8B5CF6", // purple
      "Mundo mental": "#3B82F6", // blue
      "Mundo social": "#EF4444", // red
      "Mundo natural": "#10B981", // green
    };
    return colors[macro || ""] || "#6B7280"; // gray fallback
  };

  const tabs = [
    { key: "todos", label: `${t.domains?.all || "Todos"} ${counts.total}` },
    { key: "fuente", label: `${t.domains?.sourceDomains || "Dominios fuente"} ${counts.fuente}` },
    { key: "meta", label: `${t.domains?.targetDomains || "Dominios meta"} ${counts.meta}` },
  ];

  return (
    <main className="domains-shell">
      {/* Header */}
      <header className="domains-header">
        <p className="domains-eyebrow">{t.domains?.eyebrow || "EXPLORADOR"}</p>
        <h1 className="domains-title">{t.domains?.title || "Dominios"}</h1>
        <p className="domains-description">
          {t.domains?.description ||
            "Navegación jerárquica de dominios fuente y meta. Las relaciones semánticas (hiperonimia, meronimia, cohiponimia) estructuran la red conceptual del corpus."}
        </p>
      </header>

      {/* Tabs */}
      <nav className="domains-tabs">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/corpus/${corpus.slug}/domains${tab.key === "todos" ? "" : `?tipo=${tab.key}`}`}
            className={`domain-tab ${activeTab === tab.key ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {/* Two Column Layout */}
      <div className="domains-content">
        {/* Left: Alphabetical Index */}
        <section className="domains-index">
          <div className="domains-index-header">
            <h2>{t.domains?.alphabeticalIndex || "Índice alfabético"}</h2>
            <input
              type="text"
              placeholder={t.domains?.filterPlaceholder || "Filtrar..."}
              className="domains-filter-input"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>

          <div className="domains-table-container">
            <table className="domains-table">
              <thead>
                <tr>
                  <th>{t.domains?.domain || "DOMINIO"}</th>
                  <th>{t.domains?.type || "TIPO"}</th>
                  <th>{t.domains?.macro || "MACRO"}</th>
                  <th className="numeric">{t.domains?.frequency || "FREQ."}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDomains.map((domain) => (
                  <tr key={domain.id} className="domain-row">
                    <td className="domain-name-cell">
                      <span
                        className="domain-color-dot"
                        style={{ backgroundColor: getMacroColor(domain.macrodominio) }}
                      />
                      <Link
                        href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(domain.nombre)}`}
                        className="domain-link"
                      >
                        {domain.nombre}
                      </Link>
                    </td>
                    <td>
                      <span className={`domain-type-badge ${domain.tipo}`}>
                        {domain.tipo}
                      </span>
                    </td>
                    <td className="domain-macro">{domain.macrodominio || "—"}</td>
                    <td className="numeric domain-freq">{domain.frecuencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Tree View */}
        <section className="domains-tree">
          <div className="domains-tree-header">
            <h2>{t.domains?.treeView || "Vista árbol · Hiperonimia"}</h2>
            <button
              className="domains-collapse-btn"
              onClick={() => setExpandedNodes(new Set())}
            >
              {t.domains?.collapsible || "colapsable"}
            </button>
          </div>

          <div className="domains-tree-content">
            {treeData.length === 0 ? (
              <p className="domains-empty">{t.domains?.noData || "No hay datos de jerarquía disponibles"}</p>
            ) : (
              treeData.map((node) => (
                <TreeNodeComponent
                  key={node.id}
                  node={node}
                  expandedNodes={expandedNodes}
                  toggleNode={toggleNode}
                  corpusSlug={corpus.slug}
                  getMacroColor={getMacroColor}
                  level={0}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// Recursive Tree Node Component
function TreeNodeComponent({
  node,
  expandedNodes,
  toggleNode,
  corpusSlug,
  getMacroColor,
  level,
}: {
  node: TreeNode;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  corpusSlug: string;
  getMacroColor: (macro: string | null) => string;
  level: number;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id) || node.expanded;
  const indent = level * 20;

  return (
    <div className="tree-node">
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${indent}px` }}
      >
        {hasChildren && (
          <button
            className={`tree-toggle-btn ${isExpanded ? "expanded" : ""}`}
            onClick={() => toggleNode(node.id)}
            aria-label={isExpanded ? "Colapsar" : "Expandir"}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d={isExpanded ? "M2 6h8" : "M6 2v8M2 6h8"}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        {!hasChildren && <span className="tree-toggle-placeholder" />}

        <span
          className="tree-node-dot"
          style={{ backgroundColor: getMacroColor(node.macrodominio) }}
        />

        <Link
          href={`/corpus/${corpusSlug}/domains/${encodeURIComponent(node.nombre)}`}
          className="tree-node-link"
        >
          {node.nombre}
        </Link>

        <span className="tree-node-freq">{node.frecuencia}</span>
      </div>

      {hasChildren && isExpanded && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              corpusSlug={corpusSlug}
              getMacroColor={getMacroColor}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
