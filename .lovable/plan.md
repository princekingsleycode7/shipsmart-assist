## Goal
Redesign `/track/$id` (parcel detail page) to match the uploaded mobile mockup — a clean, card-stacked "Smart Tracking" layout — while keeping all existing data and behavior.

## Reference layout (top → bottom)
1. Header row: back button · "Smart Tracking" title · overflow (•••) menu
2. Rounded isometric map card with a yellow pin marker
3. Driver card: avatar + name + "ID: VSK-…" · Call / Message pill buttons
4. Trip card: From / To row, Customer / Date row
5. Tracking code block: `#ER 454-152-47N` big serif, parcel box illustration on the right
6. Sticky bottom "Go Track" CTA pill with yellow circle icon + chevrons

## Changes
**File edited:** `src/routes/track.$id.tsx` only (UI/presentation).

- Restructure JSX into the 6 stacked cards above using existing `card-soft` + `pill` tokens.
- Header: keep back link, center title, add a circular `MoreVertical` button (visual only).
- Map card: keep `mapIso` image, overlay a yellow pin badge (absolute-positioned `MapPin` in a primary circle).
- Driver card:
  - Avatar circle (use `Avatar` from `@/components/ui/avatar`, fallback initials).
  - Show `driver_name` + small muted `ID: <last 8 of parcel.id>` line.
  - Two outlined pill buttons side-by-side: Call (tel:) and Message (sms:). Disabled-look when no `driver_phone`.
  - Move the status badge to a small chip in the top-right of this card.
- Trip card: 2×2 grid — From/To on row 1, Sender→"Customer" label / ETA→"Date" on row 2 (formatted `dd MMM yyyy`).
- Tracking code block: large `font-display` `#XX` prefix + remaining code, with a small parcel illustration on the right. Generate a new asset `src/assets/parcel-box.png` (transparent PNG, isometric kraft box with purple tape) — only new file added.
- Bottom CTA: sticky/pinned within page, yellow circle with package icon + "Go Track" label + double chevron right. Links to `/track` (new search).
- Timeline section: keep below CTA, collapsed by default behind a "View timeline" toggle to preserve all event data without cluttering the mockup look.

## Out of scope
- No DB / server-fn changes (`lookupParcel` already returns everything needed).
- No changes to `/track` search page or other routes.
- No new dependencies.

## Technical notes
- Reuse `STATUS_LABEL` map.
- Date format via `toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })`.
- Avatar fallback = initials from `driver_name`.
- All colors via existing tokens (`bg-primary`, `bg-secondary`, `text-muted-foreground`, `card-soft`, `pill`) — no hex values.
