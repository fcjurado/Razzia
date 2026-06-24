# ---- BASE ----
FROM node:25-alpine AS base
RUN npm install -g pnpm

# ---- BUILDER ----
FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/web/package.json ./packages/web/
COPY packages/socket/package.json ./packages/socket/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# ---- RUNNER ----
FROM alpine:3.23.4 AS runner

RUN apk add --no-cache nginx nodejs supervisor

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Config seed: copied to /app/config-seed in the image.
# At runtime the entrypoint copies it to the persistent disk (CONFIG_PATH)
# only if the disk is empty (first boot).
COPY config /app/config-seed

COPY --from=builder /app/packages/web/dist /app/web
COPY --from=builder /app/packages/socket/dist/index.cjs /app/socket/index.cjs

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
