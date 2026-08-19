# Altaire FrontEnd

Aplicação web do **Altaire** — SaaS educacional que atua como assistente de criação de conteúdo. Construída com [Next.js](https://nextjs.org) (App Router), [Redux Toolkit](https://redux-toolkit.js.org/), [TailwindCSS](https://tailwindcss.com/), Shadcn/Radix UI e [Axios](https://axios-http.com/).

> Frontend do ecossistema Altaire. O backend NestJS fica em `BackEnd/` (porta 3001).

---

## 🚀 Como começar

O projeto usa **pnpm** (via corepack/pnpm@9). Não use `npm`.

1. **Instale as dependências**
   ```bash
   pnpm install
   ```

2. **Configure as variáveis de ambiente**
   - Edite o arquivo `.env` (veja a [seção de variáveis](#-variáveis-de-ambiente)):
     ```
     NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
     ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   pnpm dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no navegador.

> Requer o backend em execução em `http://localhost:3001` (Swagger em `/api`).

---

## 🛠️ Tecnologias Utilizadas

- **Next.js 15** (App Router, `output: standalone`)
- **React 18** + TypeScript
- **Redux Toolkit** (`@reduxjs/toolkit`, `react-redux`) — estado global
- **TailwindCSS v4** + **Shadcn/Radix UI** + **lucide-react** — UI/UX
- **react-hook-form** + **zod** — formulários (Stepper)
- **Axios** — cliente HTTP centralizado (JWT + headers de tenant)
- **TanStack Query** — cache de dados do servidor
- **OpenLayers** (`ol`) — mapas
- **Recharts** — gráficos
- **markdown-it / react-markdown** — edição e renderização de Markdown

---

## 📁 Estrutura de Pastas

```
src/
  app/
    (auth)/          # login, signup, forgot-password, reset-password
    (main)/          # dashboard: editorial, planning, resources, marketing, people,
                     #   projects, storage, master-admin, settings, account
    api/             # BFF (route handlers) e axiosInstance.ts
    layout.tsx       # fonts e tema (--font-heading, Playfair, Inter)
  components/
    ui/              # componentes Shadcn/Radix
    landing/         # landing page
    editorial/       # editor de conteúdo (Markdown)
    planning/        # planejamento
    resources/       # recursos
    dashboard/       # layout e widgets do dashboard
    auth/            # formulários de autenticação
  lib/
    redux/           # store e slices (auth, organizations, ...)
    api/             # utilitários de API (BFF/server)
    dto/             # schemas Zod (ex: editorial.schema.ts)
  providers/         # providers (Redux, tema, React Query)
  types/             # tipos TypeScript
  validations/       # schemas de validação
```

---

## 🧩 Funcionalidades

- Autenticação com **JWT** (login, cadastro, recuperação de senha) via Redux
- **Multi-organização**: headers `x-org-id` / `x-org-role` injetados automaticamente pelo axios central
- Dashboard com módulos de **editorial**, **planning**, **resources**, **marketing**, **people**, **projects**, **storage** e **master-admin**
- **BFF** via route handlers em `src/app/api/*` — o frontend nunca chama o backend NestJS diretamente
- Edição de conteúdo em **Markdown** com pré-visualização
- Tema **dark/light** com variáveis semânticas (`bg-background`, `text-foreground`, `primary` = dourado)
- Navegação protegida para áreas autenticadas

---

## 📦 Variáveis de Ambiente

| Variável | Descrição | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | URL base do backend (pública/client) | `http://localhost:3001` |
| `INTERNAL_API_URL` | URL do backend usada pelo BFF na rede Docker | `http://backend:3001` |
| `NEXT_PUBLIC_INITIAL_MAP_CENTER` | Centro inicial do mapa (lat,long) | `-43.7,-21.2` |
| `NEXT_PUBLIC_SUMMARY_API_URL` | URL da API de resumo (opcional) | — |

---

## 🐳 Docker

**Desenvolvimento** (a partir da raiz do repositório):

```bash
docker compose up
```

O `.env` da raiz define `COMPOSE_FILE=docker-compose.dev.yml`. O frontend sobe em [http://localhost:3000](http://localhost:3000) e o backend em [http://localhost:3001](http://localhost:3001).

**Produção**: o `Dockerfile` gera a imagem standalone (`pnpm run build` com `output: 'standalone'`) e expõe a porta `3000`.

---

## 📄 Licença

MIT