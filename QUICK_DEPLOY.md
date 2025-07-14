# Quick Deployment Guide

## 🚀 One-Click Deployment

### Deploy Backend to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/select-repo?type=web)
3. Connect your repository
4. Use these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Python 3

### Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Import your GitHub repository
3. Use these settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

## 🔧 CLI Deployment

### Prerequisites

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Deploy Frontend

```bash
cd frontend
vercel --prod
```

## 🌐 Live URLs

After deployment, update these URLs:

### Backend URL (Render)

Replace `your-backend-domain` with your actual Render URL in:

- `frontend/.env.production`
- `vercel.json`
- Backend CORS settings

### Frontend URL (Vercel)

Replace `your-frontend-domain` with your actual Vercel URL in:

- Backend CORS settings in Render

## 🔄 Automatic Deployment

Both services auto-deploy when you push to your main branch!

## 📋 Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] URLs updated in configuration files
- [ ] Test file upload and processing
- [ ] Verify downloads work

## ⚡ Pro Tips

- Render free tier sleeps after 15 minutes of inactivity
- Keep your backend warm with a simple ping service
- Monitor deployments in both dashboards
- Check logs if something goes wrong

## 🆘 Need Help?

1. Check the detailed guides: `RENDER_DEPLOY.md` and `VERCEL_DEPLOY.md`
2. View deployment logs in respective dashboards
3. Test API endpoints manually
4. Verify environment variables are set correctly
