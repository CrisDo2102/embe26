# Architecture Decision Record

## ADR 001 — Keep the experience content-first

**Status:** Accepted

The product is a personal keepsake, not a management dashboard. Content and atmosphere lead; controls should stay quiet and purposeful. Interactions are introduced only where they support remembering, reading, browsing or saving.

### Consequences
- A single narrative landing page is the primary experience.
- The design system uses paper, ink, muted red and sage.
- Feature additions must preserve reading rhythm and emotional tone.
- Utility UI is restrained, keyboard-accessible and hidden when not needed.

## ADR 002 — Next.js App Router with TypeScript

**Status:** Accepted

Next.js provides routing and server route handlers in the same repository. TypeScript makes content shapes and service boundaries explicit. React remains responsible for client interactions such as lightbox, audio and local keepsakes.

### Consequences
- HTTP endpoints live under `src/app/api`.
- Interactive components opt into client execution.
- Route handlers return JSON with explicit cache headers.
- Type checking remains a separate step from bundling.

## ADR 003 — Domain service and repository boundary

**Status:** Accepted

Components should not know how memories are stored. `MemoryService` accepts a `MemoryRepository`; the current implementation adapts local content. A database-backed adapter can be introduced behind the same interface.

### Repository contract
- `list()` returns detached records.
- `findById(id)` returns one record or `undefined`.
- Adapters must not mutate shared domain records.
- Storage-specific errors should be translated at the service/API boundary.

## ADR 004 — Local-first keepsake notes

**Status:** Accepted for the current milestone

The keepsake panel stores notes in browser localStorage. This avoids collecting private content on a server before authentication, consent and retention policies exist.

### Limitations
- Notes do not follow the user to another browser/device automatically.
- Private browsing and browser cleanup may remove them.
- The interface clearly communicates local-only behavior.

### Update (see ADR 010)
Export/import to a JSON file now exists, so notes can be backed up and moved by hand. Step 4 of the migration path below is therefore already done.

### Future migration path
1. Define account ownership and consent expectations.
2. Add server-side validation and authentication.
3. Add a database migration and repository implementation.
4. ~~Provide export/import before migrating existing local notes.~~ Done (ADR 010).
5. Preserve local mode as an offline fallback if useful.

## ADR 005 — Unicode-safe typography

**Status:** Accepted

The UI uses a stack of display serif fonts and system sans-serif fallbacks. The layout must remain readable if an external font provider is blocked. Avoid using decorative fonts for Vietnamese paragraphs, dates or controls.

### Review checklist
- Check `ă â đ ê ô ơ ư` and all tone marks.
- Check uppercase labels and italic headings.
- Check line wrapping on narrow screens.
- Avoid fixed heights around translated text.
- Use semantic headings instead of styling arbitrary text.

## ADR 006 — Motion with an escape hatch

**Status:** Accepted

Motion supports gentle entrance and gallery transitions. CSS honors `prefers-reduced-motion`, and the quiet-mode control reduces transitions for users who prefer a calmer page.

### Update
`MotionProvider` wraps the app in Motion's `MotionConfig` (`reducedMotion="user"`, or `"always"` in quiet mode) and toggles an `html.quiet-mode` class for CSS. Previously quiet mode only affected CSS, so animations driven by JavaScript kept running. The hero entrance is now pure CSS, which also makes it respect both switches without extra code.

### Rules
- Never encode essential information only in animation.
- Keep transitions short and interruptible.
- Avoid animating large background surfaces on every scroll.
- Check focus behavior when dialogs open and close.
- Respect reduced-motion settings in future components.

## ADR 007 — Static-first rendering, no root `loading.tsx`

**Status:** Accepted

`app/page.tsx` is a Server Component. Copy, timeline, letter and hero are plain HTML; client JavaScript is limited to interactive islands (explorer, gallery, keepsakes, player, scroll-reveal). The hero entrance animation is CSS, so the headline and the photo are visible in the very first paint rather than waiting for hydration.

The root `loading.tsx` was **removed**. For a statically prerendered page it wraps the whole page in a Suspense boundary: the served HTML then contains the loading screen, the real content sits inside `<div hidden id="S:0">` and is swapped in by an inline script. Measured effect: a flash of the loading screen on every visit, a delayed largest-contentful-paint element, and visitors without JavaScript (or link-preview bots) seeing only "Đang mở chiếc hộp nhỏ…". `scripts/smoke.mjs` fails if that structure ever returns.

### Consequences
- Add a `loading.tsx` only to a *segment* that does real async work, never to the root of a static page.
- Scroll-reveal content starts at `opacity: 0`; a `<noscript>` rule in the layout keeps it visible without JavaScript.
- Images use `next/image` with intrinsic `width`/`height` declared in `data/memories.ts`; `SafeImage` shows a placeholder of the same size when a file is missing.

## ADR 008 — Testing pyramid and quality gates

**Status:** Accepted

| Layer | Tool | What it proves |
| --- | --- | --- |
| Unit | Vitest | Pure logic: search, dates, validation, keepsake sanitizing/merging, API helpers. |
| Component | Vitest + Testing Library (jsdom) | Behaviour and accessibility of each interactive component, including failure modes (blocked storage, 404, aborted requests). |
| HTTP smoke | `scripts/smoke.mjs` | The real production server: SSR output, headers, caching, image optimization, error shapes. |
| End-to-end | Playwright (desktop + mobile Chromium) | Whole journeys in a real browser; no console/CSP errors; works without JavaScript; axe-core WCAG 2.2 A/AA scan. |

`npm run check` (typecheck + lint + unit/component) is the pre-commit gate; CI additionally runs coverage thresholds, build, smoke and e2e. Rules: every fixed bug gets a regression test; tests assert behaviour, not implementation; coverage thresholds only ratchet upward.

## ADR 009 — Security headers and a pragmatic CSP

**Status:** Accepted, with a known trade-off

`next.config.ts` sends a Content-Security-Policy plus `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, COOP and HSTS. Everything is locked to the site's own origin (no third-party scripts, frames, plugins or form targets).

**Trade-off:** `script-src` includes `'unsafe-inline'` because Next.js emits inline bootstrap scripts. A nonce-based policy would be stricter but forces every page to be rendered per request, losing static prerendering. There is no user-generated HTML anywhere in the app, which keeps the practical exposure small. Revisit if the app ever renders untrusted HTML or adds third-party embeds.

The site is `noindex` by default (metadata + `robots.txt`) and link previews carry no image, because it is a private keepsake. `NEXT_PUBLIC_ALLOW_INDEXING=true` opts in.

## ADR 010 — Resilient browser storage

**Status:** Accepted

Anything read from `localStorage` or an imported file is untrusted. All of it flows through `sanitizeKeepsakeItems`, which accepts the legacy `{ id, text, date }` shape (so upgrades lose nothing), drops unusable entries, clamps length, normalizes Unicode and timestamps and de-duplicates.

`createKeepsakeStore` exposes the notes to React through `useSyncExternalStore`. It never throws: storage may be blocked outright, full, or contain junk. On a failed write the notes stay in memory for the session and the UI says they will not persist. Other tabs are kept in sync via the `storage` event.

Import merges instead of overwriting: duplicates are skipped, the result is ordered newest-first, and only the oldest notes beyond the 30-note capacity are dropped, with a count shown to the user. `crypto.randomUUID` is guarded because it does not exist on plain-HTTP origins (for example, testing from a phone over the LAN).

## ADR 011 — Search semantics for Vietnamese

**Status:** Accepted

- Text is compared in NFC, because keyboards and paste can deliver decomposed (NFD) characters that never equal the stored text.
- Matching is accent-insensitive (`hen ho` finds `hẹn hò`; `đ` is folded explicitly because it has no Unicode decomposition).
- Every word of the query must match, in any order.
- Matches with the exact accents rank above accent-folded matches; ties keep source order.
- Only categories that contain records are offered as filters.

## Dependency direction

```text
app route / page
   ├── components
   ├── domain service
   └── presentation helpers

API route
   └── domain service
        └── repository interface
             └── local adapter / future database adapter
```

Domain code must not import components, browser globals or Next.js UI. Components may import domain types. Browser storage is reached only through `lib/storage` (the keepsake store and the quiet-mode preference), never directly from a component.

## API error policy

- Validate query parameters at the boundary (`lib/utils/validation.ts`).
- Limit input length before searching.
- Return stable JSON shapes. Errors are always `{ error: { code, message } }`, produced by `lib/api/respond.ts`.
- Domain errors carry a safe message and a code (`INVALID_INPUT` → 400, `NOT_FOUND` → 404, `STORAGE_UNAVAILABLE` → 503); anything else becomes a generic 500 and is logged by name and message only.
- Do not return stack traces or secrets to clients.
- Add explicit cache behavior to public read endpoints; list endpoints send an `ETag` and honour `If-None-Match`.
- If persistent writes are introduced, add auth, rate limiting and CSRF/origin strategy where applicable.

## Environment policy

- `.env.local` is developer-specific and should not be committed.
- `NEXT_PUBLIC_*` values are public client configuration, never secrets.
- Document every optional environment variable in `.env.example` (and the README table).
- Production values belong in the deployment platform's secret/configuration manager.
