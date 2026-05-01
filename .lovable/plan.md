## Agentic LinkedIn Post Generator — Frontend

A polished SaaS-style dashboard for an AI LinkedIn post generator. Frontend-only with mock data so the entire UX works end-to-end immediately; a configurable API base URL in Settings makes it ready to plug into your LangGraph backend later.

### Pages & Routes

- `/` — Landing (hero, feature highlights, CTA → Dashboard)
- `/dashboard` — Topic input + generation + agent pipeline + result card
- `/history` — List of previously generated posts
- `/settings` — Theme, API base URL, tone/length defaults, clear history

Shared layout: collapsible sidebar (Dashboard, History, Settings) + top header with theme toggle.

### Dashboard flow

1. User enters a topic, optional tone (Professional / Casual / Thought-leader) and length (Short / Medium / Long).
2. Clicks **Generate Post** — button disables, skeleton appears.
3. **Agent Pipeline panel** animates through 4 steps with status pills (Pending → Running → Done):
   - Research Agent
   - Draft Agent
   - Critic Agent
   - Formatter
   Each step takes ~1–2s (simulated). Progress bar across the top.
4. **Result card** auto-scrolls into view with:
   - Final post text (LinkedIn-styled typography)
   - Quality score (0–100) with colored ring
   - Suggested hashtags as chips (click to copy)
   - Actions: Copy, Regenerate, Export as Image, Save to History (auto-saves)
5. Toast notifications for success/error and copy.

### History page

Card grid of past posts: topic, timestamp (relative), preview snippet, quality score badge, Copy / View / Delete. Stored in `localStorage` (works offline, survives refresh). Empty state with CTA back to dashboard.

### Settings page

- Theme: Light / Dark / System
- API base URL (saved to localStorage; used by API layer when wired up)
- Default tone & length
- Danger zone: Clear all history

### Export as LinkedIn-style image

Render the post into a styled card (avatar placeholder, name, "AI Generated" badge, post body, hashtags) and use `html-to-image` to download a PNG suitable for sharing.

### Mock generation engine

A single `generatePost(topic, opts)` async function in `src/lib/mock-generator.ts`:
- Emits step updates via callback so the pipeline UI is real (not faked timing in JSX).
- Returns `{ post, hashtags, qualityScore, agentLogs }`.
- Uses topic-aware templates so different inputs produce different-looking posts.

### API integration layer (ready, not active)

`src/lib/api.ts` wraps Axios with the base URL from Settings. Exposes `generatePost`, `getHistory`, `deletePost`. A feature flag (`USE_MOCK = true`) routes to the mock engine today; flipping it to `false` calls the real backend. This means zero rework when your LangGraph API is ready.

### Design system

- Tailwind v4 (already configured) — Notion/Vercel-inspired minimal aesthetic
- Color tokens: neutral base + a single accent (deep indigo/violet) for CTAs and active states
- Typography: tight headings, comfortable body, monospace for "agent log" snippets
- Components: shadcn Card, Button, Input, Textarea, Select, Badge, Progress, Sonner toasts, Sidebar
- Framer Motion for: page transitions, pipeline step transitions, result card entrance, hashtag chip hover
- Lucide icons throughout
- Fully responsive; sidebar collapses to icons on tablet, drawer on mobile
- Dark/light/system theme via a small theme provider writing `class="dark"` on `<html>`

### Technical notes

- TanStack Start file-based routing (not React Router DOM — that's not supported here). Each page is its own route file under `src/routes/` with its own `head()` metadata.
- State: React local state + a tiny `useHistory` hook backed by localStorage.
- New deps: `axios`, `framer-motion`, `html-to-image`.
- No auth, no database (per your choice). Settings + history persist in localStorage.

### Out of scope for v1

- Firebase / Lovable Cloud auth and Firestore
- Real WebSocket/SSE streaming (pipeline is simulated; structure is ready for polling later)
- Real backend wiring (toggle `USE_MOCK` once endpoints exist)
