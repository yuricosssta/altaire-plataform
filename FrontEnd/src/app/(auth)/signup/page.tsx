// FrontEnd/src/app/(auth)/signup/page.tsx
import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants/routes";

/**
 * Redirecionamento Canônico de Rota Legada.
 * Encaminha qualquer requisição a /signup para a página canônica /cadastro.
 */
export default function LegacySignupRedirectPage() {
  redirect(ROUTES.cadastro);
}