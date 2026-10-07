# Kathmandu Waste Management (Next.js)

Conversion of `KMC_Waste_Management_v2.html` and `Ward_Waste_Management_v2.html` into one Next.js (App Router) project using Tailwind CSS v4 and lucide-react.

## Run

```bash
npm install
npm run dev
```

The app needs the API from the `Waste-management` repo (FastAPI backend + local waste classifier). From that repo, `./run_local.sh` starts the model service, backend and this frontend together.

Set `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`, see `.env.example`) to point at another backend; its origin must be listed in the backend's `CORS_ORIGINS`.

Open http://localhost:3000 and choose a portal. Demo login is pre-filled (password `demo1234`):

| Portal | Email |
| --- | --- |
| KMC | anita.shrestha@kathmandu.gov.np |
| Ward | ward17@kathmandu.gov.np |

| Route | Portal |
| --- | --- |
| `/kmc` | KMC staff portal (all 32 wards) |
| `/ward` | Ward staff portal (login, then ward selection) |
| `/kmc/identify`, `/ward/identify` | Identify Waste: photo → biodegradable / non-biodegradable |

`npm run build` creates the production build and `npm run lint` runs the TypeScript check.

See `docs/CONVERSION_NOTES.md` for structure and behaviour notes.
