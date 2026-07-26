# Image for the cms/ app (Next.js 12 + Prisma).
#
# Rewritten in v0.5.0 (NC-49). The previous version could not work:
#   - `node:17.4-stretch` (non-existent tag, archived distro) and `apt -y install
#     curl` without `apt-get update`;
#   - no `prisma generate`: the @prisma/client postinstall ran before the schema
#     was copied into the image, so the client was never generated and
#     `next build` failed;
#   - the production stage copied `prod_node_modules` without the generated
#     Prisma client (`node_modules/.prisma`), so the app crashed at runtime.
#
# bullseye rather than alpine/bookworm: the Prisma 3 query engines want
# OpenSSL 1.1, which bullseye ships.

# Full dependency set (dev included): needed to build.
FROM node:18-bullseye-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Development: sources on top of the full dependency set.
FROM deps AS development
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
EXPOSE 3000
CMD [ "npm", "run", "dev" ]

# Build: generate the Prisma client, then build Next.
FROM deps AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
# Placeholder: neither `prisma generate` nor `next build` opens a database
# connection, but the datasource requires a syntactically valid URL.
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/nextcms?schema=public"
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate && npm run build

# Runtime: production dependencies plus the generated Prisma client.
#
# JWT_SECRET is deliberately not baked in: the container must receive it at run
# time (NC-2), and the app fails fast without it.
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
