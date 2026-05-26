import { notFound } from "next/navigation";

import { DashboardOverview } from "@/components/dashboard-overview";
import { getCorpusBySlug } from "@/lib/corpora";

type DashboardPageProps = {
  params: {
    slug: string;
  };
};

export default function DashboardPage({ params }: DashboardPageProps) {
  const corpus = getCorpusBySlug(params.slug);

  if (!corpus) {
    return notFound();
  }

  return <DashboardOverview corpus={corpus} />;
}
