import type { CorpusSummary } from "@/lib/corpora";

function formatNumber(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

type DashboardOverviewProps = {
  corpus: CorpusSummary;
};

export function DashboardOverview({ corpus }: DashboardOverviewProps) {
  const stats = [
    { label: "Expresiones", value: formatNumber(corpus.expressions) },
    { label: "Metáforas conceptuales", value: formatNumber(corpus.metaphors) },
    { label: "Dominios fuente", value: formatNumber(corpus.sourceDomains) },
    { label: "Dominios meta", value: formatNumber(corpus.targetDomains) },
  ];

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero-card">
        <div>
          <p className="dashboard-eyebrow">Dashboard del corpus</p>
          <h1>{corpus.name}</h1>
          <p>
            Vista inicial del corpus activo. Esta base deja resuelta la selección
            multi-corpus por URL y la persistencia del contexto de exploración.
          </p>
        </div>
        <div className="dashboard-topic-card">
          <span>Línea destacada</span>
          <strong>{corpus.highlightedTopic}</strong>
        </div>
      </section>

      <section className="stats-grid" aria-label="Estadísticas del corpus">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-panels">
        <article className="info-panel">
          <p className="panel-kicker">Estado actual</p>
          <h2>Primera entrega del frontend</h2>
          <p>
            La navegación ya queda scoped al corpus mediante el slug en la URL,
            permitiendo enlaces compartibles y una base limpia para conectar el
            backend read-only en siguientes iteraciones.
          </p>
        </article>

        <article className="info-panel info-panel-highlight">
          <p className="panel-kicker">Próximos módulos</p>
          <ul>
            <li>Explorador de metáforas</li>
            <li>Explorador de dominios</li>
            <li>KWIC y búsqueda full-text</li>
            <li>Mapa radial y estadísticas dinámicas</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
