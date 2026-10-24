# Quality plan and release checklist

This document describes repeatable checks for the project. The requirements are framework-neutral; the table below shows which ones are now enforced automatically (see ADR 008) and which still need a person.

## 0. Automation map

| Check in this plan | Enforced by |
| --- | --- |
| Hero, intro and first photo visible; readable without network/JS | `e2e/journeys.spec.ts` (JavaScript disabled), `scripts/smoke.mjs` (server-rendered HTML) |
| Lightbox: dialog role, Escape, arrows, backdrop, focus trap, focus returns | `Gallery.test.tsx`, `e2e/journeys.spec.ts` |
| Broken image keeps its layout; missing audio is understandable; autoplay refused | `SafeImage.test.tsx`, `MusicPlayer.test.tsx`, `e2e/journeys.spec.ts` |
| Keepsakes: blank, limits, emoji, reload, remove, cap of 30, corrupt/blocked storage | `MemoryKeepsake.test.tsx`, `keepsake-store.test.ts`, `serialize.test.ts`, `service.test.ts`, `e2e/journeys.spec.ts` |
| Search: diacritics, quick changes, no match, error and loading states | `service.test.ts`, `MemoryExplorer.test.tsx`, `api.test.ts`, `e2e/journeys.spec.ts` |
| No horizontal overflow (desktop and 390px phone) | `e2e/journeys.spec.ts` |
| Accessibility: labels, names, contrast, headings, landmarks, reduced motion | `e2e/a11y.spec.ts` (axe WCAG 2.2 A/AA), `page.test.tsx`, `QuietMode.test.tsx` |
| API contract: health, memories, unknown category, ETag, error shape, no leaked internals | `api.test.ts`, `respond.test.ts`, `scripts/smoke.mjs` |
| Security headers, no `x-powered-by`, no console/CSP errors | `scripts/smoke.mjs`, `e2e/journeys.spec.ts` |
| Image formats, dimensions, cache headers, soundtrack not preloaded | `scripts/smoke.mjs`, `data/memories.test.ts`, `MusicPlayer.test.tsx`, `e2e/journeys.spec.ts` |
| Install from lockfile, typecheck, lint, production build | `.github/workflows/ci.yml` |

**Still manual:** real-device checks, a screen-reader pass, 200% zoom, Safari/WebKit and Firefox (the e2e suite runs Chromium only), visual taste, licensing of photos and music, and everything under "After deploying".

The sections below remain the source of truth for *what* should hold.

## 1. Core journeys

### Read the story
- Load `/` on a fresh browser profile.
- Confirm the hero title, Vietnamese intro and first photo are visible.
- Use each navigation link and confirm the matching section enters the viewport.
- Use the browser's back-to-top link after scrolling.
- Verify that content remains readable with external network access disabled.

### Browse photographs
- Tab to a photo card and activate it with Enter or Space.
- Confirm the lightbox announces itself as a dialog.
- Use Escape to close.
- Use left/right arrows to move between photos.
- Click the backdrop to close.
- Click inside the image area and verify that it does not close unexpectedly.
- Test an image URL that returns 404 and verify that the layout does not collapse.
- Confirm alt text describes the image rather than repeating decorative text. (`alt` is optional in `data/memories.ts` and falls back to the title, so review each photo by hand.)

### Read the letter
- Scroll through the letter and reasons list.
- Activate the surprise button repeatedly.
- Confirm each reveal is announced in a sensible reading order.
- Start music only after an explicit user action.
- Pause and resume music.
- Test a missing audio file and confirm the error is understandable.
- Check that the site remains usable if autoplay is blocked.

### Save a keepsake
- Type whitespace only and confirm it cannot be saved.
- Save a short Vietnamese sentence.
- Save text containing emoji and punctuation.
- Reload the page and confirm the note remains.
- Remove one note and confirm other notes remain.
- Add many notes and confirm the collection caps at 30.
- Enter 180 characters and confirm the limit is enforced.
- Try 181 characters and confirm the UI keeps the input bounded.
- Clear browser storage and confirm the empty state is understandable.
- Verify that the UI states notes are local to the current browser.

### Search memories
- Search for a title substring.
- Search for a word with Vietnamese diacritics.
- Change category and query in quick succession.
- Search for a phrase that matches nothing.
- Test the loading, error and empty states.
- Confirm the URL query is bounded and encoded.
- Navigate the results with keyboard only.
- Expand a result and confirm its description is visible.

## 2. Responsive review

### 320–374px
- No horizontal page overflow.
- Hero heading does not overlap the photo frame.
- Buttons can wrap without clipping.
- Navigation links remain reachable.
- Keepsake action buttons fit or wrap naturally.
- Lightbox controls remain inside the viewport.
- Form controls do not become narrower than their text.

### 375–600px
- Check title wrapping and image cropping.
- Confirm timeline columns have enough space.
- Confirm gallery cards do not create awkward isolated rows.
- Confirm textarea and select controls have usable tap targets.
- Check that floating controls do not cover the primary CTA.

### 601–800px
- Confirm two-column hero remains balanced or collapses cleanly.
- Check photo aspect ratios and captions.
- Ensure section headings do not collide with side descriptions.
- Verify the keepsake grid collapses at the intended breakpoint.

### 801–1280px
- Confirm line lengths remain comfortable.
- Ensure decorative notes stay within the viewport.
- Check the max-width behavior for reading content.
- Confirm the page does not become an overly wide text wall.

### 1281px and wider
- Preserve whitespace and editorial rhythm.
- Avoid stretching paragraph measure across the entire screen.
- Check the photo frame and side annotations.
- Confirm decorative background shapes do not obscure content.

## 3. Accessibility review

- Every interactive element is reachable by keyboard.
- Focus indicators remain visible against paper and ink colors.
- No control relies only on color to communicate state.
- Image alt text is meaningful and concise.
- Form fields have accessible labels.
- Empty, loading and error states are announced where appropriate.
- Dialogs have names and an Escape close path.
- `prefers-reduced-motion: reduce` minimizes transitions.
- Zoom to 200% without loss of content or functionality.
- Test at least one screen reader/browser combination before release.
- Touch targets should be comfortably large on mobile.
- Heading levels describe document structure rather than visual size alone.

## 4. Typography and localization

Test these Vietnamese samples in headings, paragraphs, form fields and buttons:

- `ă â đ ê ô ơ ư`
- `Ánh nắng, những ngày bình thường và lời thương.`
- `Mình muốn giữ lại điều nhỏ bé này.`
- `Thương em nhiều, hôm nay và cả những ngày sau.`
- `Tụi mình sẽ có thêm nhiều kỷ niệm đẹp nhé.`

Review:
- Font fallback while offline.
- Bold and italic glyphs.
- Punctuation next to emoji.
- Long words and no-break text.
- Browser font scaling.
- Line-height in captions.
- No clipping caused by fixed-height text containers.

## 5. API contract checks

### Health endpoint
- `GET /api/health` returns HTTP 200 when the app responds.
- Response includes a stable `status` string.
- Timestamp is a valid ISO-8601 value.
- `Cache-Control` prevents stale health status.
- The response never includes environment secrets.

### Memories endpoint
- `GET /api/memories` returns `{ data, meta }`.
- `q` is capped before filtering.
- Unknown category falls back to `all`.
- A category filter and query can be combined.
- An empty result is a successful response, not a server error.
- Cache headers match the public, read-only nature of the endpoint.
- Records returned by the repository do not expose mutable shared arrays.

## 6. Security and privacy

- Never put credentials in source files.
- Do not store private user content on a server without clear consent.
- Treat all imported JSON as untrusted.
- Escape user content if it is ever rendered as HTML.
- Keep user-generated text as text nodes, not raw HTML.
- Bound text inputs and query strings.
- If authentication is introduced, verify ownership on every write/read.
- Add rate limiting before exposing public write endpoints.
- Add retention and deletion policies before collecting personal data.
- Document whether backups contain private content.
- Avoid logging the body of personal messages.
- Do not assume localStorage is encrypted or safe for secrets.

## 7. Performance review

- Use lazy loading for below-the-fold images.
- Keep image dimensions stable to avoid layout shifts.
- Avoid expensive event listeners on every component.
- Debounce server search only if the content volume justifies it. (The explorer debounces at 180 ms, aborts superseded requests and caches results per query.)
- Keep animation limited to opacity and transform where possible.
- Check production build output before adding dependencies.
- Compress source photos appropriately.
- Prefer modern image formats when all target browsers support them.
- Verify that cache headers do not accidentally cache private data.
- Inspect bundle size after adding a new library.

## 8. Release checklist

### Before merging
- [ ] Code uses clear names and explicit types.
- [ ] No dead code or placeholder links remain.
- [ ] No accidental console logs or debug-only UI.
- [ ] Loading, empty and error states are present where needed.
- [ ] No secrets or private machine paths are committed.
- [ ] README reflects actual functionality.

### Before deploying
- [ ] Install from the lockfile.
- [ ] Run typecheck.
- [ ] Run production build.
- [ ] Test the production server, not only the dev server.
- [ ] Check API endpoints on the deployment URL.
- [ ] Check environment configuration.
- [ ] Confirm the relationship date is configured only if accurate.
- [ ] Confirm image and audio assets are licensed for intended use.
- [ ] Check mobile layout on a real device.
- [ ] Keep a rollback path for the previous deployment.

### After deploying
- [ ] Open the home page in a private browser session.
- [ ] Check browser console and server logs.
- [ ] Confirm no asset paths point to a developer's machine.
- [ ] Confirm health endpoint status.
- [ ] Check a missing route and a missing image.
- [ ] Revisit the keepsake privacy statement.
- [ ] Capture a baseline screenshot for future visual regression.
