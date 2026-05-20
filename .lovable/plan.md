## Goal

Rework `src/routes/index.tsx` to adopt the **section structure and content rhythm** from the reference logistics site, while keeping Delvora's existing brand: warm cream background, amber `--primary`, Instrument Serif display + Inter body, soft rounded cards.

No new dependencies. No backend changes. Only edits to `src/routes/index.tsx` (and a small helper image asset if needed).

## New section order

1. **Trust strip** — single dark rounded band with 5–6 partner/client wordmarks rendered as plain text (e.g. OXFAM, DT Global, NAYBA, MOVE, Winsupply, Ferguson) styled as muted text on dark.
2. **"#1 Nationwide Delivery Logistics Solution"** — two-column: left = stacked image collage (reuse `map-iso.png` + `parcel-box.png`), right = headline with amber "#1", short paragraph, "Get a Quote" (primary) + "Learn More" (ghost) buttons.
3. **Shipping & Logistics Services** — centered serif heading + 3-card row (Sea / Air / Road) using lucide icons (`Ship`, `Plane`, `Truck`) on amber-tinted cards with a small arrow pill in the corner.
4. **Powering logistics across business** — two-column: left = heading + paragraph + 3 feature rows with amber check/wifi icons (Nationwide carrier network, Fully-featured logistics software, Exception tracing & live support); right = `map-iso.png` framed in a rounded card.
5. **Find Locations** — centered serif heading + faded world-map illustration (reuse `map-iso.png`) with a single info pin card overlaid ("California, USA — demo hub").
6. **Track your shipments** — dark rounded CTA band: left = heading + subtitle on a photographic-feeling dark surface, right = white card with tracking input + "Track Now" amber button → submits to `/track/$id`.
7. Keep existing footer/nav unchanged.
8. add a pro design and organised footer, with all relivant links and details.

## Design rules (locked)

- Fonts: `font-display` (Instrument Serif) for all headings, Inter for body. No new fonts.
- Colors only from existing tokens: `bg-background`, `bg-card`, `bg-secondary`, `bg-primary`, `text-primary`, `text-muted-foreground`, `bg-foreground` (for dark bands), `text-background` (for text on dark). No raw hex.
- Radii: existing `rounded-2xl` / `rounded-3xl` / `card-soft`.
- Replace the reference's orange with our amber `--primary`; replace its black sections with `bg-foreground text-background`.
- Keep current animations minimal (no new libs).

## Technical notes

- File: `src/routes/index.tsx` only.
- Reuse imports already in repo: `heroTruck`, `mapIso`, `parcelBox` from `@/assets/*`.
- New lucide icons to import: `Globe`, `Search`, `Ship`, `Plane`, `Truck`, `Wifi`, `Headphones`, `MapPin`, `ArrowUpRight`.
- Tracking form: local `useState` for tracking number → `useNavigate()` to `/track/$id` with `{ id }` param (mirrors existing `track.index.tsx` pattern).
- All section widths constrained by existing `__root` container; no layout-shell changes.
- Responsive: 1-col on mobile, 2/3-col grids at `md:` — matches existing breakpoints.

## Out of scope

- No new routes, no DB/migrations, no auth changes.
- No replacing the truck illustration with a container photo.
- No partner logos as real images (text wordmarks only, to avoid trademark assets).