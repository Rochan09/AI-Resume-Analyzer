# Deployment Guide — Frontend (Vercel) + Backend (Render)

This file lists the minimal steps to deploy your app and where to set environment variables. Do NOT commit secrets to the repo. Use the dashboard for Render and Vercel to store secrets.

---

## 1) Frontend (Vercel)

- Project root: `frontend`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

Env vars (set in Vercel dashboard, *Production/Preview/Development* as appropriate):
- `VITE_API_BASE_URL` = `https://<your-backend-url>`
  - Example: `https://ai-resume-analyzer-tkhr.onrender.com`

Steps:
1. On vercel.com -> New Project -> Import your GitHub repo.
2. During configuration set Root Directory to `frontend`.
3. Add the `VITE_API_BASE_URL` environment variable in Project → Settings → Environment Variables.
4. Deploy. Vercel will create preview and production deployments.

Notes:
- Vite exposes only `VITE_` prefixed vars to client code. Use `import.meta.env.VITE_API_BASE_URL` in the app.

---

## 2) Backend (Render)

- Root directory: `backend` (Render supports deploying a subdirectory).
- Start command: `node server.js` or `npm start` (ensure `server.js` reads `process.env.PORT`).

Important environment variables to set in Render (Dashboard → Environment):
- `MONGODB_URI` = your MongoDB connection string
- `JWT_SECRET` = strong secret for signing tokens
- `FRONTEND_ORIGIN` = `https://<your-frontend-url>`
  - Example: `https://ai-resume-analyzer-three-eta.vercel.app`
- (Optional) `AWS` or other storage keys if you use S3

Steps:
1. On render.com -> New -> Web Service -> Connect your GitHub repo.
2. Set the Root Directory to `backend` and the Start Command to `node server.js` (or `npm start`).
3. Add environment variables listed above in the Render service settings.
4. Create the service — Render will build and deploy and provide a public URL.

Security note: do NOT keep secret credentials in `backend/.env` in the repository. Use Render's dashboard for secrets.

---

## 3) CORS

In `backend/server.js` we use a `FRONTEND_ORIGIN` environment variable to restrict cross-origin requests. Set `FRONTEND_ORIGIN` on Render to the Vercel domain (e.g. `https://ai-resume-analyzer-three-eta.vercel.app`).

If you need to allow local development alongside production, you can set multiple origins comma-separated in `FRONTEND_ORIGIN`, e.g.: 
```
https://ai-resume-analyzer-three-eta.vercel.app,http://localhost:5173
```

---

## 4) Local setup / testing

Frontend (local dev):
```powershell
cd frontend
npm install
npm run dev
```

Backend (local dev):
```powershell
cd backend
npm install
# create a local .env from .env.example and fill MONGODB_URI and JWT_SECRET
node server.js
```

Test the deployed backend root:
```powershell
Invoke-RestMethod -Uri 'https://ai-resume-analyzer-tkhr.onrender.com/' -Method GET
```

Test OPTIONS preflight (simulate browser preflight):
```powershell
Invoke-WebRequest -Uri 'https://ai-resume-analyzer-tkhr.onrender.com/api/resume' -Method OPTIONS -Headers @{ Origin = 'https://ai-resume-analyzer-three-eta.vercel.app' } -UseBasicParsing
```

---

## 5) Remove secrets from repo (recommended)

If `backend/.env` currently contains secrets, remove it from git history and stop tracking it:

```powershell
# remove from index but keep file locally
git rm --cached backend/.env
git commit -m "Remove backend/.env from repo; keep .env.example"
# push commit
git push
```

If secrets were committed in prior commits and you need to scrub them from history, consider using `git filter-repo` or GitHub's secret scanning guides. That is a destructive operation; follow provider docs.

---

If you want I can:
- Remove the secret values from `backend/.env` in this repo (I replaced them already),
- Create a PR with `DEPLOY.md` and `.env.example` only (no secrets), or
- Walk you through the Render/Vercel env variable UI and confirm settings.

Pick one and I'll proceed.
