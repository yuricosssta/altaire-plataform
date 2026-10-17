// FrontEnd/src/components/landing/FAQSection.tsx
"use client";

import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { clsx } from "clsx";
import { SectionEyebrow } from "@/components/landing/SectionEyebrow";
import { SectionShell } from "@/components/landing/SectionShell";
import {
  getPublishedFaqItems,
  landingContent,
  type FAQItem,
  type LandingContent,
} from "@/lib/constants/landing-content";
import {
  FAQ_MOTION,
  MOTION_VIEWPORT,
  REDUCED_MOTION_VARIANTS,
  SECTION_FADE_VARIANTS,
  SECTION_REVEAL_VARIANTS,
  selectMotionPreset,
} from "@/lib/constants/motion";

export type FAQAccordionProps = {
  readonly items: readonly FAQItem[];
  readonly allowMultiple?: boolean;
  readonly className?: string;
};

type FAQFilterKey = "all" | "strategy" | "ai-control" | "execution";

type FAQFilterGroup = {
  readonly key: FAQFilterKey;
  readonly label: string;
  readonly itemIds?: readonly string[];
};

const FAQ_FILTER_GROUPS: readonly FAQFilterGroup[] = [
  {
    key: "all",
    label: "Todas as dúvidas",
  },
  {
    key: "strategy",
    label: "Estratégia & Negócio",
    itemIds: [
      "faq-01-gerador-de-posts",
      "faq-02-ajuda-a-vender-mais",
      "faq-03-estrategia-pronta",
      "faq-04-refinando-oferta",
      "faq-05-para-quem-foi-criado",
      "faq-08-multiplos-projetos",
    ],
  },
  {
    key: "ai-control",
    label: "IA & Controle",
    itemIds: [
      "faq-06-entender-de-ia",
      "faq-07-conteudos-genericos",
      "faq-12-revisar-e-alterar",
      "faq-13-versoes-do-mesmo-conteudo",
      "faq-16-reaproveitar-repertorio",
    ],
  },
  {
    key: "execution",
    label: "Formatos & Execução",
    itemIds: [
      "faq-09-formatos-contemplados",
      "faq-10-como-funcionam-stories",
      "faq-11-quantidade-fixa-calendario",
      "faq-14-o-que-pode-ser-gerado",
      "faq-15-materiais-complementares",
    ],
  },
] as const;

/**
 * Item individual do Acordeão com Spotlight Radial Dourado (Resend DNA)
 * e Resposta Justificada em Todas as Dimensões.
 */
function FAQAccordionRow({
  item,
  canonicalNumber,
  isOpen,
  onToggle,
  onKeyDown,
  buttonRef,
  shouldReduceMotion,
}: {
  readonly item: FAQItem;
  readonly canonicalNumber: string;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  readonly buttonRef: (el: HTMLButtonElement | null) => void;
  readonly shouldReduceMotion: boolean | null;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState<{
    x: number;
    y: number;
    opacity: number;
  }>({
    x: 240,
    y: 36,
    opacity: 0,
  });

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !rowRef.current) {
      return;
    }
    const rect = rowRef.current.getBoundingClientRect();
    setSpotlight({
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
  };

  const contentVariants = selectMotionPreset(
    shouldReduceMotion,
    FAQ_MOTION.content,
    REDUCED_MOTION_VARIANTS.disclosure
  );

  const iconVariants = selectMotionPreset(
    shouldReduceMotion,
    FAQ_MOTION.icon,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const triggerId = `${item.id}-trigger`;
  const panelId = `${item.id}-panel`;

  return (
    <div
      ref={rowRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        isOpen
          ? {
              boxShadow:
                "inset 2px 0 0 0 #CFA965, 0 12px 32px rgba(0, 0, 0, 0.45)",
            }
          : undefined
      }
      className={clsx(
        "relative overflow-hidden rounded-la-xl border transition-all duration-200",
        isOpen
          ? "border-la-gold/55 bg-[#0C0F17]/95"
          : "border-white/10 bg-la-surface-1/60 hover:border-white/20 hover:bg-la-surface-1/90"
      )}
    >
      {/* Spotlight Radial Dourado acompanhando o ponteiro do mouse */}
      <div
        aria-hidden="true"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(420px circle at ${spotlight.x}px ${spotlight.y}px, rgba(207, 169, 101, 0.10), transparent 70%)`,
        }}
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
      />

      <h3 className="relative z-10 m-0">
        <button
          ref={buttonRef}
          id={triggerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className={clsx(
            "group flex min-h-[3.75rem] w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-180 sm:px-5 sm:py-4.5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light focus-visible:ring-inset"
          )}
        >
          <span className="flex min-w-0 items-center gap-3.5">
            <span
              className={clsx(
                "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-la-xs border font-la-mono text-[0.6875rem] font-semibold tracking-[0.06em] transition-colors duration-180",
                isOpen
                  ? "border-la-gold bg-la-gold text-la-text-inverse"
                  : "border-white/15 bg-black/45 text-la-gold-light group-hover:border-la-border-gold"
              )}
            >
              {canonicalNumber}
            </span>

            <span
              className={clsx(
                "text-balance font-la-sans text-[1rem] font-semibold leading-[1.38] transition-colors duration-180 sm:text-[1.0625rem]",
                isOpen
                  ? "text-la-gold-light"
                  : "text-la-text-primary group-hover:text-la-gold-light"
              )}
            >
              {item.question}
            </span>
          </span>

          <motion.span
            aria-hidden="true"
            animate={isOpen ? "expanded" : "collapsed"}
            variants={iconVariants}
            className={clsx(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-la-sm border transition-colors duration-180",
              isOpen
                ? "border-la-border-gold bg-la-gold-faint text-la-gold-light"
                : "border-white/10 bg-black/40 text-la-text-secondary group-hover:border-white/25 group-hover:text-la-text-primary"
            )}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={triggerId}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={contentVariants}
            className="relative z-10 overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-white/10 px-4 pt-3.5 pb-5 sm:pl-14 sm:pr-6 sm:pb-5">
              {item.answer.map((paragraph) => (
                <p
                  key={paragraph}
                  className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/**
 * Acordeão acessível do FAQ (`FAQAccordion` — Etapa 2D §4.12 & §7).
 *
 * Regras de interação e acessibilidade:
 * - Pergunta renderizada como `<button type="button">` com `aria-expanded` e `aria-controls`.
 * - Inicia fechado por padrão para evitar parede de texto; permite múltiplas respostas abertas para consulta.
 * - Suporta navegação por teclado (Enter, Space, ArrowDown, ArrowUp, Home, End).
 * - Inclui barra de filtro por tema com transição FLIP (`layoutId`) e controle de Expandir/Recolher.
 * - Respostas justificadas em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function FAQAccordion({
  items,
  allowMultiple = true,
  className,
}: FAQAccordionProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FAQFilterKey>("all");
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const shouldReduceMotion = useReducedMotion();

  /* Mapeia a numeração canônica original (01 a 16) mesmo quando filtrado */
  const canonicalNumberMap = new Map<string, string>(
    items.map((item, idx) => [item.id, String(idx + 1).padStart(2, "0")])
  );

  const selectedFilterGroup =
    FAQ_FILTER_GROUPS.find((group) => group.key === activeFilter) ??
    FAQ_FILTER_GROUPS[0];

  const filteredItems =
    selectedFilterGroup.key === "all" || !selectedFilterGroup.itemIds
      ? items
      : items.filter((item) => selectedFilterGroup.itemIds?.includes(item.id));

  /* Caso uma lista customizada seja passada por prop sem os IDs padrão, mantém todos visíveis */
  const visibleItems = filteredItems.length > 0 ? filteredItems : items;

  const visibleIds = visibleItems.map((item) => item.id);
  const areAllVisibleOpen =
    visibleIds.length > 0 && visibleIds.every((id) => openIds.includes(id));

  const toggleItem = (id: string) => {
    setOpenIds((current) => {
      const isCurrentlyOpen = current.includes(id);
      if (isCurrentlyOpen) {
        return current.filter((itemId) => itemId !== id);
      }
      return allowMultiple ? [...current, id] : [id];
    });
  };

  const handleToggleAllVisible = () => {
    if (areAllVisibleOpen) {
      setOpenIds((current) =>
        current.filter((id) => !visibleIds.includes(id))
      );
    } else if (allowMultiple) {
      setOpenIds((current) => Array.from(new Set([...current, ...visibleIds])));
    } else if (visibleIds[0]) {
      setOpenIds([visibleIds[0]]);
    }
  };

  const focusTriggerAtIndex = (index: number) => {
    if (visibleItems.length === 0) {
      return;
    }
    const clampedIndex = (index + visibleItems.length) % visibleItems.length;
    requestAnimationFrame(() => {
      triggerRefs.current[clampedIndex]?.focus();
    });
  };

  const handleTriggerKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusTriggerAtIndex(currentIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusTriggerAtIndex(currentIndex - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusTriggerAtIndex(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusTriggerAtIndex(visibleItems.length - 1);
    }
  };

  return (
    <div className={clsx("flex w-full flex-col gap-4", className)}>
      {/* Barra Utilitária de Navegação do FAQ (Filtro por Eixo com FLIP + Expandir/Recolher) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-la-xl border border-white/10 bg-[#07090F]/90 p-2.5 sm:px-3.5">
        <div
          aria-label="Filtrar perguntas por tema"
          className="flex flex-wrap items-center gap-1"
        >
          {FAQ_FILTER_GROUPS.map((group) => {
            const isSelected = activeFilter === group.key;
            const count =
              group.key === "all" || !group.itemIds
                ? items.length
                : items.filter((item) => group.itemIds?.includes(item.id))
                    .length;

            if (count === 0) {
              return null;
            }

            return (
              <button
                key={group.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setActiveFilter(group.key)}
                className={clsx(
                  "relative inline-flex items-center gap-1.5 rounded-la-md px-3 py-1.5 font-la-mono text-[0.6875rem] font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light",
                  isSelected
                    ? "font-semibold text-la-text-inverse"
                    : "text-la-text-secondary hover:text-la-text-primary"
                )}
              >
                {isSelected ? (
                  <motion.span
                    layoutId="faq-filter-active-pill"
                    transition={{
                      type: "tween",
                      duration: 0.26,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="pointer-events-none absolute inset-0 z-0 rounded-la-md bg-la-gold"
                  />
                ) : null}

                <span className="relative z-10">{group.label}</span>
                <span
                  className={clsx(
                    "relative z-10 rounded-la-full px-1.5 py-0.2 font-la-mono text-[0.625rem]",
                    isSelected
                      ? "bg-black/20 text-la-text-inverse"
                      : "bg-white/5 text-la-text-muted"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {allowMultiple ? (
          <button
            type="button"
            onClick={handleToggleAllVisible}
            className="inline-flex items-center gap-1.5 rounded-la-md border border-white/10 bg-black/50 px-3 py-1.5 font-la-mono text-[0.6875rem] text-la-gold-light transition-colors hover:border-la-border-gold hover:bg-la-gold-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
          >
            {areAllVisibleOpen ? (
              <>
                <ChevronsDownUp aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Recolher abertas</span>
              </>
            ) : (
              <>
                <ChevronsUpDown aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Expandir todas</span>
              </>
            )}
          </button>
        ) : null}
      </div>

      {/* Lista de Perguntas e Respostas em Cartões Individuais de Alta Legibilidade */}
      <div className="flex flex-col gap-2.5">
        {visibleItems.map((item, index) => {
          const isOpen = openIds.includes(item.id);
          const canonicalNumber =
            canonicalNumberMap.get(item.id) ??
            String(index + 1).padStart(2, "0");

          return (
            <FAQAccordionRow
              key={item.id}
              item={item}
              canonicalNumber={canonicalNumber}
              isOpen={isOpen}
              onToggle={() => toggleItem(item.id)}
              onKeyDown={(event) => handleTriggerKeyDown(event, index)}
              buttonRef={(el) => {
                triggerRefs.current[index] = el;
              }}
              shouldReduceMotion={shouldReduceMotion}
            />
          );
        })}
      </div>
    </div>
  );
}

export type FAQSectionProps = {
  readonly content?: LandingContent["faq"];
  readonly className?: string;
};

/**
 * Seção 13 — Perguntas Frequentes (`id="perguntas-frequentes"`).
 *
 * Referência dominante: Resend (silêncio, legibilidade, bordas de 1px e spotlight sutil).
 * Intensidade: 1/5 | Profundidade: Nível 0 (Plano) -> Nível 1.
 *
 * Regras inegociáveis (CONTENT-LANDING.md §13, Etapa 2D §4.12 & ACCEPTANCE-LANDING.md §25):
 * - Eyebrow estritamente canônico: "ANTES DE COMEÇAR" (sem prefixos inventados).
 * - Filtra estritamente apenas perguntas com `status === "aprovado"` (16 perguntas canônicas).
 * - Todas as respostas iniciam fechadas por padrão.
 * - Sem CTA próprio para não competir com o CTA Final imediatamente seguinte.
 * - Subheadline, respostas e microcopy justificados em todas as dimensões (`text-justify [text-align-last:left] hyphens-auto`).
 */
export function FAQSection({
  content = landingContent.faq,
  className,
}: FAQSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const headingId = content.id
    ? `${content.id}-title`
    : "perguntas-frequentes-title";

  const publishedItems =
    content === landingContent.faq
      ? getPublishedFaqItems()
      : content.items.filter((item) => item.status === "aprovado");

  const revealVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_REVEAL_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const fadeVariants = selectMotionPreset(
    shouldReduceMotion,
    SECTION_FADE_VARIANTS,
    REDUCED_MOTION_VARIANTS.reveal
  );

  const bridgeMicrocopy =
    content.microcopy?.[0] ??
    "Ainda não precisa ter tudo pronto. Você só precisa começar pelo contexto certo.";

  return (
    <SectionShell
      id={content.id}
      ariaLabelledBy={headingId}
      container="wide"
      spacing="spacious"
      surface="canvas"
      bottomBorder={true}
      className={clsx("relative overflow-hidden [color-scheme:dark]", className)}
    >
      <div className="mx-auto flex w-full max-w-[54rem] flex-col gap-8 lg:gap-10">
        {/* 1. Cabeçalho Editorial Canônico (§13 de 02. CONTENT-LANDING.md — Sem prefixo inventado) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={revealVariants}
          className="flex flex-col items-start gap-4"
        >
          {/* Eyebrow Canônico: "ANTES DE COMEÇAR" */}
          <SectionEyebrow label={content.eyebrow} variant="pill" />

          {content.headline ? (
            <h2
              id={headingId}
              className="max-w-[24ch] text-balance font-la-sans text-[clamp(1.875rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.026em] text-la-text-primary"
            >
              {content.headline}
            </h2>
          ) : null}

          {content.subheadline ? (
            <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[1.0625rem] leading-[1.68] text-la-text-secondary">
              {content.subheadline}
            </p>
          ) : null}

          {content.body && content.body.length > 0
            ? content.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] leading-[1.68] text-la-text-secondary"
                >
                  {paragraph}
                </p>
              ))
            : null}
        </motion.div>

        {/* 2. Acordeão de Perguntas Aprovadas (16 itens canônicos) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={fadeVariants}
        >
          <FAQAccordion items={publishedItems} allowMultiple={true} />
        </motion.div>

        {/* 3. Ponte Canônica para o CTA Final (§13 Microcopy: "Ainda não precisa ter tudo pronto. Você só precisa começar pelo contexto certo.") */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={MOTION_VIEWPORT}
          variants={fadeVariants}
          className="flex flex-col items-center justify-between gap-4 rounded-la-xl border border-la-border-gold/45 bg-la-surface-1/90 px-5 py-4 sm:flex-row sm:px-6"
        >
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-la-md border border-la-border-gold bg-la-gold-faint text-la-gold-light"
            >
              <Sparkles className="h-4 w-4 text-la-gold" />
            </span>

            <p className="w-full text-justify [text-align-last:left] hyphens-auto font-la-sans text-[0.9375rem] font-medium leading-[1.55] text-la-text-primary">
              {bridgeMicrocopy}
            </p>
          </div>

          <a
            href={`#${landingContent.finalCta.id ?? "comecar"}`}
            aria-label="Avançar para a seção de decisão"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-la-full border border-la-border-gold/55 bg-la-gold-faint text-la-gold-light transition-colors hover:border-la-gold hover:bg-la-gold hover:text-la-text-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-la-gold-light"
          >
            <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
          </a>
        </motion.div>
      </div>
    </SectionShell>
  );
}

export default FAQSection;