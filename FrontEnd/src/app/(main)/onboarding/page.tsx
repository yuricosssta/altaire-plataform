// FrontEnd/src/app/(main)/onboarding/page.tsx
/**
 * Rota-Ponte Anti-404: /onboarding
 *
 * Alias legado. Redireciona permanentemente para o Onboarding Editorial
 * canônico em /dashboard/editorial?onboarding=true.
 */
import { redirect } from "next/navigation";

export default function OnboardingBridgePage() {
  redirect("/dashboard/editorial?onboarding=true");
}

