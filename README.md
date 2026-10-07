# Kathmandu Waste Management (Next.js)

Conversion of `KMC_Waste_Management_v2.html` and `Ward_Waste_Management_v2.html` into one Next.js (App Router) project using Tailwind CSS v4 and lucide-react.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000 and choose a portal. Demo login is pre-filled (any email and password also works).

| Route | Portal |
| --- | --- |
| `/kmc` | KMC staff portal (all 32 wards) |
| `/ward` | Ward staff portal (login, then ward selection) |

`npm run build` creates the production build and `npm run lint` runs the TypeScript check.

See `docs/CONVERSION_NOTES.md` for structure and behaviour notes.
