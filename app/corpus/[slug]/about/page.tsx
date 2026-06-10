import { notFound } from "next/navigation";

import { AboutDashboard } from "@/components/about-dashboard";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchCorpusStats } from "@/lib/api";

type AboutPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const corpus = await getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  // Fetch corpus details including stats
  let corpusDetails = null;
  try {
    corpusDetails = await fetchCorpusStats(slug);
  } catch (error) {
    console.error("Error fetching corpus details:", error);
  }

  const corpusForComponent = {
    slug: corpus.slug,
    nombre: corpus.name,
    descripcion: corpus.description || null,
  };

  const detailsForComponent = corpusDetails
    ? { ...corpusDetails, doi: corpusDetails.doi ?? null }
    : null;

  return (
    <AboutDashboard
      corpus={corpusForComponent}
      details={detailsForComponent}
    />
  );
}
