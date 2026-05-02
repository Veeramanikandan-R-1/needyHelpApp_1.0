# Copilot Instructions — needyHelpApp

> This file is auto-loaded by GitHub Copilot Chat in VS Code for every conversation in this workspace.
> Update it when conventions, structure, or priorities change.
> When resuming work, also read [docs/PROJECT_STATUS.md](../docs/PROJECT_STATUS.md) for the current state and [docs/ROADMAP.md](../docs/ROADMAP.md) for direction.

## Project

A web platform connecting **donors** with **people in need**. Users can post help requests (food, clothes, money, education, etc.) and donors can browse and fulfill them.

## Stack

- **Frontend** (`needyhelp-ui/`): React 18 + react-router-dom v6 + SCSS, CRA (`react-scripts` 5).
- **Backend** (`needyHelpBackend/`): Node + Express, Mongoose (MongoDB Atlas), JWT auth (access + refresh), bcryptjs, helmet, cors, cookie-parser, morgan, passport-google-oauth20.
- Backend runs over **HTTPS on port 4000** with a self-signed cert (`certificate.crt`, `privatekey.key`).
- Frontend runs on **http://localhost:3000**.
- Root `package.json` orchestrates both via `concurrently`: `npm run dev`.

## Repo layout

```
needyhelp-ui/        # React app
  src/
    components/      # feature folders: landing-page, dashboard, login, about, contact, common
    redux/           # (empty - reserved)
    utils/color.scss # design tokens ($primaryColor, $primaryBlack, $primaryWhite)
needyHelpBackend/
  src/
    server.js        # https server bootstrap
    routes.js        # mounts /v1/user
    controllers/     # route handlers (express Router per resource)
    models/          # mongoose schemas
    db/connection.js # mongoose singleton
    utils/           # auth (verifyJWT), validator, constants
  config.js          # reads .env
  .env               # secrets (gitignored)
```

## Conventions

- API base: `/v1/<resource>` (e.g. `/v1/user`, future: `/v1/requests`).
- JSON only. Errors as `{ error: "<message>" }` with appropriate HTTP status.
- Auth: `Authorization: Bearer <accessToken>` header. Refresh token stored in `httpOnly` `jwt` cookie.
- Refresh-token rotation + reuse detection is implemented in `controllers/user.js` — preserve this pattern.
- Frontend imports SCSS per component (`./index.scss`) and uses `@import "../../utils/color.scss";` for tokens.
- Use `react-icons` (already installed) for icons. Use `react-scroll` for in-page anchor nav on the landing page.
- New protected routes on the backend: wrap with `verifyJWT` from `src/utils/auth.js`.
- New protected routes on the frontend: wrap with `<ProtectedRoute>` (see `src/components/common/protected-route.jsx` once added).

## Running

```powershell
# from repo root
npm run install   # installs both
npm run dev       # runs backend + frontend together

# or individually
cd needyHelpBackend ; node src/server.js
cd needyhelp-ui     ; npm start
```

Browser will warn about the self-signed cert on `https://localhost:4000` — accept it once.

## Security rules (do NOT regress)

- **Never commit** `.env`, `*.key`, `*.crt`, or any secret. They're in `.gitignore`.
- The currently-committed `.env` contains live Atlas + Google OAuth credentials that must be rotated; treat them as compromised.
- Always validate input at the controller boundary (`utils/validator.js`).
- Always hash passwords with `bcrypt` (10 salt rounds is fine).
- CORS must use `credentials: true` and an explicit origin (not `*`) since we use cookies.

## Coding style

- Keep changes minimal and focused. Don't refactor unrelated code.
- New frontend components: function components + hooks. No class components.
- New backend controllers: one Express `Router` per resource, exported as default.
- Prefer small files over giant ones; follow the existing per-feature folder layout.

## Reusability & easy-update rule (build it so future-me thanks present-me)

Every module should be **easy to update in one place**. Before adding any literal value, ask: "if this changes in 6 months, where would someone look?" If the answer isn't obvious, extract it.

- **Single source of truth for content/config.** Site name, owner contact info, social links, contact details → `src/config/site.js` (`SITE` export). Update one file, the whole app updates.
- **Domain constants** (TN districts, roles, categories, scholarship list) → `src/utils/<topic>.js` as named exports. Never inline lists in JSX.
- **Design tokens** → `src/utils/color.scss`. No magic colors/sizes/shadows in component SCSS.
- **API endpoints** → use the shared `api` axios instance from `src/api/client.js`. Never call `axios` directly in a component.
- **Reusable building blocks**: if a card / pill / form-field shape appears in 2+ places, lift to `src/components/common/`. Keep it dumb (props in, JSX out).
- **Per-feature folders**: `components/<feature>/index.jsx` + `index.scss` + sub-components in the same folder. Don't sprawl.
- **No copy-paste**. If you find yourself duplicating a block (especially form fields, list rows, dashboard cards) — extract a component or a hook on the second occurrence, not the third.
- **Backend**: one `Router` per resource, validation in `utils/validator.js`, role gates via `requireRole(...)`. Reuse `User.toPublicJSON()` style "shape" helpers for any model that's returned to the client.
- **Document the dial.** When you add a new config knob (env var, feature flag, role), add a one-liner to `docs/PROJECT_STATUS.md` Decisions log so it's discoverable.

## UI / UX principles (apply to every visual change)

- **Modern, production-ready styling.** Aim for the polish of Linear, Stripe, Vercel — not bootstrap-default. Dark theme primary; gradients, soft glassmorphism, generous whitespace, smooth micro-interactions.
- **Advanced UI patterns, simple solutions.** Use established patterns (skeleton loaders, optimistic UI, toast notifications, empty states, focus rings, keyboard shortcuts, command-palette where it fits) — but implement them with the minimum code that works. No premature abstraction.
- **Don't over-engineer.** Build the smallest thing that delivers the pattern. No giant context providers when a hook will do. No state library until two unrelated components need shared state.
- **Design tokens** live in `src/utils/color.scss`. Add new tokens (spacing, radius, shadow) there before sprinkling magic numbers.
- **Typography:** clear hierarchy, 1 display font for headings if needed, otherwise system stack. Never hardcode pixel sizes — use `rem`.
- **Accessibility is non-negotiable.** Real `<button>`/`<a>`, labels on all inputs, visible focus states, color contrast ≥ 4.5:1, `aria-*` where the semantics aren't clear.
- **Responsive first.** Mobile layout is the default; scale up with `@media`. The existing breakpoint is 768px.
- **Animations:** subtle, < 300ms, ease-out. Use `transform`/`opacity` only (cheap to GPU). Honor `prefers-reduced-motion`.
- **Forms:** inline validation on blur, disable submit while pending, surface server errors as a toast or under the field.
- **Loading & error states are first-class.** Every async surface needs both. Skeletons preferred over spinners for content.
- **Icons:** `react-icons` only. Pick one set per feature (don't mix `Fa*`/`Io*`/`Hi*` in one screen).

## Self-review checklist (run BEFORE writing & AFTER editing any UI)

Do this mentally — or out loud in the chat — every single time you touch a visual surface. If any answer is "no", fix it before moving on.

**Before coding** (30-second plan):
1. What's the user goal on this screen? What's the primary action?
2. Is there an existing pattern/component I should reuse instead of inventing?
3. What are the loading / empty / error states? (All three exist — design all three.)
4. What's the mobile layout? (Sketch it first; desktop is the easy case.)

**After coding** (accessibility + UX pass):
1. **Semantics** — Real `<button>` for actions, `<a>` for navigation, `<form>` for forms, `<label>` for every input.
2. **Keyboard** — Can I Tab through every interactive element in a sensible order? Does Esc close modals/menus? Enter submits forms?
3. **Focus** — Visible focus ring on every focusable element (uses `:focus-visible` from `App.scss`).
4. **Screen-reader hints** — `aria-label` on icon-only buttons, `aria-invalid`+`aria-describedby` on bad fields, `aria-expanded` on dropdowns, `role="dialog"`+`aria-modal` on modals.
5. **Contrast** — Body text ≥ 4.5:1, large/UI text ≥ 3:1. Don't put `$textSubtle` on `$bgElev1` for body copy.
6. **Hit targets** — Min 40×40px on touch. Stack tight buttons with gap, don't crowd.
7. **States** — Hover, focus, active, disabled, loading all styled. Disabled buttons show `cursor: not-allowed`.
8. **Responsive** — Test at 360px (small mobile), 768px (tablet), 1280px (desktop). No horizontal scroll. No overlapping elements.
9. **Motion** — All transitions ≤ 300ms, ease-out, only on `transform`/`opacity`. Honors `prefers-reduced-motion`.
10. **Empty + error + loading** — Async surfaces show skeletons or a branded loader, friendly empty states (not just "no data"), and surface errors via toast + inline.
11. **Copy** — Sentence case, no jargon, action-oriented buttons ("Save changes", not "Submit"). Error messages tell the user what to do, not what failed.
12. **Reuse check** — Did I duplicate a block I already have? Did I inline a constant that belongs in a config?

If you skipped any of these, call it out in your reply ("note: didn't add skeleton because…") rather than silently shipping it.


## AI-assisted development workflow

The user works with Copilot/Claude. Lean into it:

- **Always check** `docs/PROJECT_STATUS.md` first when resuming. Update it at the end of each session — that file is the agent ↔ human handoff contract.
- **Plan before coding** for any change touching ≥ 3 files. Use `manage_todo_list` so the user can see progress.
- **Batch tool calls.** Read multiple files in parallel; use `multi_replace_string_in_file` for related edits.
- **Use subagents** (`Explore`, etc.) for codebase research when you'd otherwise chain 5+ search/read calls.
- **Verify before declaring done.** After edits: check `get_errors`, run the dev servers if it's a runtime change, hit the endpoint with the proper auth flow.
- **Memory:** repo-scoped notes live under `/memories/repo/`. Persist learnings (gotchas, project-specific quirks) there so future sessions don't relearn.
- **Don't ask permission for trivial choices** (file location, naming inside an established convention). Pick the obvious answer and move on. Ask only when there's a real product decision.

## When resuming work

1. Read [docs/PROJECT_STATUS.md](../docs/PROJECT_STATUS.md) — current state, in-progress items, blockers.
2. Read [docs/ROADMAP.md](../docs/ROADMAP.md) — what's next and why.
3. Run `npm run dev` and verify both servers start.
4. Pick the next item from the **Next up** section of `PROJECT_STATUS.md`.
