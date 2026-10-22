// FrontEnd/src/app/(auth)/reset-password/page.tsx
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import LogoBloco from "@/components/LogoBloco";
import { ROUTES } from "@/lib/constants/routes";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError("Informe seu endereço de e-mail.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setEmailError("Informe um endereço de e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div
      data-la-surface="dark"
      className="relative flex min-h-screen w-full flex-col justify-between overflow-x-hidden bg-la-canvas font-la-sans text-la-text-primary antialiased selection:bg-la-gold/25 selection:text-la-gold-bright [color-scheme:dark]"
    >
      <div
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(207, 169, 101, 0.14) 0%, rgba(207, 169, 101, 0.03) 48%, transparent 74%)",
        }}
        className="pointer-events-none fixed inset-0 z-0"
      />

      <header className="relative z-20 mx-auto flex w-full max-w-[82rem] items-center justify-between px-5 pt-5 pb-3 sm:px-8">
        <LogoBloco
          orientation="horizontal"
          size="sm"
          tone="public-dark"
          href={ROUTES.home}
        />

        <Link
          href={ROUTES.login}
          className="inline-flex min-h-[2.375rem] items-center gap-2 rounded-la-md border border-white/12 bg-white/[0.03] px-3.5 py-1.5 font-la-mono text-[0.75rem] text-la-text-secondary backdrop-blur-md transition-colors hover:border-la-border-gold hover:text-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
        >
          <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5 text-la-gold" />
          <span>Voltar ao login</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-[32rem] flex-1 items-center px-5 py-8">
        <div
          style={{
            backgroundColor: "rgba(9, 12, 20, 0.82)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow:
              "inset 0 1px 1px rgba(255, 255, 255, 0.14), 0 28px 64px rgba(0, 0, 0, 0.85), 0 0 72px rgba(207, 169, 101, 0.10)",
          }}
          className="relative w-full overflow-hidden rounded-la-xl border border-white/14 p-6 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-[image:var(--la-gradient-border-gold-top)]"
          />

          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <motion.div
                key="reset-success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="flex flex-col items-start gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-la-lg border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                  <CheckCircle2 className="h-6 w-6 text-la-gold" />
                </div>

                <div>
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Instruções Enviadas
                  </span>
                  <h1 className="mt-1 font-la-sans text-[1.5rem] font-semibold text-la-text-primary">
                    Verifique seu e-mail
                  </h1>
                </div>

                <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.65] text-la-text-secondary">
                  Se o endereço <strong className="text-la-gold-light">{email}</strong> estiver cadastrado na plataforma, enviamos um link seguro para a redefinição da sua senha de acesso.
                </p>

                <div className="mt-2 w-full rounded-la-md border border-white/10 bg-black/45 p-3.5">
                  <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-la-text-muted">
                    Dica de Segurança
                  </span>
                  <p className="mt-1 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.75rem] leading-[1.5] text-la-text-secondary">
                    O link expira em 30 minutos. Caso não encontre na caixa de entrada, verifique sua pasta de spam ou lixo eletrônico.
                  </p>
                </div>

                <div className="mt-4 flex w-full flex-col gap-2.5">
                  <Link
                    href={ROUTES.login}
                    className="inline-flex min-h-[2.875rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  >
                    <span>Ir para a página de login</span>
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="font-la-mono text-[0.75rem] text-la-text-secondary hover:text-la-gold-light"
                  >
                    Tentar outro e-mail
                  </button>
                </div>
              </motion.div>
            ) : (
              <form
                key="reset-form"
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-la-md border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                  <KeyRound className="h-5 w-5 text-la-gold" />
                </div>

                <div>
                  <span className="font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-la-gold-light">
                    SEGURANÇA DA CONTA
                  </span>
                  <h1 className="mt-1 font-la-sans text-[1.625rem] font-semibold leading-[1.2] text-la-text-primary">
                    Recupere seu acesso
                  </h1>
                  <p className="mt-1.5 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                    Informe o e-mail associado à sua conta do Legion Altaire para receber as instruções de redefinição de senha.
                  </p>
                </div>

                {emailError ? (
                  <div
                    role="alert"
                    className="flex items-start gap-2.5 rounded-la-md border border-red-500/45 bg-red-950/40 p-3 text-red-200"
                  >
                    <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                    <p className="font-la-sans text-[0.8125rem]">{emailError}</p>
                  </div>
                ) : null}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="reset-email"
                    className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-text-secondary"
                  >
                    E-mail Cadastrado
                  </label>
                  <div className="relative flex items-center">
                    <Mail
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3.5 h-4 w-4 text-la-gold/80"
                    />
                    <input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      placeholder="voce@suaempresa.com.br"
                      value={email}
                      onChange={handleInputChange}
                      className={clsx(
                        "min-h-[2.875rem] w-full rounded-la-md border bg-black/55 py-2.5 pr-4 pl-10 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                        emailError
                          ? "border-red-500/70"
                          : "border-white/12 hover:border-white/25"
                      )}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={clsx(
                    "mt-2 inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-6 py-3 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse shadow-[var(--la-elevation-gold)] transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                    isSubmitting && "cursor-not-allowed opacity-75"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-text-inverse border-t-transparent" />
                      <span>Processando envio...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar link de recuperação</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="border-t border-white/10 pt-4 text-center">
                  <Link
                    href={ROUTES.login}
                    className="inline-flex items-center gap-1.5 font-la-mono text-[0.75rem] text-la-text-secondary transition-colors hover:text-la-gold-light"
                  >
                    <ArrowLeft aria-hidden="true" className="h-3 w-3" />
                    <span>Lembrou da senha? Fazer login</span>
                  </Link>
                </div>
              </form>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="relative z-20 mx-auto flex w-full max-w-[82rem] items-center justify-center border-t border-white/10 px-5 py-4 font-la-mono text-[0.6875rem] text-la-text-muted">
        <span>© {new Date().getFullYear()} Legion Altaire. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}