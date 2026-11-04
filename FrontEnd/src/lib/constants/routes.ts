// FrontEnd/src/lib/constants/routes.ts
/**
 * Fonte canônica de verdade para URLs públicas, âncoras da landing page,
 * itens de navegação (Header, Dropdown Recursos, Mobile Nav, Footer),
 * rotas de ativação/checkout, aliases legados e guardas de redirecionamento.
 */

/* -------------------------------------------------------------------------- */
/* 1. Rotas Públicas e de Autenticação Canônicas                              */
/* -------------------------------------------------------------------------- */

export const PUBLIC_ROUTES = {
  home: "/",
  pricing: "/precos",
  about: "/sobre",
  contact: "/contato",
  login: "/login",
  signup: "/cadastro",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verificar-email",
  terms: "/termos-de-uso",
  privacy: "/politica-de-privacidade",
  cookies: "/politica-de-cookies",
} as const;

/**
 * Rotas internas reais sob (main)/dashboard sincronizadas com o App Router (Commit f5c95d1)
 */
export const WORKSPACE_ROUTES = {
  painelDoDia: "/dashboard",
  centralEstrategica: "/dashboard/editorial",
  onboardingEditorial: "/dashboard/editorial?onboarding=true",
  projectWorkspace: (projectId: string) => `/dashboard/editorial/${projectId}`,
  projectTab: (
    projectId: string,
    tab: "dashboard" | "linha-editorial" | "calendario" | "temas" | "roteiros"
  ) => `/dashboard/editorial/${projectId}?aba=${tab}`,
} as const;

export const ACTIVATION_ROUTES = {
  plans: "/precos",
  checkoutProcessing: "/checkout/processando",
  checkoutCanceled: "/checkout/cancelado",
  checkoutExpired: "/checkout/expirado",
  checkoutError: "/checkout/erro",
  onboarding: WORKSPACE_ROUTES.onboardingEditorial,
  firstEditorialProject: WORKSPACE_ROUTES.onboardingEditorial,
  strategicCenter: WORKSPACE_ROUTES.centralEstrategica,
  dailyPanel: WORKSPACE_ROUTES.painelDoDia,
} as const;

/* -------------------------------------------------------------------------- */
/* 2. Âncoras e IDs Oficiais das 15 Seções da Landing                         */
/* -------------------------------------------------------------------------- */

export const LANDING_SECTION_IDS = {
  header: "topo",
  hero: "inicio",
  faixaPosicionamento: "posicionamento",
  problema: "problema",
  mudancaDeParadigma: "mudanca-de-paradigma",
  produto: "produto",
  demonstracao: "demonstracao",
  funcoes: "funcoes",
  comoFunciona: "como-funciona",
  beneficios: "beneficios",
  diferenciais: "diferenciais",
  provas: "provas",
  faq: "perguntas-frequentes",
  ctaFinal: "comecar",
  footer: "rodape",
} as const;

export const LANDING_DOM_IDS = {
  siteHeader: "site-header",
  siteFooter: "site-footer",
  resourcesPanel: "resources-panel",
  mobileNavDrawer: "mobile-navigation-drawer",
} as const;

export const LANDING_ANCHORS = {
  top: LANDING_SECTION_IDS.header,
  hero: LANDING_SECTION_IDS.hero,
  positioning: LANDING_SECTION_IDS.faixaPosicionamento,
  problem: LANDING_SECTION_IDS.problema,
  paradigmShift: LANDING_SECTION_IDS.mudancaDeParadigma,
  product: LANDING_SECTION_IDS.produto,
  demo: LANDING_SECTION_IDS.demonstracao,
  functions: LANDING_SECTION_IDS.funcoes,
  howItWorks: LANDING_SECTION_IDS.comoFunciona,
  benefits: LANDING_SECTION_IDS.beneficios,
  differentials: LANDING_SECTION_IDS.diferenciais,
  evidence: LANDING_SECTION_IDS.provas,
  faq: LANDING_SECTION_IDS.faq,
  finalCta: LANDING_SECTION_IDS.ctaFinal,
  footer: LANDING_SECTION_IDS.footer,
} as const;

export const LANDING_SECTION_ROUTES = {
  header: `/#${LANDING_SECTION_IDS.header}`,
  hero: `/#${LANDING_SECTION_IDS.hero}`,
  faixaPosicionamento: `/#${LANDING_SECTION_IDS.faixaPosicionamento}`,
  problema: `/#${LANDING_SECTION_IDS.problema}`,
  mudancaDeParadigma: `/#${LANDING_SECTION_IDS.mudancaDeParadigma}`,
  produto: `/#${LANDING_SECTION_IDS.produto}`,
  demonstracao: `/#${LANDING_SECTION_IDS.demonstracao}`,
  funcoes: `/#${LANDING_SECTION_IDS.funcoes}`,
  comoFunciona: `/#${LANDING_SECTION_IDS.comoFunciona}`,
  beneficios: `/#${LANDING_SECTION_IDS.beneficios}`,
  diferenciais: `/#${LANDING_SECTION_IDS.diferenciais}`,
  provas: `/#${LANDING_SECTION_IDS.provas}`,
  faq: `/#${LANDING_SECTION_IDS.faq}`,
  ctaFinal: `/#${LANDING_SECTION_IDS.ctaFinal}`,
  footer: `/#${LANDING_SECTION_IDS.footer}`,
} as const;

/* -------------------------------------------------------------------------- */
/* 3. Objeto Unificado ROUTES (Retrocompatível com todo o projeto)            */
/* -------------------------------------------------------------------------- */

export const ROUTES = {
  home: PUBLIC_ROUTES.home,

  sobre: PUBLIC_ROUTES.about,
  contato: PUBLIC_ROUTES.contact,
  precos: PUBLIC_ROUTES.pricing,
  demonstracao: LANDING_SECTION_ROUTES.demonstracao,

  termosDeUso: PUBLIC_ROUTES.terms,
  politicaDePrivacidade: PUBLIC_ROUTES.privacy,
  politicaDeCookies: PUBLIC_ROUTES.cookies,

  cadastro: PUBLIC_ROUTES.signup,
  login: PUBLIC_ROUTES.login,
  recuperarSenha: PUBLIC_ROUTES.forgotPassword,
  redefinirSenha: PUBLIC_ROUTES.resetPassword,
  verificarEmail: PUBLIC_ROUTES.verifyEmail,

  planos: ACTIVATION_ROUTES.plans,
  checkoutProcessando: ACTIVATION_ROUTES.checkoutProcessing,
  checkoutCancelado: ACTIVATION_ROUTES.checkoutCanceled,
  checkoutExpirado: ACTIVATION_ROUTES.checkoutExpired,
  checkoutErro: ACTIVATION_ROUTES.checkoutError,

  onboarding: WORKSPACE_ROUTES.onboardingEditorial,
  primeiroProjetoEditorial: WORKSPACE_ROUTES.onboardingEditorial,
  centralEstrategica: WORKSPACE_ROUTES.centralEstrategica,
  painelDoDia: WORKSPACE_ROUTES.painelDoDia,
} as const;

/* -------------------------------------------------------------------------- */
/* 4. Rotas Legadas e Aliases de Migração                                     */
/* -------------------------------------------------------------------------- */

export const LEGACY_ROUTES = {
  signup: "/signup",
  dashboard: "/dashboard",
  editorialBase: "/editorial/base",
  centralEstrategicaAlias: "/central-estrategica",
  onboardingAlias: "/onboarding",
} as const;

export const ROUTE_ALIASES = {
  [LEGACY_ROUTES.signup]: ROUTES.cadastro,
  [LEGACY_ROUTES.dashboard]: ROUTES.painelDoDia,
  [LEGACY_ROUTES.editorialBase]: ROUTES.centralEstrategica,
  [LEGACY_ROUTES.centralEstrategicaAlias]: ROUTES.centralEstrategica,
  [LEGACY_ROUTES.onboardingAlias]: ROUTES.onboarding,
} as const;

/* -------------------------------------------------------------------------- */
/* 5. Navegação Canônica: Header, Recursos e Footer                           */
/* -------------------------------------------------------------------------- */

export const HEADER_NAV_ROUTES = {
  produto: LANDING_SECTION_ROUTES.produto,
  comoFunciona: LANDING_SECTION_ROUTES.comoFunciona,
  beneficios: LANDING_SECTION_ROUTES.beneficios,
  demonstracao: LANDING_SECTION_ROUTES.demonstracao,
  precos: ROUTES.precos,
} as const;

export const HEADER_RESOURCE_ROUTES = {
  perguntasFrequentes: LANDING_SECTION_ROUTES.faq,
  sobre: ROUTES.sobre,
} as const;

export const FOOTER_NAV_ROUTES = {
  produto: LANDING_SECTION_ROUTES.produto,
  comoFunciona: LANDING_SECTION_ROUTES.comoFunciona,
  beneficios: LANDING_SECTION_ROUTES.beneficios,
  precos: ROUTES.precos,
  demonstracao: LANDING_SECTION_ROUTES.demonstracao,
  perguntasFrequentes: LANDING_SECTION_ROUTES.faq,
  sobre: ROUTES.sobre,
  contato: ROUTES.contato,
  termosDeUso: ROUTES.termosDeUso,
  politicaDePrivacidade: ROUTES.politicaDePrivacidade,
  politicaDeCookies: ROUTES.politicaDeCookies,
  entrar: ROUTES.login,
  criarConta: ROUTES.cadastro,
} as const;

export const HEADER_NAV_ITEMS = [
  {
    key: "produto",
    label: "Produto",
    href: HEADER_NAV_ROUTES.produto,
    type: "anchor",
  },
  {
    key: "como-funciona",
    label: "Como funciona",
    href: HEADER_NAV_ROUTES.comoFunciona,
    type: "anchor",
  },
  {
    key: "beneficios",
    label: "Benefícios",
    href: HEADER_NAV_ROUTES.beneficios,
    type: "anchor",
  },
  {
    key: "demonstracao",
    label: "Demonstração",
    href: HEADER_NAV_ROUTES.demonstracao,
    type: "anchor",
  },
  {
    key: "precos",
    label: "Preços",
    href: HEADER_NAV_ROUTES.precos,
    type: "route",
  },
] as const;

export const RESOURCE_MENU_ITEMS = [
  {
    key: "perguntas-frequentes",
    label: "Perguntas frequentes",
    description: "Encontre respostas sobre funcionamento, aplicação e acesso.",
    href: HEADER_RESOURCE_ROUTES.perguntasFrequentes,
    type: "anchor",
  },
  {
    key: "sobre",
    label: "Sobre o Legion Altaire",
    description: "Conheça a visão, o método e os princípios da plataforma.",
    href: HEADER_RESOURCE_ROUTES.sobre,
    type: "route",
  },
] as const;

export const HEADER_ACTION_ITEMS = {
  secondary: {
    label: "Entrar",
    href: ROUTES.login,
    variant: "ghost",
  },
  primary: {
    label: "Começar agora",
    href: ROUTES.cadastro,
    variant: "primary",
  },
} as const;

export const COOKIE_PREFERENCES_ACTION = {
  key: "preferencias-de-cookies",
  label: "Preferências de Cookies",
  actionId: "open-cookie-preferences",
  type: "action",
} as const;

export const FOOTER_LINK_GROUPS = {
  produto: {
    title: "Produto",
    items: [
      { label: "Produto", href: FOOTER_NAV_ROUTES.produto, status: "aprovado" },
      { label: "Como funciona", href: FOOTER_NAV_ROUTES.comoFunciona, status: "aprovado" },
      { label: "Benefícios", href: FOOTER_NAV_ROUTES.beneficios, status: "aprovado" },
      { label: "Preços", href: FOOTER_NAV_ROUTES.precos, status: "aprovado-dependente" },
      { label: "Demonstração", href: FOOTER_NAV_ROUTES.demonstracao, status: "aprovado" },
      {
        label: "Perguntas frequentes",
        href: FOOTER_NAV_ROUTES.perguntasFrequentes,
        status: "aprovado",
      },
    ],
  },
  empresa: {
    title: "Empresa",
    items: [
      { label: "Sobre o Legion Altaire", href: FOOTER_NAV_ROUTES.sobre, status: "aprovado" },
      { label: "Contato", href: FOOTER_NAV_ROUTES.contato, status: "provisorio" },
    ],
  },
  legal: {
    title: "Legal",
    items: [
      { label: "Termos de Uso", href: FOOTER_NAV_ROUTES.termosDeUso, status: "aprovado-dependente" },
      {
        label: "Política de Privacidade",
        href: FOOTER_NAV_ROUTES.politicaDePrivacidade,
        status: "aprovado-dependente",
      },
      {
        label: "Política de Cookies",
        href: FOOTER_NAV_ROUTES.politicaDeCookies,
        status: "aprovado-dependente",
      },
    ],
    actions: [COOKIE_PREFERENCES_ACTION],
  },
  acesso: {
    title: "Acesso",
    items: [
      { label: "Entrar", href: FOOTER_NAV_ROUTES.entrar, variant: "secondary" },
      { label: "Começar agora", href: FOOTER_NAV_ROUTES.criarConta, variant: "primary-subtle" },
    ],
  },
} as const;

/* -------------------------------------------------------------------------- */
/* 6. Parâmetros de Query, Indexação SEO e Eventos de Analytics               */
/* -------------------------------------------------------------------------- */

export const CHECKOUT_QUERY_KEYS = {
  utmSource: "utm_source",
  utmMedium: "utm_medium",
  utmCampaign: "utm_campaign",
  utmContent: "utm_content",
  utmTerm: "utm_term",
  ref: "ref",
  returnTo: "returnTo",
  plano: "plano",
  token: "token",
} as const;

export const ALLOWED_PUBLIC_QUERY_KEYS = [
  CHECKOUT_QUERY_KEYS.utmSource,
  CHECKOUT_QUERY_KEYS.utmMedium,
  CHECKOUT_QUERY_KEYS.utmCampaign,
  CHECKOUT_QUERY_KEYS.utmContent,
  CHECKOUT_QUERY_KEYS.utmTerm,
  CHECKOUT_QUERY_KEYS.ref,
  CHECKOUT_QUERY_KEYS.plano,
  CHECKOUT_QUERY_KEYS.returnTo,
] as const;

export const INDEXABLE_PUBLIC_ROUTES = [
  PUBLIC_ROUTES.home,
  PUBLIC_ROUTES.pricing,
  PUBLIC_ROUTES.about,
  PUBLIC_ROUTES.contact,
  PUBLIC_ROUTES.terms,
  PUBLIC_ROUTES.privacy,
  PUBLIC_ROUTES.cookies,
] as const;

export const NOINDEX_ROUTES = [
  PUBLIC_ROUTES.signup,
  PUBLIC_ROUTES.login,
  PUBLIC_ROUTES.forgotPassword,
  PUBLIC_ROUTES.resetPassword,
  PUBLIC_ROUTES.verifyEmail,
  ACTIVATION_ROUTES.plans,
  ACTIVATION_ROUTES.checkoutProcessing,
  ACTIVATION_ROUTES.checkoutCanceled,
  ACTIVATION_ROUTES.checkoutExpired,
  ACTIVATION_ROUTES.checkoutError,
  ACTIVATION_ROUTES.onboarding,
  ACTIVATION_ROUTES.firstEditorialProject,
  ACTIVATION_ROUTES.strategicCenter,
  LEGACY_ROUTES.signup,
  LEGACY_ROUTES.dashboard,
] as const;

export const NAVIGATION_ANALYTICS_EVENTS = {
  landingCtaClicked: "landing_cta_clicked",
  landingAnchorClicked: "landing_anchor_clicked",
  demoRequested: "demo_requested",
  signupStarted: "signup_started",
  signupCompleted: "signup_completed",
  planSelectionViewed: "plan_selection_viewed",
  planSelected: "plan_selected",
  checkoutCreated: "checkout_created",
  checkoutReturned: "checkout_returned",
  trialConfirmed: "trial_confirmed",
  onboardingStarted: "onboarding_started",
  onboardingCompleted: "onboarding_completed",
  firstEditorialProjectCreated: "first_editorial_project_created",
} as const;

/* -------------------------------------------------------------------------- */
/* 7. Helpers Tipados de Navegação e Segurança                                */
/* -------------------------------------------------------------------------- */

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
export type PublicRoute = (typeof PUBLIC_ROUTES)[keyof typeof PUBLIC_ROUTES];
export type ActivationRoute = (typeof ACTIVATION_ROUTES)[keyof typeof ACTIVATION_ROUTES];
export type LegacyRoute = (typeof LEGACY_ROUTES)[keyof typeof LEGACY_ROUTES];
export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];
export type LandingAnchorKey = keyof typeof LANDING_ANCHORS;
export type LandingSectionRoute =
  (typeof LANDING_SECTION_ROUTES)[keyof typeof LANDING_SECTION_ROUTES];

export type CTAConfig = {
  readonly label: string;
  readonly href: string;
  readonly variant?: "primary" | "secondary" | "ghost";
};

export type FooterLinkItem = {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
};

export type FooterActionItem = {
  readonly label: string;
  readonly actionId: string;
  readonly type: "action";
};

export function landingHref<K extends LandingAnchorKey>(
  anchor: K
): `/#${(typeof LANDING_ANCHORS)[K]}` {
  return `/#${LANDING_ANCHORS[anchor]}`;
}

export function toLandingSection<ID extends LandingSectionId>(
  sectionId: ID
): `/#${ID}` {
  return `/#${sectionId}`;
}

export function isLegacyPublicAlias(pathname: string): pathname is LegacyRoute {
  return (
    pathname === LEGACY_ROUTES.signup ||
    pathname === LEGACY_ROUTES.dashboard ||
    pathname === LEGACY_ROUTES.editorialBase ||
    pathname === LEGACY_ROUTES.centralEstrategicaAlias ||
    pathname === LEGACY_ROUTES.onboardingAlias
  );
}

export function resolveLegacyAlias(pathname: LegacyRoute): string {
  return ROUTE_ALIASES[pathname];
}

const INTERNAL_RETURN_TO_ALLOWLIST: ReadonlySet<string> = new Set([
  WORKSPACE_ROUTES.centralEstrategica,
  WORKSPACE_ROUTES.painelDoDia,
  WORKSPACE_ROUTES.onboardingEditorial,
  ACTIVATION_ROUTES.plans,
  ACTIVATION_ROUTES.checkoutProcessing,
  PUBLIC_ROUTES.pricing,
  PUBLIC_ROUTES.about,
  PUBLIC_ROUTES.contact,
  PUBLIC_ROUTES.home,
]);

export function sanitizeReturnTo(
  rawReturnTo: string | null | undefined,
  fallback: string = WORKSPACE_ROUTES.centralEstrategica
): string {
  if (!rawReturnTo || typeof rawReturnTo !== "string") {
    return fallback;
  }

  const trimmed = rawReturnTo.trim();

  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.toLowerCase().startsWith("javascript:")
  ) {
    return fallback;
  }

  const [pathname, query] = trimmed.split("?");

  if (
    pathname === "/editorial/base" ||
    pathname === "/central-estrategica" ||
    pathname === "/onboarding"
  ) {
    return query?.includes("onboarding=true") || pathname === "/onboarding"
      ? WORKSPACE_ROUTES.onboardingEditorial
      : WORKSPACE_ROUTES.centralEstrategica;
  }

  if (pathname === LEGACY_ROUTES.signup) {
    return PUBLIC_ROUTES.signup;
  }

  if (
    pathname.startsWith("/dashboard/editorial") ||
    pathname === "/dashboard" ||
    INTERNAL_RETURN_TO_ALLOWLIST.has(pathname)
  ) {
    return trimmed;
  }

  return fallback;
}

export function filterAllowedQueryParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): URLSearchParams {
  const clean = new URLSearchParams();
  const allowedSet = new Set<string>(ALLOWED_PUBLIC_QUERY_KEYS);

  if (params instanceof URLSearchParams) {
    params.forEach((value, key) => {
      if (allowedSet.has(key) && value.trim() !== "") {
        if (key === CHECKOUT_QUERY_KEYS.returnTo) {
          clean.set(key, sanitizeReturnTo(value));
        } else {
          clean.set(key, value.trim());
        }
      }
    });
    return clean;
  }

  for (const [key, rawValue] of Object.entries(params)) {
    if (!allowedSet.has(key) || rawValue === undefined) continue;
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof value === "string" && value.trim() !== "") {
      if (key === CHECKOUT_QUERY_KEYS.returnTo) {
        clean.set(key, sanitizeReturnTo(value));
      } else {
        clean.set(key, value.trim());
      }
    }
  }

  return clean;
}

export type AccountAccessState = {
  readonly isAuthenticated: boolean;
  readonly hasActiveOrTrialingPlan: boolean;
  readonly isCheckoutProcessing?: boolean;
  readonly isOnboardingCompleted: boolean;
  readonly preferredStartRoute?: string | null;
};

/**
 * Resolve o destino canônico pós-autenticação com base no estado real da conta:
 * - Sem projetos (isOnboardingCompleted = false) -> /dashboard/editorial?onboarding=true (Onboarding Editorial Inicial)
 * - Com projetos (isOnboardingCompleted = true) -> /dashboard/editorial (Central Estratégica — Projetos Editoriais)
 * - Com preferência salva -> Rota preferida (/dashboard ou /dashboard/editorial/[projectId])
 */
export function resolvePostAuthDestination(
  state: AccountAccessState,
  requestedReturnTo?: string | null
): string {
  if (!state.isAuthenticated) {
    return PUBLIC_ROUTES.login;
  }

  if (state.isCheckoutProcessing) {
    return ACTIVATION_ROUTES.checkoutProcessing;
  }

  if (!state.hasActiveOrTrialingPlan) {
    return ACTIVATION_ROUTES.plans;
  }

  if (!state.isOnboardingCompleted) {
    return WORKSPACE_ROUTES.onboardingEditorial;
  }

  if (requestedReturnTo) {
    const safeTarget = sanitizeReturnTo(
      requestedReturnTo,
      WORKSPACE_ROUTES.centralEstrategica
    );
    if (
      safeTarget !== PUBLIC_ROUTES.login &&
      safeTarget !== PUBLIC_ROUTES.signup
    ) {
      return safeTarget;
    }
  }

  if (state.preferredStartRoute) {
    return sanitizeReturnTo(
      state.preferredStartRoute,
      WORKSPACE_ROUTES.centralEstrategica
    );
  }

  return WORKSPACE_ROUTES.centralEstrategica;
}