// FrontEnd/src/app/(main)/dashboard/layout.tsx
import type { ReactNode } from "react";

/**
 * Sub-layout de `/dashboard/*`.
 *
 * O Shell Global (Sidebar + Header + Micro-mensagem de continuidade) já é
 * renderizado pelo layout pai em `src/app/(main)/layout.tsx`.
 * Este arquivo atua exclusivamente como pass-through para evitar duplicação
 * de Sidebar e Header nas rotas filhas.
 */
export default function DashboardSubLayout({
  children,
}: {
  readonly children: ReactNode;
}) {
  return <>{children}</>;
}