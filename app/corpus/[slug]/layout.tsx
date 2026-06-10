import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { MainNavigation } from "@/components/main-navigation";
import { getCorpusBySlug } from "@/lib/corpora";

type CorpusLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function CorpusLayout({ children, params }: CorpusLayoutProps) {
  const { slug } = await params;
  const corpus = await getCorpusBySlug(slug);

  if (!corpus) {
    return notFound();
  }

  return (
    <div className="corpus-layout-shell">
      <MainNavigation corpus={corpus} />
      {children}
    </div>
  );
}
