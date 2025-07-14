#!/bin/bash

# Vercel build script for Paint-by-Numbers Generator
echo "Starting Vercel build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the React application
echo "Building React application..."
npm run build

echo "Build completed successfully!"
