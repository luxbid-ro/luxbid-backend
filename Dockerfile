# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Install TypeScript for build
RUN npm install -g typescript

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN tsc

# Expose port
EXPOSE 4000

# Start with compiled JavaScript
CMD ["node", "dist/main.js"]