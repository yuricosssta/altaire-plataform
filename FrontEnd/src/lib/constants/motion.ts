// FrontEnd/src/lib/constants/motion.ts

/**
 * Fonte canônica dos comportamentos de motion da experiência pública do Legion Altaire.
 *
 * Referências de autoridade:
 * - docs/DESIGN-LEGION-PUBLIC.md (Etapas 2B, 2C e 2D)
 * - docs/ACCEPTANCE-LANDING.md (§18, §30, §31, §32, §33)
 * - PLANO-OPERACIONAL-ETAPA-3-LANDING.md (§8.3 e §20)
 *
 * Regras inegociáveis:
 * - Todos os tempos estão expressos em segundos (compatível com `motion/react`).
 * - Nenhum componente deve inventar durações, delays ou curvas próprias.
 * - Motion funcional tem prioridade sobre motion narrativa.
 * - Motion atmosférica é rara, lenta e limitada a 1 elemento dominante por viewport.
 * - Proibido bounce, efeito elástico visível, scroll hijacking ou partículas aleatórias.
 * - Nenhuma informação essencial pode depender de animação para ser compreendida.
 * - `prefers-reduced-motion` deve ser respeitado em 100% dos componentes.
 */

import type { LandingSectionId } from "./routes";

export type CubicBezier = [number, number, number, number];

export type MotionEasingName =
  | "linear"
  | "interface"
  | "reveal"
  | "standard"
  | "enter"
  | "exit"
  | "emphasized";

export type MotionHierarchyLevel =
  | "functional"
  | "narrative"
  | "atmospheric"
  | "cinematic";

export type MotionOfficialVerb =
  | "convergir"
  | "conectar"
  | "alinhar"
  | "revelar"
  | "ativar"
  | "transformar"
  | "distribuir"
  | "estabilizar";

export type MotionTransition = {
  readonly type?: "tween" | "spring";
  readonly duration?: number;
  readonly delay?: number;
  readonly ease?: CubicBezier;
  readonly stiffness?: number;
  readonly damping?: number;
  readonly mass?: number;
  readonly bounce?: number;
  readonly staggerChildren?: number;
  readonly delayChildren?: number;
  readonly when?: "beforeChildren" | "afterChildren";
};

export type MotionTarget = {
  readonly opacity?: number;
  readonly x?: number | string;
  readonly y?: number | string;
  readonly scale?: number;
  readonly rotate?: number;
  readonly height?: number | string;
  readonly clipPath?: string;
  readonly pathLength?: number;
  readonly pathOffset?: number;
  readonly filter?: string;
  readonly transition?: MotionTransition;
};

export type MotionVariantMap = Record<string, MotionTarget>;

export type MotionPresetGroup = Record<string, MotionVariantMap>;

/* -------------------------------------------------------------------------- */
/* 1. Vocabulário Semântico do Movimento (Etapa 2C §11 & ACCEPTANCE §31)      */
/* -------------------------------------------------------------------------- */

export const OFFICIAL_MOTION_VERBS = [
  "convergir",
  "conectar",
  "alinhar",
  "revelar",
  "ativar",
  "transformar",
  "distribuir",
  "estabilizar",
] as const satisfies readonly MotionOfficialVerb[];

export const FORBIDDEN_MOTION_VERBS = [
  "explodir",
  "saltar",
  "quicar",
  "tremer",
  "girar continuamente",
  "perseguir o cursor",
  "flutuar sem destino",
  "deslizar por longas distâncias",
] as const;

/* -------------------------------------------------------------------------- */
/* 2. Tokens Temporais Oficiais em Segundos (Etapa 2B §16.1)                  */
/* -------------------------------------------------------------------------- */

export const MOTION_DURATIONS = {
  none: 0,
  instant: 0.11,
  fast: 0.18,
  normal: 0.28,
  base: 0.28,
  moderate: 0.36,
  reveal: 0.6,
  slow: 0.6,
  scene: 0.82,
  narrative: 0.82,
  cinematic: 1.2,
} as const;

/* -------------------------------------------------------------------------- */
/* 3. Curvas Oficiais (Etapa 2B §16.2)                                        */
/* -------------------------------------------------------------------------- */

export const MOTION_EASINGS: Record<MotionEasingName, CubicBezier> = {
  linear: [0, 0, 1, 1],
  interface: [0.16, 1, 0.3, 1],
  reveal: [0.22, 1, 0.36, 1],
  standard: [0.2, 0, 0, 1],
  enter: [0.16, 1, 0.3, 1],
  exit: [0.4, 0, 1, 1],
  emphasized: [0.16, 1, 0.3, 1],
};

export const MOTION_CSS_EASINGS = {
  linear: "linear",
  interface: "cubic-bezier(0.16, 1, 0.3, 1)",
  reveal: "cubic-bezier(0.22, 1, 0.36, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/* -------------------------------------------------------------------------- */
/* 4. Delays e Limites Superiores de Amplitude                                */
/* -------------------------------------------------------------------------- */

export const MOTION_DELAYS = {
  none: 0,
  short: 0.04,
  base: 0.08,
  sequence: 0.12,
  narrative: 0.18,
} as const;

export const MOTION_LIMITS = {
  revealOffsetPx: 16,
  itemOffsetPx: 10,
  dropdownOffsetPx: 8,
  mobileMenuOffsetPercent: 100,
  stickyStoryOffsetPx: 18,
  subtleParallaxPx: 12,
  narrativeParallaxPx: 20,
  maximumParallaxPx: 24,
  minimumScale: 0.985,
  maximumScale: 1.015,
  maxAtmosphericMovementsPerViewport: 1,
  maxSimultaneousMicrointeractions: 2,
} as const;

/* -------------------------------------------------------------------------- */
/* 5. Transições-Base Reutilizáveis                                           */
/* -------------------------------------------------------------------------- */

export const MOTION_TRANSITIONS = {
  none: {
    type: "tween",
    duration: MOTION_DURATIONS.none,
    ease: MOTION_EASINGS.linear,
  },

  instant: {
    type: "tween",
    duration: MOTION_DURATIONS.instant,
    ease: MOTION_EASINGS.interface,
  },

  functional: {
    type: "tween",
    duration: MOTION_DURATIONS.fast,
    ease: MOTION_EASINGS.interface,
  },

  interactive: {
    type: "tween",
    duration: MOTION_DURATIONS.normal,
    ease: MOTION_EASINGS.interface,
  },

  reveal: {
    type: "tween",
    duration: MOTION_DURATIONS.reveal,
    ease: MOTION_EASINGS.reveal,
  },

  scene: {
    type: "tween",
    duration: MOTION_DURATIONS.scene,
    ease: MOTION_EASINGS.interface,
  },

  narrative: {
    type: "tween",
    duration: MOTION_DURATIONS.scene,
    ease: MOTION_EASINGS.emphasized,
  },

  atmospheric: {
    type: "tween",
    duration: MOTION_DURATIONS.cinematic,
    ease: MOTION_EASINGS.reveal,
  },

  cinematic: {
    type: "tween",
    duration: MOTION_DURATIONS.cinematic,
    ease: MOTION_EASINGS.interface,
  },

  dampedSpring: {
    type: "spring",
    stiffness: 260,
    damping: 32,
    mass: 1,
    bounce: 0,
  },

  exit: {
    type: "tween",
    duration: MOTION_DURATIONS.fast,
    ease: MOTION_EASINGS.exit,
  },
} satisfies Record<string, MotionTransition>;

export const MOTION_VIEWPORT = {
  once: true,
  amount: 0.22,
  margin: "0px 0px -10% 0px",
} as const;

/* -------------------------------------------------------------------------- */
/* 6. Variantes Estruturais de Seção e Stagger                                */
/* -------------------------------------------------------------------------- */

export const SECTION_REVEAL_VARIANTS = {
  hidden: {
    opacity: 0,
    y: MOTION_LIMITS.revealOffsetPx,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITIONS.reveal,
  },
} satisfies MotionVariantMap;

export const SECTION_FADE_VARIANTS = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,
    transition: MOTION_TRANSITIONS.reveal,
  },
} satisfies MotionVariantMap;

export const SECTION_MASK_REVEAL_VARIANTS = {
  hidden: {
    opacity: 0,
    clipPath: "inset(0 0 12% 0)",
  },

  visible: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    transition: MOTION_TRANSITIONS.narrative,
  },
} satisfies MotionVariantMap;

export const STAGGER_CONTAINER_VARIANTS = {
  hidden: {},

  visible: {
    transition: {
      type: "tween",
      delayChildren: MOTION_DELAYS.base,
      staggerChildren: MOTION_DELAYS.base,
      when: "beforeChildren",
    },
  },
} satisfies MotionVariantMap;

export const STAGGER_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: MOTION_LIMITS.itemOffsetPx,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: MOTION_TRANSITIONS.reveal,
  },
} satisfies MotionVariantMap;

/* -------------------------------------------------------------------------- */
/* 7. Coreografia do Hero, Mockups em TSX e Fio Estratégico                   */
/* -------------------------------------------------------------------------- */

export const HERO_STAGE_MOTION = {
  copyContainer: {
    hidden: {},
    visible: {
      transition: {
        type: "tween",
        staggerChildren: MOTION_DELAYS.base,
        when: "beforeChildren",
      },
    },
  },

  copyItem: {
    hidden: {
      opacity: 0,
      y: MOTION_LIMITS.revealOffsetPx,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: MOTION_TRANSITIONS.reveal,
    },
  },

  productFrame: {
    hidden: {
      opacity: 0,
      y: MOTION_LIMITS.stickyStoryOffsetPx,
      scale: MOTION_LIMITS.minimumScale,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...MOTION_TRANSITIONS.cinematic,
        delay: MOTION_DELAYS.sequence,
      },
    },
  },
} satisfies MotionPresetGroup;

export const STICKY_STORY_VARIANTS = {
  inactive: {
    opacity: 0.38,
    y: MOTION_LIMITS.stickyStoryOffsetPx,
    scale: MOTION_LIMITS.minimumScale,
    transition: MOTION_TRANSITIONS.interactive,
  },

  active: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: MOTION_TRANSITIONS.scene,
  },

  past: {
    opacity: 0.58,
    y: -MOTION_LIMITS.itemOffsetPx,
    scale: 0.992,
    transition: MOTION_TRANSITIONS.interactive,
  },
} satisfies MotionVariantMap;

export const MOCKUP_SCENE_VARIANTS = {
  enter: {
    opacity: 0,
    y: MOTION_LIMITS.itemOffsetPx,
    scale: MOTION_LIMITS.minimumScale,
  },

  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: MOTION_TRANSITIONS.scene,
  },

  exit: {
    opacity: 0,
    y: -MOTION_LIMITS.itemOffsetPx,
    scale: 0.992,
    transition: MOTION_TRANSITIONS.exit,
  },
} satisfies MotionVariantMap;

export const STRATEGIC_LINE_VARIANTS = {
  hidden: {
    pathLength: 0,
    opacity: 0,
  },

  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      type: "tween",
      duration: MOTION_DURATIONS.scene,
      ease: MOTION_EASINGS.interface,
    },
  },
} satisfies MotionVariantMap;

/* -------------------------------------------------------------------------- */
/* 8. Componentes Interativos: Dropdown, Menu Mobile, FAQ e Modal             */
/* -------------------------------------------------------------------------- */

export const DROPDOWN_MOTION = {
  panel: {
    closed: {
      opacity: 0,
      y: -MOTION_LIMITS.dropdownOffsetPx,
      scale: MOTION_LIMITS.minimumScale,
      transition: MOTION_TRANSITIONS.exit,
    },

    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.interactive,
    },
  },

  item: {
    closed: {
      opacity: 0,
      y: -4,
    },

    open: {
      opacity: 1,
      y: 0,
      transition: MOTION_TRANSITIONS.functional,
    },
  },
} satisfies MotionPresetGroup;

export const MOBILE_MENU_MOTION = {
  overlay: {
    closed: {
      opacity: 0,
      transition: MOTION_TRANSITIONS.exit,
    },

    open: {
      opacity: 1,
      transition: MOTION_TRANSITIONS.functional,
    },
  },

  panel: {
    closed: {
      opacity: 0,
      x: `${MOTION_LIMITS.mobileMenuOffsetPercent}%`,
      transition: MOTION_TRANSITIONS.exit,
    },

    open: {
      opacity: 1,
      x: "0%",
      transition: MOTION_TRANSITIONS.interactive,
    },
  },

  list: {
    closed: {},

    open: {
      transition: {
        type: "tween",
        delayChildren: MOTION_DELAYS.short,
        staggerChildren: MOTION_DELAYS.short,
        when: "beforeChildren",
      },
    },
  },

  item: {
    closed: {
      opacity: 0,
      x: 12,
    },

    open: {
      opacity: 1,
      x: 0,
      transition: MOTION_TRANSITIONS.functional,
    },
  },
} satisfies MotionPresetGroup;

export const FAQ_MOTION = {
  content: {
    collapsed: {
      opacity: 0,
      height: 0,
      transition: MOTION_TRANSITIONS.exit,
    },

    expanded: {
      opacity: 1,
      height: "auto",
      transition: MOTION_TRANSITIONS.interactive,
    },
  },

  icon: {
    collapsed: {
      rotate: 0,
      transition: MOTION_TRANSITIONS.functional,
    },

    expanded: {
      rotate: 180,
      transition: MOTION_TRANSITIONS.functional,
    },
  },
} satisfies MotionPresetGroup;

export const DEMO_DIALOG_MOTION = {
  overlay: {
    closed: {
      opacity: 0,
      transition: MOTION_TRANSITIONS.exit,
    },

    open: {
      opacity: 1,
      transition: MOTION_TRANSITIONS.functional,
    },
  },

  dialog: {
    closed: {
      opacity: 0,
      y: MOTION_LIMITS.revealOffsetPx,
      scale: MOTION_LIMITS.minimumScale,
      transition: MOTION_TRANSITIONS.exit,
    },

    open: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.interactive,
    },
  },
} satisfies MotionPresetGroup;

/* -------------------------------------------------------------------------- */
/* 9. Presets Obrigatórios para `prefers-reduced-motion` (ACCEPTANCE §33)     */
/* -------------------------------------------------------------------------- */

export const REDUCED_MOTION_VARIANTS = {
  reveal: {
    hidden: {
      opacity: 1,
      y: 0,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: MOTION_TRANSITIONS.none,
    },
  },

  disclosure: {
    collapsed: {
      opacity: 0,
      height: 0,
      transition: MOTION_TRANSITIONS.none,
    },

    expanded: {
      opacity: 1,
      height: "auto",
      transition: MOTION_TRANSITIONS.none,
    },
  },

  overlay: {
    closed: {
      opacity: 0,
      transition: MOTION_TRANSITIONS.none,
    },

    open: {
      opacity: 1,
      transition: MOTION_TRANSITIONS.none,
    },
  },

  panel: {
    closed: {
      opacity: 0,
      x: 0,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },

    open: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },
  },

  stickyStory: {
    inactive: {
      opacity: 0.72,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },

    active: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },

    past: {
      opacity: 0.82,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },
  },

  mockupScene: {
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    center: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },
    exit: {
      opacity: 0,
      y: 0,
      scale: 1,
      transition: MOTION_TRANSITIONS.none,
    },
  },

  strategicLine: {
    hidden: {
      pathLength: 1,
      opacity: 1,
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: MOTION_TRANSITIONS.none,
    },
  },
} satisfies MotionPresetGroup;

/* -------------------------------------------------------------------------- */
/* 10. Orçamento de Intensidade, Movimento e Profundidade (Etapa 2D §3, §8, §9)*/
/* -------------------------------------------------------------------------- */

export type SectionIntensityScore = 1 | 2 | 3 | 4 | 5;
export type SectionDepthLevel = 0 | 1 | 2 | 3 | 4;

export type SectionMotionSpec = {
  readonly intensity: SectionIntensityScore;
  readonly depthLevel: SectionDepthLevel;
  readonly allowedMotion: string;
  readonly allowAtmosphericGlow: boolean;
  readonly allowStickyDesktop: boolean;
};

export const SECTION_MOTION_BUDGET: Record<LandingSectionId, SectionMotionSpec> = {
  topo: {
    intensity: 1,
    depthLevel: 1,
    allowedMotion: "funcional",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  inicio: {
    intensity: 5,
    depthLevel: 4,
    allowedMotion: "narrativo + atmosferico",
    allowAtmosphericGlow: true,
    allowStickyDesktop: false,
  },
  posicionamento: {
    intensity: 2,
    depthLevel: 0,
    allowedMotion: "reveal simples",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  problema: {
    intensity: 2,
    depthLevel: 0,
    allowedMotion: "reveal narrativo leve",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  "mudanca-de-paradigma": {
    intensity: 3,
    depthLevel: 1,
    allowedMotion: "narrativo (convergencia)",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  produto: {
    intensity: 5,
    depthLevel: 3,
    allowedMotion: "scrollytelling principal",
    allowAtmosphericGlow: true,
    allowStickyDesktop: true,
  },
  demonstracao: {
    intensity: 4,
    depthLevel: 3,
    allowedMotion: "funcional + reveal",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  funcoes: {
    intensity: 3,
    depthLevel: 2,
    allowedMotion: "narrativo moderado",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  "como-funciona": {
    intensity: 3,
    depthLevel: 2,
    allowedMotion: "progresso sequencial",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  beneficios: {
    intensity: 2,
    depthLevel: 0,
    allowedMotion: "reveal simples",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  diferenciais: {
    intensity: 3,
    depthLevel: 1,
    allowedMotion: "ativacao curta",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  provas: {
    intensity: 2,
    depthLevel: 1,
    allowedMotion: "reveal simples + progressao documental discreta",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  "perguntas-frequentes": {
    intensity: 1,
    depthLevel: 0,
    allowedMotion: "funcional",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
  comecar: {
    intensity: 4,
    depthLevel: 4,
    allowedMotion: "cinematografico controlado",
    allowAtmosphericGlow: true,
    allowStickyDesktop: false,
  },
  rodape: {
    intensity: 1,
    depthLevel: 0,
    allowedMotion: "funcional minimo",
    allowAtmosphericGlow: false,
    allowStickyDesktop: false,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 11. Política Central e Helpers de Seleção                                  */
/* -------------------------------------------------------------------------- */

export const MOTION_POLICY = {
  functionalFirst: true,
  contentMustWorkWithoutMotion: true,
  reducedMotionRequired: true,
  scrollHijackingAllowed: false,
  mandatoryAutoplayAllowed: false,
  heavyParallaxAllowed: false,
  decorativeParticlesAllowed: false,
  continuousNeonAllowed: false,
  fakeVideoInteractionAllowed: false,
  revealRunsOnce: true,
  singleStickySequenceInLanding: true,
} as const;

/**
 * Seleciona o preset adequado respeitando `prefers-reduced-motion` sem exigir
 * que o preset padrão e o preset reduzido animem exatamente as mesmas chaves CSS.
 */
export function selectMotionPreset<
  TStandard extends MotionVariantMap = MotionVariantMap,
  TReduced extends MotionVariantMap = MotionVariantMap,
>(
  shouldReduceMotion: boolean | null | undefined,
  standardPreset: TStandard,
  reducedPreset: TReduced
): MotionVariantMap {
  return shouldReduceMotion ? reducedPreset : standardPreset;
}

/**
 * Seleciona uma transição normal ou instantânea (`duration: 0`).
 */
export function selectMotionTransition(
  shouldReduceMotion: boolean | null | undefined,
  standardTransition: MotionTransition = MOTION_TRANSITIONS.interactive
): MotionTransition {
  return shouldReduceMotion ? MOTION_TRANSITIONS.none : standardTransition;
}

export const MOTION_PRESETS = {
  sectionReveal: SECTION_REVEAL_VARIANTS,
  sectionFade: SECTION_FADE_VARIANTS,
  sectionMaskReveal: SECTION_MASK_REVEAL_VARIANTS,
  staggerContainer: STAGGER_CONTAINER_VARIANTS,
  staggerItem: STAGGER_ITEM_VARIANTS,
  heroStage: HERO_STAGE_MOTION,
  stickyStory: STICKY_STORY_VARIANTS,
  mockupScene: MOCKUP_SCENE_VARIANTS,
  strategicLine: STRATEGIC_LINE_VARIANTS,
  dropdown: DROPDOWN_MOTION,
  mobileMenu: MOBILE_MENU_MOTION,
  faq: FAQ_MOTION,
  demoDialog: DEMO_DIALOG_MOTION,
  reduced: REDUCED_MOTION_VARIANTS,
} as const;