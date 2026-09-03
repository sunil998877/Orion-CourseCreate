# ORION Course Creator — Full Project Documentation

**ORION** is an AI-driven course creation platform that turns a topic, audience, and instructional style into a complete multi-format learning product: curriculum modules, Gamma slide decks, PPTX exports, ElevenLabs audiobooks, two-host podcasts, and narrative PDF ebooks.

This document is the canonical technical and product reference for the current codebase, including **production deployment on [Render](https://render.com)** via `render.yaml`. It supersedes older notes in `README.md`, `FEATURES.md`, and `ARCHITECTURE.md` where those files disagree with the live routes and models.

| Item | Value |
|------|--------|
| Product | ORION Course Creator |
| Production frontend | `https://orion.evokeaisolutions.com` (custom domain → Render static site) |
| Hosting | **Render** — API web service + static frontend (`render.yaml`) |
| Render services | `orion-api` (Node), `orion-web` (static SPA) |
| Repo layout | Decoupled monorepo: `frontEnd/` + `Backend/` |
| Backend API prefix | `/api` |
| Health check | `GET /api/health` |
| Default local ports | Frontend `5173`, Backend `3000` |

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [Tech stack](#2-tech-stack)
3. [Repository structure](#3-repository-structure)
4. [System architecture](#4-system-architecture)
5. [User journeys](#5-user-journeys)
6. [Course creation wizard](#6-course-creation-wizard)
7. [AI generation pipelines](#7-ai-generation-pipelines)
8. [Credits, wallets, and billing](#8-credits-wallets-and-billing)
9. [Admin console](#9-admin-console)
10. [Authentication and security](#10-authentication-and-security)
11. [Database models](#11-database-models)
12. [Backend API reference](#12-backend-api-reference)
13. [Frontend architecture](#13-frontend-architecture)
14. [Environment variables](#14-environment-variables)
15. [Local development](#15-local-development)
16. [Render deployment (production)](#16-render-deployment-production)
17. [Background jobs](#17-background-jobs)
18. [Operations & troubleshooting](#18-operations--troubleshooting)
19. [Glossary](#19-glossary)

---

## 1. Product overview

ORION is built for instructional designers, trainers, and organisations that need to produce structured courses quickly. A creator configures a course once. ORION then generates:

- A **curriculum blueprint** of 10–15 minute modules (titles, objectives, teaching content, case studies, quizzes, further study).
- **Slide decks** via the Gamma API, with 60+ visual themes.
- **PPTX downloads** streamed through the backend.
- **Audiobooks** via ElevenLabs TTS, with transcripts.
- **Podcasts** as a two-host dialogue (Alex + Sam) with per-speaker voices.
- **Ebooks** as A4 PDFs (OpenAI narrative + Puppeteer/Chromium).

Usage is metered with a **credit wallet**. Users start on a Free plan, can subscribe to Pro/Team, or buy one-time top-ups. Payments go through **Razorpay** (INR). An **admin console** manages users, wallets, pricing rules, transactions, and generated courses.

### What ORION is not

- It is not an LMS. There is no student enrolment, progress tracking, or classroom delivery.
- It is not a live video platform. Voice output is generated audio, not a conferencing product.
- Step 3 (Resources) exists in older feature notes but is **not in the current wizard UI**. The live wizard is steps 1, 2, 4, and 5.

---

## 2. Tech stack

### Frontend (`frontEnd/`)

| Layer | Technology |
|-------|------------|
| UI | React 18 + TypeScript |
| Bundler | Vite 5 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion, Three.js, Lottie |
| Charts | Recharts |
| Toasts | react-toastify |
| Cropping | react-easy-crop |
| Icons | lucide-react, react-icons |
| Build output | Vite `dist/` (published by Render static site) |

### Backend (`Backend/`)

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ES modules), Node **20** on Render |
| Framework | Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| Uploads | multer (2 MB avatar limit, memory storage) |
| Email | Nodemailer (SMTP) and/or Resend API (`RESEND_API_KEY`) |
| AI text | OpenAI SDK (`gpt-4o` / `gpt-4o-mini`) |
| Slides | Gamma public API |
| Speech | ElevenLabs |
| PDF | Puppeteer-core + `@sparticuz/chromium` |
| Payments | Razorpay (primary), Stripe checkout still present as optional |
| Security | helmet, cors, express-rate-limit, express-mongo-sanitize |
| Start command | `npm start` → `node index.js` |

### Production hosting (Render)

| Layer | Technology |
|-------|------------|
| Blueprint | Root `render.yaml` |
| API | Web Service `orion-api` (`rootDir: Backend`) |
| SPA | Static Site `orion-web` (`rootDir: frontEnd`, publish `./dist`) |
| Database | MongoDB Atlas (external; `MONGODB_URI` on Render) |
| Custom domain | `https://orion.evokeaisolutions.com` → `orion-web` |
| Optional alt | Vercel / Docker configs remain in repo but are not the live path |

### External services

```
OpenAI     → course descriptions, module drafts, ebook narrative, audio/podcast scripts
Gamma      → slide deck generation and PPTX export
ElevenLabs → audiobook TTS and multi-voice podcasts
Razorpay   → credit top-ups and plan subscriptions (INR)
SMTP       → registration OTP and password-reset OTP
MongoDB    → users, courses, wallets, plans, transactions, pricing rules
```

---

## 3. Repository structure

```
courseCreator/
├── DOCUMENTATION.md          ← this file (full project + Render docs)
├── render.yaml               ← Render Blueprint (orion-api + orion-web)
├── README.md                 ← product overview
├── FEATURES.md               ← older feature matrix (partially stale)
├── ARCHITECTURE.md           ← older architecture notes (partially stale)
├── frontEnd/
│   ├── src/
│   │   ├── App.tsx           ← routes, providers, auth gates
│   │   ├── contextAPI/       ← course, credits, theme, wizard state
│   │   ├── pages/            ← user + admin pages
│   │   ├── components/       ← wizard, dashboard, credits, admin UI
│   │   ├── layout/           ← AppLayout, AdminLayout, Header, Sidebar
│   │   ├── services/         ← HTTP clients (course, wallet, admin, Razorpay)
│   │   ├── hooks/            ← audio/podcast players, notifications
│   │   ├── utils/            ← API base URL, themes, auth interceptor
│   │   └── types/            ← Course and credit TypeScript types
│   ├── vercel.json
│   └── package.json
└── Backend/
    ├── index.js              ← Express app, CORS, rate limits, route mount
    ├── config/               ← MongoDB, Razorpay, default credit plans
    ├── routes/               ← auth, courses, AI, ebook, wallet, Razorpay, admin
    ├── controllers/          ← one concern per controller file
    ├── models/               ← User, Course, ModuleContent, credits/*
    ├── middlewares/          ← JWT user auth, admin JWT
    ├── services/
    │   ├── creditService/    ← reserve / reconcile / refund / plans / recharge
    │   └── ebook/            ← HTML/PDF ebook builders
    ├── utils/                ← OpenAI client, JWT, SMTP email
    ├── seed/pricingRule.js   ← seed default pricing SKUs
    ├── Dockerfile
    ├── vercel.json
    └── .env.example
```

---

## 4. System architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser — orion-web (Render Static Site)                       │
│  Custom domain: orion.evokeaisolutions.com                      │
│  AppLayout │ Wizard │ Dashboard │ Credits │ Admin               │
│  CreditsContext + CourseDataProvider + JWT in localStorage      │
└───────────────────────────────┬─────────────────────────────────┘
                                │ REST + Bearer JWT
                                │ VITE_API_BASE_URL → orion-api
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  orion-api (Render Web Service, Node 20)                        │
│  helmet / CORS / rate-limit / mongo-sanitize / sessions         │
│  auth → courses → AI → ebook/audio/slides → wallet → Razorpay   │
│  Background: reservation cleanup + plan renewal (every 5 min) │
└─────────┬──────────────────┬──────────────────┬─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
   MongoDB Atlas        OpenAI / Gamma     Razorpay / SMTP
   User, Course         ElevenLabs         Resend (optional)
   Wallet, Plan
   PricingRule
   CreditTransaction
```

### Request flow for a billed AI action

1. Frontend calls a generation endpoint with `Authorization: Bearer <token>`.
2. `authenticateJWT` verifies the token and single-session `sessionId`.
3. Credit service looks up an active `PricingRule` by `actionKey`.
4. If `balance >= cost`, it creates a `RESERVE` transaction and increments `wallet.reserved`.
5. The provider call runs (OpenAI, Gamma, ElevenLabs).
6. On success: `RECONCILE` deducts reserved credits and increases `lifetimeUsed`.
7. On failure: `REFUND` / `RELEASE` restores the reserved amount.
8. A 5-minute worker expires stale reservations older than `RESERVATION_TIMEOUT_MINUTES` (default 15).

---

## 5. User journeys

### 5.1 Registration and login

1. User submits username, organisation, email, password, optional avatar (`POST /api/register`, multipart).
2. Password is hashed with bcrypt (10 rounds). Avatars are stored as a data-URI on the user document (max 2 MB).
3. If SMTP is configured and `SKIP_REGISTRATION_OTP` is not true, a 6-digit OTP is emailed (10-minute expiry).
4. User verifies OTP (`POST /api/verify-registration-otp`) and receives a 7-day JWT.
5. On login, ORION writes a new `activeSessionId`. A previous device with the old token is rejected (`Session expired. Logged in from another device.`).
6. Admin emails cannot register or log in on the user form; they must use `/admin/login`.

OTP can be skipped when `SKIP_REGISTRATION_OTP=true`, or automatically on Render/Vercel if SMTP is not configured.

### 5.2 Create and launch a course

1. Home (`/course-creator`) → **Architect New Course** (`/create-course`).
2. Wizard Step 1: level, title, audience, country, industry, standards, course style.
3. Wizard Step 2: AI description, duration, module count, Gamma theme.
4. Wizard Step 4: batch module blueprinting (OpenAI), preview, regenerate/refine.
5. Wizard Step 5: generate Gamma slides, download PPTX, launch course to dashboard.
6. Dashboard (`/course-dashboard`) lists courses and can generate audio, podcast, and ebook.

### 5.3 Buy credits or upgrade plan

1. Sidebar **CreditsTracker** or `/add-credits`.
2. Choose a top-up package or a Pro/Team plan.
3. Frontend loads Razorpay Checkout, creates an order (`POST /api/razorpay/order`), then verifies (`/verify-payment` or `/verify-plan`).
4. Wallet balance (or monthly allotment) is updated and a `RECHARGE` / `PLAN_RESET` ledger row is written.

---

## 6. Course creation wizard

The wizard lives in `frontEnd/src/components/CourseCreator/` and is driven by `CourseCreatorContext`. Visible steps are **1, 2, 4, 5** (step 3 is skipped in the UI).

### Step 1 — Basics (`CourseStepOne.tsx`)

| Field | Options / rules |
|-------|-----------------|
| Level | Beginner, Intermediate, Advanced, Professional |
| Title | Required, first letter auto-capitalised |
| Audience | Level-dependent dropdown plus custom tags |
| Country / region | Australia, Canada, India, United States, London (UK), or custom |
| Industry | Preset list + custom |
| Standards | Global (ISO/IEC), Regional, Industry Specific |
| Course style | Academic / Formal, Storytelling, Interactive Coaching, Humanized Teaching, Modern Edutainment, Scenario-Based |

### Step 2 — Structure (`CourseStepTwo.tsx`)

- AI-generated description (minimum 50 words, hard cap 5,000 words).
- Inline edit + full-screen modal + natural-language refine prompt.
- Duration value + unit (minutes / hours / days / weeks / months).
- Module count, with level-based suggestions.
- Gamma theme picker (60+ themes in 8 categories: Professional, Creative, Bold, Elegant, Warm, Soft, Unique).
- Optional resource URLs can still be stored on course data even though the old dedicated “Resources” step is gone.

### Step 4 — Generate / Preview (`CourseStepFour.tsx`)

- Confirms generation; core settings lock once blueprinting starts.
- Batch-generates all modules (`POST /api/generate-all-modules-draft`, concurrency 5).
- Progress overlay, per-module preview, regenerate, and refine.
- Theme can be set per module.

### Step 5 — Review & Launch (`CourseStepFive.tsx`)

- Specs snapshot and module list with estimated credit cost.
- Per-module or batch Gamma slide generation.
- PPTX download via backend proxy.
- **Launch** persists the course and sends the user to the dashboard.

Drafts are saved during the wizard (`POST /api/courses/save-course-data`). Starting a new course sets `sessionStorage.resetCourseData` so the form clears.

---

## 7. AI generation pipelines

### 7.1 Course description

- `POST /api/generate-course-description` — GPT builds a 50–150+ word academic description from title, audience, level, industry, standards, and style.
- `POST /api/refine-course-description` — applies a user prompt without regenerating from scratch.

### 7.2 Module blueprint

Each module is a structured JSON object:

```
Title
Objectives[]
TeachingContent[] { Topics, StandardsReference, ContentPoints[] }
CaseStudy { CaseStudyDescription, Questions[], ModelAnswers[] }
Quizzes[] { QuizDescription, Questions[], Answers[] }
VisualDescriptions[]
FurtherStudy { ExternalLinks[], BookReferences[] }
slides[], gammaUrl, gammaGenerationId, status
```

Rules enforced in the prompt:

- Style/tone follows the selected course style.
- Previous modules are passed in so topics do not overlap.
- Content is sized for a 10–15 minute instructional unit.
- If a named standard (DPDP, GDPR, HIPAA, etc.) is set, generation focuses on that standard.
- Module titles must not include “Module X:” prefixes.

Endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/generate-all-modules-draft` | Parallel batch (limit 5) |
| POST | `/api/generate-module-draft` | Single module outline |
| POST | `/api/generate-module` | Full single-module generation |
| POST | `/api/module-contents` | Persist module JSON |
| GET | `/api/module-contents` | Load saved modules |
| POST | `/api/chat` | Authenticated AI chat helper |

### 7.3 Gamma slides

- `POST /api/generate-module-slides-gamma` — one module.
- `POST /api/generate-all-slides-gamma` — sequential batch.
- Backend creates a Gamma generation, polls until complete, stores `gammaUrl` / `gammaGenerationId`.
- Slide generation **reserves** the `course_generation_gamma` pricing rule (seeded at 250 credits).
- `GET /api/courses/:courseId/modules/:moduleNumber/download-pptx` streams the PPTX with `Content-Disposition`.

### 7.4 Audiobook (ElevenLabs)

`POST /api/courses/:courseId/generate-audio`

1. GPT-4o-mini compresses course content into a voiceover script (kept under provider limits).
2. Long scripts are split into chunks under ~4,000 characters.
3. ElevenLabs TTS uses `VOICE_ID` plus stability / similarity / style settings.
4. MP3 + transcript are stored on the course (`audioUrl`, `audioTranscript`).
5. Dashboard player: play/pause, seek, speed (0.5x–2x), download, transcript modal.

### 7.5 Podcast

`POST /api/courses/:courseId/generate-podcast`

1. GPT-4o-mini writes a two-host dialogue: **Alex** (friendly co-host) and **Sam** (expert).
2. Sequential TTS with `PODCAST_HOST_A_VOICE_ID` and `PODCAST_HOST_B_VOICE_ID`.
3. Cached if already generated. Status: `idle | generating | completed | failed`.
4. UI shows dialogue bubbles and highlights the active turn from playback position.

### 7.6 Ebook PDF

`POST /api/courses/:courseId/generate-ebook`

1. Requires modules to exist.
2. GPT writes a practical, chaptered narrative (objectives, implementation, exercises, FAQ, glossary, CTA).
3. HTML is built (`services/ebook/`) with cover, TOC, running headers, Mermaid-friendly markup.
4. Optional OpenAI Assistant path via `OPENAI_EBOOK_ASSISTANT_ID`.
5. Puppeteer + serverless Chromium render A4 PDF with print backgrounds.
6. PDF is stored as base64 on `course.ebookData`.
7. `GET /api/ebooks/:courseId/download` serves the file.

Publisher name is collected in the dashboard before generation.

---

## 8. Credits, wallets, and billing

Credits are integer units. Floats are rejected at the schema layer.

### 8.1 Wallet

One wallet per user (`models/credits/wallet.js`):

| Field | Meaning |
|-------|---------|
| `balance` | Spendable credits |
| `reserved` | Credits locked in an in-flight generation |
| `lifetimeUsed` | Cumulative spent credits |
| `plan` | ObjectId → Plan |
| `renewsOn` | Next monthly allotment date |

A wallet is created on first access (typically Free plan + monthly allotment).

### 8.2 Default plans (`config/creditPlans.js`)

| Plan | Monthly credits | Price (INR) | Rollover |
|------|-----------------|-------------|----------|
| Free | 500 | ₹0 | No |
| Pro | 3,000 | ₹999 | Yes |
| Team | 10,000 | ₹2,499 | Yes |

Plans auto-insert if the `Plan` collection is empty. Due subscriptions are renewed by the 5-minute worker (`renewAllDueSubscriptions`).

### 8.3 Seeded pricing rules (`Backend/seed/pricingRule.js`)

| actionKey | Display name | Provider | Credits |
|-----------|--------------|----------|---------|
| `course_generation_gamma` | Generate Course | gamma | 250 |
| `course_outline_openai` | Generate Course Outline | openai | 10 |
| `workbook_openai` | Generate Workbook | openai | 20 |
| `quiz_openai` | Generate Quiz | openai | 8 |
| `podcast_elevenlabs` | Generate Podcast | elevenlabs | 15 |
| `rewrite_openai` | Generate Rewrite Content | openai | 5 |

Admins can change `creditCost` and `isActive` from **Pricing Rules**. Frontend display costs in `credits.types.ts` are UX hints; **the database rule is authoritative**.

### 8.4 Ledger types (`CreditTransaction`)

| type | When |
|------|------|
| `RESERVE` | Credits locked before a provider call (`PENDING`) |
| `RECONCILE` | Successful generation; reservation consumed |
| `REFUND` | Failed generation; reserved credits returned |
| `RECHARGE` | One-time top-up |
| `PLAN_RESET` | Subscription allotment / upgrade |
| `ADJUSTMENT` | Admin credit grant or deduction |

Statuses: `PENDING`, `RECONCILED`, `RELEASED`, `EXPIRED`, `COMPLETED`.

### 8.5 Top-up packages (frontend)

| Package | Credits | Price (INR) |
|---------|---------|-------------|
| `pkg-100` | 100 | ₹19 |
| `pkg-500` | 500 | ₹79 (popular) |
| `pkg-1000` | 1,000 | ₹149 |
| `pkg-5000` | 5,000 | ₹599 |

### 8.6 Payments

**Razorpay (primary)** — `/api/razorpay`

- `GET /config` — public key + currency.
- `POST /order` — create order for `type: "recharge" | "plan"`.
- `POST /verify-payment` — HMAC signature check, then `processRecharge`.
- `POST /verify-plan` — HMAC check, then `processPlanSubscription`.

**Stripe (optional leftover)** — `/api/wallet/recharge/stripe-session/` and `/api/wallet/plans/stripe-session/`. Used only if `STRIPE_SECRET_KEY` is set. Checkout UI in production is Razorpay.

If the user has too few credits, `CreditsContext` opens `CreditShortageModal` and can emit `CREDIT_SHORTAGE_EVENT`.

---

## 9. Admin console

Admin is a separate session from the creator app.

- Login: `/admin/login` → `POST /api/admin/login`.
- Credentials: `ADMIN_EMAIL` + `ADMIN_PASSWORD` (env only, not a User document).
- Token: JWT with `isAdmin: true`, **8-hour** expiry, stored as `adminToken`.
- Layout: `AdminLayout` + admin sidebar/nav, independent of `AppLayout`.

| Route | Page | Purpose |
|-------|------|---------|
| `/admin` | Dashboard | Users, courses, credits issued/spent, provider breakdown |
| `/admin/pricing` | Pricing rules | Edit SKU costs |
| `/admin/users` | User wallets | Search users, inspect wallet, adjust credits |
| `/admin/recharges` | Recharges & plans | Top-ups and subscriptions |
| `/admin/transactions` | Credit ledger | Filterable audit log |
| `/admin/courses` | Generated courses | Catalogue of user courses |
| `/admin/analytics` | Cost & margins | Spend analytics |
| `/admin/settings` | Settings | Admin profile / system settings |

Admin can also call:

- `POST /api/wallet/adjust/` — grant or deduct credits (`ADJUSTMENT`).
- `POST /api/wallet/cleanup-reservations/` — force stale-reservation cleanup.
- `POST /api/wallet/renew-subscriptions/` — force plan renewals.

---

## 10. Authentication and security

### User JWT

- Signed with `JWT_SECRET` (required in production).
- Payload: `id`, `userId`, `email`, `username`, `sessionId`.
- Expiry: 7 days.
- Sent as `Authorization: Bearer <token>` (query `?token=` also accepted).
- Frontend stores token in `localStorage`. `authInterceptor.ts` redirects to `/login` on 401/403.

### Single-session lock

Login and OTP verify write `activeSessionId`. If a later request’s `sessionId` does not match, the API returns 401. Logging in on a new device invalidates the previous session.

### Password policy and recovery

- Registration requires username, organisation, email, password.
- Change password requires the current password (`POST /api/change-password`).
- Forgot password sends a 6-digit OTP; reset consumes it (`/forgot-password`, `/reset-password`).

### HTTP hardening (`Backend/index.js`)

- **CORS** allowlist: localhost, `orion.evokeaisolutions.com`, `*.vercel.app`, `*.onrender.com`.
- **Helmet** with `crossOriginResourcePolicy: cross-origin` (needed for audio/PDF/PPTX).
- **mongo-sanitize** on incoming bodies.
- **Rate limit**: 300 req / 15 min per IP in production (1,000 in dev) on `/api`.
- **Auth rate limit**: 20 / 15 min in production on login/register/OTP/reset paths.
- JSON body limit 5 MB. Avatar upload 2 MB.
- Production refuses to boot without `SESSION_SECRET` and `JWT_SECRET`.

### Dev bypass

`authenticateJWT` allows `?dev=true` **only when `NODE_ENV !== 'production'`**. Do not enable this in production.

---

## 11. Database models

### User (`models/userModel.js`)

| Field | Notes |
|-------|--------|
| `username`, `email` (unique, indexed), `password`, `organisation` | Identity |
| `avatar` | Data-URI string |
| `isVerified`, `verificationOTP`, `verificationOTPExpires` | Email OTP |
| `resetPasswordToken`, `resetPasswordExpires` | Password reset |
| `notifications[]` | `{ title, message, type, isRead, createdAt }` |
| `activeSessionId`, `lastLoginAt`, `lastLoginDevice`, `lastLoginIP` | Session audit |
| `hasCourse`, `courseData` | Legacy/draft mixed payload |

### Course (`models/courseModel.js`)

Unique index on `{ userId, courseId }`. Embedded `modules[]` use the same shape as module blueprints, plus `slides`, `gammaUrl`, `gammaGenerationId`, `status`.

Asset fields: `audioUrl`, `audioTranscript`, `ebookUrl`, `ebookTranscript`, `ebookData`, `ebookStatus`, `podcastUrl`, `podcastTranscript`, `podcastScript`, `podcastStatus`.

### ModuleContent (`models/moduleModel.js`)

Separate collection for module drafts keyed by `{ userId, courseId }` (unique). Used while the wizard is generating, before/alongside the course document.

### Plan (`models/credits/plain.js`)

`name`: `Free | Pro | Team`. `monthlyCreditAllotment`, `priceInINR`, `rolloverAllowed`.

### PricingRule (`models/credits/pricingRule.js`)

Unique `actionKey`. `provider`: `gamma | openai | elevenlabs`. Integer `creditCost`, `isActive`.

### CreditTransaction (`models/credits/creditTransaction.js`)

Indexed on wallet, type, status, `createdAt`, `referenceId`. Optional `approvedBy` / `reason` for admin adjustments. `providerUsageMeta` stores provider-side usage when present.

---

## 12. Backend API reference

Base URL: `{ORIGIN}/api`  
Frontend helper: `frontEnd/src/utils/api.ts` (`VITE_API_BASE_URL`, always normalised to end with `/api`).

Unless noted, endpoints require `Authorization: Bearer <user JWT>`.

### Health

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/health` | Public | `{ status, db }` — 200 if Mongo connected, 503 otherwise |

### Auth (`routes/authRoutes.js` mounted at `/api`)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/register` | Public | Create user, send OTP (multipart `avatar`) |
| POST | `/verify-registration-otp` | Public | Verify email, issue JWT, start session |
| POST | `/resend-registration-otp` | Public | Resend OTP |
| POST | `/login` | Public | Credentials → 7-day JWT |
| POST | `/forgot-password` | Public | Send reset OTP |
| POST | `/reset-password` | Public | Set new password from OTP |
| POST | `/change-password` | JWT | Change password |
| GET | `/user` | JWT | Profile (no password) |
| POST | `/profile/avatar` | JWT | Update avatar |
| POST | `/logout` | Public | Client-side token clear companion |

### Notifications (`/api`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/notifications` | List (newest first); UI polls ~30s |
| PUT | `/notifications/read` | Mark all read |
| PUT | `/notifications/:id/read` | Mark one read |
| DELETE | `/notifications` | Delete all |
| GET | `/analytics/activity` | Course-creation activity for charts |

### Courses (`/api/courses`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/` or `/create-course` | Create course |
| POST | `/save-course-data` | Wizard draft save |
| GET | `/me` or `/get-user-courses` | Current user’s courses |
| GET | `/search` or `/search-courses` | Regex search |
| GET | `/get-user-course-data` | Hydrate one course payload |
| GET | `/get-course-modules/:courseId` | Modules for a course |
| DELETE | `/:courseId` or `/delete-course/:courseId` | Delete |

### AI (`/api`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/chat` | Chat with course AI |
| POST | `/generate-course-description` | Write description |
| POST | `/refine-course-description` | Refine description |
| POST | `/module-contents` | Save modules |
| GET | `/module-contents` | Load modules |
| POST | `/generate-module-draft` | One module draft |
| POST | `/generate-module` | One full module |
| POST | `/generate-all-modules-draft` | Batch drafts |

### Assets (`routes/ebookRoutes.js` mounted at `/api`)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/courses/:courseId/generate-audio` | Audiobook |
| POST | `/courses/:courseId/generate-podcast` | Podcast |
| POST | `/courses/:courseId/generate-ebook` | Ebook PDF |
| GET | `/ebooks/:courseId/download` | Download PDF (no JWT on this route) |
| POST | `/generate-module-slides-gamma` | One module slides |
| POST | `/generate-all-slides-gamma` | All module slides |
| GET | `/courses/:courseId/modules/:moduleNumber/download-pptx` | PPTX stream |

### Wallet (`/api/wallet`) — JWT after the three admin routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/adjust/` | Admin | Manual credit adjustment |
| POST | `/cleanup-reservations/` | Admin | Expire stale reserves |
| POST | `/renew-subscriptions/` | Admin | Run plan renewals |
| GET | `/` | User | Balance, plan, reserved |
| GET | `/transactions/` | User | Paginated ledger |
| POST | `/estimate/` | User | Cost preview by `actionKey` |
| POST | `/recharge/` | User | Direct top-up (server-side) |
| POST | `/recharge/stripe-session/` | User | Optional Stripe checkout |
| GET | `/plans/` | User | List plans |
| POST | `/plans/subscribe/` | User | Subscribe / change plan |
| POST | `/plans/stripe-session/` | User | Optional Stripe plan checkout |

### Razorpay (`/api/razorpay`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/config` | Publishable key |
| POST | `/order` | Create order |
| POST | `/verify-payment` | Verify top-up |
| POST | `/verify-plan` | Verify subscription |

### Admin (`/api/admin`)

`POST /login` is public. All other routes require admin JWT.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/login` | Admin JWT |
| GET | `/stats` | Dashboard KPIs |
| GET | `/users` | User + wallet list |
| GET | `/users/:userId/details` | User detail |
| POST | `/users/adjust-credits` | Adjust one wallet |
| GET | `/transactions` | Global ledger |
| GET | `/courses` | All courses |
| GET | `/pricing-rules` | List SKUs |
| PUT | `/pricing-rules/:id` | Update SKU |
| GET | `/analytics` | Cost analytics |
| GET | `/recharges-and-plans` | Billing overview |

Static files: `Backend/public` and `/courses` (generated audio/PDF artefacts when stored on disk).

---

## 13. Frontend architecture

### Routing (`App.tsx`)

Public: `/`, `/login`, `/register`, `/admin/login`.

Protected (`localStorage.token`):

| Path | Page |
|------|------|
| `/course-creator` | Home / Orion guidance |
| `/create-course`, `/course-basic-info` | Wizard |
| `/dashboard`, `/course-dashboard`, `/course-details` | Course library + asset controls |
| `/analytics` | Personal activity charts |
| `/add-credits` | Plans + top-ups |

Admin (`adminToken` via `hasAdminSession()`): `/admin`, `/admin/pricing`, `/admin/users`, `/admin/recharges`, `/admin/transactions`, `/admin/courses`, `/admin/analytics`, `/admin/settings` (plus aliases `/admin/customers`, `/admin/subscriptions`, `/admin/products`).

Unknown paths redirect to `/`.

Pages are **lazy-loaded**. Auth and admin shells skip `AppLayout`. Creator pages wrap in `AppLayout` (header, collapsible sidebar, notifications, avatar, change-password, scroll-to-top).

### State

| Provider | Role |
|----------|------|
| `CourseDataProvider` | Current course payload and `courseId` |
| `CreditsProvider` | Wallet, transactions, shortage modal |
| `CourseCreatorProvider` | Wizard step machine, generation flags, previews |
| `ThemeContext` | Light/dark (admin + toasts) |

### Key UI surfaces

- **Sidebar**: Home, Course, Analytics + `CreditsTracker`.
- **Header**: avatar crop, notifications (poll 30s), change password, logout.
- **Dashboard (`HeroPages.tsx`)**: course cards, search, delete-with-name-confirm, audio/podcast/ebook modals and players.
- **Analytics**: week/month/year bar chart (Recharts) from `/api/analytics/activity`.
- **Toasts**: max 3, theme-aware, 3s auto-close.

---

## 14. Environment variables

### Backend (`Backend/.env.example`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NODE_ENV` | Prod | `production` enables strict secrets and tighter rate limits |
| `PORT` | Local | Default `3000` |
| `MONGODB_URI` | Yes | Mongo connection string |
| `JWT_SECRET` | Prod | User + admin JWT signing |
| `SESSION_SECRET` | Prod | Express session cookie |
| `FRONTEND_URL` | Recommended | CORS / Stripe return URLs |
| `OPENAI_API_KEY` | Yes for AI | Descriptions, modules, scripts, ebooks |
| `GAMMA_API_KEY` | Yes for slides | Gamma generations |
| `ELEVEN_API_KEY` | Yes for audio | TTS |
| `VOICE_ID` | Audiobook | Default narrator |
| `PODCAST_HOST_A_VOICE_ID` | Podcast | Alex |
| `PODCAST_HOST_B_VOICE_ID` | Podcast | Sam |
| `OPENAI_EBOOK_ASSISTANT_ID` | Optional | Assistant-based ebook |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | OTP email | Registration + reset |
| `SKIP_REGISTRATION_OTP` | Optional | `true` skips inbox OTP |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin | Console login |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payments | Checkout + signature verify |
| `STRIPE_SECRET_KEY` | Optional | Legacy Stripe sessions |
| `RESERVATION_TIMEOUT_MINUTES` | Optional | Default `15` |
| `RESEND_API_KEY` | Optional | Prefer Resend HTTP email when set (see `smtpClient.js`) |
| `RENDER` | Set by Render | Detected for cloud OTP / email behaviour |
| `VERCEL` | Platform | Legacy; connects DB at import and skips `listen()` |

Never commit `.env`. Do not put secrets in git.

### Frontend (`frontEnd/.env.example`)

```
VITE_API_BASE_URL=https://your-api-host/api
```

In Vite **dev**, if unset, the client defaults to `http://localhost:3000/api`. Production builds **throw** if `VITE_API_BASE_URL` is missing.

On Render, `render.yaml` wires `VITE_API_BASE_URL` from the `orion-api` service’s `RENDER_EXTERNAL_URL` at **build time**. The frontend client auto-appends `/api` if the URL does not already end with `/api`.

### Render Blueprint env map (`render.yaml`)

| Service | Key | How it is set |
|---------|-----|----------------|
| `orion-api` | `NODE_VERSION` | `"20"` |
| `orion-api` | `NODE_ENV` | `production` |
| `orion-api` | `SESSION_SECRET` | `generateValue: true` (Render auto-generates) |
| `orion-api` | `JWT_SECRET`, `MONGODB_URI`, API keys, SMTP, admin, Razorpay | Dashboard secrets (`sync: false`) — you enter them once |
| `orion-api` | `SMTP_PORT` | `"587"` |
| `orion-api` | `SKIP_REGISTRATION_OTP` | `"false"` (OTP required when email works) |
| `orion-api` | `FRONTEND_URL` | `https://orion.evokeaisolutions.com` |
| `orion-web` | `NODE_VERSION` | `"20"` |
| `orion-web` | `VITE_API_BASE_URL` | From `orion-api` → `RENDER_EXTERNAL_URL` |

---

## 15. Local development

### Prerequisites

- Node.js 18+ (Render uses Node **20**)
- MongoDB Atlas or local MongoDB
- API keys for the providers you want to exercise

### Backend

```bash
cd Backend
cp .env.example .env   # fill secrets
npm install
npm run dev            # nodemon index.js
```

Seed pricing SKUs once:

```bash
node seed/pricingRule.js
```

Plans self-seed on first `GET /api/wallet/plans/` if the collection is empty.

### Frontend

```bash
cd frontEnd
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev            # Vite on :5173
```

### Quick smoke checks

1. `GET http://localhost:3000/api/health` → `status: ok`.
2. Register → verify OTP (or skip) → login.
3. Open `/add-credits` and confirm wallet balance (Free allotment).
4. Create a short Beginner course (1–2 modules) before testing slides/audio (those cost real provider + credit usage).

---

## 16. Render deployment (production)

ORION is deployed on **Render** using the Blueprint at the repo root: [`render.yaml`](./render.yaml).

### 16.1 Architecture on Render

```
GitHub / Git repo
        │
        │  Blueprint sync / auto-deploy on push
        ▼
┌──────────────────────┐     ┌──────────────────────────────┐
│  orion-web           │     │  orion-api                   │
│  Type: Static Site   │     │  Type: Web Service           │
│  rootDir: frontEnd   │────▶│  rootDir: Backend            │
│  build: npm run build│     │  build: npm install          │
│  publish: ./dist     │     │  start: npm start            │
│  SPA rewrite /* →    │     │  health: /api/health         │
│    /index.html       │     │  plan: free (configurable)   │
└──────────────────────┘     └──────────────┬───────────────┘
   Custom domain:                           │
   orion.evokeaisolutions.com               ▼
                                      MongoDB Atlas
                                      OpenAI / Gamma / ElevenLabs
                                      Razorpay / SMTP / Resend
```

### 16.2 Services defined in `render.yaml`

#### `orion-api` — Backend Web Service

| Setting | Value |
|---------|--------|
| Type | `web` |
| Runtime | `node` |
| Plan | `free` (upgrade in Dashboard if you need always-on) |
| Root directory | `Backend` |
| Build | `npm install` |
| Start | `npm start` (`node index.js`) |
| Health check | `/api/health` |
| Node version | `20` |

Because this is a **long-running Node process** (not serverless), the Express `app.listen` path runs. That means:

- Mongo connects at server start
- SMTP is verified on boot
- Credit **cleanup** and **plan renewal** workers schedule every 5 minutes

#### `orion-web` — Frontend Static Site

| Setting | Value |
|---------|--------|
| Type | `static` |
| Root directory | `frontEnd` |
| Build | `npm install && npm run build` |
| Publish path | `./dist` |
| SPA routing | Rewrite `/*` → `/index.html` |
| API URL | Build-time `VITE_API_BASE_URL` from `orion-api`’s `RENDER_EXTERNAL_URL` |

### 16.3 First-time deploy (Blueprint)

1. Push this repo to GitHub/GitLab (or connect the existing remote).
2. In [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Select the repo. Render reads `render.yaml` and proposes `orion-api` + `orion-web`.
4. For every `sync: false` variable on `orion-api`, paste production secrets:

   - `JWT_SECRET` (long random string; **do not leave empty**)
   - `MONGODB_URI`
   - `OPENAI_API_KEY`, `GAMMA_API_KEY`, `ELEVEN_API_KEY`, voice IDs
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `SMTP_*` / `EMAIL_FROM` and/or `RESEND_API_KEY`
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
5. Apply the Blueprint. Wait for both services to build.
6. Confirm API health: `https://<orion-api>.onrender.com/api/health`.
7. Open the static site URL (or custom domain) and smoke-test login + wallet.

### 16.4 Manual deploy (without Blueprint)

**API**

1. New → Web Service → connect repo.
2. Root directory: `Backend`.
3. Build: `npm install` · Start: `npm start`.
4. Health check path: `/api/health`.
5. Add the same env vars as in `render.yaml`.

**Frontend**

1. New → Static Site → same repo.
2. Root directory: `frontEnd`.
3. Build: `npm install && npm run build`.
4. Publish: `dist`.
5. Add rewrite: `/*` → `/index.html`.
6. Env: `VITE_API_BASE_URL=https://<your-api-service>.onrender.com`  
   (the client will append `/api` if needed).

### 16.5 Custom domain

Production frontend is configured as:

```
FRONTEND_URL=https://orion.evokeaisolutions.com
```

On Render Static Site (`orion-web`):

1. Settings → **Custom Domains** → add `orion.evokeaisolutions.com`.
2. Point DNS (CNAME / A records as Render instructs).
3. Wait for TLS certificate provisioning.

CORS already allows:

- `https://orion.evokeaisolutions.com`
- any `*.onrender.com` origin
- localhost for local testing

If you add another custom domain, update `allowedOrigins` in `Backend/index.js` **or** rely on the `.onrender.com` rule for temporary Render URLs.

### 16.6 Important Render behaviours

| Topic | Detail |
|-------|--------|
| Free web service sleep | Free `orion-api` may spin down after idle. First request can take 30–60s (cold start). Upgrade plan for always-on AI generations. |
| Build-time Vite env | Changing `VITE_API_BASE_URL` requires a **rebuild** of `orion-web`. |
| Ephemeral disk | Files written under `Backend/courses` or `public` on the free instance can be lost on redeploy/restart. Prefer Mongo base64 / CDN for durable assets (ebooks already store base64 on the course). |
| Chromium / ebook PDF | Ebook uses `@sparticuz/chromium` + `puppeteer-core`. If PDF generation fails on Render free, check logs for missing libs / memory; consider a paid instance or Docker with the repo `Dockerfile`. |
| Auto-deploy | With Blueprint/Git sync, pushes to the connected branch redeploy both services. |
| Secrets | Never put API keys in the frontend. Only `VITE_*` is public in the browser bundle. |
| OTP on cloud | With SMTP/Resend configured and `SKIP_REGISTRATION_OTP=false`, registration requires email OTP. If SMTP is missing on Render, registration may auto-skip OTP (see `register.Controller.js`). |

### 16.7 Post-deploy checklist

- [ ] `GET /api/health` returns `{ status: "ok", db: "connected" }`
- [ ] Register + OTP email arrives (or intentional skip)
- [ ] Login works; second device invalidates old session
- [ ] `/admin/login` works with `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- [ ] Wallet shows Free plan credits after first `/api/wallet/` call
- [ ] Pricing rules seeded (`node seed/pricingRule.js` against Atlas once)
- [ ] Create a tiny course; confirm OpenAI module draft
- [ ] Razorpay test/live keys match Dashboard mode
- [ ] Custom domain HTTPS loads SPA deep links (`/create-course`, `/admin/...`)

### 16.8 Other deploy options (legacy / optional)

These remain in the repo but are **not** the primary production path:

| Option | Files | Notes |
|--------|-------|-------|
| Vercel SPA | `frontEnd/vercel.json` | SPA rewrite to `/` |
| Vercel API | `Backend/vercel.json` | Serverless; **no** 5-min workers unless cron/admin triggers |
| Docker | `Backend/Dockerfile` | Node 18-slim + Chromium libs for Puppeteer |

---

## 17. Background jobs

Started when the API process calls `app.listen` (local, Docker, and **Render web service**):

| Job | Interval | Behaviour |
|-----|----------|-----------|
| Stale reservation cleanup | 5 minutes | Releases `RESERVE` rows older than `RESERVATION_TIMEOUT_MINUTES` |
| Plan renewal | 5 minutes | Credits wallets whose `renewsOn` is due; respects rollover |

Timeout default is 15 minutes so a hung Gamma/OpenAI job does not lock credits forever.

On Render free tier, workers pause while the service is asleep and resume after the next wake. For reliable monthly renewals, keep `orion-api` on a paid always-on plan or trigger:

- `POST /api/wallet/cleanup-reservations/` (admin)
- `POST /api/wallet/renew-subscriptions/` (admin)

---

## 18. Operations & troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Frontend calls wrong host | Stale Vite build / wrong `VITE_API_BASE_URL` | Rebuild `orion-web` after API URL changes |
| CORS blocked | Origin not allowlisted | Use `*.onrender.com` or add domain in `Backend/index.js` |
| Health 503 | Mongo down / bad `MONGODB_URI` | Fix Atlas URI, IP allowlist `0.0.0.0/0` or Render egress |
| Cold start timeouts | Free plan sleep | Upgrade Render plan or hit `/api/health` to warm |
| OTP never arrives | SMTP/Resend misconfigured | Set SMTP or `RESEND_API_KEY`; check Render logs |
| “Session expired” | Login on another device | Expected single-session lock |
| Insufficient credits | Wallet empty / reserved stuck | Top up; or admin cleanup reservations |
| Ebook PDF fails | Chromium/memory on small instance | Check logs; larger plan or Docker image |
| Admin 503 | Missing env | Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` on `orion-api` |
| Razorpay verify fails | Wrong secret / test vs live mix | Match key id + secret + Dashboard mode |

Useful logs: Render Dashboard → `orion-api` → **Logs**. Look for Mongo connect, SMTP verify, and `[Cleanup Job Error]` / `[Plan Renewal Job Error]`.

---

## 19. Glossary

| Term | Meaning |
|------|---------|
| **Blueprint** | Render config-as-code file (`render.yaml`) that defines services |
| **orion-api** | Render web service running the Express backend |
| **orion-web** | Render static site hosting the Vite React SPA |
| **Blueprint (course)** | AI-generated module outline (titles, objectives, teaching blocks) |
| **Course style** | Tone directive (academic, storytelling, scenario-based, …) applied to all AI output |
| **Gamma** | Third-party slide generation API |
| **Reserve / reconcile** | Two-phase credit debit: lock, then settle or refund |
| **Rollover** | Unused monthly credits carry into the next cycle (Pro/Team only) |
| **SKU / pricing rule** | Named action (`actionKey`) with a credit price and provider |
| **Wizard lock** | After blueprinting starts, earlier wizard fields cannot be changed |

---

## Related files

| File | Role |
|------|------|
| `render.yaml` | Render Blueprint — production deploy definition |
| `README.md` | Marketing-style product summary |
| `FEATURES.md` | Feature checklist (some paths/steps outdated) |
| `ARCHITECTURE.md` | Diagrams (Stripe/plan numbers may be outdated; this doc wins) |
| `Backend/.env.example` | Server env template |
| `frontEnd/.env.example` | Client env template |

---

*ORION Course Creator — documented against the current `frontEnd/` + `Backend/` tree and Render production Blueprint.*