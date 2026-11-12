// FrontEnd/src/app/(main)/dashboard/editorial/[projectId]/calendario-editorial/[calendarId]/page.tsx
import { redirect } from "next/navigation";

export default async function LegacyCalendarRedirectPage({
  params,
}: {
  readonly params: Promise<{ projectId: string; calendarId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/dashboard/editorial/${projectId}?aba=calendario`);
}