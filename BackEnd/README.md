# Altaire BackEnd

API RESTful do ecossistema **Altaire** — SaaS educacional que atua como assistente de criação de conteúdo. Construída com [NestJS](https://nestjs.com/), MongoDB (Mongoose), JWT e arquitetura orientada a eventos (EventEmitter2).

Integrações: OpenAI, Cloudflare R2 (SDK AWS S3), SMTP (reset de senha), transcrição de vídeo/áudio (yt-dlp) e WebSockets (Socket.io).

> Frontend Next.js fica em `FrontEnd/` (porta 3000).

## Como rodar

### 1. Configure o `.env`

Copie o exemplo e preencha com as variáveis reais:

```bash
cp BackEnd/.env.example BackEnd/.env
```

A variável `MONGO_URI` é obrigatória para iniciar.

### 2. Instale dependências

```bash
cd BackEnd
pnpm install
```

### 3. Execute localmente

```bash
pnpm start:dev
```

A API fica disponível em `http://localhost:3001` (Swagger em `http://localhost:3001/api`).

### 4. Execute com Docker

**Desenvolvimento** (a partir da raiz do repo, com frontend + backend):

```bash
docker compose up
```

O `.env` da raiz define `COMPOSE_FILE=docker-compose.dev.yml`. Backend em `http://localhost:3001`.

**Produção (serviço isolado)**:

```bash
cd BackEnd
docker compose up --build
```

Usa o `Dockerfile` multi-stage (build + `pnpm prune --prod`); entrypoint `node dist/src/main.js`, expõe a porta `3001`.

## Variáveis de ambiente principais

- `PORT` – porta onde o serviço escuta (`3001`).
- `MONGO_URI` – string de conexão MongoDB.
- `JWT_SECRET`, `JWT_EXPIRES_IN` – segredo e expiração do JWT.
- `OPENAI_API_KEY` – chave da OpenAI.
- `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_DOMAIN` – configurações do Cloudflare R2 (SDK AWS S3).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` – envio de e-mails (reset de senha).
- `FRONTEND_URL` – URL do frontend para redirecionamentos e links em e-mails.

## Estrutura de módulos

```
src/
  auth/           # Autenticação (JWT, Passport)
  users/          # Usuários
  organization/   # Multi-tenancy (organizações, membros, papéis)
  posts/          # Posts
  projects/       # Projetos
  planning/       # Planejamento
  resources/      # Recursos (padrão Service/Repository)
  storage/        # Upload de arquivos (Cloudflare R2)
  summary/        # Resumos (IA)
  transcription/  # Transcrição de vídeo/áudio (yt-dlp)
  shared/         # Utilitários, pipes (Zod), filtros e guards
```

Convenções da arquitetura:

- **Service/Repository**: services orquestram negócio; repositories acessam Mongoose (padrão consolidado em `resources/repositories/*`).
- **Validação**: DTOs com **Zod** + `ZodValidationPipe` no controller (`shared/pipe/zod-validation.pipe.ts`).
- **Soft delete**: registros são desativados com `isActive: false` (consultas filtram `isActive: { $ne: false }`).
- **Eventos**: `EventEmitter2` para fluxos transversais (timeline, recursos).
- **IDs MongoDB**: sempre `new (Types.ObjectId as any)(String(id))`.

## Autenticação

- `POST /auth/login` — autentica e retorna um JWT:

```json
{
  "email": "admin@admin.com",
  "password": "12345678"
}
```

- Envie o token no header `Authorization: Bearer <token>`.
- `GET /auth/profile` — perfil do usuário autenticado.

## Multi-tenancy

Endpoints dos módulos de organização (`organization`, `posts`, `projects`, `planning`, `resources`, `summary`, `transcription`, `storage`) exigem os headers:

- `x-org-id` — ID da organização.
- `x-org-role` — papel do usuário na organização (`OWNER`, `ADMIN`, etc.).

## Comandos úteis

```bash
pnpm start:dev    # Desenvolvimento com watch
pnpm build        # Compila para dist/ (entrypoint: dist/src/main.js)
pnpm lint         # ESLint
pnpm format       # Prettier
pnpm test         # Testes unitários (*.spec.ts)
pnpm test:e2e     # Testes end-to-end
```

## Documentação

- Swagger: `http://localhost:3001/api`
- Decisões de arquitetura: `../documento-arquitetura-vivo.txt`