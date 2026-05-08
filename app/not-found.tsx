import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="not-found-shell">
      <div className="not-found-card">
        <p className="selector-kicker">MetaCorpus Explorer</p>
        <h1>Página no encontrada</h1>
        <p>
          El corpus o la ruta solicitada no existen en esta versión inicial del
          frontend.
        </p>
        <Link href="/" className="change-corpus-link">
          Volver al selector
        </Link>
      </div>
    </main>
  );
}
