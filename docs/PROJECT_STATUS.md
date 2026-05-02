# Project Status — needyHelpApp

> Living document. Update at the **end of every working session** so the next session (human or AI) can pick up without re-reading the codebase.

_Last updated: 2026-05-03 (landing page + user mgmt + profile shipped)_

---

## TL;DR

App boots end-to-end. **Full auth flow + role-aware user management is live.** New marketing landing page (hero / impact band / features / how-it-works / CTA / footer). Backend `User` model expanded with `role`, `verified`, `phone`, `district`, `pincode`, `language`, `bio`, `avatarUrl` + `timestamps`. New endpoints `GET/PATCH /v1/user/me` and `POST /v1/user/change-password`. Frontend `Profile` page (Profile + Security tabs), avatar dropdown menu in dashboard header, profile-completion banner, `RoleRoute` helper, Tamil Nadu districts constant. Domain modules (Sponsor-a-Student, Scholarship Tracker) are next.

## How to run

```powershell
cd needyHelpBackend ; node src/server.js     # https://localhost:4000
cd needyhelp-ui     ; npm start              # http://localhost:3000
```
Or `npm run dev` from the repo root.

> First time: open `https://localhost:4000` once and accept the self-signed cert, otherwise the browser will block the auth API calls.

---

## ✅ Done

### 2026-05-03 — Landing + user mgmt + profile
- **Landing page**: full multi-section marketing layout — hero (eyebrow + gradient headline + dual CTA + trust row), impact band (4 stats), features grid (Sponsor-a-Student / Scholarship tracker — "Coming next"), how-it-works (3 steps), CTA card, footer.
- **Modern Navbar**: glass header with sticky `scrolled` state, react-scroll for in-page anchors, conditional Sign in / Get started / Dashboard depending on auth state. Mobile sidebar updated to match.
- **Backend `User` model expansion**: `role` (donor/student/teacher/admin), `verified`, `phone`, `district`, `pincode`, `language` (en/ta), `bio`, `avatarUrl`, Mongoose `timestamps`, indexes on `emailId` + `role` + `district`. New `toPublicJSON()` and `ROLES` export.
- **Backend endpoints**: `GET /v1/user/me`, `PATCH /v1/user/me` (whitelisted fields, role-switch resets `verified`), `POST /v1/user/change-password` (verifies current, invalidates all refresh tokens, clears cookie). Role baked into access JWT.
- **Backend `verifyJWT`**: now sets `req.user = { _id, role }`. New `requireRole(...roles)` middleware exported. Refresh-cookie `maxAge` bumped to 7d + `sameSite: 'lax'`. Login/signup/refresh now return `{ accessToken, user }`.
- **Frontend `AuthContext`**: hydrates full user via `/me`, exposes `updateProfile`, `changePassword`, `refreshUser`, `hasRole`.
- **Profile page** (`/profile`): tabs (Profile / Security), edit form (name, role, phone, language, district dropdown, pincode, avatarUrl, bio with counter), inline validation, change-password flow with re-login.
- **Dashboard**: avatar dropdown menu (initials/photo + name + role + verified badge), profile-completion banner if district/phone missing, personalised greeting.
- **`<RoleRoute>`** helper for role-gated routes. **TN districts** constant (`src/utils/tn-districts.js`).

### 2026-05-02 — Initial auth + UI

#### Infra & docs
- `.gitignore` hardened (`.env`, `*.key`, `*.crt`, `*.pem`, build, node_modules).
- `.env.example` template added.
- Backend `start` script split: `start` = `node`, `dev` = `nodemon`.
- Resume-context system: `.github/copilot-instructions.md` (auto-loaded), `docs/PROJECT_STATUS.md` (this file), `docs/ROADMAP.md`.
- UI / UX principles + AI-assisted workflow rules added to copilot-instructions.

### Backend (`needyHelpBackend`)
- Express + helmet + cors (`origin: localhost:3000`, `credentials: true`) + morgan + cookie-parser.
- HTTPS on port 4000, MongoDB Atlas via Mongoose.
- `User` model with bcrypt + refresh-token array.
- Endpoints under `/v1/user`: `POST /signup`, `POST /login`, `GET /logout`, `GET /refresh` (rotation + reuse detection), `GET /:id` (verifyJWT), Google OAuth scaffold.
- Bug fix: `clientId/clientSecret` import in `controllers/user.js`.
- Bug fix: Google `failureRedirect` → `/v1/user/failure`.
- Token TTLs: access `15m`, refresh `7d`.

### Frontend (`needyhelp-ui`)
- **Routing** (`src/App.js`) via `BrowserRouter`: `/`, `/login`, `/signin`→`/login`, `/signup`, `/about`, `/contact`, `/dashboard` (protected), `*` error fallback.
- **Auth** (`src/context/AuthContext.jsx`):
  - On mount, silently calls `/v1/user/refresh` to restore session from httpOnly cookie.
  - Access token kept **in memory only** (never in localStorage).
  - `login`, `signup`, `logout` helpers.
- **API client** (`src/api/client.js`):
  - `axios` with `withCredentials: true`.
  - Request interceptor injects `Authorization: Bearer …`.
  - Response interceptor: on 403 → single-flight refresh → retry the original request once.
- **`<ProtectedRoute>`** (`src/components/common/protected-route.jsx`).
- **Modern Login + Signup** pages (`src/components/auth/`):
  - Glassmorphism card, gradient hero background, dotted-grid mask.
  - Inline field validation on blur, `aria-invalid`, password rule hint.
  - Submit disabled while pending; surfaces server errors inline + via toast.
  - Google OAuth button.
- **Modernized `CustomButton`** with primary + ghost variants, gradient + hover lift + focus ring.
- **Dashboard** (protected) — header, stat cards, empty state, sign-out.
- **About / Contact / ErrorPage** — minimal but on-brand.
- **Design tokens** (`src/utils/color.scss`) — full palette, radius, shadow, gradient, easing.
- Global CSS reset + system font stack + `prefers-reduced-motion` honored.
- `react-hot-toast` Toaster wired (themed).
- Landing page button + navbar/sidebar links now point to real routes (`/signup`, `/login`).

---

## 🔴 Known issues / tech debt

| # | Severity | Area | Issue |
|---|----------|------|-------|
| 1 | **Critical** | Secrets | `needyHelpBackend/.env` has live Atlas password, JWT secrets, Google client secret committed to history. **Rotate all of them**, then scrub history (`git filter-repo` / BFG). |
| 2 | Medium | Frontend | First page load may show a blink while `/refresh` runs. Acceptable, but could show a branded splash. |
| 3 | Medium | Frontend | Self-signed HTTPS cert on backend means user must accept the cert once or auth calls will silently fail. Consider `mkcert` or a CRA proxy. |
| 4 | Low | Frontend | `Dashboard` is a shell — needs real data once `/v1/requests` exists. |
| 5 | Low | Backend | `failure` route returns nested `res.send().json(...)` — call works but is non-idiomatic. |
| 6 | Low | Build | CRA + react-scripts 5 deprecated — Vite migration deferred to P3. |

---

## 🔜 Next up (priority order)

### P1 — Sponsor-a-Student module (chosen direction)
- [ ] `StudentRequest` model: `studentName`, `class`, `schoolName`, `district`, `medium` (Tamil/English), `category` (books/uniform/exam-fee/transport/other), `description`, `amount`, `deadline`, `photoUrl?`, `postedBy`, `verifiedBy?`, `status` (`open|claimed|funded|delivered|confirmed|closed`), `claimedBy?`, `proofUrl?`, timestamps.
- [ ] Endpoints `/v1/student-requests`: list (filter district/class/category/status), get, create (teacher only — `RoleRoute` + `verified=true`), claim, mark-funded, upload-proof, confirm-delivery.
- [ ] Pages: `/students` (browse with filters + skeleton), `/students/:id` (detail with UPI deep link), `/students/new` (teacher-gated form).
- [ ] Dashboard tabs: My Sponsored / Pending Confirmations / (admin) Pending Verifications.
- [ ] Anti-fraud v1: cap unverified teachers at 3 active requests; admin verification workflow.

### P2 — Scholarship Tracker
- [ ] Read-only seed of TN/India govt scholarships (Pre/Post-Matric, BC/MBC, INSPIRE, AICTE) — eligibility checker + deadline reminders.

### P3 — Polish & infra
- [ ] CRA → Vite, TypeScript.
- [ ] Tests (Supertest + RTL).
- [ ] GitHub Actions CI; Dockerfile; deploy.

---

## In-progress

_(none — last session shipped P0 auth bundle)_

## Decisions log

- 2026-05-02 — Adopted layered "resume context" system: `.github/copilot-instructions.md` + `docs/PROJECT_STATUS.md` + `docs/ROADMAP.md`.
- 2026-05-02 — Refresh tokens stored in `httpOnly` cookie; access tokens in memory only (no `localStorage`).
- 2026-05-02 — Switched from `createBrowserRouter` data-router API to `<BrowserRouter><Routes>` to allow context providers (`AuthProvider`) above the routes.
- 2026-05-02 — Single-flight refresh interceptor: parallel 401s queue behind one `/refresh` call to avoid token-rotation race.
- 2026-05-02 — Dark-theme-firslanding redesign + user mgmt + profile)_

## Decisions log

- 2026-05-03 — Product narrowed to **Tamil Nadu poor students** (Sponsor-a-Student + Scholarship Tracker as M2). Generic `HelpRequest` model deferred in favour of domain-specific `StudentRequest`.
- 2026-05-03 — User roles: `donor | student | teacher | admin`. Teachers post on behalf of students; require admin `verified` flag before posting (anti-fraud).
- 2026-05-03 — JWT access token now carries `role` (so `verifyJWT` populates `req.user = { _id, role }` and `requireRole(...)` middleware can gate endpoints).
- 2026-05-03 — `User.toPublicJSON()` is the canonical shape returned to the client; `password` and `refreshtoken` never leave the server.
- 2026-05-03 — TN districts kept as a **static constant** (`src/utils/tn-districts.js`) — no API call needed.