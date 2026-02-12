# Deployment Guide - Calendar Assistant (Free Tier Version)

## ⚠️ Important Update: Render Persistence
Render's **Free Tier** does not support persistent disks. This means if you use SQLite on Render's free tier, your database will be wiped every time the server restarts (which happens at least once an hour).

**Recommended Free Solution**: Use **Supabase** (PostgreSQL) for the database. It is forever free and keeps your data persistent.

---

## Step 1: Prepare Your Database (Supabase)

1. Go to [Supabase.com](https://supabase.com) and create a free account.
2. Create a "New Project".
3. Once the project is ready, go to **Project Settings** → **Database**.
4. Copy the **Connection String** (use the "URI" or "Transaction Pooler" string). It will look like: 
   `postgresql://postgres:[PASSWORD]@db.[INSTANCE].supabase.co:5432/postgres`

---

## Step 2: Deploy Backend to Render

### 2.1 Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com).
2. "New +" → "Web Service" → Connect your GitHub repo.
3. **Root Directory**: `backend`
4. **Runtime**: `Node`
5. **Build Command**: `npm install && npm run build`
6. **Start Command**: `node dist/index.js`
7. **Instance Type**: `Free`

### 2.2 Add Environment Variables
In Render, add these:
```
GOOGLE_CLIENT_ID=<your-id>
GOOGLE_CLIENT_SECRET=<your-secret>
LLM_API_KEY=<your-gemini-key>
JWT_SECRET=<long-random-string>
PORT=4000
CLIENT_ORIGIN=https://your-app.vercel.app  (Update this AFTER Step 3)
GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/auth/google/callback
```

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com).
2. Import your GitHub repo.
3. **Root Directory**: `frontend`
4. **Framework Preset**: `Vite`
5. **Add Environment Variable**:
   - **Name**: `VITE_BACKEND_URL`
   - **Value**: `https://your-backend.onrender.com`

---

## Step 4: Finalize Google Console

Update your [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials):

1. **Authorized JavaScript Origins**:
   - `https://your-app.vercel.app`
2. **Authorized Redirect URIs**:
   - `https://your-backend.onrender.com/auth/google/callback`

---

## 🎬 Tips for your Demo Video

### **Option A: The "Production Ready" Path (Recommended)**
Use an external DB like Supabase. I can help you update the code to use Postgres in under 2 minutes (it’s just a package swap). This looks best for a technical demo.

### **Option B: The "Fast Demo" Path**
If you just need to film the video **right now**, keep the SQLite code as is. 
- Deploy to Render Free. 
- The app will work perfectly for your 5-minute video. 
- Just be aware that if you check the app 20 minutes later, the users/tokens might be gone. **Mention this as a "known limitation of the hosting tier" in your demo to sound pro!**

---

## Troubleshooting

- **Delay on start**: Render Free services "sleep" after 15 mins. The first request will take ~30 seconds.
- **CORS Errors**: Ensure `CLIENT_ORIGIN` on Render matches your Vercel URL exactly (no trailing slash).
