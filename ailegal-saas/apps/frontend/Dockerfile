FROM node:24-alpine AS builder

WORKDIR /app

# Install the frontend workspace from the monorepo's authoritative lockfile.
# The old frontend-local lockfile does not describe the current dependencies.
COPY package.json package-lock.json ./
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/shared-types/package.json ./packages/shared-types/package.json
# Keep downloaded packages after failed builds and limit concurrent connections
# to the registry on smaller deployment hosts. HTTP logs identify stalled files.
RUN --mount=type=cache,id=pbmapp-frontend-npm,target=/root/.npm,sharing=locked \
    npm ci --workspace=apps/frontend --include-workspace-root=false \
      --no-audit --no-fund --prefer-offline \
      --maxsockets=3 --fetch-retries=4 --fetch-retry-factor=2 \
      --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000 \
      --fetch-timeout=300000 --loglevel=http

COPY apps/frontend/ ./apps/frontend/

ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build --workspace=apps/frontend

FROM nginx:alpine
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/frontend/docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
