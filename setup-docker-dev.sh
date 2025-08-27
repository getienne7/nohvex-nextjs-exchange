#!/bin/bash

# NOHVEX Docker Development Environment Setup Script
# This script helps you get started with the Docker development environment

echo "🚀 NOHVEX Docker Development Environment Setup"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if .env.docker exists
if [ ! -f ".env.docker" ]; then
    echo "❌ .env.docker file not found"
    exit 1
fi

echo "✅ Environment file found"

# Check if user needs to configure API keys
if grep -q "your-nownodes-api-key-here" .env.docker; then
    echo ""
    echo "⚠️  IMPORTANT: You need to configure your API keys"
    echo "   Edit .env.docker and update:"
    echo "   - NOWNODES_API_KEY (required for crypto data)"
    echo "   - NEXTAUTH_SECRET (required for authentication)"
    echo ""
    read -p "Have you updated the API keys? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please update .env.docker first, then run this script again."
        exit 1
    fi
fi

echo ""
echo "🏗️  Building and starting Docker containers..."
echo "   This may take a few minutes on first run..."

# Build and start containers
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for containers to be ready
echo ""
echo "⏳ Waiting for containers to be ready..."
sleep 10

# Check if containers are running
if ! docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "❌ Containers failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

echo "✅ Containers are running"

# Initialize database
echo ""
echo "🗄️  Setting up database..."
docker-compose -f docker-compose.dev.yml exec -T web npm run db:push
docker-compose -f docker-compose.dev.yml exec -T web npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Your NOHVEX development environment is ready:"
echo "  📱 Application: http://localhost:3000"
echo "  🗄️  Database: localhost:5434"
echo ""
echo "Useful commands:"
echo "  npm run docker:logs    # View application logs"
echo "  npm run docker:down    # Stop containers"
echo "  docker-compose -f docker-compose.dev.yml exec web sh  # Shell into container"
echo ""
echo "📖 For more information, see DOCKER_DEVELOPMENT_GUIDE.md"