# ---- Etapa 1: dependencias ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma7.config.ts ./

RUN npm ci

# ---- Etapa 2: builder ----
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Variables dummy SOLO para build time.
# En runtime se inyectan con --env-file .env (reemplazan a estas).
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXT_PUBLIC_SUPABASE_URL="https://dummy.supabase.co"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="dummy-anon-key"
ENV SUPABASE_SERVICE_ROLE_KEY="dummy-service-role-key"
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_dummy"
ENV STRIPE_SECRET_KEY="sk_dummy"
ENV STRIPE_WEBHOOK_SECRET="whsec_dummy"
ENV RESEND_API_KEY="re_dummy"
ENV RESEND_FROM_EMAIL="dummy@resend.dev"
ENV NEXT_PUBLIC_SITE_URL="https://dummy.local"
ENV NEXT_PUBLIC_APP_URL="https://dummy.local"

RUN npx prisma generate --config=prisma7.config.ts
RUN npm run build

# ---- Etapa 3: runner ----
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma7.config.ts ./prisma7.config.ts
COPY --from=builder /app/src/generated ./src/generated

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]