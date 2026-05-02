# Roadmap — needyHelpApp

## Vision

A trustworthy platform where anyone can **post a need** (food, clothes, education materials, medical help, money) and **anyone can fulfill it**. Optimized for low-friction posting, local discovery, and accountability.

## Personas

- **Requester** — person/family in need; can post requests, attach photos, accept help.
- **Donor** — person who wants to help; browses requests, filters by location/category, claims & fulfills.
- **Admin** — moderates content, removes spam/abuse, verifies high-value requests.

## Milestones

### M1 — Working auth (P0) — _next_
Real signup/login UI, refresh-token cycle on the client, protected dashboard. **Definition of done:** A new user can sign up, log out, log back in, hit `/dashboard`, and stay logged in across page reloads.

### M2 — Help requests MVP (P1)
Create / browse / detail / claim / fulfill help requests with category & city filters and image upload. **Definition of done:** Two users on different browsers can interact through one request from creation to fulfillment.

### M3 — Engagement (P2)
In-app chat after claim, email notifications, geo search, ratings. **Definition of done:** A claim triggers an email + chat thread; donors can rate completed transactions.

### M4 — Productionize (P3)
TypeScript + Vite, RTK, tests, CI/CD, Docker, deploy. **Definition of done:** Push-to-main deploys automatically; staging + prod environments.

## Non-goals (for now)

- Payments / money transfer (stick to in-kind donations + external links).
- Mobile apps (web responsive only).
- Multi-language (English only initially).

## Open questions

- Should requests be moderated **before** going live, or post-publish with report flow?
- Should anonymous donors be allowed?
- KYC for high-value monetary requests?
