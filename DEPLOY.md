# Deploying SmartSpend

SmartSpend is a Vite + React frontend with an Express API. The same Express app runs:

- **locally:** `server/index.js` (port 5000)
- **on Vercel:** `api/index.js`, as a serverless function (configured in `vercel.json`)

## Run locally

```bash
npm install
npm run dev:full      # API on :5000 + Vite on :5173
```

Open http://localhost:5173, register an account, and you're in. New accounts start with sample data. You can clear it under **Settings → Start fresh**.

## Deploy to Vercel (free)

1. Push the project to GitHub (GitHub Desktop → *Add local repository* → *Publish*).
2. Go to https://vercel.com, click **Add New → Project**, and import the repo. The defaults are fine (framework: Vite, output: `dist`).
3. Under **Settings → Environment Variables**, add:

   | Name | Value |
   |------|-------|
   | `JWT_SECRET` | a long random string (keep it private) |

4. Deploy. The site and `/api/*` are both served from the same URL.

> **Data on Vercel:** the JSON store writes to the function's temporary disk, which is wiped when the function goes idle. Signed-in users get their sample data back automatically, but accounts and new entries don't persist long-term. For permanent storage, connect a database such as MongoDB Atlas (free tier). The Mongoose models are already in `server/models/`.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `5000` | Local API port |
| `JWT_SECRET` | dev fallback | Signs login tokens. **Set this in production.** |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin(s), comma-separated |
| `SMARTSPEND_DB_FILE` | `server/data/database.json` | Override the JSON database path |

## Checks before shipping

```bash
npm run build   # type-check + production bundle
npm run lint
```
