"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Hash, Layers, Share2 } from "lucide-react";

import type { CorpusSummary } from "@/lib/corpora";
import type { ApiMetaphorDetail, ApiRelatedMetaphor } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/language-context";

type MetaphorDetailProps = {
  corpus: CorpusSummary;
  metaphor: ApiMetaphorDetail;
  expressions: {
    id: string;
    id_registro: string;
    orden: number;
    expresion_metaforica: string;
    corresp_ontologicas: string | null;
    corresp_epistemicas: string | null;
    fuente_textual: {
      id: string;
      titulo_1: string;
      autor: string | null;
    };
  }[];
  totalExpressions: number;
  currentPage: number;
  totalPages: number;
  relatedMetaphors: ApiRelatedMetaphor[];
};

export function MetaphorDetail({
  corpus,
  metaphor,
  expressions,
  totalExpressions,
  currentPage,
  totalPages,
  relatedMetaphors,
}: MetaphorDetailProps) {
  const { t } = useLanguage();
  const router = useRouter();

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      router.push(`/corpus/${corpus.slug}/metaphors/${metaphor.id}?page=${page}`);
    }
  };

  const showingFrom = (currentPage - 1) * 20 + 1;
  const showingTo = Math.min(currentPage * 20, totalExpressions);

  return (
    <main className="metaphor-detail-shell">
      {/* Header con navegación */}
      <header className="metaphor-detail-header">
        <Link
          href={`/corpus/${corpus.slug}/metaphors`}
          className="back-link"
        >
          <ArrowLeft size={18} />
          <span>Volver a metáforas</span>
        </Link>

        <div className="metaphor-title-section">
          <span className="section-tag">METÁFORA CONCEPTUAL</span>
          <h1 className="metaphor-title">{metaphor.nombre}</h1>
          {metaphor.descripcion && (
            <p className="metaphor-description">{metaphor.descripcion}</p>
          )}
        </div>
      </header>

      {/* Info cards */}
      <div className="metaphor-info-grid">
        {/* Dominios */}
        <div className="info-card">
          <div className="info-card-header">
            <Share2 size={18} />
            <span>Dominios</span>
          </div>
          <div className="domains-pair">
            {metaphor.dominio_fuente && (
              <div className="domain-item">
                <span className="domain-label">Fuente</span>
                <Link
                  href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(metaphor.dominio_fuente.nombre)}`}
                  className="domain-badge source"
                >
                  {metaphor.dominio_fuente.nombre}
                </Link>
              </div>
            )}
            {metaphor.dominio_meta && (
              <div className="domain-item">
                <span className="domain-label">Meta</span>
                <Link
                  href={`/corpus/${corpus.slug}/domains/${encodeURIComponent(metaphor.dominio_meta.nombre)}`}
                  className="domain-badge target"
                >
                  {metaphor.dominio_meta.nombre}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tipología */}
        <div className="info-card">
          <div className="info-card-header">
            <Layers size={18} />
            <span>Tipología</span>
          </div>
          <span className={`typology-badge typology-${(metaphor.tipologia || "OTRA").toLowerCase()}`}>
            {metaphor.tipologia || "Sin tipología"}
          </span>
        </div>

        {/* Estadísticas */}
        <div className="info-card">
          <div className="info-card-header">
            <Hash size={18} />
            <span>Estadísticas</span>
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{metaphor.estadisticas.total_expresiones}</span>
              <span className="stat-label">expresiones</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{metaphor.estadisticas.correspondencias_ontologicas_distintas}</span>
              <span className="stat-label">corr. ontológicas</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{metaphor.estadisticas.correspondencias_epistemicas_distintas}</span>
              <span className="stat-label">corr. epistémicas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Correspondencias */}
      {(metaphor.correspondencias.ontologicas.length > 0 ||
        metaphor.correspondencias.epistemicas.length > 0) && (
        <section className="correspondences-section">
          <h2 className="section-title">
            <BookOpen size={18} />
            Correspondencias
          </h2>
          <div className="correspondences-grid">
            {metaphor.correspondencias.ontologicas.length > 0 && (
              <div className="correspondence-list">
                <h3>Ontológicas</h3>
                <ul>
                  {metaphor.correspondencias.ontologicas.map((item, idx) => (
                    <li key={idx}>
                      <span className="correspondence-value">{item.valor}</span>
                      <span className="correspondence-freq">({item.frecuencia})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {metaphor.correspondencias.epistemicas.length > 0 && (
              <div className="correspondence-list">
                <h3>Epistémicas</h3>
                <ul>
                  {metaphor.correspondencias.epistemicas.map((item, idx) => (
                    <li key={idx}>
                      <span className="correspondence-value">{item.valor}</span>
                      <span className="correspondence-freq">({item.frecuencia})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Expresiones asociadas */}
      <section className="expressions-section">
        <h2 className="section-title">
          Expresiones asociadas
          <span className="section-count">{totalExpressions}</span>
        </h2>

        {expressions.length === 0 ? (
          <p className="empty-state">No hay expresiones asociadas.</p>
        ) : (
          <>
            <div className="expressions-list">
              {expressions.map((expr) => (
                <div key={expr.id} className="expression-item">
                  <div className="expression-header">
                    <span className="expression-order">#{expr.orden}</span>
                    <span className="expression-id">{expr.id_registro}</span>
                  </div>
                  <p className="expression-text">{expr.expresion_metaforica}</p>
                  {expr.corresp_ontologicas && (
                    <p className="expression-correspondence">
                      <strong>Ontológica:</strong> {expr.corresp_ontologicas}
                    </p>
                  )}
                  {expr.corresp_epistemicas && (
                    <p className="expression-correspondence">
                      <strong>Epistémica:</strong> {expr.corresp_epistemicas}
                    </p>
                  )}
                  <p className="expression-source">
                    <em>{expr.fuente_textual.titulo_1}</em>
                    {expr.fuente_textual.autor && ` — ${expr.fuente_textual.autor}`}
                  </p>
                </div>
              ))}
            </div>

            {/* Pagination for expressions */}
            {totalPages > 1 && (
              <div className="expressions-pagination">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="pagination-button"
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  {showingFrom}-{showingTo} de {totalExpressions} · Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="pagination-button"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Metáforas relacionadas */}
      {relatedMetaphors.length > 0 && (
        <section className="related-section">
          <h2 className="section-title">
            <Share2 size={18} />
            Metáforas relacionadas
          </h2>
          <div className="related-grid">
            {relatedMetaphors.map((related) => (
              <Link
                key={related.id}
                href={`/corpus/${corpus.slug}/metaphors/${related.id}`}
                className="related-card"
              >
                <h4>{related.nombre}</h4>
                <div className="related-meta">
                  <span className={`typology-badge typology-${(related.tipologia || "OTRA").toLowerCase()}`}>
                    {related.tipologia || "—"}
                  </span>
                  <span className="relation-type">{related.tipo_relacion}</span>
                </div>
                <span className="expressions-count">{related.total_expresiones} expresiones</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
