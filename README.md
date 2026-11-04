# Kathmandu Waste Management (Next.js)

Two staff portals for Kathmandu Metropolitan City, built with Next.js (App Router), Tailwind CSS v4 and lucide-react.
The UI follows the HTML prototypes in [`docs/prototypes`](docs/prototypes):

| Route | Portal | Prototype |
| --- | --- | --- |
| `/kmc` | KMC Waste Management Portal: citywide view of all 32 wards | `docs/prototypes/kmc-portal.html` |
| `/ward` | Ward Waste Management: operations for Ward 17 | `docs/prototypes/ward-portal.html` |

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # TypeScript check
```

## Pages

**KMC** (`/kmc/...`): `dashboard` (clickable ward map, attention list, targets) · `vehicles` (ward vehicle approval queue: approve / reject / return) · `collection` (city map, ward status, exceptions, multi-ward approvals) · `awareness` (campaign cards, filterable table, create campaign) · `monitoring` (ward performance table and details) · `updates` (featured announcement, events, filterable updates) · `reports` (searchable complaints, resolve).

**Ward** (`/ward/...`): `dashboard` (operational summary, route map, routes and stops, progress snapshot, attention rail) · `vehicles` (vehicles with search and status filter, routes, vehicle requests) · `collection` (stop KPIs, route filter chips, exceptions, status donut) · `awareness` (programs, attendance, participant summary) · `performance` (collection chart, milestones, public notices, KMC updates) · `reports` (open complaints).

## Structure

```
src/
  app/                  routes: /, /kmc/*, /ward/* (each page renders one component)
  components/
    ui/                 shared kit: Card, Kpi, Badge, DataTable, ListItem, Tabs, Donut, ProgressBar, Button, Field, Modal
    layout/             PortalShell (sidebar, header, mobile menu) and Sidebar
    kmc/                KMC pages and the canvas ward map
    ward/               ward pages, route map, stop-update modal, page layout with right rail
  context/              ToastContext, KmcContext, WardContext (demo state shared between pages)
  data/                 typed demo data: shared.ts, kmc.ts, ward.ts (navigation lives here too)
  lib/                  collection metrics, status colours, CSV export, cn()
```

## Behaviour notes

- Demo data lives in memory and resets on reload, as in the prototypes. Changes made on one page (approvals, resolved complaints, new campaigns, stop statuses, the selected ward) carry over to the other pages of the same portal.
- Ward collection numbers (KPIs, route status, donut, dashboard summary) are all derived from the same stop list in `data/ward.ts` via `lib/collection.ts`. A route takes its most urgent stop status; cancelled stops are left out of totals.
- The prototype's `prompt()` dialogs for updating stops are replaced by a proper modal (open it from any route row or the "Update collection status" quick action).
- "Export vehicle list", "Download collection report" and "Download complaints report" download real CSV files. Actions that need a backend still show a toast.
- Both portals share one component kit; `data-portal="ward"` switches to the ward prototype's slightly different greens (see `app/globals.css`).
- Layout is responsive: the sidebar becomes a slide-in menu below 1024px, and the ward right rail stacks under the main column below 1280px.
