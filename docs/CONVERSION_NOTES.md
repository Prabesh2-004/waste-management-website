# Conversion notes

## Structure

```
src/
  app/                 routes (/, /kmc/*, /ward/*) and global CSS
  components/
    ui/                buttons, fields, rows, tabs, bars, overlays (shared)
    layout/            app shell, sidebar, notification menu
    auth/              login/sign-up card, ward selection card
    shared/            parts used by both portals (settings form, update feed, report filters, modals)
    kmc/               KMC portal components, grouped by page
    ward/              Ward portal components, grouped by page
  context/             UiContext (toast, drawer, modal), KmcContext, WardContext
  data/                all static data as JSON (shared/, kmc/, ward/)
  lib/                 helpers (time format, status colours, hex map geometry)
  types/               TypeScript types
```

Each page file in `app/` only renders one page component. Pages are split into small components per task (for example `collection/OverviewTab`, `VehicleDrawer`, `ScheduleModal`).

## Data

Records (wards, vehicles, routes, schedules, programs, updates, reports, notifications, drivers) come from the backend API (`src/lib/api.ts`). Their original seed JSON moved to `Waste-management/backend/app/seed_data`. `src/data` still holds UI configuration: navigation, status colours, dropdown options, default form values, hex-map layout and route-map lines.

## State

The original used global variables and `innerHTML` re-rendering. Now:

- `KmcContext` and `WardContext` hold the data and the actions (assign driver, complete route, create program, and so on).
- `UiContext` provides `toast`, `openDrawer`, `openModal` and `closeOverlay`.
- Drawers and modals receive an id and read live data from context, so they stay up to date.
- On login the context loads its portal's state (`GET /api/v1/kmc/state` or `/api/v1/wards/{n}/state`). Each action updates React state right away, sends the change to the API, then reloads the state so the UI shows what the server stored. API errors appear as toasts.
- The session token is kept in `sessionStorage`, so a reload keeps you logged in. Log out clears it and reloads the page.

## Design

Colour variables, light and dark mode (`prefers-color-scheme` and `data-theme`), font sizes, spacing, borders and radii are the same as the HTML. Variables are exposed as Tailwind colours (`bg-surface`, `text-mut`, `border-line`, `bg-ac`, `bg-ok`, `bg-warn`, `bg-bad`, `bg-info`, ...) in `app/globals.css`.

Stat and key-value numbers inherit the muted text colour, exactly as in the HTML (the value `<b>` sits inside a `.mut` element). To make them darker, add `text-ink` to the `<b>` in `ui/StatStrip.tsx` and `ui/KeyValueGrid.tsx`.

## Responsive behaviour

The HTML only changed layout at 1100px and kept a fixed sidebar. Now:

- `lg` is set to 1101px, so desktop layout matches the HTML above 1100px.
- 768px to 1100px: 180px sidebar, single-column panels (as in the HTML).
- Below 768px: the sidebar becomes a slide-in menu opened with a hamburger button, stat strips use 2 columns, headers and button groups wrap, tabs scroll horizontally, and modals and drawers use the full width.

## Small differences from the HTML

- Notification badge is hidden when there is nothing unread (the HTML showed an empty red pill) and updates live.
- Notifications menu also closes on outside click.
- A newer toast replaces the previous one and resets the timer.
- Escape closes drawers and modals.
- Time fields must be filled when creating or changing a schedule or program (the HTML would show "NaN" for an empty time).
- Rows that open drawers or modals are keyboard accessible.
- Vehicle select in the route dialogs falls back to the first available vehicle when the current one is in maintenance, as a browser `<select>` did in the HTML.
- A landing page at `/` links to both portals, since the two HTML files were separate.
