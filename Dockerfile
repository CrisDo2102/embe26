# syntax=docker/dockerfile:1
# Small production image using Next.js "standalone" output.
#   docker build -t embe .
#   docker run --rm -p 3000:3000 embe
# Build-time args become part of the client bundle (they are NEXT_PUBLIC_*):
#   docker build --build-arg NEXT_PUBLIC_RELATIONSHIP_START_DATE=2024-06-01 -t embe .

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_RELATIONSHIP_START_DATE=""
ARG NEXT_PUBLIC_ALLOW_INDEXING=""
ARG NEXT_PUBLIC_SITE_URL=""
ENV NEXT_TELEMETRY_DISABLED=1 BUILD_STANDALONE=true
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
