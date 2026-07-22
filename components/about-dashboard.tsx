"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { Download, FileText, Database, Code } from "lucide-react";

// Types
type AboutDashboardProps = {
  corpus: {
    slug: string;
    nombre: string;
    descripcion?: string | null;
  };
  details: {
    slug: string;
    nombre: string;
    descripcion: string | null;
    version: string;
    fecha_publicacion: string | null;
    doi: string | null;
    licencia: string | null;
    como_citar?: string;
    fair?: {
      findable: {
        slug: string;
        doi: string | null;
        identificadores: string[];
      };
      accessible: {
        activo: boolean;
        licencia: string | null;
      };
      interoperable: {
        idioma: string;
        formato_api: string;
        version_api: string;
      };
      reusable: {
        licencia: string | null;
        version: string;
        fecha_publicacion: string | null;
        autores: unknown;
      };
    };
    autores?: unknown;
  } | null;
};

// FAIR Cards Component
function FairCards({ fair }: { fair?: { findable: unknown; accessible: unknown; interoperable: unknown; reusable: unknown } | undefined }) {
  const cards = [
    {
      letter: "F",
      title: "Findable",
      subtitle: "LOCALIZABLE",
      description:
        "Slug de corpus, DOIs, indexación en OLAC, esquema y Google Dataset Search y Schema.org.",
    },
    {
      letter: "A",
      title: "Accessible",
      subtitle: "ACCESIBLE",
      description:
        "API REST pública sobre HTTPS sin autenticación para lectura, metadatos Dublin Core.",
    },
    {
      letter: "I",
      title: "Interoperable",
      subtitle: "INTEROPERABLE",
      description:
        "JSON-LD, TEI-XML, RDF/Turtle, Vocabularios SKOS, Dublin Core, Universal Dependencies.",
    },
    {
      letter: "R",
      title: "Reusable",
      subtitle: "REUTILIZABLE",
      description:
        "Licencia CC-BY 4.0, proceso técnica detallada por registro, estándares MIPVU + TEI.",
    },
  ];

  return (
    <div className="fair-cards-grid">
      {cards.map((card) => (
        <div key={card.letter} className="fair-card">
          <div className="fair-card-header">
            <span className="fair-letter">{card.letter}</span>
            <div className="fair-titles">
              <h3 className="fair-title">{card.title}</h3>
              <span className="fair-subtitle">{card.subtitle}</span>
            </div>
          </div>
          <p className="fair-description">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

// Download Item Component
function DownloadItem({
  format,
  description,
  icon: Icon,
}: {
  format: string;
  description: string;
  icon: typeof Download;
}) {
  return (
    <div className="download-item">
      <div className="download-info">
        <span className="download-format">.{format}</span>
        <span className="download-desc">{description}</span>
      </div>
      <button className="download-btn" title={`Descargar ${format}`}>
        <Icon size={16} />
      </button>
    </div>
  );
}

// Sidebar Component
function AboutSidebar({
  citation,
  downloads,
  autores,
}: {
  citation?: string;
  downloads?: { format: string; description: string; icon: typeof Download }[];
  autores?: { nombre: string; afiliacion?: string }[];
}) {
  const defaultDownloads = [
    { format: "csv", description: "Plano, todos los campos", icon: FileText },
    { format: "json", description: "Jerárquico", icon: Code },
    { format: "json-ld", description: "Linked Data", icon: Database },
    { format: "tei-xml", description: "Text Encoding Initiative", icon: FileText },
    { format: "rdf", description: "Linked Data (semantic)", icon: Database },
  ];

  return (
    <aside className="about-sidebar">
      {/* Citation Section */}
      <section className="sidebar-section">
        <h3>Cómo citar</h3>
        <div className="citation-box-compact">
          <p className="citation-text-compact">
            {citation ||
              "Andrés Caicedo, Valentina Ruiz (2024). Prensa Política Colombiana 2018-2024 (Versión 0.8.2) [Corpus de metáforas conceptuales MIPVU]. Semillero Corpus vs Machine. https://doi.org/10.5281/zenodo.15661203"}
          </p>
        </div>
      </section>

      {/* Downloads Section */}
      <section className="sidebar-section">
        <h3>Descargar corpus</h3>
        <div className="downloads-list">
          {(downloads || defaultDownloads).map((item) => (
            <DownloadItem
              key={item.format}
              format={item.format}
              description={item.description}
              icon={item.icon}
            />
          ))}
        </div>
      </section>

      {/* Authors Section */}
      <section className="sidebar-section">
        <h3>Autoría y anotación</h3>
        <div className="authors-list">
          {(autores || [
            { nombre: "Andrés Caicedo", afiliacion: "Universidad de los Andes" },
            { nombre: "Valentina Ruiz", afiliacion: "Universidad de Medellín" },
          ]).map((autor) => (
            <div key={autor.nombre} className="author-item">
              <span className="author-name">{autor.nombre}</span>
              {autor.afiliacion && (
                <span className="author-affiliation">{autor.afiliacion}</span>
              )}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

// Main About Dashboard Component
export function AboutDashboard({ corpus, details }: AboutDashboardProps) {
  const { t } = useLanguage();

  // Format authors from details
  const autores = Array.isArray(details?.autores)
    ? details.autores.map((a: { nombre?: string; afiliacion?: string }) => ({
        nombre: a.nombre || "",
        afiliacion: a.afiliacion || "",
      }))
    : undefined;

  return (
    <div className="about-page">
      {/* Header */}
      <header className="about-header">
        <span className="section-tag">DOCUMENTACIÓN</span>
        <h1>Acerca del corpus</h1>
        <p className="subtitle">
          Metodología MIPVU, principios FAIR, licencia, cómo citar y descargas.
        </p>
      </header>

      {/* FAIR Cards */}
      <FairCards fair={details?.fair} />

      {/* Main Content Grid */}
      <div className="about-content-grid">
        {/* Left Column - Main Content */}
        <div className="about-main">
          {/* MIPVU Methodology */}
          <section className="about-section">
            <h2>Metodología MIPVU</h2>
            <p>
              El Metaphor Identification Procedure Vrije Universiteit (MIPVU) es el protocolo
              estándar de anotación de metáforas lingüísticas, desarrollado en la Universidad Libre
              de Ámsterdam. El procedimiento identifica unidades léxicas metafóricas mediante la
              comparación entre su significado contextual y su significado básico según un diccionario
              de referencia (para el español, el DLE).
            </p>
          </section>

          {/* Annotation Schema */}
          <section className="about-section">
            <h2>Esquema de anotación — 20 campos</h2>
            <p>
              Cada registro MIPVU incluye: <strong>ID, Orden</strong> (consecutivo secuencial único por documento
              fuente), <strong>Título 1/2/3, Página, Expresión metafórica, Contexto, Foco, Foco lematizado,
              Categoría gramatical del foco, Significado contextual, Significado básico, Metáfora
              conceptual (dominio X ES Y), Dominio fuente, Dominio meta, Correspondencias
              ontológicas, Correspondencias epistémicas, Tipología, Observaciones</strong>.
            </p>
          </section>

          {/* The Orden Field */}
          <section className="about-section">
            <h2>El campo Orden</h2>
            <p>
              Un aporte diferenciador de MetaCorpus Explorer es el tratamiento explícito del campo
              Orden como entero único por documento fuente. Este campo permite medir la
              proximidad textual entre expresiones metafóricas con granularidad superior al
              número de página, habilitando visualizaciones de densidad metafórica y navegación
              secuencial por la aparición en el texto, no por ID arbitrario.
            </p>
          </section>

          {/* Current Corpus Info */}
          <section className="about-section">
            <h2>Corpus actual — {details?.nombre || corpus.nombre}</h2>
            <p className="corpus-version">
              Versión {details?.version || "0.8.2"}, publicado el{" "}
              {details?.fecha_publicacion || "2024-03-30"}. Licencia{" "}
              {details?.licencia || "CC-BY-4.0"}.{" "}
              {details?.doi && (
                <>
                  DOI{" "}
                  <a
                    href={`https://doi.org/${details.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doi-link"
                  >
                    {details.doi}
                  </a>
                  .
                </>
              )}
            </p>
          </section>
        </div>

        {/* Right Column - Sidebar */}
        <AboutSidebar
          citation={details?.como_citar}
          autores={autores}
        />
      </div>
    </div>
  );
}
