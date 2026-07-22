"use client";

import Link from "next/link";
import { FileJson, FileText, FileCode, Link as LinkIcon, ChevronLeft, ChevronRight } from "lucide-react";

import type { CorpusSummary } from "@/lib/corpora";
import type { ApiExpression } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/language-context";

type ExpressionDetailProps = {
  corpus: CorpusSummary;
  expression: ApiExpression;
  nearbyExpressions: ApiExpression[];
  sourceTotal: number;
};

const TYPOLOGY_COLORS: Record<string, string> = {
  ESTRUCTURAL: "#2563eb",
  ONTOLOGICA: "#8b5a2b",
  ORIENTACIONAL: "#16a34a",
  OTRA: "#6b7280",
};

export function ExpressionDetail({
  corpus,
  expression,
  nearbyExpressions,
  sourceTotal,
}: ExpressionDetailProps) {
  const { t } = useLanguage();
  // Tipologia can be on expression directly or nested in metafora_conceptual
  const tipologia = expression.tipologia || expression.metafora_conceptual?.tipologia;
  const typologyColor = TYPOLOGY_COLORS[tipologia ?? "OTRA"] ?? TYPOLOGY_COLORS.OTRA;

  // Build proper citation in academic format
  const buildCitation = () => {
    const parts: string[] = [];
    
    // Author
    if (expression.fuente_textual.autor) {
      parts.push(expression.fuente_textual.autor);
    }
    
    // Year
    if (expression.fuente_textual.anio) {
      parts.push(`(${expression.fuente_textual.anio})`);
    }
    
    // Title
    if (expression.fuente_textual.titulo_1) {
      parts.push(expression.fuente_textual.titulo_1);
      if (expression.fuente_textual.titulo_2) {
        parts.push(`: ${expression.fuente_textual.titulo_2}`);
      }
    }
    
    // Page if available
    if (expression.pagina) {
      parts.push(`p. ${expression.pagina}`);
    }
    
    // Expression reference
    parts.push(`[MetaCorpus ID: ${expression.id_registro}]`);
    
    return parts.join(". ") + ".";
  };
  
  const citationText = buildCitation();

  // Export functions
  const exportJSONLD = () => {
    const data = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: expression.expresion_metaforica,
      text: expression.contexto,
      about: expression.metafora_conceptual?.nombre,
      author: {
        "@type": "Person",
        name: expression.fuente_textual.autor,
      },
      datePublished: expression.fuente_textual.anio,
      isPartOf: {
        "@type": "Book",
        name: expression.fuente_textual.titulo_1,
      },
    };
    downloadJSON(data, `expression-${expression.id_registro}.json`);
  };

  const exportRIS = () => {
    const ris = `TY  - ELEC
TI  - ${expression.expresion_metaforica}
AU  - ${expression.fuente_textual.autor || "Anónimo"}
PY  - ${expression.fuente_textual.anio || "n.d."}
T2  - ${expression.fuente_textual.titulo_1}
AB  - ${expression.contexto || expression.expresion_metaforica}
ID  - ${expression.id_registro}
ER  - `;
    downloadText(ris, `expression-${expression.id_registro}.ris`);
  };

  const exportTEI = () => {
    const tei = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0">
  <teiHeader>
    <fileDesc>
      <titleStmt>
        <title>${expression.expresion_metaforica}</title>
        <author>${expression.fuente_textual.autor || "Anónimo"}</author>
      </titleStmt>
      <sourceDesc>
        <bibl>
          <title>${expression.fuente_textual.titulo_1}</title>
          <date>${expression.fuente_textual.anio}</date>
        </bibl>
      </sourceDesc>
    </fileDesc>
  </teiHeader>
  <text>
    <body>
      <p>${expression.contexto || expression.expresion_metaforica}</p>
    </body>
  </text>
</TEI>`;
    downloadText(tei, `expression-${expression.id_registro}.xml`);
  };

  const copyPermalink = () => {
    const url = `${window.location.origin}/corpus/${corpus.slug}/concordance/${expression.id}`;
    navigator.clipboard.writeText(url);
    alert(t.concordance?.linkCopied || "Enlace copiado al portapapeles");
  };

  // Render the full expression with highlighted focus
  const renderFullExpression = () => {
    const fullText = expression.expresion_metaforica;
    const focus = expression.foco;
    
    if (!focus || !fullText.includes(focus)) {
      return <span className="expression-full-text">{fullText}</span>;
    }

    const focusIndex = fullText.indexOf(focus);
    const before = fullText.slice(0, focusIndex);
    const after = fullText.slice(focusIndex + focus.length);

    return (
      <span className="expression-full-text">
        «{before}
        <span
          className="expression-focus-highlight"
          style={{
            backgroundColor: `${typologyColor}30`,
            borderBottom: `2px solid ${typologyColor}`,
          }}
        >
          {focus}
        </span>
        {after}»
      </span>
    );
  };

  // Previous/next navigation — pick the immediately adjacent by orden
  const prevExpression = nearbyExpressions
    .filter((e) => e.orden < expression.orden)
    .sort((a, b) => b.orden - a.orden)[0];
  const nextExpression = nearbyExpressions
    .filter((e) => e.orden > expression.orden)
    .sort((a, b) => a.orden - b.orden)[0];

  return (
    <main className="expression-detail-shell">
      {/* Breadcrumb */}
      <nav className="expression-breadcrumb">
        <Link href={`/corpus/${corpus.slug}/concordance`} className="breadcrumb-link">
          {t.concordance?.title || "Concordancia"}
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{expression.id_registro}</span>
      </nav>

      {/* Navigation prev/next */}
      <div className="expression-navigation">
        {prevExpression ? (
          <Link
            href={`/corpus/${corpus.slug}/concordance/${prevExpression.id}`}
            className="nav-button prev"
          >
            <ChevronLeft size={16} />
            {t.concordance?.previous || "Anterior"}
          </Link>
        ) : (
          <span className="nav-button prev disabled">
            <ChevronLeft size={16} />
            {t.concordance?.previous || "Anterior"}
          </span>
        )}
        {nextExpression ? (
          <Link
            href={`/corpus/${corpus.slug}/concordance/${nextExpression.id}`}
            className="nav-button next"
          >
            {t.concordance?.next || "Siguiente"}
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className="nav-button next disabled">
            {t.concordance?.next || "Siguiente"}
            <ChevronRight size={16} />
          </span>
        )}
      </div>

      {/* Full expression header */}
      <header className="expression-header">
        <div className="expression-header-content">
          {renderFullExpression()}
        </div>
      </header>

      {/* Two column layout */}
      <div className="expression-content">
        {/* Left column - MIPVU Record */}
        <div className="expression-left">
          <section className="mipvu-section">
            <div className="mipvu-header">
              <h2>{t.concordance?.mipvuRecord || "Ficha MIPVU"}</h2>
              <span className="field-count">20 {t.concordance?.fields || "campos"}</span>
              <span className="corpus-badge">{expression.id_registro}</span>
            </div>

            <div className="mipvu-fields">
              {/* Row 1 - Orden (full width for position bar) */}
              <div className="mipvu-row">
                <div className="mipvu-field mipvu-field--order full">
                  <label>{t.concordance?.fieldOrder || "Orden"}</label>
                  <div className="order-position">
                    <span className="order-value">
                      {expression.orden}
                      {sourceTotal > 0 && (
                        <span className="order-total"> / {sourceTotal}</span>
                      )}
                    </span>
                    {sourceTotal > 0 && (
                      <div className="order-bar-container">
                        <div className="order-bar-wrapper" aria-label={t.concordance?.orderPositionLabel || "Posición relativa en el documento fuente"}>
                          <div
                            className="order-bar-fill"
                            style={{ width: `${Math.min((expression.orden / sourceTotal) * 100, 100)}%` }}
                          />
                        </div>
                        <div className="order-bar-labels">
                          <span>{t.concordance?.orderStart || "inicio"}</span>
                          <span>{t.concordance?.orderPositionLabel || "posición relativa en el documento fuente"}</span>
                          <span>{t.concordance?.orderEnd || "fin"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2 - Fuente textual */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldSource || "Fuente textual"}</label>
                  <span className="field-value">
                    {expression.fuente_textual.titulo_1}
                    {expression.fuente_textual.titulo_2 && ` \u2014 ${expression.fuente_textual.titulo_2}`}
                  </span>
                  {(expression.fuente_textual.titulo_3 || expression.pagina) && (
                    <span className="source-subtitle">
                      {[
                        expression.fuente_textual.titulo_3,
                        expression.pagina != null ? `p.\u00a0${expression.pagina}` : null,
                      ]
                        .filter(Boolean)
                        .join(" \u00b7 ")}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2 */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldExpression || "Expresión"}</label>
                  <span className="field-value expression-value">{expression.expresion_metaforica}</span>
                </div>
              </div>

              {/* Row 3 - Focus + lema + categoría gramatical */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldFocus || "Foco"}</label>
                  <div className="focus-inline">
                    {expression.foco ? (
                      <span className="focus-inline-value">{expression.foco}</span>
                    ) : (
                      <span className="empty-value" title="Foco no especificado">—</span>
                    )}
                    {expression.foco_lematizado && expression.foco_lematizado !== expression.foco && (
                      <span className="focus-lema">
                        <span className="focus-sep">·</span>
                        {t.concordance?.lema || "lema"}: {expression.foco_lematizado}
                      </span>
                    )}
                    {(expression.categoria_gramatical || expression.cat_gramatical)?.nombre && (
                      <span className="focus-sep">·</span>
                    )}
                    {(expression.categoria_gramatical || expression.cat_gramatical)?.nombre ? (
                      <span className="tag category-tag">
                        {(expression.categoria_gramatical || expression.cat_gramatical)?.nombre?.toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="mipvu-row">
                <div className="mipvu-field">
                  <label>{t.concordance?.fieldContextual || "Significado contextual"}</label>
                  <span className="field-value">{expression.significado_contextual || "—"}</span>
                </div>
                <div className="mipvu-field">
                  <label>{t.concordance?.fieldBasic || "Significado básico"}</label>
                  <span className="field-value">{expression.significado_basico || "—"}</span>
                </div>
              </div>

              {/* Row 5 - Metaphor conceptual with link */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldMetaphor || "Metáfora conceptual"}</label>
                  <span className="field-value">
                    {expression.metafora_conceptual?.nombre ? (
                      <Link
                        href={`/corpus/${corpus.slug}/metaphors?id=${expression.metafora_conceptual.id}`}
                        className="link-value metaphor-link"
                      >
                        {expression.metafora_conceptual.nombre}
                      </Link>
                    ) : (
                      <span className="empty-value" title="No se ha asignado una metáfora conceptual a esta expresión">—</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Row 6 - Domains with links - nested in metafora_conceptual per backend API */}
              <div className="mipvu-row">
                <div className="mipvu-field">
                  <label>{t.concordance?.fieldSourceDomain || "Dominio fuente"}</label>
                  <span className="field-value">
                    {expression.metafora_conceptual?.dominio_fuente?.nombre ? (
                      <Link
                        href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(expression.metafora_conceptual.dominio_fuente.nombre)}`}
                        className="link-value tag source-domain-tag"
                      >
                        {expression.metafora_conceptual.dominio_fuente.nombre}
                      </Link>
                    ) : (
                      <span className="empty-value" title="Dominio fuente no especificado">—</span>
                    )}
                  </span>
                </div>
                <div className="mipvu-field">
                  <label>{t.concordance?.fieldTargetDomain || "Dominio meta"}</label>
                  <span className="field-value">
                    {expression.metafora_conceptual?.dominio_meta?.nombre ? (
                      <Link
                        href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(expression.metafora_conceptual.dominio_meta.nombre)}`}
                        className="link-value tag target-domain-tag"
                      >
                        {expression.metafora_conceptual.dominio_meta.nombre}
                      </Link>
                    ) : (
                      <span className="empty-value" title="Dominio meta no especificado">—</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Row 7 - Typology only */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldTypology || "Tipología"}</label>
                  <span className="field-value">
                    {tipologia ? (
                      <span
                        className="tag typology-tag"
                        style={{
                          backgroundColor: `${typologyColor}15`,
                          borderColor: typologyColor,
                          color: typologyColor,
                        }}
                      >
                        {tipologia}
                      </span>
                    ) : (
                      <span className="empty-value" title="Tipología no especificada">—</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Row 8 - Correspondences - backend uses corresp_ontologicas/corresp_epistemicas */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldOntological || "Correspondencias ontológicas"}</label>
                  <span className="field-value">
                    {expression.corresp_ontologicas || expression.correspondencias_ontologicas || 
                     <span className="empty-value">—</span>}
                  </span>
                </div>
              </div>

              {/* Row 9 */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldEpistemic || "Correspondencias epistémicas"}</label>
                  <span className="field-value">
                    {expression.corresp_epistemicas || expression.correspondencias_epistemicas || 
                     <span className="empty-value">—</span>}
                  </span>
                </div>
              </div>

              {/* Row 10 */}
              <div className="mipvu-row">
                <div className="mipvu-field full">
                  <label>{t.concordance?.fieldObservations || "Observaciones"}</label>
                  <span className="field-value">{expression.observaciones || "—"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Nearby expressions - deduplicate by ID */}
          {(() => {
            // Remove duplicates by ID (keep first occurrence) and exclude current
            const seenIds = new Set<string>();
            const uniqueNearby = nearbyExpressions
              .filter((e) => e.id !== expression.id) // exclude current
              .filter((e) => {
                if (seenIds.has(e.id)) return false;
                seenIds.add(e.id);
                return true;
              })
              .sort((a, b) => a.orden - b.orden);

            if (uniqueNearby.length === 0) return null;

            return (
              <section className="nearby-section">
                <div className="section-header">
                  <h3>{t.concordance?.nearbyExpressions || "Expresiones cercanas"}</h3>
                  <span className="order-range">
                    {t.concordance?.orderRange || "Orden ±5"}
                  </span>
                </div>
                <div className="nearby-list">
                  {uniqueNearby.map((expr) => (
                    <Link
                      key={expr.id}
                      href={`/corpus/${corpus.slug}/concordance/${expr.id}`}
                      className="nearby-item"
                    >
                      <span className="nearby-order">{expr.orden}</span>
                      <span className="nearby-text">
                        «{expr.expresion_metaforica.slice(0, 80)}
                        {expr.expresion_metaforica.length > 80 ? "..." : ""}»
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>

        {/* Right column - Sidebar */}
        <aside className="expression-sidebar">
          {/* Citation */}
          <section className="sidebar-section">
            <h3>{t.concordance?.howToCite || "Cómo citar"}</h3>
            <div className="citation-box">
              <p className="citation-text">{citationText}</p>
              <button
                onClick={() => navigator.clipboard.writeText(citationText)}
                className="copy-citation-button"
              >
                {t.concordance?.copy || "Copiar"}
              </button>
            </div>
          </section>

          {/* Export */}
          <section className="sidebar-section">
            <h3>{t.concordance?.export || "Exportar"}</h3>
            <div className="export-options">
              <button onClick={exportJSONLD} className="export-button">
                <FileJson size={16} />
                JSON-LD
              </button>
              <button onClick={exportRIS} className="export-button">
                <FileText size={16} />
                RIS
              </button>
              <button onClick={exportTEI} className="export-button">
                <FileCode size={16} />
                TEI-XML
              </button>
              <button onClick={copyPermalink} className="export-button">
                <LinkIcon size={16} />
                {t.concordance?.permalink || "Copiar permalink"}
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

// Helper functions for downloads
function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, filename);
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain" });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
