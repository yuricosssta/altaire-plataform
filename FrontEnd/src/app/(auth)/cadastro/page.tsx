// FrontEnd/src/app/(auth)/cadastro/page.tsx
"use client";

import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Layers,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { ROUTES } from "@/lib/constants/routes";
import {
  registerSchema,
  type RegisterFormData,
} from "@/lib/validations/auth";
import type { AuthResponse } from "@/types/auth";
import { AppDispatch } from "@/lib/redux/store";
import { setAuthState } from "@/lib/redux/slices/authSlice";
import { fetchUserProfile } from "@/lib/redux/slices/userSlice";
import { fetchMyOrganizations } from "@/lib/redux/slices/organizationSlice";

type RegistrationStep = 1 | 2;

type BlueprintStageNode = {
  readonly stepNumber: RegistrationStep;
  readonly code: "01" | "02";
  readonly badge: string;
  readonly headline: string;
  readonly description: string;
};

const BLUEPRINT_STAGE_NODES: readonly BlueprintStageNode[] = [
  {
    stepNumber: 1,
    code: "01",
    badge: "PASSO 01 · CREDENCIAIS DE TITULARIDADE",
    headline: "Acesso seguro e isolamento total do seu contexto estratégico.",
    description:
      "Sua conta cria um ambiente criptografado onde suas ofertas, promessas e roteiros pertencem exclusivamente à sua operação.",
  },
  {
    stepNumber: 2,
    code: "02",
    badge: "PASSO 02 · VALIDAÇÃO E ENTRADA NA OPERAÇÃO",
    headline: "Confirmação de titularidade e abertura imediata da Central Estratégica.",
    description:
      "Assim que validado, você é direcionado para criar seu primeiro Projeto Editorial e estruturar sua linha de conteúdo.",
  },
] as const;

function GoogleBrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.19-2.07H12v.05z" />
      <path fill="#4285F4" d="M12 22c2.7 0 4.96-.89 6.62-2.42l-3.3-2.56c-.91.61-2.08.98-3.32.98-2.55 0-4.71-1.72-5.48-4.04H3.11v2.64C4.76 19.87 8.11 22 12 22z" />
      <path fill="#FBBC05" d="M6.52 13.96A5.98 5.98 0 0 1 6.2 12c0-.68.12-1.34.32-1.96V7.4H3.11A9.98 9.98 0 0 0 2 12c0 1.61.39 3.14 1.11 4.6l3.41-2.64z" />
      <path fill="#34A853" d="M12 6c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 3.01 14.7 2 12 2 8.11 2 4.76 4.13 3.11 7.4l3.41 2.64C7.29 7.72 9.45 6 12 6z" />
    </svg>
  );
}

function AppleBrandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-white">
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

export default function CadastroPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const shouldReduceMotion = useReducedMotion();

  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);

  /* Passo 1: Credenciais */
  const [credentials, setCredentials] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [step1Errors, setStep1Errors] = useState<
    Partial<Record<keyof RegisterFormData, string>>
  >({});

  /* Passo 2: Verificação de E-mail */
  const [verificationCode, setVerificationCode] = useState<string>("842910");
  const [codeResentFeedback, setCodeResentFeedback] = useState<boolean>(false);
  const [redirectUrl, setRedirectUrl] = useState<string>(
    "/dashboard/editorial?newProject=true"
  );
  const [authToken, setAuthToken] = useState<string | null>(null);

  /* Estados Gerais */
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSocialLoading, setIsSocialLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /* Estados do Palco 3D */
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

  /* Força de Senha */
  const passwordChecks = useMemo(() => {
    const pwd = credentials.password;
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
    };
  }, [credentials.password]);

  const passwordStrengthScore = useMemo(() => {
    return [
      passwordChecks.minLength,
      passwordChecks.hasUpper,
      passwordChecks.hasLower,
      passwordChecks.hasNumber,
    ].filter(Boolean).length;
  }, [passwordChecks]);

  const passwordStrengthLabel = useMemo(() => {
    if (credentials.password.length === 0) return "Aguardando senha";
    if (passwordStrengthScore <= 1) return "Nível 1 · Fraca";
    if (passwordStrengthScore === 2) return "Nível 2 · Em progresso";
    if (passwordStrengthScore === 3) return "Nível 3 · Boa";
    return "Nível 4 · Senha Forte Validada";
  }, [credentials.password.length, passwordStrengthScore]);

  const handleStageMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !stageRef.current) return;
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
    setTilt({ rotateX: 0, rotateY: 0 });
    setStageSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleFormCardMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !formCardRef.current) return;
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

  const handleStep1InputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const nextValue = type === "checkbox" ? checked : value;

    setCredentials((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    const fieldKey = name as keyof RegisterFormData;
    if (step1Errors[fieldKey]) {
      setStep1Errors((prev) => ({ ...prev, [fieldKey]: undefined }));
    }
    if (serverError) {
      setServerError(null);
    }
  };

  const executeRegistration = async (payload: RegisterFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.success) {
        setServerError(
          data.message ||
            "Não foi possível concluir o cadastro. Verifique os dados informados."
        );
        return;
      }

      if (data.token) {
        setAuthToken(data.token);
        localStorage.setItem("token", data.token);
        dispatch(setAuthState({ token: data.token }));
        dispatch(fetchUserProfile());
        dispatch(fetchMyOrganizations());
      }

      if (data.redirectUrl) {
        setRedirectUrl(data.redirectUrl);
      }

      setCurrentStep(2);
    } catch {
      setServerError(
        "Falha de comunicação com o servidor ao criar sua conta. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep1Submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep1Errors({});
    setServerError(null);

    const validation = registerSchema.safeParse(credentials);
    if (!validation.success) {
      const nextErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof RegisterFormData;
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message;
        }
      }
      setStep1Errors(nextErrors);
      return;
    }

    await executeRegistration(validation.data);
  };

  const handleSocialQuickRegister = async (
    provider: "google" | "apple" | "microsoft"
  ) => {
    setIsSocialLoading(true);
    setStep1Errors({});
    setServerError(null);

    const socialPayload: RegisterFormData = {
      fullName: credentials.fullName.trim() || `Especialista ${provider}`,
      email:
        credentials.email.trim() || `${provider}.auth@legionaltaire.com.br`,
      password: "OAuth2VerifiedPassword9",
      confirmPassword: "OAuth2VerifiedPassword9",
      acceptTerms: true,
    };

    setCredentials(socialPayload);
    await executeRegistration(socialPayload);
    setIsSocialLoading(false);
  };

  const handleCompleteVerification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authToken) {
      localStorage.setItem("token", authToken);
      dispatch(setAuthState({ token: authToken }));
      dispatch(fetchUserProfile());
      dispatch(fetchMyOrganizations());
    }
    window.location.assign(redirectUrl);
  };

  const handleResendCode = () => {
    setCodeResentFeedback(true);
    window.setTimeout(() => setCodeResentFeedback(false), 3000);
  };

  return (
    <div
      data-la-surface="dark"
      className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-la-canvas font-la-sans text-la-text-primary antialiased selection:bg-la-gold/25 selection:text-la-gold-bright [color-scheme:dark] [overflow-anchor:none]"
    >
      <div
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 24% 16%, rgba(207, 169, 101, 0.14) 0%, rgba(207, 169, 101, 0.03) 46%, transparent 74%)",
        }}
        className="pointer-events-none fixed inset-0 z-0"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-[84rem] items-center justify-between px-5 pt-5 pb-3 sm:px-8 lg:px-10">
        <LogoBloco
          orientation="horizontal"
          size="sm"
          tone="public-dark"
          href={ROUTES.home}
        />

        <div className="flex items-center gap-3">
          <Link
            href={ROUTES.login}
            className="hidden rounded-la-md px-3 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:text-la-gold-light sm:inline-flex"
          >
            Já possui conta? Entrar
          </Link>

          <Link
            href={ROUTES.home}
            className="inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary backdrop-blur-md transition-colors hover:border-la-border-gold hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
          >
            <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
            <span>Início</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[84rem] flex-1 items-center px-5 py-6 sm:px-8 lg:py-8 xl:px-10">
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-12">
          <div className="w-full lg:col-span-6">
            <div
              ref={formCardRef}
              onMouseMove={handleFormCardMouseMove}
              onMouseLeave={handleFormCardMouseLeave}
              style={{
                backgroundColor: "rgba(9, 12, 20, 0.80)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 28px 64px rgba(0, 0, 0, 0.85), 0 0 72px rgba(207, 169, 101, 0.10)",
              }}
              className="relative overflow-hidden rounded-la-xl border border-white/14 p-6 sm:p-8"
            >
              <div
                aria-hidden="true"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(207, 169, 101, 0.18) 0%, rgba(207, 169, 101, 0.04) 42%, transparent 70%)",
                }}
                className="pointer-events-none absolute -top-12 -left-12 z-0 h-56 w-56 rounded-full blur-2xl"
              />

              <div
                aria-hidden="true"
                style={{
                  opacity: cardSpotlight.opacity,
                  background: `radial-gradient(420px circle at ${cardSpotlight.x}px ${cardSpotlight.y}px, rgba(207, 169, 101, 0.12), transparent 68%)`,
                }}
                className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              <div className="relative z-10 flex flex-col">
                <div className="mb-5 grid grid-cols-2 gap-3 border-b border-white/10 pb-4">
                  {[
                    { step: 1 as const, label: "01 · Credenciais" },
                    { step: 2 as const, label: "02 · Confirmação" },
                  ].map((item) => {
                    const isActive = currentStep === item.step;
                    const isCompleted = currentStep > item.step;

                    return (
                      <div key={item.step} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={clsx(
                              "truncate font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em]",
                              isActive
                                ? "text-la-gold-light"
                                : isCompleted
                                  ? "text-la-gold"
                                  : "text-la-text-muted"
                            )}
                          >
                            {item.label}
                          </span>
                          {isCompleted ? (
                            <CheckCircle2
                              aria-hidden="true"
                              className="h-3 w-3 shrink-0 text-la-gold"
                            />
                          ) : null}
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-la-full bg-white/10">
                          <div
                            className={clsx(
                              "h-full rounded-la-full transition-all duration-300",
                              isActive || isCompleted
                                ? "w-full bg-la-gold shadow-[0_0_8px_#CFA965]"
                                : "w-0 bg-transparent"
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {serverError ? (
                  <div
                    role="alert"
                    className="mb-4 flex items-start gap-2.5 rounded-la-md border border-red-500/45 bg-red-950/40 p-3.5 text-red-200"
                  >
                    <AlertCircle
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-red-400"
                    />
                    <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.5]">
                      {serverError}
                    </p>
                  </div>
                ) : null}

                <AnimatePresence mode="wait">
                  {currentStep === 1 ? (
                    <motion.div
                      key="register-step-1"
                      initial={
                        shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -12 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      exit={
                        shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 12 }
                      }
                      transition={{ duration: 0.22 }}
                      className="flex flex-col"
                    >
                      <h1 className="text-balance font-la-sans text-[1.625rem] font-semibold leading-[1.15] tracking-[-0.025em] text-la-text-primary sm:text-[1.875rem]">
                        Crie sua conta no Legion Altaire
                      </h1>
                      <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                        Configure suas credenciais de titularidade para acessar a
                        plataforma e iniciar sua operação editorial.
                      </p>

                      {/* GRADE DE LOGIN SOCIAL: Google (Principal) + Apple + Microsoft */}
                      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                        <button
                          type="button"
                          disabled={isSocialLoading || isSubmitting}
                          onClick={() => handleSocialQuickRegister("google")}
                          className="flex min-h-[2.875rem] items-center justify-center gap-3 rounded-la-md border border-white/14 bg-white/[0.04] px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-primary transition-all duration-200 hover:border-la-border-gold/65 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light sm:col-span-8"
                        >
                          {isSocialLoading ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-gold border-t-transparent" />
                          ) : (
                            <>
                              <GoogleBrandIcon />
                              <span>Cadastrar com o Google</span>
                            </>
                          )}
                        </button>

                        <div className="grid grid-cols-2 gap-2.5 sm:col-span-4">
                          <button
                            type="button"
                            disabled={isSocialLoading || isSubmitting}
                            aria-label="Cadastrar com a Apple"
                            onClick={() => handleSocialQuickRegister("apple")}
                            className="flex min-h-[2.875rem] items-center justify-center rounded-la-md border border-white/14 bg-white/[0.04] px-4 py-2 transition-all duration-200 hover:border-la-border-gold/65 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                          >
                            <AppleBrandIcon />
                          </button>

                          <button
                            type="button"
                            disabled={isSocialLoading || isSubmitting}
                            aria-label="Cadastrar com a Microsoft"
                            onClick={() => handleSocialQuickRegister("microsoft")}
                            className="flex min-h-[2.875rem] items-center justify-center rounded-la-md border border-white/14 bg-white/[0.04] px-4 py-2 transition-all duration-200 hover:border-la-border-gold/65 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                          >
                            <MicrosoftBrandIcon />
                          </button>
                        </div>
                      </div>

                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="font-la-mono text-[0.6875rem] uppercase tracking-[0.08em] text-la-text-muted">
                          ou preencha seus dados
                        </span>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>

                      <form
                        onSubmit={handleStep1Submit}
                        noValidate
                        className="flex flex-col gap-3.5"
                      >
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="reg-fullName"
                            className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                          >
                            Nome Completo *
                          </label>
                          <div className="relative flex items-center">
                            <User
                              aria-hidden="true"
                              className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                            />
                            <input
                              id="reg-fullName"
                              name="fullName"
                              type="text"
                              autoComplete="name"
                              placeholder="Ex.: Roberto Zane"
                              value={credentials.fullName}
                              onChange={handleStep1InputChange}
                              className={clsx(
                                "min-h-[2.75rem] w-full rounded-la-md border bg-black/55 py-2 pr-4 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                                step1Errors.fullName
                                  ? "border-red-500/70"
                                  : "border-white/12 hover:border-white/25"
                              )}
                            />
                          </div>
                          {step1Errors.fullName ? (
                            <p className="font-la-mono text-[0.6875rem] text-red-400">
                              {step1Errors.fullName}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor="reg-email"
                            className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                          >
                            E-mail de Acesso *
                          </label>
                          <div className="relative flex items-center">
                            <Mail
                              aria-hidden="true"
                              className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                            />
                            <input
                              id="reg-email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              placeholder="voce@seuemail.com.br"
                              value={credentials.email}
                              onChange={handleStep1InputChange}
                              className={clsx(
                                "min-h-[2.75rem] w-full rounded-la-md border bg-black/55 py-2 pr-4 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                                step1Errors.email
                                  ? "border-red-500/70"
                                  : "border-white/12 hover:border-white/25"
                              )}
                            />
                          </div>
                          {step1Errors.email ? (
                            <p className="font-la-mono text-[0.6875rem] text-red-400">
                              {step1Errors.email}
                            </p>
                          ) : null}
                        </div>

                        {/* Senha e Confirmação na Mesma Linha no Desktop */}
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor="reg-password"
                                className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                              >
                                Crie uma Senha *
                              </label>
                            </div>
                            <div className="relative flex items-center">
                              <Lock
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                              />
                              <input
                                id="reg-password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Mínimo 8 dígitos"
                                value={credentials.password}
                                onChange={handleStep1InputChange}
                                className={clsx(
                                  "min-h-[2.75rem] w-full rounded-la-md border bg-black/55 py-2 pr-11 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                                  step1Errors.password
                                    ? "border-red-500/70"
                                    : "border-white/12 hover:border-white/25"
                                )}
                              />
                              <button
                                type="button"
                                aria-label={
                                  showPassword ? "Ocultar senha" : "Mostrar senha"
                                }
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-la-xs text-la-text-secondary hover:text-la-gold-light"
                              >
                                {showPassword ? (
                                  <EyeOff aria-hidden="true" className="h-4 w-4" />
                                ) : (
                                  <Eye aria-hidden="true" className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label
                              htmlFor="reg-confirmPassword"
                              className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                            >
                              Confirme a Senha *
                            </label>
                            <div className="relative flex items-center">
                              <KeyRound
                                aria-hidden="true"
                                className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                              />
                              <input
                                id="reg-confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Repita a senha"
                                value={credentials.confirmPassword}
                                onChange={handleStep1InputChange}
                                className={clsx(
                                  "min-h-[2.75rem] w-full rounded-la-md border bg-black/55 py-2 pr-11 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                                  step1Errors.confirmPassword
                                    ? "border-red-500/70"
                                    : "border-white/12 hover:border-white/25"
                                )}
                              />
                              <button
                                type="button"
                                aria-label={
                                  showConfirmPassword ? "Ocultar confirmação" : "Mostrar confirmação"
                                }
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                className="absolute right-2.5 inline-flex h-7 w-7 items-center justify-center rounded-la-xs text-la-text-secondary hover:text-la-gold-light"
                              >
                                {showConfirmPassword ? (
                                  <EyeOff aria-hidden="true" className="h-4 w-4" />
                                ) : (
                                  <Eye aria-hidden="true" className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div
                              aria-hidden="true"
                              className="flex w-2/3 gap-1.5"
                            >
                              {[1, 2, 3, 4].map((level) => {
                                const isFilled = passwordStrengthScore >= level;
                                return (
                                  <div
                                    key={level}
                                    className={clsx(
                                      "h-1.5 flex-1 rounded-la-full transition-colors duration-200",
                                      isFilled
                                        ? passwordStrengthScore === 4
                                          ? "bg-la-gold shadow-[0_0_8px_#CFA965]"
                                          : "bg-la-gold/70"
                                        : "bg-white/10"
                                    )}
                                  />
                                );
                              })}
                            </div>
                            <span className="font-la-mono text-[0.625rem] text-la-gold-light">
                              {passwordStrengthLabel}
                            </span>
                          </div>
                          <div className="mt-1 grid grid-cols-2 gap-1 font-la-mono text-[0.625rem]">
                            <span className={passwordChecks.minLength ? "text-la-gold-light" : "text-la-text-muted"}>
                              {passwordChecks.minLength ? "✓" : "•"} 8+ caracteres
                            </span>
                            <span className={passwordChecks.hasUpper ? "text-la-gold-light" : "text-la-text-muted"}>
                              {passwordChecks.hasUpper ? "✓" : "•"} 1 letra maiúscula
                            </span>
                            <span className={passwordChecks.hasLower ? "text-la-gold-light" : "text-la-text-muted"}>
                              {passwordChecks.hasLower ? "✓" : "•"} 1 letra minúscula
                            </span>
                            <span className={passwordChecks.hasNumber ? "text-la-gold-light" : "text-la-text-muted"}>
                              {passwordChecks.hasNumber ? "✓" : "•"} 1 número
                            </span>
                          </div>
                          {step1Errors.password ? (
                            <p className="mt-1 font-la-mono text-[0.6875rem] text-red-400">
                              {step1Errors.password}
                            </p>
                          ) : null}
                          {step1Errors.confirmPassword ? (
                            <p className="mt-1 font-la-mono text-[0.6875rem] text-red-400">
                              {step1Errors.confirmPassword}
                            </p>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-col gap-1">
                          <label className="flex cursor-pointer items-start gap-2.5 select-none">
                            <input
                              type="checkbox"
                              name="acceptTerms"
                              checked={credentials.acceptTerms}
                              onChange={handleStep1InputChange}
                              className="sr-only"
                            />
                            <span
                              aria-hidden="true"
                              className={clsx(
                                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-la-xs border transition-colors",
                                credentials.acceptTerms
                                  ? "border-la-gold bg-la-gold text-la-text-inverse"
                                  : "border-white/25 bg-black/50 text-transparent"
                              )}
                            >
                              <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                            <span className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                              Li e concordo com os{" "}
                              <Link
                                href={ROUTES.termosDeUso}
                                className="font-semibold text-la-gold-light underline underline-offset-2 hover:text-la-text-primary"
                              >
                                Termos de Uso
                              </Link>{" "}
                              e com a{" "}
                              <Link
                                href={ROUTES.politicaDePrivacidade}
                                className="font-semibold text-la-gold-light underline underline-offset-2 hover:text-la-text-primary"
                              >
                                Política de Privacidade
                              </Link>{" "}
                              do Legion Altaire.
                            </span>
                          </label>
                          {step1Errors.acceptTerms ? (
                            <p className="font-la-mono text-[0.6875rem] text-red-400">
                              {step1Errors.acceptTerms}
                            </p>
                          ) : null}
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting || isSocialLoading}
                          className={clsx(
                            "mt-2 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-6 py-3 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                            (isSubmitting || isSocialLoading) &&
                              "cursor-not-allowed opacity-75"
                          )}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-text-inverse border-t-transparent" />
                              <span>Criando sua conta...</span>
                            </>
                          ) : (
                            <>
                              <span>Criar conta e validar acesso</span>
                              <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  ) : null}

                  {currentStep === 2 ? (
                    <motion.div
                      key="register-step-2"
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, scale: 0.97 }
                      }
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-la-lg border border-la-border-gold bg-la-gold-faint text-la-gold-light shadow-[0_0_24px_rgba(207,169,101,0.3)]">
                        <CheckCircle2 className="h-6 w-6 text-la-gold" />
                      </div>

                      <span className="mt-4 font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        Conta Criada com Sucesso
                      </span>

                      <h2 className="mt-1 text-balance font-la-sans text-[1.625rem] font-semibold leading-[1.18] text-la-text-primary">
                        Confirme seu endereço de e-mail
                      </h2>

                      <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                        Enviamos um protocolo de verificação para{" "}
                        <strong className="text-la-gold-light">
                          {credentials.email}
                        </strong>
                        . Confirme abaixo para entrar na plataforma e criar o
                        seu primeiro Projeto Editorial.
                      </p>

                      <form
                        onSubmit={handleCompleteVerification}
                        className="mt-5 flex flex-col gap-4 rounded-la-lg border border-white/12 bg-black/50 p-4"
                      >
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="reg-verification-code"
                              className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light"
                            >
                              Código de Segurança (6 dígitos)
                            </label>
                            <button
                              type="button"
                              onClick={handleResendCode}
                              className="font-la-mono text-[0.6875rem] text-la-text-secondary hover:text-la-gold-light"
                            >
                              {codeResentFeedback
                                ? "✓ Código reenviado!"
                                : "Reenviar código"}
                            </button>
                          </div>

                          <div className="relative flex items-center">
                            <KeyRound
                              aria-hidden="true"
                              className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold"
                            />
                            <input
                              id="reg-verification-code"
                              type="text"
                              maxLength={6}
                              value={verificationCode}
                              onChange={(e) =>
                                setVerificationCode(e.target.value)
                              }
                              className="min-h-[2.875rem] w-full rounded-la-md border border-la-border-gold/55 bg-black/70 py-2 pr-4 pl-10 font-la-mono text-[1.125rem] font-semibold tracking-[0.35em] text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="inline-flex min-h-[3.125rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-6 py-3 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                        >
                          <span>Confirmar e criar 1º Projeto Editorial</span>
                          <ArrowRight aria-hidden="true" className="h-4 w-4" />
                        </button>
                      </form>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="mt-5 border-t border-white/10 pt-4 text-center">
                  <p className="font-la-sans text-[0.8125rem] text-la-text-secondary">
                    Já possui acesso ao Legion Altaire?{" "}
                    <Link
                      href={ROUTES.login}
                      className="font-semibold text-la-gold-light underline-offset-4 hover:text-la-text-primary hover:underline"
                    >
                      Fazer login
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA (6 COLS): PALCO 3D/2.5D */}
          <div className="hidden lg:col-span-6 lg:block">
            <div
              ref={stageRef}
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
                className="relative overflow-hidden rounded-la-xl border border-la-border-gold/45 bg-[#07090F]/95 p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.14),0_32px_72px_rgba(0,0,0,0.9),0_0_84px_rgba(207,169,101,0.12)] backdrop-blur-xl"
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

                <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div aria-hidden="true" className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-la-full bg-white/15" />
                      <span className="h-2 w-2 rounded-la-full bg-white/15" />
                      <span className="h-2 w-2 rounded-la-full bg-la-gold/80" />
                    </div>
                    <Layers
                      aria-hidden="true"
                      className="ml-1 h-4 w-4 text-la-gold"
                    />
                    <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      Ativação de Conta · Etapa 0{currentStep}/02
                    </span>
                  </div>

                  <span className="rounded-la-full border border-la-border-gold/55 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                    Acesso Direto
                  </span>
                </div>

                <div className="relative z-10 mt-5 grid grid-cols-12 items-center gap-5">
                  <div className="col-span-7 flex flex-col gap-2.5">
                    <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                      IDENTIDADE DE OPERAÇÃO
                    </span>

                    <div className="rounded-la-lg border border-la-border-gold/45 bg-black/55 p-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                          Titular da Conta
                        </span>
                        <span className="font-la-mono text-[0.5625rem] text-la-gold-light">
                          OWNER
                        </span>
                      </div>
                      <p className="mt-1 truncate font-la-sans text-[0.9375rem] font-semibold text-la-text-primary">
                        {credentials.fullName.trim() || "Aguardando identificação"}
                      </p>
                      <p className="mt-1 truncate font-la-mono text-[0.6875rem] text-la-text-secondary">
                        E-mail:{" "}
                        <span className="text-la-gold-light">
                          {credentials.email.trim() || "Em configuração..."}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-la-md border border-white/10 bg-white/[0.025] p-2.5">
                        <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                          Status
                        </span>
                        <span className="mt-0.5 block truncate font-la-sans text-[0.75rem] font-semibold text-la-text-primary">
                          {currentStep === 2 ? "Validado" : "Credenciais"}
                        </span>
                      </div>
                      <div className="rounded-la-md border border-white/10 bg-white/[0.025] p-2.5">
                        <span className="block font-la-mono text-[0.5625rem] uppercase text-la-text-muted">
                          Próximo Destino
                        </span>
                        <span className="mt-0.5 block truncate font-la-sans text-[0.75rem] font-semibold text-la-gold-light">
                          Novo Projeto Editorial
                        </span>
                      </div>
                    </div>
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
                          ? { rotateX: 22, rotateY: -24, rotateZ: 0 }
                          : {
                              rotateX: [20, 28, 20],
                              rotateY: [-26, 26, -26],
                              rotateZ: [-3, 3, -3],
                            }
                      }
                      transition={{
                        duration: 8.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                      className="relative flex h-24 w-24 items-center justify-center"
                    >
                      {[1, 2].map((stepLayer, idx) => {
                        const isLayerActive = currentStep === stepLayer;
                        const zPos = idx === 1 ? 16 : -16;

                        return (
                          <motion.div
                            key={stepLayer}
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
                                PASSO 0{stepLayer}
                              </span>
                              <Target className="h-2.5 w-2.5 text-la-gold" />
                            </div>
                            <div className="h-1 w-2/3 rounded-la-full bg-la-gold/75" />
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </div>
                </div>

                <div className="relative z-10 mt-5 grid grid-cols-1 rounded-la-lg border border-white/10 bg-black/55 p-4">
                  {BLUEPRINT_STAGE_NODES.map((node) => {
                    const isCurrent = currentStep === node.stepNumber;

                    return (
                      <div
                        key={node.code}
                        aria-hidden={!isCurrent}
                        className={clsx(
                          "col-start-1 row-start-1 flex flex-col gap-2 transition-opacity duration-250",
                          isCurrent
                            ? "relative z-10 opacity-100"
                            : "pointer-events-none z-0 opacity-0 select-none"
                        )}
                      >
                        <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                          {node.badge}
                        </span>
                        <h3 className="font-la-sans text-[1.0625rem] font-semibold text-la-text-primary">
                          {node.headline}
                        </h3>
                        <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.6] text-la-text-secondary">
                          {node.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 font-la-mono text-[0.6875rem] text-la-text-secondary">
                  <div className="flex items-center gap-2">
                    <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                    <span>Contexto 100% isolado por projeto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
                    <span>Aprovação humana em cada etapa</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-20 mx-auto flex w-full max-w-[84rem] flex-col items-center justify-between gap-2 border-t border-white/10 px-5 py-4 text-center font-la-mono text-[0.6875rem] text-la-text-muted sm:flex-row sm:px-8 lg:px-10">
        <span>© {new Date().getFullYear()} Legion Altaire. Todos os direitos reservados.</span>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href={ROUTES.termosDeUso} className="transition-colors hover:text-la-gold-light">Termos de Uso</Link>
          <Link href={ROUTES.politicaDePrivacidade} className="transition-colors hover:text-la-gold-light">Política de Privacidade</Link>
          <Link href={ROUTES.precos} className="transition-colors hover:text-la-gold-light">Planos e Preços</Link>
        </div>
      </footer>
    </div>
  );
}
