import Link from "next/link";

import type { CorpusSummary } from "@/lib/corpora";

function formatExpressions(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

type CorpusSelectorProps = {
  corpora: CorpusSummary[];
};

export function CorpusSelector({ corpora }: CorpusSelectorProps) {
  return (
    <main className="selector-shell">
      <section className="selector-hero">
        <h1 className="selector-title">
          Meta<span>Corpus</span> Explorer
        </h1>
        <p className="selector-description">
          Plataforma multi-corpus para la exploración, búsqueda y visualización de
          metáforas conceptuales anotadas con MIPVU. Selecciona un corpus para
          comenzar tu sesión.
        </p>
      </section>

      <section className="selector-grid" aria-label="Corpus disponibles">
        {corpora.map((corpus) => (
          <article key={corpus.slug} className="corpus-card">
            <div className="corpus-card-top">
              <p className="corpus-code">{corpus.shortCode}</p>
              <h2 className="corpus-name">{corpus.name}</h2>
              <p className="corpus-copy">{corpus.description}</p>
            </div>

            <div className="corpus-badges">
              <span className="badge badge-soft">{corpus.language}</span>
              <span className="badge">v{corpus.version}</span>
              <span className="badge badge-accent">{corpus.license}</span>
            </div>

            <dl className="corpus-metrics">
              <div>
                <dt>Expresiones</dt>
                <dd>{formatExpressions(corpus.expressions)}</dd>
              </div>
              <div>
                <dt>Metáforas</dt>
                <dd>{formatExpressions(corpus.metaphors)}</dd>
              </div>
              <div>
                <dt>Dom. fuente</dt>
                <dd>{formatExpressions(corpus.sourceDomains)}</dd>
              </div>
              <div>
                <dt>Dom. meta</dt>
                <dd>{formatExpressions(corpus.targetDomains)}</dd>
              </div>
            </dl>

            <div className="corpus-card-footer">
              <div>
                <p className="corpus-date-label">Publicado</p>
                <p className="corpus-date">{formatDate(corpus.publicationDate)}</p>
              </div>
              <Link
                className="explore-link"
                href={`/corpus/${corpus.slug}/dashboard`}
              >
                Explorar
              </Link>
            </div>
          </article>
        ))}
      </section>

      <footer className="selector-footer">
        <span>MIPVU · Metaphor Identification Procedure Vrije Universiteit</span>
        <span>Abierto · Citable · Interoperable · Reutilizable</span>
      </footer>
    </main>
  );
}
