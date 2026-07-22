# Multi-stage Dockerfile for Single-Container Deployment
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.33.2

# Copy package manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source files
COPY . .

# Download data and build projects
RUN pnpm run update-data
RUN pnpm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g pnpm@10.33.2

COPY package.json pnpm-workspace.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Copy built backend & frontend static dist
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=builder /app/packages/backend/src/data ./packages/backend/dist/data
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "packages/backend/dist/main.js"]
