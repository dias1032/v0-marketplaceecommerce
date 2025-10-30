# Vestti Marketplace — Phase 1 (Demo)

Local quickstart

1. Install dependencies

```powershell
cd F:\vesttibeta
npm install
```

2. Create a Supabase project and set environment variables (use `.env.local` copying from `.env.local.example`).

3. Run migrations (use Supabase SQL editor or psql) with `scripts/migrations.sql`.

4. (Optional) Run `npm run seed` after setting `SUPABASE_SERVICE_ROLE_KEY` to create demo vendors/products.

5. Start dev server

```powershell
npm run dev
```

Open http://localhost:3000

Notes
- This scaffold is a demo. Replace mock data and integrate Supabase services in Phase 2.
- Do NOT commit real keys to git. Use Vercel environment variables for deployment.
