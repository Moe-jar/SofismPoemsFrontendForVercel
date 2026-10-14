# Troubleshooting: Local Backend Works, Deployed Backend Fails

## Problem Analysis: Why Render Backend Failed

Your deployed backend (`https://diwan-sufi-api.onrender.com`) failed while localhost worked. Here are the **likely causes and fixes**:

---

## 🔴 Problem #1: CORS (Most Common)

### What's Happening?

When your frontend (on Vercel) calls your backend (on Render), the browser blocks the request if the backend doesn't explicitly allow it.

**Error in Console:**

```
Access to XMLHttpRequest at 'https://diwan-sufi-api.onrender.com/api/auth/login'
from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

### Why localhost worked:

- Localhost requests skip CORS checks
- Vercel ≠ localhost, so CORS is enforced

### ✅ Fix: Update Your Backend CORS

Edit your backend's `Program.cs`:

```csharp
using Microsoft.AspNetCore.Cors;

var builder = WebApplicationBuilder.CreateBuilder(args);

// Add CORS BEFORE adding other services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVercelFrontend", policy =>
    {
        policy
            .WithOrigins(
                "https://your-vercel-app.vercel.app",  // Your actual Vercel URL
                "http://localhost:3000",                 // Local dev
                "http://localhost:5500",                 // Local test
                "https://localhost:7145"                 // Local HTTPS
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();  // Allow cookies/auth headers
    });
});

builder.Services.AddControllers();
// ... other services ...

var app = builder.Build();

// Enable CORS BEFORE routing
app.UseCors("AllowVercelFrontend");

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

**Then deploy to Render!** (git push will trigger auto-deploy)

---

## 🔴 Problem #2: Render Free Tier Auto-Sleep

### What's Happening?

Render **auto-sleeps free-tier services after 15 minutes of inactivity**. First request after sleep takes ~30 seconds.

**Error in Console:**

```
Failed to fetch from https://diwan-sufi-api.onrender.com/api/auth/login
```

### Why localhost worked:

- Your local backend never sleeps (you control it)

### ✅ Fixes:

**Option A: Upgrade Render Plan** (Recommended for production)

- Go to Render Dashboard → Your Backend Service
- Click **"Upgrade to Pro"** ($7/month)
- Services stay awake 24/7

**Option B: Add a "Keep-Alive" Monitor** (Free)

```javascript
// Add this to your frontend JS to ping backend every 10 minutes
setInterval(
  async () => {
    try {
      await fetch("https://diwan-sufi-api.onrender.com/health");
    } catch (e) {
      // Silent fail - just keeping it awake
    }
  },
  10 * 60 * 1000,
);
```

**Option C: Accept the delay**

- Just warn users: "⏳ First load may take 30 seconds..."

---

## 🔴 Problem #3: HTTPS & Self-Signed Certificates

### What's Happening?

Your config uses `https://localhost:7145` locally, which might have certificate issues.

**Error in Console:**

```
CORS policy: Response to preflight request doesn't pass access control validation
```

### Why this matters:

- Browsers block mixed content (HTTP frontend calling HTTPS backend)
- Self-signed certificates may fail verification

### ✅ Fix: Use HTTP Locally

**Update `js/config.js`:**

```javascript
// For LOCAL development only:
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  return "http://localhost:5000"; // Use HTTP, not HTTPS
}
```

---

## 🔴 Problem #4: Wrong API Port/Path

### What's Happening?

Backend might be running on a different port than expected.

**Common ports:**

- Local: `http://localhost:5000` (default .NET)
- Local: `https://localhost:7145` (default .NET with HTTPS)
- Render: `https://diwan-sufi-api.onrender.com` (HTTPS always)

### ✅ Fix: Verify your backend started correctly

```bash
cd backend
dotnet run
# Should show:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: https://localhost:7145
```

---

## 🟡 Problem #5: Authentication Token Issues

### What's Happening?

JWT token from localhost might not work with deployed backend (different signing key).

**Error in Console:**

```
401 Unauthorized: Invalid token
```

### ✅ Fix: Check Backend Token Signing

In your backend `appsettings.json`:

```json
{
  "Jwt": {
    "Key": "your-super-secret-key-that-is-at-least-32-characters-long!!!",
    "Issuer": "https://diwan-sufi-api.onrender.com",
    "Audience": "diwan-frontend"
  }
}
```

**Same key must be in BOTH local and Render!**

Check Render environment variables:

1. Go to Render Dashboard → Backend Service
2. Click **Environment**
3. Verify `JWT_KEY` matches your local config

---

## 🧪 How to Debug All Problems

### Step 1: Open Browser DevTools

```
F12 or Ctrl+Shift+I → Console tab
```

### Step 2: Look for These Error Patterns

| Error                     | Problem                    | Solution               |
| ------------------------- | -------------------------- | ---------------------- |
| `CORS policy blocked`     | CORS not enabled           | Set backend CORS       |
| `timed out / no response` | Render sleeping or offline | Wait or upgrade Render |
| `401 Unauthorized`        | Bad token                  | Check JWT signing key  |
| `404 Not Found`           | Wrong endpoint path        | Verify API routes      |
| `ERR_SSL_PROTOCOL_ERROR`  | HTTPS cert issue           | Use HTTP for local     |

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Try to login
3. Click on the failed request
4. Check:
   - **Status**: What code? (4xx = client error, 5xx = server error)
   - **Response**: What does backend say?
   - **Headers**: Look for `Access-Control-Allow-Origin` header

---

## ✅ Verification Checklist Before Deployment

- [ ] Backend CORS includes Vercel domain
- [ ] Backend JWT signing key is set in Render env vars
- [ ] Render backend is awake (or you've accepted the delay)
- [ ] Frontend uses `https://diwan-sufi-api.onrender.com` for production
- [ ] Frontend uses `http://localhost:5000` for local testing
- [ ] Test login works on local backend
- [ ] Test login works on Render backend (even if slow first request)

---

## Quick Test Commands

**Test backend is running:**

```bash
curl https://diwan-sufi-api.onrender.com/api/auth/me
# Should return 401 (not found) since you're not authenticated
```

**Test CORS:**

```bash
curl -X OPTIONS https://diwan-sufi-api.onrender.com/api/auth/login \
  -H "Origin: https://your-vercel-app.vercel.app"
# Should include Access-Control-Allow headers
```

---

## Still Not Working?

1. **Check Render logs**:
   - Render Dashboard → Your Service → Logs
   - Look for CORS or auth errors

2. **Check Vercel logs**:
   - Vercel Dashboard → Your Project → Logs
   - Look for network errors

3. **Ask for specific error**:
   - Screenshot the console error
   - Include full error message
