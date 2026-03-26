# Vercel Deployment Guide for ديوان الصوفية Frontend

## Prerequisites

- ✅ Vercel account (free tier is fine)
- ✅ GitHub repo connected (or Vercel Git integration)
- ✅ Backend running on Render: `https://diwan-sufi-api.onrender.com`

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Production ready for Vercel deployment"
git push origin main
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Select your GitHub repository
4. Configure:
   - **Root Directory**: `frontend/` (if this folder isn't the root)
   - Leave Build Command and Output Directory empty (static site)
5. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
npm i -g vercel
cd frontend
vercel
# Follow prompts
```

## Step 3: Add Environment Variables

In Vercel Dashboard:

1. Go to your Project → **Settings** → **Environment Variables**
2. Add these variables:

```
VITE_API_BASE = https://diwan-sufi-api.onrender.com
API_BASE = https://diwan-sufi-api.onrender.com
```

3. Click **"Save"** and trigger a redeploy

## Step 4: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration steps

## Step 5: Verify Deployment

✅ Your frontend should now be live!

Test the deployment:

- Open your Vercel URL
- Try logging in with test credentials:
  - Username: `lead` | Password: `lead123`
  - Username: `ahmad` | Password: `ahmad123`

## Common Issues & Fixes

### Issue: API requests fail with CORS error

**Solution**: Your backend needs CORS headers. Update your backend in Render:

```csharp
// In Program.cs or Startup.cs
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
        policy =>
        {
            policy.WithOrigins("https://your-vercel-url.vercel.app", "http://localhost:*")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

app.UseCors(MyAllowSpecificOrigins);
```

### Issue: 404 errors on page refresh

**Fixed** ✅ - `vercel.json` rewrites all non-matching routes to `index.html`

### Issue: Slow API responses (Render free tier)

**Info**: Render free tier services auto-sleep after inactivity. First request takes ~10 seconds.
**Solution**: Upgrade to paid tier or accept the delay on first use.

## Performance Optimization

Current setup:

- ✅ Static HTML/CSS/JS (no build step needed)
- ✅ Vercel Edge caching enabled
- ✅ Long-lived cache for `.js` and `.css` files (1 year)
- ✅ Short cache for `.html` files (must revalidate)
- ✅ Security headers enabled (CSP, X-Frame-Options, etc.)

## Monitoring & Logs

1. **Vercel Dashboard**: View build logs and deployment history
2. **Network tab** (F12): Check API calls to `https://diwan-sufi-api.onrender.com`
3. **Console** (F12): Check for any JavaScript errors

## Cleanup

Remove this file if you want to keep the repo clean:

```bash
rm VERCEL_DEPLOYMENT.md
```

## Support

If deployment fails:

1. Check Vercel build logs
2. Verify `API_BASE` is set correctly
3. Ensure backend CORS allows your Vercel domain
4. Contact support: vercel.com/support

---

**Good luck! 🚀**
