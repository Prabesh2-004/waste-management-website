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
| `/kmc/sms`, `/ward/sms` | SMS Alerts: ward subscribers, broadcasts and the outbox |

## Camera on phones

Identify Waste has three modes: **Camera** (tap the shutter, or press Space, and the photo is identified straight away), **Live video** (the result updates about once a second; press *Save this result* to keep one) and **Upload** (drag and drop or pick a file). Photos are shrunk in the browser before upload.

Browsers only give web pages the camera on HTTPS or `localhost`. On a laptop, `npm run dev` is enough. A phone on the same Wi-Fi that opens `http://<laptop-ip>:3000` gets the **Open phone camera** button instead, which opens the phone's camera app and works without HTTPS. For the in-page camera and live video on a phone:

```bash
npm run dev:mobile   # prints https://<laptop-ip>:3000 to open on the phone
```

`scripts/dev-mobile.sh` makes a self-signed certificate for the laptop's LAN address in `certificates/` (accept the browser warning once on the phone) and sends API calls through this site (`/api/v1` is rewritten to `BACKEND_URL`, default `http://localhost:8000`), so the phone needs only the one address and the backend's CORS settings don't change. Set `LAN_IP` if it picks the wrong network interface. Stop `npm run dev` first, or pass another port: `npm run dev:mobile -- -p 3443`.

`npm run build` creates the production build and `npm run lint` runs the TypeScript check.

See `docs/CONVERSION_NOTES.md` for structure and behaviour notes.
