# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev for ts-node)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 4000

# Start with database setup and ts-node
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --force-reset || echo 'DB push failed, continuing...' && npx ts-node src/main.ts"]