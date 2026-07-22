import { notFound } from "next/navigation";

import { ApiExplorer } from "@/components/api-explorer";
import { getCorpusBySlug } from "@/lib/corpora";

type ApiPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ApiPage({ params }: ApiPageProps) {
  const { slug } = await params;
  const corpus = await getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  return <ApiExplorer corpus={corpus} />;
}
