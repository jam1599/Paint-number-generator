# Vercel Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free)
- Backend deployed on Render (see RENDER_DEPLOY.md)

## Frontend Deployment Steps

### 1. Prepare Frontend Configuration

1. Update the API URL in your React app to point to your Render backend
2. Ensure the `vercel.json` is properly configured (already done)

### 2. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select "Paint_Numbers_Generator"
5. Configure deployment:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: paint-numbers-frontend
# - Directory: ./
```

### 3. Environment Variables

In Vercel dashboard, add environment variable:

```
REACT_APP_API_URL=https://your-backend-domain.onrender.com
```

### 4. Update Backend CORS

Update your Render backend's CORS_ORIGINS environment variable:

```
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3000
```

## Configuration Files

### vercel.json (Frontend)

```json
{
  "version": 2,
  "name": "paint-numbers-frontend",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend-domain.onrender.com"
  }
}
```

### Root vercel.json (For API Proxy - Optional)

If you want to proxy API calls through Vercel:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-domain.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Custom Domain Setup (Optional)

### Free Custom Domain

1. Go to your project settings in Vercel
2. Add domain under "Domains"
3. Update DNS records as instructed

### Purchased Domain

1. Add domain in Vercel dashboard
2. Update nameservers or add CNAME record
3. SSL certificate is automatic

## Environment-Specific Configuration

### Development

```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

### Production

```javascript
const API_URL =
  process.env.REACT_APP_API_URL || "https://your-backend-domain.onrender.com";
```

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Check all dependencies in package.json
   - Ensure React scripts are up to date
   - Check for TypeScript errors

2. **API Calls Fail**

   - Verify REACT_APP_API_URL is set correctly
   - Check CORS configuration on backend
   - Ensure backend is running

3. **Routing Issues**

   - Verify vercel.json routes configuration
   - Check React Router setup

4. **Environment Variables Not Working**
   - Ensure variables start with REACT*APP*
   - Redeploy after adding variables
   - Check variables are set in Vercel dashboard

### Debugging

1. **Check Build Logs**

   - View in Vercel dashboard under deployments
   - Look for dependency or compilation errors

2. **Runtime Errors**

   - Open browser developer tools
   - Check console for errors
   - Verify network requests

3. **Performance**
   - Use Vercel Analytics
   - Check Core Web Vitals
   - Optimize images and assets

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Image upload works
- [ ] Image processing completes
- [ ] Generated files download properly
- [ ] All routes work correctly
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

## Maintenance

### Updates

- Push changes to GitHub
- Vercel automatically redeploys on push to main branch
- Check deployment status in dashboard

### Monitoring

- Use Vercel Analytics for usage metrics
- Monitor Core Web Vitals
- Set up error tracking (Sentry, LogRocket, etc.)
