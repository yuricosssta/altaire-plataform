# Dockerfile frontend para produção
# Estágio 1: Instalação e Build
FROM node:22-alpine AS builder
WORKDIR /app

# Instala o pnpm (se for o que você usa)
RUN corepack enable && corepack prepare pnpm@9 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_INITIAL_MAP_CENTER
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_INITIAL_MAP_CENTER=$NEXT_PUBLIC_INITIAL_MAP_CENTER
RUN pnpm run build

# Estágio 2: Runner (Imagem final bem leve)
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

ENV NODE_ENV=production

# Copia apenas o necessário do standalone (exige "output: 'standalone'" no next.config.js)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER appuser
EXPOSE 3001

EXPOSE 3000
CMD ["node", "server.js"]