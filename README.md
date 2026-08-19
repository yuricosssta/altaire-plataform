# Plataforma Altaire

A plataforma é um SaaS educacional em que auxiliará o usuário na criação de sua identidade visual em ambientes virtuais com a criação de conteúdos publicitários assistidos por IA. O resultado pode ser conferido e testado pelo link a seguir: 
[Plataforma Altaire](https://altaire-plataform.vercel.app/)


 Dois apps independentes (sem package.json raiz):

- `BackEnd/` — API NestJS 10 (TypeScript, MongoDB/Mongoose, Zod, EventEmitter2)
- `FrontEnd/` — Next.js 15 App Router (Redux Toolkit, Tailwind v4, Shadcn/Radix)

## Requisitos

- Node 22+ (com corepack) ou Docker + Docker Compose
- [pnpm](https://pnpm.io/) como gerenciador de pacotes (lockfiles + Dockerfiles usam corepack/pnpm@9)

## Rodando com Docker (dev completo)

```bash
cp .env.example .env   # define COMPOSE_FILE=docker-compose.dev.yml
docker compose up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001 (Swagger em `/api`)

## Rodando localmente

```bash
# Backend (exige MONGO_URI definida em BackEnd/.env)
cd BackEnd && pnpm install && pnpm start:dev

# Frontend (NEXT_PUBLIC_API_BASE_URL, default http://localhost:3001)
cd FrontEnd && pnpm install && pnpm dev
```

## Documentação

- `documento-arquitetura-vivo.txt` — changelog vivo de decisões de arquitetura (PT-BR)
- `AGENTS.md` — convenções e regras arquiteturais do repo