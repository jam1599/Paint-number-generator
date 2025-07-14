# 🚀 Deploy Paint Numbers Generator to Vercel & Render (Free)

## Quick Deployment Steps

### 1. Deploy Backend to Render

1. **Push code to GitHub** (if not already done):

   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Go to Render**: https://dashboard.render.com/

3. **Create New Web Service**:

   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repo: `24dmg`

4. **Configure the service**:

   - **Name**: `paint-numbers-backend`
   - **Root Directory**: `Paint_Numbers_Generator/backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`

5. **Add Environment Variables**:

   - `FLASK_ENV` = `production`
   - `CORS_ORIGINS` = `https://paint-numbers-generator.vercel.app`

6. **Deploy** and copy your Render URL

### 2. Deploy Frontend to Vercel

1. **Update Backend URL**:

   - Edit `vercel.json` and replace `paint-numbers-backend.onrender.com` with your actual Render URL

2. **Go to Vercel**: https://vercel.com/dashboard

3. **Import Project**:

   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select repo: `24dmg`

4. **Configure Project**:

   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Add Environment Variable**:

   - `REACT_APP_API_URL` = `https://your-render-url.onrender.com/api`

6. **Deploy**!

### 3. Update CORS

- Go back to Render dashboard
- Update `CORS_ORIGINS` with your Vercel URL
- Service will auto-redeploy

## ✅ That's it!

Your app will be live at:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.onrender.com`

## 💡 Tips

- Render free tier sleeps after 15 min (first request takes ~30s to wake up)
- Both platforms have generous free tiers
- Check logs in dashboards if something goes wrong
