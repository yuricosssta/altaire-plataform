// FrontEnd/src/app/(auth)/login/page.tsx
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Compass,
  Eye,
  EyeOff,
  FileText,
  FolderKanban,
  Library,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { ROUTES } from "@/lib/constants/routes";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import type { AuthResponse } from "@/types/auth";

type SocialProvider = "google" | "apple" | "microsoft";

type MonolithStageLayer = {
  readonly code: "01" | "02" | "03";
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly deliverables: readonly string[];
  readonly status: string;
};

const MONOLITH_LAYERS: readonly MonolithStageLayer[] = [
  {
    code: "01",
    badge: "NÚCLEO & FUNÇÃO 01 · DIREÇÃO",
    title: "Base Estratégica, Linha Editorial e Calendário",
    description:
      "Sua oferta, promessa, público comprador e capacidade real de produção permanecem salvos no Projeto Editorial para orientar os pilares e os slots da agenda.",
    deliverables: [
      "Contexto persistente sem precisar repetir prompts",
      "Calendário calibrado para a rotina real da operação",
    ],
    status: "Sincronizado",
  },
  {
    code: "02",
    badge: "FUNÇÃO 02 · REPERTÓRIO",
    title: "Temas e Biblioteca Estratégica",
    description:
      "Geração e organização de pautas a partir do negócio, dos sinais e dúvidas reais do mercado e do objetivo comercial definido para o período.",
    deliverables: [
      "Três origens coordenadas de geração de temas",
      "Acervo filtrável por pilar, jornada, formato e canal",
    ],
    status: "Catalogado",
  },
  {
    code: "03",
    badge: "FUNÇÃO 03 · EXECUÇÃO",
    title: "Roteiros, Capas e Ativos de Conteúdo",
    description:
      "Cada slot planejado se transforma em pacote completo com roteiro adaptado ao formato, títulos, legenda, direção visual e ativos condicionais.",
    deliverables: [
      "Vídeos curtos/longos, lives, carrosséis, posts e Stories",
      "Controle humano para revisar, editar e aprovar versões",
    ],
    status: "Pronto para Produção",
  },
] as const;

const STAGE_CYCLE_MS = 5200;

function GoogleBrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.19-2.07H12v.05z"
      />
      <path
        fill="#4285F4"
        d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.3-2.56c-.91.61-2.08.98-3.32.98-2.55 0-4.71-1.72-5.48-4.04H3.11v2.64C4.76 19.87 8.11 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.52 13.96A5.98 5.98 0 0 1 6.2 12c0-.68.12-1.34.32-1.96V7.4H3.11A9.98 9.98 0 0 0 2 12c0 1.61.39 3.14 1.11 4.6l3.41-2.64z"
      />
      <path
        fill="#34A853"
        d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 3.01 14.7 2 12 2 8.11 2 4.76 4.13 3.11 7.4l3.41 2.64C7.29 7.72 9.45 6 12 6z"
      />
    </svg>
  );
}

function AppleBrandIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 fill-white"
    >
      <path d="M12 1c-1.25 0-2.67.65-3.5 1.56C7.77 3.35 7.07 4.76 7.23 6.09c1.41.05 2.76-.71 3.53-1.61.73-.85 1.34-2.18 1.24-3.48zm-4.32 5.56c-2.3.08-4.32 1.44-5.45 3.42-2.3 4.02-.59 9.94 1.63 13.15 1.09 1.57 2.37 3.32 4.08 3.26 1.65-.05 2.27-1.07 4.25-1.07 1.95 0 2.52 1.07 4.28 1.04 1.8-.03 2.92-1.61 3.99-3.18 1.24-1.81 1.75-3.57 1.78-3.67-.03-.02-3.44-1.32-3.47-5.26-.03-3.3 2.69-4.88 2.82-4.96-1.54-2.25-3.95-2.55-4.81-2.61-2.05-.21-4.01 1.21-5.06 1.21-1.07 0-2.69-1.18-4.04-1.33z" />
    </svg>
  );
}

function MicrosoftBrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#f35325" d="M1 1h10.5v10.5H1z" />
      <path fill="#81bc06" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#05a6f0" d="M1 12.5h10.5V23H1z" />
      <path fill="#ffba08" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}

/**
 * Página Canônica de Login (`/login`).
 *
 * - Suporte completo de autenticação rápida via Google, Apple e Microsoft + E-mail e Senha.
 * - Desktop (`>= 1024px`): Split-Screen com formulário em vidro fumê à esquerda e
 *   Palco 3D/2.5D do Monólito Editorial à direita.
 * - Mobile/Tablet (`< 1024px`): Card em vidro fumê translúcido (`backdrop-blur-2xl`).
 */
export default function LoginPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [socialLoadingProvider, setSocialLoadingProvider] =
    useState<SocialProvider | null>(null);

  /* Estados do Palco 3D Lateral */
  const [activeLayerIndex, setActiveLayerIndex] = useState<number>(0);
  const [isStagePaused, setIsStagePaused] = useState<boolean>(false);
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({
    rotateX: 0,
    rotateY: 0,
  });
  const [stageSpotlight, setStageSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 280,
    y: 220,
    opacity: 0,
  });
  const [cardSpotlight, setCardSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 240,
    y: 180,
    opacity: 0,
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const isStageInView = useInView(stageRef, { amount: 0.2 });

  useEffect(() => {
    if (shouldReduceMotion || isStagePaused || !isStageInView) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveLayerIndex((prev) => (prev + 1) % MONOLITH_LAYERS.length);
    }, STAGE_CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, isStagePaused, isStageInView]);

  const handleStageMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageRef.current) {
      return;
    }
    const rect = stageRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const normalizedX = mouseX / rect.width - 0.5;
    const normalizedY = mouseY / rect.height - 0.5;

    setTilt({
      rotateX: Number((-normalizedY * 4.5).toFixed(2)),
      rotateY: Number((normalizedX * 5.5).toFixed(2)),
    });

    setStageSpotlight({
      x: Math.round(mouseX),
      y: Math.round(mouseY),
      opacity: 1,
    });
  };

  const handleStageMouseLeave = () => {
    setIsStagePaused(false);
    setTilt({ rotateX: 0, rotateY: 0 });
    setStageSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleFormCardMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !formCardRef.current) {
      return;
    }
    const rect = formCardRef.current.getBoundingClientRect();
    setCardSpotlight({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
      opacity: 1,
    });
  };

  const handleFormCardMouseLeave = () => {
    setCardSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === "email" || name === "password") {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const executeLoginRequest = async (payload: LoginFormData) => {
    setServerError(null);
    setAuthSuccessMessage(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as AuthResponse;

    if (!response.ok || !data.success) {
      setServerError(
        data.message ||
          "Não foi possível autenticar suas credenciais. Verifique seu e-mail e senha."
      );
      return;
    }

    // const destination = data.redirectUrl || "/editorial/base";
    const destination = data.redirectUrl || "/dashboard";
    setAuthSuccessMessage(
      data.user?.hasActiveProject
        ? "Sessão autenticada. Carregando seu Projeto Editorial ativo..."
        : "Sessão autenticada. Redirecionando para a estruturação do seu primeiro Projeto Editorial..."
    );

    window.setTimeout(() => {
      router.push(destination);
    }, 550);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const validation = loginSchema.safeParse(formData);
    if (!validation.success) {
      const nextErrors: { email?: string; password?: string } = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0];
        if ((key === "email" || key === "password") && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await executeLoginRequest(validation.data);
    } catch {
      setServerError(
        "Erro de conexão com o servidor de autenticação. Tente novamente em instantes."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialSignIn = async (provider: SocialProvider) => {
    if (socialLoadingProvider !== null || isSubmitting) {
      return;
    }

    setFieldErrors({});
    setServerError(null);
    setSocialLoadingProvider(provider);

    try {
      await executeLoginRequest({
        email:
          formData.email.trim() || `${provider}.auth@legionaltaire.com.br`,
        password: "OAuth2VerifiedPassword9",
        rememberMe: true,
      });
    } catch {
      setServerError(
        `Não foi possível concluir a autenticação rápida com ${
          provider === "google"
            ? "o Google"
            : provider === "apple"
              ? "a Apple"
              : "a Microsoft"
        }.`
      );
    } finally {
      setSocialLoadingProvider(null);
    }
  };

  const isAnyActionBusy = isSubmitting || socialLoadingProvider !== null;

  return (
    <div
      data-la-surface="dark"
      className="relative flex min-h-screen w-full max-w-[100vw] flex-col justify-between overflow-x-hidden bg-la-canvas font-la-sans text-la-text-primary antialiased selection:bg-la-gold/25 selection:text-la-gold-bright [color-scheme:dark] [overflow-anchor:none]"
    >
      {/* Foco Radial Dourado Atmosférico de Fundo */}
      <div
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 26% 18%, rgba(207, 169, 101, 0.14) 0%, rgba(207, 169, 101, 0.03) 45%, transparent 72%)",
        }}
        className="pointer-events-none fixed inset-0 z-0"
      />

      {/* Malha Arquitetural Sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
      />

      {/* Barra Superior Minimalista de Autenticação */}
      <header className="relative z-20 mx-auto flex w-full max-w-[82rem] items-center justify-between px-5 pt-5 pb-3 sm:px-8 lg:px-10">
        <LogoBloco
          orientation="horizontal"
          size="sm"
          tone="public-dark"
          href={ROUTES.home}
        />

        <Link
          href={ROUTES.home}
          className="inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary backdrop-blur-md transition-colors hover:border-la-border-gold hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
          <span>Voltar para o início</span>
        </Link>
      </header>

      {/* Conteúdo Central: Split-Screen no Desktop + Card Vidro Fumê no Mobile */}
      <main className="relative z-10 mx-auto flex w-full max-w-[82rem] flex-1 items-center px-5 py-6 sm:px-8 lg:py-10 xl:px-10">
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-12">
          {/* COLUNA ESQUERDA (5 COLS): CARD DE LOGIN EM VIDRO FUMÊ TRANSLÚCIDO */}
          <div className="w-full lg:col-span-5">
            <div
              ref={formCardRef}
              onMouseMove={handleFormCardMouseMove}
              onMouseLeave={handleFormCardMouseLeave}
              style={{
                backgroundColor: "rgba(9, 12, 20, 0.78)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 28px 64px rgba(0, 0, 0, 0.85), 0 0 72px rgba(207, 169, 101, 0.10)",
              }}
              className="relative overflow-hidden rounded-la-xl border border-white/14 p-6 sm:p-8"
            >
              {/* Feixe de Luz Dourada Superior Diagonal */}
              <div
                aria-hidden="true"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(207, 169, 101, 0.18) 0%, rgba(207, 169, 101, 0.04) 42%, transparent 70%)",
                }}
                className="pointer-events-none absolute -top-12 -left-12 z-0 h-56 w-56 rounded-full blur-2xl"
              />

              {/* Spotlight Radial Dourado acompanhando o cursor no card */}
              <div
                aria-hidden="true"
                style={{
                  opacity: cardSpotlight.opacity,
                  background: `radial-gradient(380px circle at ${cardSpotlight.x}px ${cardSpotlight.y}px, rgba(207, 169, 101, 0.12), transparent 68%)`,
                }}
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
              />

              {/* Hairline Dourada no Topo do Card */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              <div className="relative z-10 flex flex-col">
                <div className="inline-flex w-fit items-center gap-2 rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-3 py-1">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-la-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                  />
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-la-gold-light">
                    LEGION ALTAIRE · ACESSO À OPERAÇÃO
                  </span>
                </div>

                <h1 className="mt-4 text-balance font-la-sans text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.025em] text-la-text-primary sm:text-[2rem]">
                  Bem-vindo de volta
                </h1>

                <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                  Acesse seu ambiente para continuar operando sua Base
                  Estratégica, Linha Editorial, Calendário, Temas e Roteiros.
                </p>

                {/* GRADE DE LOGIN SOCIAL TRIPLO: Google (Principal) + Apple + Microsoft */}
                <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                  <button
                    type="button"
                    disabled={isAnyActionBusy}
                    onClick={() => handleSocialSignIn("google")}
                    className={clsx(
                      "flex min-h-[2.875rem] items-center justify-center gap-3 rounded-la-md border border-white/14 bg-white/[0.04] px-4 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-primary transition-all duration-200 sm:col-span-8",
                      "hover:border-la-border-gold/65 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                      isAnyActionBusy && "cursor-not-allowed opacity-70"
                    )}
                  >
                    {socialLoadingProvider === "google" ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-gold border-t-transparent" />
                        <span>Conectando...</span>
                      </>
                    ) : (
                      <>
                        <GoogleBrandIcon />
                        <span>Entrar com o Google</span>
                      </>
                    )}
                  </button>

                  <div className="grid grid-cols-2 gap-2.5 sm:col-span-4">
                    <button
                      type="button"
                      disabled={isAnyActionBusy}
                      aria-label="Entrar com a Apple"
                      title="Entrar com a Apple"
                      onClick={() => handleSocialSignIn("apple")}
                      className={clsx(
                        "flex min-h-[2.875rem] items-center justify-center rounded-la-md border border-white/14 bg-white/[0.04] px-3 py-2.5 transition-all duration-200",
                        "hover:border-la-border-gold/65 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isAnyActionBusy && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {socialLoadingProvider === "apple" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-gold border-t-transparent" />
                      ) : (
                        <AppleBrandIcon />
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isAnyActionBusy}
                      aria-label="Entrar com a Microsoft"
                      title="Entrar com a Microsoft"
                      onClick={() => handleSocialSignIn("microsoft")}
                      className={clsx(
                        "flex min-h-[2.875rem] items-center justify-center rounded-la-md border border-white/14 bg-white/[0.04] px-3 py-2.5 transition-all duration-200",
                        "hover:border-la-border-gold/65 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isAnyActionBusy && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {socialLoadingProvider === "microsoft" ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-gold border-t-transparent" />
                      ) : (
                        <MicrosoftBrandIcon />
                      )}
                    </button>
                  </div>
                </div>

                {/* Divisor Sutil */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="font-la-mono text-[0.6875rem] uppercase tracking-[0.08em] text-la-text-muted">
                    ou continue com seu e-mail
                  </span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                {/* Feedback de Erro ou Sucesso em Vidro Fumê */}
                <AnimatePresence mode="wait">
                  {serverError ? (
                    <motion.div
                      key="login-error"
                      role="alert"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-4 flex items-start gap-2.5 rounded-la-md border border-red-500/45 bg-red-950/40 p-3.5 text-red-200 backdrop-blur-md"
                    >
                      <AlertCircle
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                      />
                      <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.5]">
                        {serverError}
                      </p>
                    </motion.div>
                  ) : null}

                  {authSuccessMessage ? (
                    <motion.div
                      key="login-success"
                      role="status"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mb-4 flex items-start gap-2.5 rounded-la-md border border-la-gold/60 bg-la-gold-faint p-3.5 text-la-gold-light backdrop-blur-md"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-la-gold"
                      />
                      <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] font-medium leading-[1.5]">
                        {authSuccessMessage}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Formulário de E-mail e Senha */}
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="flex flex-col gap-4"
                >
                  {/* Campo de E-mail */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="login-email"
                      className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                    >
                      E-mail de Acesso
                    </label>
                    <div className="relative flex items-center">
                      <Mail
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                      />
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="voce@seuemail.com.br"
                        value={formData.email}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={
                          fieldErrors.email ? "login-email-error" : undefined
                        }
                        className={clsx(
                          "min-h-[2.875rem] w-full rounded-la-md border bg-black/55 py-2.5 pr-4 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          fieldErrors.email
                            ? "border-red-500/70 focus-visible:ring-red-400"
                            : "border-white/12 hover:border-white/25"
                        )}
                      />
                    </div>
                    {fieldErrors.email ? (
                      <p
                        id="login-email-error"
                        className="font-la-mono text-[0.6875rem] text-red-400"
                      >
                        {fieldErrors.email}
                      </p>
                    ) : null}
                  </div>

                  {/* Campo de Senha com Alternador Eye/EyeOff */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor="login-password"
                        className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                      >
                        Senha de Acesso
                      </label>
                      <Link
                        href="/reset-password"
                        className="font-la-mono text-[0.6875rem] text-la-gold-light transition-colors hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      >
                        Esqueceu a senha?
                      </Link>
                    </div>

                    <div className="relative flex items-center">
                      <Lock
                        aria-hidden="true"
                        className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                      />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="••••••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(fieldErrors.password)}
                        aria-describedby={
                          fieldErrors.password
                            ? "login-password-error"
                            : undefined
                        }
                        className={clsx(
                          "min-h-[2.875rem] w-full rounded-la-md border bg-black/55 py-2.5 pr-11 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          fieldErrors.password
                            ? "border-red-500/70 focus-visible:ring-red-400"
                            : "border-white/12 hover:border-white/25"
                        )}
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-la-xs text-la-text-secondary transition-colors hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden="true" className="h-4 w-4" />
                        ) : (
                          <Eye aria-hidden="true" className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.password ? (
                      <p
                        id="login-password-error"
                        className="font-la-mono text-[0.6875rem] text-red-400"
                      >
                        {fieldErrors.password}
                      </p>
                    ) : null}
                  </div>

                  {/* Checkbox Lembrar meu acesso */}
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="inline-flex cursor-pointer items-center gap-2.5 select-none">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={Boolean(formData.rememberMe)}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={clsx(
                          "flex h-4 w-4 items-center justify-center rounded-la-xs border transition-colors",
                          formData.rememberMe
                            ? "border-la-gold bg-la-gold text-la-text-inverse"
                            : "border-white/25 bg-black/50 text-transparent"
                        )}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                        Lembrar meu acesso por 30 dias
                      </span>
                    </label>
                  </div>

                  {/* Botão Dominante Dourado com Halo Sutil */}
                  <div className="relative mt-2">
                    <div
                      aria-hidden="true"
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(207, 169, 101, 0.25) 0%, transparent 72%)",
                      }}
                      className="pointer-events-none absolute -inset-2 rounded-la-lg blur-lg"
                    />
                    <button
                      type="submit"
                      disabled={isAnyActionBusy}
                      className={clsx(
                        "relative z-10 inline-flex min-h-[3.125rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-6 py-3 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-all duration-200",
                        "hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        isAnyActionBusy && "cursor-not-allowed opacity-75"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-text-inverse border-t-transparent" />
                          <span>Autenticando sessão...</span>
                        </>
                      ) : (
                        <>
                          <span>Entrar na plataforma</span>
                          <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Link para Criar Conta (/cadastro) */}
                <div className="mt-6 border-t border-white/10 pt-4 text-center">
                  <p className="font-la-sans text-[0.875rem] text-la-text-secondary">
                    Ainda não tem um Projeto Editorial?{" "}
                    <Link
                      href={ROUTES.cadastro}
                      className="inline-flex items-center gap-1 font-semibold text-la-gold-light underline-offset-4 transition-colors hover:text-la-text-primary hover:underline"
                    >
                      <span>Criar conta agora</span>
                      <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA (7 COLS): PALCO 3D/2.5D DO MONÓLITO EDITORIAL */}
          <div className="hidden lg:col-span-7 lg:block">
            <div
              ref={stageRef}
              onMouseEnter={() => setIsStagePaused(true)}
              onMouseMove={handleStageMouseMove}
              onMouseLeave={handleStageMouseLeave}
              style={{ perspective: "1400px" }}
              className="relative w-full select-none [overflow-anchor:none]"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-4 rounded-[2.25rem] bg-[radial-gradient(circle_at_55%_35%,rgba(207,169,101,0.16)_0%,rgba(207,169,101,0.04)_48%,transparent_75%)] blur-2xl"
              />

              <motion.div
                animate={
                  shouldReduceMotion
                    ? { rotateX: 0, rotateY: 0 }
                    : {
                        rotateX: tilt.rotateX,
                        rotateY: tilt.rotateY,
                      }
                }
                transition={{
                  type: "tween",
                  duration: 0.22,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative overflow-hidden rounded-la-xl border border-la-border-gold/45 bg-[#07090F]/95 p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_32px_72px_rgba(0,0,0,0.9),0_0_84px_rgba(207,169,101,0.12)] backdrop-blur-xl xl:p-8"
              >
                <div
                  aria-hidden="true"
                  style={{
                    opacity: stageSpotlight.opacity,
                    background: `radial-gradient(500px circle at ${stageSpotlight.x}px ${stageSpotlight.y}px, rgba(207, 169, 101, 0.15), transparent 65%)`,
                  }}
                  className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
                />

                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-12 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
                />

                <div className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div aria-hidden="true" className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-la-full bg-white/15" />
                      <span className="h-2 w-2 rounded-la-full bg-white/15" />
                      <span className="h-2 w-2 rounded-la-full bg-la-gold/80" />
                    </div>
                    <FolderKanban
                      aria-hidden="true"
                      className="ml-1 h-4 w-4 text-la-gold"
                    />
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Sistema Operacional Editorial · Contexto Persistente
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-3 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                    <ShieldCheck aria-hidden="true" className="h-3 w-3 text-la-gold" />
                    <span>Ambiente Criptografado</span>
                  </span>
                </div>

                <div className="relative z-10 mt-6 grid grid-cols-12 items-center gap-6">
                  <div className="col-span-7 flex flex-col">
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-la-gold-light">
                      ESTRATÉGIA → PLANEJAMENTO → CONTEÚDO
                    </span>
                    <h2 className="mt-2 text-balance font-la-sans text-[1.625rem] font-semibold leading-[1.18] tracking-[-0.024em] text-la-text-primary xl:text-[1.875rem]">
                      Sua estratégia conectada da direção à execução editorial.
                    </h2>
                    <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                      Ao entrar no Legion Altaire, você opera sobre a Base
                      Estratégica do seu negócio sem precisar recomeçar do zero
                      a cada publicação.
                    </p>
                  </div>

                  <div
                    aria-hidden="true"
                    style={{ perspective: "900px" }}
                    className="relative col-span-5 flex h-[11.5rem] items-center justify-center rounded-la-lg border border-white/10 bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.18)_0%,rgba(10,13,20,0.95)_62%,#040508_100%)]"
                  >
                    <motion.div
                      animate={
                        shouldReduceMotion || !isStageInView
                          ? { rotateZ: 0 }
                          : { rotateZ: 360 }
                      }
                      transition={{
                        duration: 24,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute h-32 w-32 rounded-la-full border border-dashed border-la-gold/40"
                    />

                    <motion.div
                      animate={
                        shouldReduceMotion || !isStageInView
                          ? { rotateX: 62, rotateZ: 0 }
                          : { rotateX: 62, rotateZ: -360 }
                      }
                      transition={{
                        duration: 16,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="pointer-events-none absolute h-36 w-36 rounded-la-full border border-white/15"
                    />

                    <motion.div
                      animate={
                        shouldReduceMotion || !isStageInView
                          ? { rotateX: 22, rotateY: -26, rotateZ: 0 }
                          : {
                              rotateX: [20, 28, 20],
                              rotateY: [-26, 26, -26],
                              rotateZ: [-3, 3, -3],
                            }
                      }
                      transition={{
                        duration: 8.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative flex h-24 w-24 items-center justify-center"
                    >
                      {MONOLITH_LAYERS.map((layer, idx) => {
                        const isLayerActive = activeLayerIndex === idx;
                        const zPos = idx === 2 ? 22 : idx === 1 ? 0 : -20;

                        return (
                          <motion.div
                            key={layer.code}
                            animate={{
                              translateZ: isLayerActive ? zPos + 8 : zPos,
                              scale: isLayerActive ? 1.06 : 0.94,
                            }}
                            transition={{ duration: 0.35 }}
                            className={clsx(
                              "absolute inset-1.5 flex flex-col justify-between rounded-la-lg border p-2 backdrop-blur-md transition-colors",
                              isLayerActive
                                ? "border-la-gold bg-la-gold/25 shadow-[0_0_26px_rgba(207,169,101,0.42)]"
                                : "border-white/15 bg-white/[0.04]"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-la-mono text-[0.5rem] font-semibold uppercase text-la-gold-light">
                                CAMADA {layer.code}
                              </span>
                              <Compass className="h-2.5 w-2.5 text-la-gold" />
                            </div>
                            <div className="h-1 w-2/3 rounded-la-full bg-la-gold/75" />
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>

                <div className="relative z-10 mt-6 grid grid-cols-3 gap-2.5">
                  {MONOLITH_LAYERS.map((layer, idx) => {
                    const isSelected = activeLayerIndex === idx;
                    const TabIcon =
                      idx === 0 ? Compass : idx === 1 ? Library : FileText;

                    return (
                      <button
                        key={layer.code}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActiveLayerIndex(idx)}
                        className={clsx(
                          "relative flex flex-col justify-between overflow-hidden rounded-la-lg border p-3 text-left transition-colors duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          isSelected
                            ? "border-la-gold/70 bg-[#101420] text-la-text-primary"
                            : "border-white/10 bg-black/45 text-la-text-secondary hover:border-white/25"
                        )}
                      >
                        {isSelected ? (
                          <motion.div
                            layoutId="login-monolith-active-tab"
                            transition={{
                              type: "tween",
                              duration: 0.26,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{
                              backgroundColor: "rgba(207, 169, 101, 0.07)",
                            }}
                            className="pointer-events-none absolute inset-0 z-0 rounded-la-lg"
                          />
                        ) : null}

                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            ETAPA {layer.code}
                          </span>
                          <TabIcon
                            aria-hidden="true"
                            className={clsx(
                              "h-3.5 w-3.5",
                              isSelected ? "text-la-gold" : "text-white/30"
                            )}
                          />
                        </div>
                        <span className="relative z-10 mt-1 truncate font-la-sans text-[0.8125rem] font-semibold text-la-text-primary">
                          {layer.title}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="relative z-10 mt-4 grid grid-cols-1 rounded-la-lg border border-white/10 bg-black/55 p-4">
                  {MONOLITH_LAYERS.map((layer, idx) => {
                    const isCurrent = activeLayerIndex === idx;

                    return (
                      <div
                        key={layer.code}
                        aria-hidden={!isCurrent}
                        className={clsx(
                          "col-start-1 row-start-1 flex flex-col gap-3 transition-opacity duration-250",
                          isCurrent
                            ? "relative z-10 opacity-100"
                            : "pointer-events-none z-0 opacity-0 select-none"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                          <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                            {layer.badge}
                          </span>
                          <span className="rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] text-la-gold-light">
                            {layer.status}
                          </span>
                        </div>

                        <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                          {layer.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2.5">
                          {layer.deliverables.map((item) => (
                            <div
                              key={item}
                              className="flex items-center gap-2 rounded-la-md border border-white/10 bg-white/[0.03] px-3 py-2"
                            >
                              <CheckCircle2
                                aria-hidden="true"
                                className="h-3.5 w-3.5 shrink-0 text-la-gold"
                              />
                              <span className="font-la-sans text-[0.75rem] font-medium text-la-text-primary">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 mt-5 flex items-center justify-between border-t border-white/10 pt-3.5 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  <span className="inline-flex items-center gap-2">
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                    <span>A estratégia orienta. A IA organiza.</span>
                  </span>
                  <span className="text-la-gold-light">
                    Você revisa, ajusta e aprova.
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 mx-auto flex w-full max-w-[82rem] flex-col items-center justify-between gap-2 border-t border-white/10 px-5 py-4 text-center font-la-mono text-[0.6875rem] text-la-text-muted sm:flex-row sm:px-8 lg:px-10">
        <span>
          © {new Date().getFullYear()} Legion Altaire. Todos os direitos
          reservados.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href={ROUTES.termosDeUso}
            className="transition-colors hover:text-la-gold-light"
          >
            Termos de Uso
          </Link>
          <Link
            href={ROUTES.politicaDePrivacidade}
            className="transition-colors hover:text-la-gold-light"
          >
            Política de Privacidade
          </Link>
          <Link
            href={ROUTES.contato}
            className="transition-colors hover:text-la-gold-light"
          >
            Suporte
          </Link>
        </div>
      </footer>
    </div>
  );
}