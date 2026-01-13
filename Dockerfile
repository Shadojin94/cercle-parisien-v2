FROM node:20-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/api/health || exit 1

# Start
CMD ["node", "index.js"]
