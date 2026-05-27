
# Replace UI with Safefreight Way template

## Prerequisite (blocking)

I need the **full template assets zip** (the `assets/` folder with `css/`, `js/`, `img/`, `fonts/`, plus any other top-level `.html` pages like `about.html`, `service.html`, `tracking.html`, `contact.html`, etc.). Upload that and I'll execute the plan below.

## Approach

Embed the template **as-is** (no rewrite into Tailwind). The HTML pages are dropped into `public/` along with their `assets/` folder so all original CSS/JS/images/jQuery plugins keep working byte-for-byte. TanStack routes become thin wrappers that load the corresponding template page and graft on our dynamic backend pieces (track lookup, admin, login, AI chat).

## What goes where

```text
public/
  assets/css/...        ← template (untouched)
  assets/js/...         ← template (untouched)
  assets/img/...        ← template (untouched)
  assets/fonts/...      ← template (untouched)
  templates/
    index.html          ← raw template pages
    about.html
    service.html
    service-details.html
    tracking.html
    contact.html
    ...                 ← every page from the zip
```

## Routes (TanStack)

Each marketing route renders the matching template page inside a full-bleed iframe-free wrapper. Because the template ships its own `<header>`, `<footer>`, preloader, scroll-up button, and **WhatsApp floating icon**, we render the raw HTML body via a `TemplatePage` component that:

1. Fetches `/templates/<page>.html` once.
2. Injects the `<body>` markup into a container.
3. Loads the template's JS bundles (jQuery, slick, rs6, custom `main.js`) on mount so sliders, menus, preloader, and WhatsApp float all initialise.

Route map:
- `/` → index.html
- `/about` → about.html
- `/services` + `/services/$slug` → service.html / service-details.html
- `/tracking` → tracking.html (form posts to `/track/$id`)
- `/track/$id` → **rebuilt** in template style: same header/footer/WhatsApp float, but body shows live parcel data from `lookupParcel` server fn (driver, timeline, map, ETA) styled with the template's classes.
- `/contact` → contact.html (form wired to existing settings/WhatsApp number)
- Any other template pages (blog, pricing, faq, 404) get routes too.

## Backend-backed pages (template chrome + custom body)

A shared `<TemplateShell>` component renders the template's header + footer + WhatsApp float, with a `{children}` slot for our React UI. Used by:
- `/login` (Google + email/password, password rules already relaxed)
- `/support` and `/support/$threadId` (AI chat + save history)
- `/admin`, `/admin/users`, `/admin/chats` (existing admin tools)
- `/track/$id`

This satisfies "Apply template header/footer only" for admin/auth/support.

## Tracking form integration

`tracking.html`'s search input gets a small inline script (added during install) that intercepts submit and navigates to `/track/<code>` via `window.location`. No template markup changes beyond adding an `id` hook.

## WhatsApp floating icon

Already part of the template's HTML/CSS/JS — kept everywhere because every route renders through either the raw template page or `TemplateShell`, both of which include the float. Its number is wired to `app_settings.whatsapp_number` by a tiny inline script that reads from `window.__APP_SETTINGS__` (injected by root loader from `getWhatsAppNumber`).

## Things I will NOT change

- Database schema, RLS, server functions (`lookupParcel`, admin/chat fns) — untouched.
- Auth flow, Google OAuth, admin promotion.
- AI chat backend.

## Things I WILL delete

- Current Tailwind-styled marketing files: `src/assets/hero-truck.png`, `parcel-box.png`, `src/styles.css` design tokens (kept minimal — only needed for admin/login/chat shadcn components), old `src/routes/index.tsx`, `track.index.tsx`, `contact.tsx` bodies (replaced by template embeds).
- Custom font imports / `Instrument Serif` — template ships its own fonts.

## Technical details

- `TemplatePage` uses `fetch` + `dangerouslySetInnerHTML` on the body content, then dynamically appends `<script src="/assets/js/...">` tags in order (jQuery first). Re-runs on route change with cleanup.
- For SEO each route still sets its own `head()` with title/description matching the template page.
- Server runtime untouched; everything new is client-side static asset serving from `public/`.
- Vite serves `public/assets/**` directly — no bundling of template CSS/JS so nothing breaks.

## Open items (small)

- Confirm the zip contains a `tracking.html`. If not, I'll mirror `service.html`'s layout for the tracking form.
- Confirm template font files are inside `assets/fonts/` (some HTTrack mirrors drop them).

Upload the zip and I'll execute.
