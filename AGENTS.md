# AGENTS.md

## Visão geral
SaaS educacional (Altaire) — assistente de criação de conteúdo. Dois apps independentes, sem package.json raiz:
- `BackEnd/` — NestJS 10, MongoDB (Mongoose), arquitetura orientada a eventos (EventEmitter2)
- `FrontEnd/` — Next.js 15 (App Router), Redux Toolkit, Tailwind v4, Shadcn/Radix
- `documento-arquitetura-vivo.txt` — changelog vivo de decisões (PT-BR). Ler antes de mexer em editorial/landing/auth.

## Package manager
Use **pnpm** (lockfiles + Dockerfiles usam corepack/pnpm@9). READMEs estão desatualizados (citam npm, "Grupo Cazua"/"Escola Desafio"). Fontes de verdade: package.json/Dockerfiles + arquitetura-vivo.

## Comandos
- Dev completo: `docker compose up` na raiz (`.env` define `COMPOSE_FILE=docker-compose.dev.yml`; frontend :3000, backend :3001)
- Backend: `pnpm start:dev` em `BackEnd/` (exige `MONGO_URI`; Swagger em `/api`); testes `pnpm test` (`*.spec.ts`) e `pnpm test:e2e`
- Frontend: `pnpm dev` em `FrontEnd/` (usa `NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:3001`); sem framework de testes; `pnpm lint`

## Backend — regras arquiteturais
- **Service/Repository**: services orquestram negócio; repositories acessam Mongoose. Padrão já implantado em `resources/repositories/*` — estender a módulos novos. Módulos antigos (`projects`, `planning`) ainda injetam `@InjectModel` no service — não replicar.
- **IDs MongoDB**: sempre `new (Types.ObjectId as any)(String(id))` (o cast `as any` é idiomático no repo; `Types.ObjectId.isValid()` para checar).
- **Dinheiro/saldo de tokens**: usar `Precision.round` de `shared/utils/precision.util.ts` (nunca floats crus).
- **Deleção**: Soft Delete `isActive: false` (`query.isActive = { $ne: false }`) com validações de dependência.
- **Eventos**: `EventEmitter2` via `@nestjs/event-emitter` (`EventEmitterModule.forRoot()` em `app.module.ts`) para fluxos transversais (timeline, recursos).
- **Validação**: DTOs Zod + `ZodValidationPipe` no controller (`shared/pipe/zod-validation.pipe.ts`), não class-validator.
- **Multi-tenancy**: headers `x-org-id` / `x-org-role` (`organization/guards/tenant.guard.ts`, `main.ts` CORS).
- **Storage**: Cloudflare R2 via SDK AWS S3 (`R2_*` envs) — streaming de vídeo e PDFs.
- Build prod: `node dist/src/main.js` (Dockerfile runner).

## Frontend — UI/UX (Regra 60-30-10)
- **Fundo dominante preto/cinza escuro (60%), branco (30%) para legibilidade, dourado (10%, ~#D4AF37) só para conversão** (CTAs, títulos, ícones).
- **Somente variáveis semânticas**: `bg-background`, `bg-card`, `text-foreground`, `border-border`, `primary`=dourado. Proibido zinc/slate/white soltos que quebrem o dark mode.
- **Tipografia** (definidas em `src/app/layout.tsx` via `next/font/google`): `--font-heading` (DM Serif Display) em H1/chamadas, Playfair Display em H2/citações, Inter em parágrafos.
- **Assets/LCP**: `next/image` (nunca `backgroundImage` inline), controle de `z-index`. Tema dark/light com `dark:block`/`dark:hidden` (não renderização condicional — evita hydration mismatch).
- **Geometria**: `rounded-md` (4px); ícones só via `lucide-react`, preferencialmente em dourado sobre fundo escuro.
- **Estado**: Redux Toolkit para estado global (`src/lib/redux/store.ts`); Web Storage para preferências locais; BFF via route handlers `src/app/api/*`.
- **axios central** em `src/app/api/axiosInstance.ts` injeta JWT + `x-org-id`/`x-org-role`; nunca chamar o backend direto do client quando houver handler BFF.
- **Nunca importar mongoose no frontend**: validar ObjectId com regex 24 hex (`src/lib/dto/editorial.schema.ts`).
- Formulários com Stepper: react-hook-form + zodResolver.

## Conventions
- Commits: Conventional Commits (`feat(editorial): ...`, `fix: ...`, `style: ...`).