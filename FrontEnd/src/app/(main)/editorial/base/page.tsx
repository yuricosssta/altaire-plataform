// FrontEnd/src/app/(main)/editorial/base/page.tsx
/**
 * Rota-Ponte Anti-404: /editorial/base
 *
 * Redireciona permanentemente para a Central Estratégica canônica em
 * /dashboard/editorial, preservando o parâmetro de onboarding quando presente.
 *
 * Esta rota existe apenas como guardrail de segurança; o roteamento real
 * pós-login é feito via WORKSPACE_ROUTES em routes.ts.
 */
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EditorialBaseBridgePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const isOnboarding =
    params?.onboarding === "true" || params?.novo === "true";

  if (isOnboarding) {
    redirect("/dashboard/editorial?onboarding=true");
  }

  redirect("/dashboard/editorial");
}
