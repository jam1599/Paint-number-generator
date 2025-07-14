#!/bin/bash

# EC2 Deployment Script for Paint by Numbers Generator
# This script sets up the application on a fresh EC2 instance

set -e

echo "🚀 Setting up Paint by Numbers Generator on EC2..."

# Update system
sudo apt-get update -y
sudo apt-get upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Git if not present
if ! command -v git &> /dev/null; then
    echo "📦 Installing Git..."
    sudo apt-get install -y git
fi

# Clone or update repository
if [ -d "Paint_Number_Jam" ]; then
    echo "📂 Updating existing repository..."
    cd Paint_Number_Jam
    git pull origin main
else
    echo "📂 Cloning repository..."
    git clone https://github.com/your-username/Paint_Number_Jam.git
    cd Paint_Number_Jam
fi

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
# Production Environment Variables
FLASK_ENV=production
FLASK_APP=app.py
REACT_APP_API_URL=http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):5000/api
EOF

# Create uploads and outputs directories
mkdir -p backend/uploads backend/outputs
sudo chown -R $USER:$USER backend/uploads backend/outputs

# Build and start services
echo "🔨 Building and starting services..."
docker-compose down || true
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Your Paint by Numbers Generator is now available at:"
    echo "   http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
    echo ""
    echo "📊 To check service status: docker-compose ps"
    echo "📋 To view logs: docker-compose logs -f"
    echo "🔄 To restart: docker-compose restart"
    echo "🛑 To stop: docker-compose down"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi
