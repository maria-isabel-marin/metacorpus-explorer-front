import { notFound } from "next/navigation";

import { ExpressionDetail } from "@/components/expression-detail";
import { getCorpusBySlug } from "@/lib/corpora";
import { fetchExpressionById, fetchNearbyExpressions, fetchSourceExpressionCount } from "@/lib/api";

type ExpressionDetailPageProps = {
  params: Promise<{ slug: string; expressionId: string }>;
};

export default async function ExpressionDetailPage({
  params,
}: ExpressionDetailPageProps) {
  const { slug, expressionId } = await params;

  const corpus = await getCorpusBySlug(slug);
  if (!corpus) {
    return notFound();
  }

  const expression = await fetchExpressionById(slug, expressionId);
  if (!expression) {
    return notFound();
  }

  // Fetch nearby expressions (±5) and total count in parallel
  const [nearbyExpressions, sourceTotal] = await Promise.all([
    fetchNearbyExpressions(
      slug,
      expressionId,
      expression.fuente_textual.id,
      expression.orden,
      5
    ),
    fetchSourceExpressionCount(slug, expression.fuente_textual.id),
  ]);

  return (
    <ExpressionDetail
      corpus={corpus}
      expression={expression}
      nearbyExpressions={nearbyExpressions}
      sourceTotal={sourceTotal}
    />
  );
}
