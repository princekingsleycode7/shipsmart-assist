
## Delvora — Logistics & Tracking App

A clean, mobile-first logistics app inspired by the uploaded Delvora screens (warm off-white background, soft cards, signature amber/yellow accent, bold display headings). Built as a responsive web app with TanStack Start + Lovable Cloud.

## Pages & navigation

```text
/                 Landing — hero "Quick, Safe, And Reliable Delivery", CTA → /track
/track            Enter tracking number (e.g. #ER 454-152-47N) → result
/track/$id        Smart Tracking detail: route, status timeline, driver card, From/To, ETA
/support          AI chatbot (Delvora Assistant) — threaded if signed in
/contact          WhatsApp deep link + "Chat with a live agent" (in-app)
/login            Email/password (only needed for chat history + admin)
/admin            Admin-only: create / update parcels, set status & location
```

Shared bottom nav on mobile (Home · Track · Support · Account), top nav on desktop.

## Core features

1. **Public parcel tracking** — anyone enters a tracking ID, no login. Shows current status (Pending / In Transit / Out for Delivery / Delivered), origin → destination, ETA, driver name, and a timeline of status events. Map area uses a stylized isometric illustration (matching screen 3) rather than a live map.
2. **Admin console** — users with the `admin` role can create parcels, edit status, push new location/timeline events, assign a driver.
3. **AI support chatbot** — "Delvora Assistant" powered by Lovable AI Gateway (`google/gemini-3-flash-preview`) via AI SDK. It knows about shipping FAQs and can look up a parcel by tracking ID as a tool call. Threaded conversations per user, saved in the database. Guests can chat in a single ephemeral session and are prompted to sign in to save history.
4. **Human handoff** — a "Talk to a human" panel with two buttons: **WhatsApp** (opens `wa.me/<number>` deep link) and **Live chat** (in-app realtime chat with an agent via Supabase Realtime; agent replies from `/admin/chats`).

## Design direction

- Palette: warm off-white `#F7F4EE` background, ink near-black text, signature amber `#F5B82E`, soft card surfaces with subtle shadow + 24px radius.
- Typography: bold italic display for headings (Instrument Serif / DM Serif feel), clean sans for body (Inter/Manrope).
- Components: pill buttons, big rounded cards, isometric 3D illustrations for hero/empty states (generated), small icon chips for timeline.
- Mobile-first; works great on desktop with centered max-w layout.

## Data model (Lovable Cloud / Supabase)

```text
profiles(id, full_name, avatar_url)
user_roles(user_id, role)                  -- 'admin' | 'user'  (separate table, RLS via has_role)
parcels(id, tracking_code unique, sender, recipient, origin, destination,
        status, current_location, eta, driver_name, driver_phone, created_at)
parcel_events(id, parcel_id, status, location, note, occurred_at)
chat_threads(id, user_id, title, created_at, updated_at)
chat_messages(id, thread_id, role, parts jsonb, created_at)
support_conversations(id, user_id, status, created_at)        -- live agent
support_messages(id, conversation_id, sender_id, body, created_at)
```

RLS: parcels readable by anyone (public tracking); writable only by admins. Chat tables scoped to `auth.uid()`. Roles enforced via `has_role()` security-definer function.

## Technical details

- **Stack**: TanStack Start (existing template), Tailwind v4 design tokens in `src/styles.css`, shadcn/ui.
- **Routes**: file-based; tracking detail at `/track/$id` loads from a public `createServerFn` using `supabaseAdmin` (scoped WHERE on tracking_code).
- **AI chat**: AI Elements (`conversation`, `message`, `prompt-input`, `tool`, `shimmer`) installed; server route `src/routes/api/chat.ts` uses `streamText` + `toUIMessageStreamResponse`; tool `lookupParcel({ trackingCode })` calls the parcel server fn. Threads use route `/support/$threadId` with `useChat({ id: threadId, messages })`, persisted in `chat_threads` / `chat_messages` via `onFinish`.
- **Live agent chat**: Supabase Realtime channel per `support_conversation`; admin inbox at `/admin/chats`.
- **WhatsApp**: configurable phone number stored in a `settings` row (admin-editable); button opens `https://wa.me/<number>?text=...`.
- **Auth**: email/password via Lovable Cloud (no Google unless asked). Required only to save chat threads and for admin.
- **Seed**: one demo admin + a few sample parcels so tracking works immediately.

## What I'll deliver in the first build

1. Enable Lovable Cloud + schema/RLS + seed data.
2. Landing, /track, /track/$id, /support (+ threads), /contact, /login, /admin (parcels CRUD), /admin/chats.
3. AI chatbot wired to gateway with parcel-lookup tool.
4. Generated isometric hero illustration matching the Delvora vibe.
5. Mobile bottom nav + desktop top nav, themed tokens, dark-mode-safe contrast.

After approval I'll start with Cloud setup + schema, then build the UI surfaces in order: tracking → admin → AI chat → live chat/WhatsApp.
