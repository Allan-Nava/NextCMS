# Immagine dell'app cms/ (Next.js 12 + Prisma).
#
# Riscritta in v0.5.0 (NC-49). La versione precedente non poteva funzionare:
#   - `node:17.4-stretch` (tag inesistente, distro archiviata) e `apt -y install
#     curl` senza `apt-get update`;
#   - nessun `prisma generate`: il postinstall di @prisma/client girava prima
#     che lo schema venisse copiato nell'immagine, quindi il client non veniva
#     mai generato e `next build` falliva;
#   - lo stage di produzione copiava `prod_node_modules` senza il client Prisma
#     generato (`node_modules/.prisma`), quindi l'app andava in errore a runtime.
#
# bullseye e non alpine/bookworm: i query engine di Prisma 3 vogliono
# OpenSSL 1.1, presente in bullseye.

# Dipendenze complete (dev incluse): servono per il build.
FROM node:18-bullseye-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Sviluppo: sorgenti montati sopra le dipendenze complete.
FROM deps AS development
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

# Build: genera il client Prisma, poi builda Next.
FROM deps AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
# Placeholder: né `prisma generate` né `next build` aprono connessioni al DB,
# ma il datasource pretende una URL sintatticamente valida.
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/nextcms?schema=public"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate && npm run build

# Runtime: solo dipendenze di produzione + il client Prisma generato.
FROM node:18-bullseye-slim AS production
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD [ "npm", "start" ]
