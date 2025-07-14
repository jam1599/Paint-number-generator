# Render Deployment Guide

## Prerequisites

- GitHub account
- Render account (free)
- Your repository pushed to GitHub

## Backend Deployment Steps

### 1. Connect Repository to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select your Paint Numbers Generator repository

### 2. Configure Service

- **Name**: `paint-numbers-backend`
- **Environment**: `Python 3`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`

### 3. Environment Variables

Add these environment variables in Render:

```
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
PYTHONUNBUFFERED=1
```

### 4. Deploy

1. Click "Create Web Service"
2. Wait for deployment (usually 2-5 minutes)
3. Note your backend URL (e.g., `https://paint-numbers-backend.onrender.com`)

## Important Notes

### File Storage Limitation

⚠️ **Important**: Render's free tier has ephemeral storage, meaning uploaded files and generated outputs will be lost when the service restarts. For production use, consider:

- Upgrading to a paid plan with persistent storage
- Using external storage services (AWS S3, Cloudinary, etc.)
- Implementing database storage for generated files

### Cold Starts

- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30+ seconds to respond
- Consider implementing a keep-alive mechanism for better UX

### Custom Domain (Optional)

1. Go to your service settings
2. Add custom domain under "Custom Domains"
3. Update DNS records as instructed

## Troubleshooting

### Common Issues

1. **Build fails**: Check requirements.txt has all dependencies
2. **CORS errors**: Verify CORS_ORIGINS environment variable
3. **File upload errors**: Check file permissions and temp directory setup

### Logs

- View real-time logs in Render dashboard
- Use `print()` statements for debugging (they appear in logs)

### Health Check

Your deployed backend should respond at:

```
GET https://your-backend-domain.onrender.com/
```

Expected response:

```json
{
  "message": "Paint by Numbers Generator API",
  "version": "1.0.0"
}
```
