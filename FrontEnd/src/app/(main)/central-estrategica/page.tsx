// FrontEnd/src/app/(main)/central-estrategica/page.tsx
/**
 * Rota-Ponte Anti-404: /central-estrategica
 *
 * Alias legado. Redireciona permanentemente para a Central Estratégica
 * canônica em /dashboard/editorial.
 */
import { redirect } from "next/navigation";

export default function CentralEstrategicaBridgePage() {
  redirect("/dashboard/editorial");
}

