// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/linha-editorial/[versionId]/mapa/page.tsx
import { redirect } from "next/navigation";

export default async function LegacyLineMapRedirectPage({
  params,
}: {
  readonly params: Promise<{ projectId: string; versionId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/dashboard/editorial/${projectId}?aba=linha-editorial`);
}