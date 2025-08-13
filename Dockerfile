# Use Node.js 20 Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies first
RUN npm install

# Copy Prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy all source code
COPY . .

# Build the application to dist/
RUN npm run build

# Expose port
EXPOSE 4000

# Start with database setup and compiled JS (NO ts-node)
CMD ["sh", "-c", "npx prisma db push || echo 'DB push failed, continuing...' && node dist/main.js"]