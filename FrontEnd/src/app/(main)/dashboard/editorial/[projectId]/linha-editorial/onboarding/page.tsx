// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/linha-editorial/onboarding/page.tsx
import { redirect } from "next/navigation";

export default async function LegacyOnboardingRedirectPage({
  params,
}: {
  readonly params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/dashboard/editorial/${projectId}?aba=linha-editorial`);
}