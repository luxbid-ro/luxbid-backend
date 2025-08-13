# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Clean install with all dependencies
RUN npm ci && npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy all source code
COPY . .

# Expose port
EXPOSE 4000

# Start with database setup and ts-node (simpler approach)
CMD ["sh", "-c", "npx prisma db push || echo 'DB push failed, continuing...' && npx ts-node src/main.ts"]