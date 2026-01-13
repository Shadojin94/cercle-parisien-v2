FROM node:20-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy backend application code
COPY backend/ .

# Copy frontend files to public directory
COPY index.html ./public/
COPY assets/ ./public/assets/
COPY .htaccess ./public/ 2>/dev/null || true
COPY vite.svg ./public/ 2>/dev/null || true

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3003/api/health || exit 1

# Start
CMD ["node", "index.js"]
