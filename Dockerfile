FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

FROM deps AS builder
COPY . .
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
RUN DATABASE_URL=file:/app/db/custom.db node node_modules/prisma/build/index.js generate
RUN npm run build
# Keep the complete, locked production dependency tree, including Prisma CLI.
RUN npm prune --omit=dev --legacy-peer-deps --ignore-scripts

FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat openssl dumb-init
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh && mkdir -p /app/db/backups /app/public/uploads && chown -R nextjs:nodejs /app/db /app/public/uploads
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 CMD wget -q --spider http://127.0.0.1:3000/api/public/site || exit 1
ENTRYPOINT ["dumb-init", "--", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
