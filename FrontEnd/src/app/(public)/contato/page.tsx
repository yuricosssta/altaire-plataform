// FrontEnd/src/app/(public)/contato/page.tsx
"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  HelpCircle,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { CTAButton } from "@/components/landing/CTAGroup";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";
import { ROUTES } from "@/lib/constants/routes";

const WHATSAPP_NUMBER = "5532999999999"; // Substitua pelo número oficial da operação
const WHATSAPP_PREFILLED_MESSAGE =
  "Olá! Gostaria de falar com o time do Legion Altaire sobre a plataforma.";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_PREFILLED_MESSAGE
)}`;

const OFFICIAL_EMAIL = "contato@legionaltaire.com.br";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Por favor, informe seu nome completo (mínimo 3 caracteres)."),
  email: z
    .string()
    .trim()
    .email("Por favor, informe um endereço de e-mail corporativo válido."),
  subject: z.enum(
    ["comercial", "suporte", "agencia", "outros"],
    {
      errorMap: () => ({ message: "Selecione o motivo principal do seu contato." }),
    }
  ),
  message: z
    .string()
    .trim()
    .min(10, "Sua mensagem deve conter pelo menos 10 caracteres."),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContatoPage() {
  const shouldReduceMotion = useReducedMotion();

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "comercial",
    message: "",
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<ContactFormData | null>(
    null
  );
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof ContactFormData]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      /* Ignora falha de clipboard caso não permitido pelo browser */
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {};
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof ContactFormData;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setFormErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    /* Simulação assíncrona de processamento com resposta visual imediata */
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSubmitting(false);
    setSubmittedData(result.data);
  };

  const handleResetForm = () => {
    setSubmittedData(null);
    setFormData({
      name: "",
      email: "",
      subject: "comercial",
      message: "",
    });
    setFormErrors({});
  };

  const revealVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_REVEAL_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  return (
    <div className="flex flex-col [overflow-anchor:none]">
      <SectionShell
        id="contato-topo"
        ariaLabelledBy="contato-hero-title"
        container="max"
        spacing="hero"
        surface="canvas"
        bottomBorder={false}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-14 left-1/2 -z-0 h-[28rem] w-[54rem] -translate-x-1/2 rounded-la-full bg-[radial-gradient(circle_at_center,rgba(207,169,101,0.12)_0%,rgba(207,169,101,0.03)_48%,transparent_74%)] blur-3xl"
        />

        <div className="relative z-10 flex flex-col gap-10 lg:gap-14">
          {/* 1. CABEÇALHO EDITORIAL DE ATENDIMENTO */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={MOTION_VIEWPORT}
            variants={revealVariants}
            className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-10"
          >
            <div className="flex flex-col items-start lg:col-span-7">
              <SectionEyebrow
                label="CANAL DIRETO · ATENDIMENTO E SUPORTE"
                variant="pill"
              />

              <h1
                id="contato-hero-title"
                className="mt-4 max-w-[22ch] text-balance font-la-sans text-[clamp(2rem,3.4vw,3.125rem)] font-semibold leading-[1.1] tracking-[-0.028em] text-la-text-primary"
              >
                Fale com a equipe do Legion Altaire.
              </h1>

              <p className="mt-4 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
                Tire dúvidas sobre os planos, receba orientação para
                estruturar sua operação ou acione nosso suporte técnico. Estamos
                à disposição para atender você com agilidade e clareza.
              </p>
            </div>

            <div className="flex flex-col justify-between gap-4 border-l-2 border-la-gold/55 pl-4 sm:pl-5 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-8">
              <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                Você pode optar pelo atendimento instantâneo via WhatsApp
                Oficial para questões rápidas ou preencher o formulário
                estruturado caso precise de alinhamento consultivo.
              </p>

              <div className="flex items-center gap-3 rounded-la-lg border border-la-border-gold/45 bg-la-gold-faint px-4 py-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-la-gold"
                />
                <span className="font-la-mono text-[0.75rem] font-semibold tracking-[0.04em] text-la-gold-light">
                  Atendimento direto e sem intermediários robotizados.
                </span>
              </div>
            </div>
          </motion.div>

          {/* 2. GRID PRINCIPAL: CANAIS DIRETOS (5 COLS) + FORMULÁRIO EM VIDRO FUMÊ (7 COLS) */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
            {/* COLUNA ESQUERDA: CANAIS DIRETOS DE CONTATO */}
            <div className="flex flex-col gap-4 lg:col-span-5">
              {/* Card 1: WhatsApp Oficial com Destaque Dourado */}
              <div className="relative overflow-hidden rounded-la-xl border border-la-border-gold/60 bg-[#0B0E17]/95 p-6 shadow-[var(--la-elevation-gold)]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-la-md border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="block font-la-mono text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        Atendimento Imediato
                      </span>
                      <h3 className="font-la-sans text-[1.125rem] font-semibold text-la-text-primary">
                        Suporte via WhatsApp
                      </h3>
                    </div>
                  </div>

                  <span className="rounded-la-full border border-la-border-gold/50 bg-la-gold-faint px-2.5 py-0.5 font-la-mono text-[0.625rem] font-semibold text-la-gold-light">
                    Tempo Real
                  </span>
                </div>

                <p className="mt-3 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.875rem] leading-[1.6] text-la-text-secondary">
                  Fale diretamente com nosso time comercial ou tire dúvidas
                  técnicas sobre como configurar seu Projeto Editorial.
                </p>

                <div className="mt-5">
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[2.875rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-4 py-2.5 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  >
                    <span>Iniciar conversa no WhatsApp</span>
                    <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Card 2: E-mail Institucional */}
              <div className="rounded-la-xl border border-white/12 bg-la-surface-1/90 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-la-md border border-white/10 bg-black/45 text-la-gold">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="block font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-muted">
                      Canal Corporativo
                    </span>
                    <h3 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                      E-mail Institucional
                    </h3>
                  </div>
                </div>

                <div className="mt-3.5 flex items-center justify-between rounded-la-md border border-white/10 bg-black/50 px-3.5 py-2.5">
                  <span className="font-la-mono text-[0.8125rem] text-la-text-primary">
                    {OFFICIAL_EMAIL}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1 rounded-la-xs px-2 py-1 font-la-mono text-[0.6875rem] text-la-gold-light transition-colors hover:text-la-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-la-gold" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card 3: Horários de Atendimento & SLA */}
              <div className="rounded-la-xl border border-white/12 bg-la-surface-1/90 p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-la-md border border-white/10 bg-black/45 text-la-gold">
                    <Clock className="h-4 w-4" />
                  </span>
                  <div>
                    <span className="block font-la-mono text-[0.625rem] uppercase tracking-[0.08em] text-la-text-muted">
                      Disponibilidade
                    </span>
                    <h3 className="font-la-sans text-[1rem] font-semibold text-la-text-primary">
                      Horário & Prazos de Resposta
                    </h3>
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 font-la-sans text-[0.8125rem] text-la-text-secondary">
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto">
                    • <strong className="text-la-text-primary">Horário:</strong> Segunda a Sexta-feira, das 09h às 18h (Horário de Brasília).
                  </p>
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto">
                    • <strong className="text-la-text-primary">WhatsApp:</strong> Respostas no mesmo dia útil (geralmente em menos de 2 horas).
                  </p>
                  <p className="w-full text-justify [text-align-last:left] hyphens-auto">
                    • <strong className="text-la-text-primary">Formulário / E-mail:</strong> Retorno em até 1 dia útil com análise do contexto.
                  </p>
                </div>
              </div>

              {/* Card 4: Operações de Agência e Múltiplas Contas */}
              <div className="rounded-la-xl border border-white/10 bg-black/45 p-5">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-la-gold" />
                  <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                    Agências & Coprodutores
                  </span>
                </div>
                <p className="mt-2 w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.8125rem] leading-[1.58] text-la-text-secondary">
                  Se você administra mais de 10 Projetos Editoriais simultâneos
                  ou necessita de um plano customizado para sua equipe,
                  selecione o assunto &ldquo;Parceria ou Contas de Agência&rdquo; no
                  formulário para falar com um consultor sênior.
                </p>
              </div>
            </div>

            {/* COLUNA DIREITA: FORMULÁRIO INTERATIVO VALIDADO EM VIDRO FUMÊ TRANSLÚCIDO */}
            <div className="relative overflow-hidden rounded-la-xl border border-white/12 bg-[#07090F]/95 p-6 shadow-[var(--la-elevation-2)] backdrop-blur-xl sm:p-8 lg:col-span-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-12 top-0 h-px bg-[image:var(--la-gradient-border-gold-top)]"
              />

              <AnimatePresence mode="wait">
                {submittedData ? (
                  /* PAINEL DE SUCESSO / CONFIRMAÇÃO */
                  <motion.div
                    key="success-card"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-start gap-4 py-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-la-lg border border-la-border-gold bg-la-gold-faint text-la-gold-light">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>

                    <div>
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        Mensagem Recebida com Sucesso
                      </span>
                      <h2 className="mt-1 font-la-sans text-[1.5rem] font-semibold text-la-text-primary">
                        Obrigado pelo contato, {submittedData.name.split(" ")[0]}!
                      </h2>
                    </div>

                    <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary">
                      Registramos sua solicitação sob o assunto selecionado.
                      Nossa equipe responderá diretamente para o e-mail{" "}
                      <strong className="text-la-gold-light">
                        {submittedData.email}
                      </strong>{" "}
                      dentro do prazo máximo de 1 dia útil.
                    </p>

                    <div className="mt-2 w-full rounded-la-md border border-white/10 bg-black/50 p-4">
                      <span className="block font-la-mono text-[0.5625rem] uppercase tracking-[0.08em] text-la-text-muted">
                        Resumo do envio
                      </span>
                      <p className="mt-1 font-la-sans text-[0.8125rem] text-la-text-secondary">
                        <strong className="text-la-text-primary">Mensagem enviada:</strong> &ldquo;{submittedData.message}&rdquo;
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="inline-flex min-h-[2.625rem] items-center rounded-la-md border border-white/15 bg-white/[0.04] px-4 py-2 font-la-sans text-[0.875rem] font-medium text-la-text-primary transition-colors hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      >
                        Enviar outra mensagem
                      </button>

                      <a
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[2.625rem] items-center gap-1.5 rounded-la-md bg-la-gold px-4 py-2 font-la-sans text-[0.875rem] font-semibold text-la-text-inverse transition-colors hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                      >
                        <span>Falar no WhatsApp agora</span>
                        <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  /* FORMULÁRIO INTERATIVO */
                  <form
                    key="contact-form"
                    onSubmit={handleSubmit}
                    noValidate
                    className="flex flex-col gap-5"
                  >
                    <div className="border-b border-white/10 pb-3">
                      <span className="font-la-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-la-gold-light">
                        Formulário Estruturado
                      </span>
                      <h2 className="mt-1 font-la-sans text-[1.25rem] font-semibold text-la-text-primary">
                        Envie sua mensagem para a nossa equipe
                      </h2>
                    </div>

                    {/* Campo: Nome Completo */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-name"
                        className="font-la-mono text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary"
                      >
                        Nome Completo *
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Ex.: Roberto Zane"
                        value={formData.name}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(formErrors.name)}
                        aria-describedby={
                          formErrors.name ? "name-error" : undefined
                        }
                        className={clsx(
                          "min-h-[2.875rem] rounded-la-md border bg-black/50 px-3.5 py-2 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          formErrors.name
                            ? "border-red-500/70 focus-visible:ring-red-400"
                            : "border-white/12 hover:border-white/25"
                        )}
                      />
                      {formErrors.name ? (
                        <p
                          id="name-error"
                          className="font-la-mono text-[0.6875rem] text-red-400"
                        >
                          {formErrors.name}
                        </p>
                      ) : null}
                    </div>

                    {/* Campo: E-mail Corporativo */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-email"
                        className="font-la-mono text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary"
                      >
                        E-mail de Contato *
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seuemail@empresa.com.br"
                        value={formData.email}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(formErrors.email)}
                        aria-describedby={
                          formErrors.email ? "email-error" : undefined
                        }
                        className={clsx(
                          "min-h-[2.875rem] rounded-la-md border bg-black/50 px-3.5 py-2 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          formErrors.email
                            ? "border-red-500/70 focus-visible:ring-red-400"
                            : "border-white/12 hover:border-white/25"
                        )}
                      />
                      {formErrors.email ? (
                        <p
                          id="email-error"
                          className="font-la-mono text-[0.6875rem] text-red-400"
                        >
                          {formErrors.email}
                        </p>
                      ) : null}
                    </div>

                    {/* Campo: Assunto */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-subject"
                        className="font-la-mono text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary"
                      >
                        Assunto / Motivo do Contato *
                      </label>
                      <div className="relative">
                        <select
                          id="contact-subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          className="min-h-[2.875rem] w-full appearance-none rounded-la-md border border-white/12 bg-black/60 px-3.5 py-2 font-la-sans text-[0.9375rem] text-la-text-primary transition-colors hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
                        >
                          <option value="comercial" className="bg-[#0B0E17]">
                            Dúvida Comercial sobre os Planos
                          </option>
                          <option value="suporte" className="bg-[#0B0E17]">
                            Suporte Técnico da Plataforma
                          </option>
                          <option value="agencia" className="bg-[#0B0E17]">
                            Parceria ou Contas de Agência
                          </option>
                          <option value="outros" className="bg-[#0B0E17]">
                            Outros Assuntos
                          </option>
                        </select>
                      </div>
                      {formErrors.subject ? (
                        <p className="font-la-mono text-[0.6875rem] text-red-400">
                          {formErrors.subject}
                        </p>
                      ) : null}
                    </div>

                    {/* Campo: Mensagem */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="contact-message"
                        className="font-la-mono text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-la-text-secondary"
                      >
                        Mensagem *
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        placeholder="Descreva brevemente como podemos ajudar sua operação..."
                        value={formData.message}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(formErrors.message)}
                        aria-describedby={
                          formErrors.message ? "message-error" : undefined
                        }
                        className={clsx(
                          "rounded-la-md border bg-black/50 px-3.5 py-2.5 font-la-sans text-[0.9375rem] text-la-text-primary placeholder:text-white/25 transition-colors resize-y",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                          formErrors.message
                            ? "border-red-500/70 focus-visible:ring-red-400"
                            : "border-white/12 hover:border-white/25"
                        )}
                      />
                      {formErrors.message ? (
                        <p
                          id="message-error"
                          className="font-la-mono text-[0.6875rem] text-red-400"
                        >
                          {formErrors.message}
                        </p>
                      ) : null}
                    </div>

                    {/* Botão de Envio */}
                    <div className="mt-2 flex flex-col gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={clsx(
                          "inline-flex min-h-[3rem] w-full items-center justify-center gap-2 rounded-la-md bg-la-gold px-6 py-3 font-la-sans text-[0.9375rem] font-semibold text-la-text-inverse transition-colors",
                          "hover:bg-la-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light shadow-[var(--la-elevation-gold)]",
                          isSubmitting && "opacity-75 cursor-not-allowed"
                        )}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-la-text-inverse border-t-transparent" />
                            <span>Validando e enviando...</span>
                          </>
                        ) : (
                          <>
                            <span>Enviar mensagem agora</span>
                            <Send aria-hidden="true" className="h-4 w-4" />
                          </>
                        )}
                      </button>

                      <p className="text-center font-la-mono text-[0.6875rem] text-la-text-muted">
                        Seus dados são protegidos conforme a nossa Política de Privacidade.
                      </p>
                    </div>
                  </form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}