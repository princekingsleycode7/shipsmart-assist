# Safefreight Way — UI/UX Audit & Fix Plan

## A. Preview not opening (published works)
- Local dev server returns 200 and the template renders correctly in a headless
  browser at `http://localhost:8080/`. The Lovable preview URL gates behind
  login; once authenticated, the same bundle is served.
- Most likely cause: the Lovable preview iframe proxy is intercepting one of
  the third-party requests (Google Fonts, jQuery, RevSlider scripts) or the
  template's `#preloader` overlay never fades because a script 404s.
  Mitigations:
  1. Force-remove `#preloader` on mount even before scripts finish (already
     partly done in `template-page.tsx`; add a hard 1s timeout fallback).
  2. Skip the template's `rs6.min.js` / RevSlider if it errors — wrap script
     injection in try/catch and continue.
  3. If still broken in preview, confirm on the **published URL** (per
     Lovable preview-proxy note). The published deploy is the source of truth.

## B. Live chat floating icon — DONE
- Now rendered **only on `/`** (home). Auto-hides on `/live-chat` (chat open),
  admin, support, etc.
- Single source of truth (`FloatingLiveChat` in `__root.tsx`). Removed
  scroll-position quirks; consistent right-bottom placement on mobile + desktop.
- WhatsApp button (left-bottom, green) is separate and remains site-wide.

## C. Template integration polish
1. **Preloader timeout** — guarantee fade-out after 1s even if jQuery never
   loads, so users never see a blank/loading screen in the preview iframe.
2. **Script load failures** — currently silently `resolve()`. Add a single
   console warning per failed asset so we can see issues in logs without
   blocking the page.
3. **Fragment caching** — `fetch('/templates/fragments/...')` runs on every
   navigation. Memoize in module scope to avoid re-fetch/re-init flicker.
4. **CLS** — reserve min-height on the template container so layout doesn't
   jump when the fragment HTML arrives.

## D. Routing / UX flow gaps
1. **Header nav buttons in the template** are static `<a href="...">` links.
   Intercept on mount and convert to client-side navigation (router.navigate)
   so we don't full-reload between marketing pages.
2. **Tracking search form** on `/tracking` posts to a static URL. Wire it to
   `router.navigate({ to: '/track/$id' })` on submit.
3. **`/track/:id`** uses `TemplateShell` (good) but the timeline visual
   doesn't match the template's `track-detail.html`. Either:
   - render the template fragment and inject parcel data via data attributes, or
   - keep React UI but adopt the template's color tokens/typography.
4. **`/login`, `/admin`, `/support`** — wrapped in `TemplateShell` but their
   internal cards still use shadcn defaults. Restyle to match template
   (rounded headings, orange accent `#f5a623`, navy `#0c2340`).
5. **Mobile header** — template's mobile menu requires `script.js` to bind.
   Verify hamburger opens drawer on the published site at 360px.

## E. Live chat experience
- `FloatingLiveChat` → navigates to a full-page `/live-chat` route.
  Consider promoting `chat-widget.tsx`'s `LiveSupportWidget` (slide-up panel)
  instead, so the user stays on the marketing page while chatting with a
  human agent. Decision needed from user.
- When live-chat panel is open, suppress the floating icon (already handled
  if we mount widget instead of route).
- Agent (admin) side: ensure `/admin/chats` shows unread counts and supports
  realtime delivery (Supabase channel already in widget).

## F. SEO & metadata
- Per-route `head()` titles already added for `/`, `/about`, `/services`,
  `/tracking`, `/contact`, `/track/$id`. Good.
- Add unique meta descriptions per route (currently inherit root).
- Add `og:image` per leaf route once we have hero images (skip root og:image
  override).

## G. Cleanup
- Delete `src/components/old.tsx` (duplicate of chat-widget).
- Delete `src/components/nav.tsx` (BottomNav/TopNav no longer used since
  template controls chrome).
- Remove unused imports in `__root.tsx` (`BottomNav`, `TopNav`,
  unused `loading`/`user`/`onLogout`).
- Drop legacy Tailwind hero assets (`hero-truck.png`, `parcel-box.png`).

## H. Skill request
- `npx skills add Leonxlnx/taste-skill` must be run from the user's local
  terminal (CLI command). Once installed and committed to the project, I'll
  pick it up in subsequent turns.

## Suggested order
1. Floating-icon fix (DONE)
2. Preloader timeout + script error logging (quick)
3. Convert template nav `<a>` to client routing
4. Wire tracking form to `/track/$id`
5. Restyle login/admin/support inside `TemplateShell`
6. Cleanup dead files
7. Per-route meta descriptions
