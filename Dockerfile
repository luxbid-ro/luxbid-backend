# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy pre-built JavaScript files (no need to build in Docker)
COPY dist ./dist/

# Expose port
EXPOSE 4000

# Start with database setup and pre-built JS
CMD ["sh", "-c", "npx prisma db push || echo 'DB push failed, continuing...' && node dist/main.js"]