# Kathmandu Waste Management (Next.js)

One website for everyone involved in waste collection in Kathmandu Metropolitan City. A single login page (`/`) has four sections:

| Section | Who | Route | Layout |
| --- | --- | --- | --- |
| Citizen | Residents | `/citizen` | Phone-first |
| Driver | Collection-truck drivers | `/driver` | Phone-only (shown as a phone-width column on a desktop) |
| Ward staff | Ward office (admin for one ward) | `/ward` | Desktop and phone |
| KMC staff | City office (admin for all 32 wards) | `/kmc` | Desktop and phone |

Next.js (App Router), Tailwind CSS v4, lucide-react, Leaflet maps with OpenStreetMap tiles (no API key; the browser loads tiles from tile.openstreetmap.org).

## Run

The app needs the API from the `Waste-management` repo (FastAPI backend + local waste classifier). From that repo, `./run_local.sh` starts the model service, backend and this site together. Or run this site on its own:

```bash
npm install
npm run dev
```

The browser calls this site's `/api/v1`, and Next.js forwards it to `BACKEND_URL` (default `http://localhost:8000`). Only set `NEXT_PUBLIC_API_URL` to call another backend directly; if it points at `localhost` but the page is opened from another device, the site falls back to its own `/api/v1` (on a phone, `localhost` would be the phone itself).

Demo accounts, password `demo1234` (the login page fills them in for each section):

| Section | Email |
| --- | --- |
| Citizen | asha.gurung@example.com (Ward 17) |
| Driver | ram.thapa@kathmandu.gov.np (KMC-04 on Ward 17 Route 3, KMC-01 on Ward 5) |
| Driver | bikash.shrestha@kathmandu.gov.np, sita.gurung@…, hari.adhikari@…, … (first.last@kathmandu.gov.np for every driver) |
| Ward staff | ward17@kathmandu.gov.np |
| KMC staff | anita.shrestha@kathmandu.gov.np |

## What each section does

**Citizen**: next collection time and status; *Track collection* (live truck map, time until the truck reaches each stop, nearest stop from the phone's location); SMS collection reminders (subscribes the phone to the ward's SMS alerts); *Waste Help* with live Identify (point the camera, the biodegradable / non-biodegradable answer updates on screen about three times a second) and *Ask* (answers to common waste questions from a built-in guide, not an AI model); community programs with registration; news; report an issue in three steps (category → details with optional photo and "use my location" → review), with a reference number (WR-00012) and a status timeline that follows the ward office's updates.

**Driver**: today's assignment (vehicle, route, schedule, waste type, stops); *Start collection*; route map with the phone's live GPS position; total time needed (drive to the first stop + between stops + loading) and the finish time, recalculated as the truck moves; mark stops collected or skipped; finish the route with the weight, or report a delay (alerts the ward, KMC and SMS subscribers); schedule of all assigned routes; trip records and vehicle-issue reports. While signed in, the driver's position is sent every 5 seconds (or after 25 m) and appears on the ward, KMC and citizen maps; sharing can be turned off on the profile page. *Simulate drive* moves a pretend position along the route for testing at a desk.

Time estimates are straight-line distances × 1.35 at 18 km/h (nudged towards the truck's measured speed) plus 6 minutes per stop (`src/lib/eta.ts`). They are estimates, not turn-by-turn routing.

**Ward staff** and **KMC staff**: dashboards, live collection maps, collection management, awareness programs, updates, reports and complaints (with citizen photos and status history), SMS alerts and settings. KMC also has Identify Waste and ward monitoring.

## Phones: camera and GPS

Browsers only give web pages the camera and GPS on HTTPS or `localhost`. On a laptop, `npm run dev` is enough. A phone on the same Wi-Fi can open `http://<laptop-ip>:3000` and sign in, but for the live camera and GPS:

```bash
npm run dev:mobile   # prints https://<laptop-ip>:3000 to open on the phone
```

`scripts/dev-mobile.sh` makes a self-signed certificate for the laptop's LAN address in `certificates/` (accept the browser warning once on the phone). Set `LAN_IP` if it picks the wrong network interface. Stop `npm run dev` first (only one dev server can run per project), or pass another port: `npm run dev:mobile -- -p 3443`.

Without HTTPS, Identify offers **Open phone camera** (the phone's camera app) and the driver section offers **Simulate drive**.

## Tests

```bash
npm run lint        # TypeScript
npm run test:e2e    # builds the site, starts backend + classifier + site on spare ports with a fresh database, runs Playwright
```

The end-to-end tests (`e2e/`) drive Chromium on a desktop and a phone viewport with a fake camera (a banana-peel photo) and a fixed GPS position. They sign in to every section, click every button on every page and fail on any page error or React error, check that phone pages never scroll sideways, and walk the main flows: live identify, the report wizard with a photo, program registration, reminders, the driver's route (GPS sharing, stops, simulated drive, finishing with a weight, issue reports), the GPS-denied case, and cross-section updates (a ward status change appearing in the citizen's timeline, the driver's position appearing on the ward's map).

To run them against servers you already have running (they change that data): `E2E_BASE_URL=http://localhost:3000 E2E_API_URL=http://localhost:8000 npm run test:e2e:dev`. The backend repo has its own API tests (`pytest`).

See `docs/CONVERSION_NOTES.md` for structure and behaviour notes.
