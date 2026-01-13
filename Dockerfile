FROM node:20-alpine

WORKDIR /app

# 1. Setup Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# 2. Copy Backend Code
COPY backend/ .

# 3. Setup Public (Frontend) at /app/public (sibling to backend)
WORKDIR /app
COPY public/ ./public/
COPY index.html ./public/
COPY assets/ ./public/assets/

# 4. Run from Backend dir
WORKDIR /app/backend
EXPOSE 3003

# Health check (url is localhost:3003)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3003/api/health || exit 1

CMD ["node", "index.js"]
