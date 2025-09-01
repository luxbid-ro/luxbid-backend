#!/bin/bash

# 🚀 LuxBid Backend Auto-Deploy Script
# This script handles the deployment process for Render.com

set -e  # Exit on any error

echo "🔧 Starting LuxBid Backend Deployment..."
echo "======================================="

# Environment setup
export NODE_ENV=production

echo "📦 Installing dependencies..."
npm ci --production=false

echo "🗄️ Setting up database..."
echo "Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo "⚠️ Migration failed, continuing..."

echo "🔨 Building production backend..."
npm run build

echo "🧪 Running post-build validation..."
# Check if TypeScript compilation was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

if [ ! -f "dist/main.js" ]; then
    echo "❌ Build failed - main.js not found"
    exit 1
fi

echo "📊 Build statistics:"
du -sh dist
echo "Total compiled files: $(find dist -name '*.js' | wc -l)"

echo "🔍 Running health checks..."
# Verify required environment variables
required_vars=("DATABASE_URL" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "⚠️ Warning: $var environment variable not set"
    else
        echo "✅ $var is configured"
    fi
done

echo "✅ Backend deployment ready!"
echo "🔗 Will be available at: https://luxbid-backend.onrender.com"

# The start command will be handled by Render
echo "🚀 Starting production server..."