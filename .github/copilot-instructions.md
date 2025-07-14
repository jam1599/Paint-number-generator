# Copilot Instructions for Paint-by-Numbers Generator

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Paint-by-Numbers generator web application with:
- Python Flask backend for image processing
- React.js frontend for user interface
- Docker configuration for AWS EC2 deployment

## Tech Stack
- **Backend**: Python Flask, OpenCV, NumPy, Pillow, scikit-learn
- **Frontend**: React.js, Axios, Material-UI
- **Deployment**: Docker, Docker Compose, AWS EC2

## Code Style Guidelines
- Use Python type hints for all function parameters and return values
- Follow PEP 8 style guidelines for Python code
- Use ES6+ features and functional components for React
- Implement proper error handling and logging
- Use environment variables for configuration

## Key Features
- Image upload and processing
- Color reduction using K-means clustering
- Region detection and facet generation
- SVG and PNG output generation
- Responsive web interface

## API Endpoints
- POST /api/upload - Upload image file
- POST /api/process - Process image to generate paint-by-numbers
- GET /api/download/:id - Download generated files
