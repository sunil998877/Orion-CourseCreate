# ORION Course Creator — Complete Feature Breakdown

## Project Overview

**ORION** is an AI-driven course creation platform that transforms educational concepts into multi-format learning assets. Built with a React/TypeScript + Vite frontend and Node.js/Express + MongoDB backend, it integrates with OpenAI (GPT-4o), ElevenLabs (TTS), and Gamma (slide decks) to generate slides, audiobooks, ebooks, and PPTX exports from a single course concept.

---

## 1. Authentication & User Management

| Feature | Details | Key Files |
|---------|---------|-----------|
| **User Registration** | Username, email, organisation, password with bcrypt hashing; optional avatar upload | `routes/authRoutes.js`, `frontEnd/src/pages/RegistrationPage.tsx` |
| **Email Verification via OTP** | 6-digit verification code sent via Nodemailer SMTP | `routes/authRoutes.js` (`/api/auth/verify-otp`) |
| **Resend Verification OTP** | 30s cooldown timer before resend allowed | `routes/authRoutes.js` (`/api/auth/resend-otp`) |
| **Login** | Email/password with JWT token (7-day expiry), stored in localStorage | `routes/authRoutes.js`, `frontEnd/src/pages/LoginPage.tsx` |
| **Forgot Password** | 6-digit OTP sent to email, stored with 1-hour expiry | `routes/authRoutes.js` (`/api/auth/forgot-password`) |
| **Reset Password** | Validate OTP + set new password | `routes/authRoutes.js` (`/api/auth/reset-password`) |
| **Change Password** | Authenticated endpoint requiring current password verification | `routes/authRoutes.js` (`/api/auth/change-password`) |
| **User Profile** | Fetch user details (excludes password), edit avatar with cropping | `routes/authRoutes.js` (`/api/auth/user`), `frontEnd/src/layout/AppLayout.tsx` |
| **Auth Interceptor** | Global fetch wrapper redirects to login on 401/403 | `frontEnd/src/utils/authInterceptor.ts` |
| **Logout** | Clears localStorage token + user data | `frontEnd/src/layout/AppLayout.tsx` |

---

## 2. Notifications System

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Add Notification** | Server-side helper triggered on course creation, avatar updates, etc. | `routes/authRoutes.js` (helper function) |
| **Fetch Notifications** | Sorted by most recent (newest first), polled every 30s from frontend | `routes/authRoutes.js` (`/api/auth/notifications`), `frontEnd/src/layout/AppLayout.tsx` |
| **Mark All Read** | Bulk update all user notifications to `read: true` | `routes/authRoutes.js` (`/api/auth/notifications/mark-all-read`) |
| **Mark Single Read** | Mark individual notification as read | `routes/authRoutes.js` (`/api/auth/notifications/mark-read`) |
| **Delete All Notifications** | Clear entire notification array from user document | `routes/authRoutes.js` (`/api/auth/notifications/delete-all`) |
| **Notification Badge** | Animated pulse indicator showing unread count | `frontEnd/src/layout/AppLayout.tsx` |
| **Notification Dropdown** | Dropdown panel with mark-read and remove-all actions | `frontEnd/src/layout/AppLayout.tsx` |

---

## 3. Multi-Step Course Creation Wizard (5 Steps)

### Step 1 — Course Configuration
- Course title input
- Audience selector: dropdown (Beginner/Intermediate/Advanced/Professional) + custom text input
- Course type, level, country/region (with custom option), industry (predefined list + custom)
- Standards selector: Global ISO/IEC, Regional, etc.
- Course Style selector: Academic/Formal, Storytelling, Scenario-based, Case Study Driven, Problem-Based, Interactive/Discussion, Practical/Hands-On, Research/Oriented
- Auto-save course data to backend on every change

**File:** `frontEnd/src/components/CourseCreatorForm.tsx`

### Step 2 — Course Details
- **AI-Generated Description:** GPT-4o generates academic description (50-150 words) based on title, audience, level, standards, industry, and course style
- **Description Refinement:** User can prompt AI to refine description without regenerating everything
- **Inline Editing:** Toggle between view and edit modes for description
- **Duration:** Value + unit selector (minutes/hours/days/weeks/months)
- **Module Count:** Auto-suggested based on level (Beginner=10, Intermediate=24, Advanced=64, Professional=96)
- **Validation:** Minimum 50 words for description, positive duration, at least 1 module

**File:** `frontEnd/src/components/CourseCreatorForm.tsx`

### Step 3 — Resources
- URL management: add/remove reference URLs with validation

**File:** `frontEnd/src/components/CourseCreatorForm.tsx`

### Step 4 — Module Blueprinting
- **Batch Generation:** All modules generated in parallel via single API call
- **Progress Tracking:** Real-time progress bar per module, overall blueprinting progress
- **Module Previews:** Shows generated module titles and lesson topics
- **Regenerate Single Module:** Regenerate any module independently
- **Refine Single Module:** Natural language refinement prompt applied to specific module
- **Highlight Animation:** Auto-scrolls to the module being regenerated/refined
- **Scroll Arrows:** Scroll-to-bottom indicators for long module lists
- **Blueprint Lock:** Prevents navigation back to earlier steps once generation starts

**File:** `frontEnd/src/components/CourseCreatorForm.tsx`

### Step 5 — Slide Generation & Launch
- **Batch Slide Generation:** Generates Gamma slides for all modules sequentially
- **Per-Module Slide Generation:** Individual slide generation with progress indicator
- **PPTX Download:** Download any module as PowerPoint via Gamma API proxy
- **Voice Script Modal:** Slide-by-slide transcript viewer with copy-all feature
- **Course Launch:** Saves completed course to database and redirects to dashboard

**File:** `frontEnd/src/components/CourseCreatorForm.tsx`

---

## 4. AI Module Content Generation

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Module Structure** | Title, Objectives, TeachingContent (Topics + StandardsReference + ContentPoints), CaseStudy, Quizzes, VisualDescriptions, FurtherStudy | `routes/authRoutes.js` (`/api/courses/generate-modules`) |
| **Course Style Adaptation** | Tone/persona adapts to selected style (storytelling → narrative flow, scenario-based → fictional characters, academic → formal) | `routes/authRoutes.js` |
| **Non-Overlap Enforcement** | AI receives previous modules as context to ensure distinct sub-topics | `routes/authRoutes.js` |
| **10-15 Minute Design** | Content depth optimized for short instructional units | `routes/authRoutes.js` |
| **Background Generation** | Modules generate in background, frontend polls for completion | `routes/authRoutes.js`, `frontEnd/src/pages/Modules/ModuleGen.tsx` |
| **Previous Module Context** | Each module generation receives previous modules to avoid repetition | `routes/authRoutes.js` |
| **Slide Transcript Rules** | Character-length targets per slide type (intro: 600-900, deep dives: 1800-2500+, case studies: 1500-2000, quizzes: 500-800) | `routes/authRoutes.js` |
| **Character-Driven Narration** | Every slide transcript features a persona (mentor, advisor, expert character) | `routes/authRoutes.js` |

**Frontend files:** `frontEnd/src/pages/Modules/ModuleGen.tsx`, `ModuleViewer.tsx`, `SlideContent.tsx`

---

## 5. Gamma API Slide Deck Integration

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Gamma API Connection** | Creates presentations via Gamma public API, polls for completion with adaptive intervals | `routes/authRoutes.js` (`/api/courses/generate-slides`) |
| **60+ Visual Themes** | Categorized into 8 groups: Professional (10), Creative (7), Bold (6), Elegant (7), Warm (3), Soft (6), Unique (5) | `frontEnd/src/utils/themes.ts` |
| **Theme Category Filter** | Filter themes by category in the wizard UI | `frontEnd/src/components/CourseCreatorForm.tsx` |
| **Theme Preview Cards** | Visual display with color swatches and style descriptions | `frontEnd/src/components/CourseCreatorForm.tsx` |
| **Slide Content Fallback** | Pads to exactly 10 slides if AI returns fewer | `routes/authRoutes.js` |
| **Gamma Export Trigger** | On-demand PPTX export request if no download URL exists | `routes/authRoutes.js` (`/api/courses/export-pptx`) |
| **PPTX Streaming Proxy** | Streams PPTX from Gamma CDN to user with proper Content-Disposition headers | `routes/authRoutes.js` (`/api/courses/download-pptx`) |

---

## 6. Audiobook Generation (ElevenLabs)

| Feature | Details | Key Files |
|---------|---------|-----------|
| **AI Script Compression** | GPT-4o-mini compresses course content into concise voiceover script (<2000 chars) | `routes/authRoutes.js` (`/api/courses/generate-audio`) |
| **ElevenLabs TTS** | High-fidelity text-to-speech with expressive voice settings (stability, similarity boost, style, speaker boost) | `routes/authRoutes.js` |
| **Chunked Processing** | Splits long scripts into <4000-character chunks for ElevenLabs API limits | `routes/authRoutes.js` |
| **Credit Deduction** | Each generation deducts 1 credit from user's ElevenLabs quota (300 default) | `routes/authRoutes.js` |
| **Caching** | Returns cached audio if already generated (saves API credits) | `routes/authRoutes.js` |
| **Audio Player** | Play/pause, seek bar, current/total time display, speed control (0.5x, 1x, 1.25x, 1.5x, 2x) | `frontEnd/src/pages/HeroPage.tsx` |
| **MP3 Download** | Download generated audio files | `frontEnd/src/pages/HeroPage.tsx` |
| **Transcript Viewing** | View audio script text in modal | `frontEnd/src/pages/HeroPage.tsx` |

---

## 7. Podcast Generation

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Two-Host Dialogue Script** | GPT-4o-mini generates natural conversation between hostA (Alex, friendly co-host) and hostB (Sam, expert teacher) | `routes/authRoutes.js` (`/api/courses/generate-podcast`) |
| **Multi-Voice ElevenLabs** | Sequential TTS with different voice IDs for each speaker (Rachel female, George male) | `routes/authRoutes.js` |
| **JSON Schema Compliance** | Strictly formatted dialogue output with speaker labels and character counts | `routes/authRoutes.js` |
| **Cache System** | Reuses previously generated podcast to avoid API costs | `routes/authRoutes.js` |
| **Credit Deduction** | Each generation deducts 1 credit (separate from audiobook credits) | `routes/authRoutes.js` |
| **Podcast Player** | Same feature set as audiobook player (play/pause, seek, speed, download) | `frontEnd/src/pages/HeroPage.tsx` |
| **Podcast Chat Transcript** | Visual dialogue bubbles with active speaker highlighting based on playback position | `frontEnd/src/pages/HeroPage.tsx` |
| **Progress-Based Highlighting** | Character-count algorithm determines which dialogue turn is currently playing | `frontEnd/src/pages/HeroPage.tsx` |
| **Transcript Download** | View full podcast conversation text | `frontEnd/src/pages/HeroPage.tsx` |

---

## 8. Ebook Generation (PDF)

| Feature | Details | Key Files |
|---------|---------|-----------|
| **AI Narrative Engine** | GPT-4o generates premium narrative ebook with introduction, chapters, FAQ, glossary, conclusion, CTA | `routes/authRoutes.js` (`/api/courses/generate-ebook`) |
| **Assistant API Support** | Optional OpenAI Assistant (asst_XXX) for ebook generation | `routes/authRoutes.js` |
| **Fallback HTML Ebook** | Static HTML ebook generated if AI narrative generation fails | `routes/authRoutes.js` |
| **Puppeteer PDF Generation** | HTML-to-A4 PDF with print backgrounds, headers, footers via headless Chromium | `routes/authRoutes.js` |
| **Mermaid.js Diagrams** | Client-side Mermaid rendering for flowcharts and architecture diagrams | `routes/authRoutes.js` (ebook HTML template) |
| **DALL-E Image Generation** | Auto-generates images from `[GENERATE_IMAGE: description]` tags in ebook content | `routes/authRoutes.js` |
| **Professional Styling** | Playfair Display headings, Lora body font, navy/gold color scheme, drop caps, running headers | `routes/authRoutes.js` (HTML template) |
| **Cover Page** | Course title, audience, level, duration, standards, publisher name | `routes/authRoutes.js` |
| **Table of Contents** | Auto-generated with sub-headings and page references | `routes/authRoutes.js` |
| **Chapter Structure** | Summary, hook, learning objectives, core content, diagrams, expert insights, implementation guide, common mistakes, practical exercises, mini project, success checklist, interview questions, key takeaways, pro tips, knowledge checks, further reading, footnotes | `routes/authRoutes.js` |
| **Custom Publisher Name** | User-configurable publisher name via input field | `frontEnd/src/pages/HeroPage.tsx` |
| **Base64 MongoDB Storage** | PDF stored in MongoDB as base64 string on course document | `routes/authRoutes.js` |
| **Download Endpoint** | Serves PDF with proper Content-Disposition headers | `routes/authRoutes.js` (`/api/courses/download-ebook`) |

---

## 9. Course Dashboard

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Course Grid View** | Responsive cards with level badges, module count, duration | `frontEnd/src/pages/HeroPage.tsx` |
| **Course Search** | Search by title, description, type, standards, level via MongoDB regex | `routes/authRoutes.js` (`/api/courses/user-courses`) |
| **Course Details View** | Full detail page with info cards (audience, duration, modules, standards, audio/ebook/podcast/PPTX download links) | `frontEnd/src/pages/HeroPage.tsx` |
| **Course Deletion** | Confirmation modal with course name matching before delete | `frontEnd/src/pages/HeroPage.tsx` |
| **Empty State** | "No courses yet" placeholder with CTA to create first course | `frontEnd/src/pages/HeroPage.tsx` |
| **Architect New Course Button** | Quick-create navigation from dashboard | `frontEnd/src/pages/HeroPage.tsx` |
| **Audiobook Control** | Generate/download/listen/view transcript | `frontEnd/src/pages/HeroPage.tsx` |
| **Podcast Control** | Generate/download/listen/view chat transcript | `frontEnd/src/pages/HeroPage.tsx` |
| **Ebook Control** | Generate with publisher name input, download PDF | `frontEnd/src/pages/HeroPage.tsx` |

---

## 10. Analytics

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Activity Tracking** | Course creation counts over week, month, year | `routes/authRoutes.js` (`/api/courses/analytics`) |
| **Recharts Bar Chart** | Gradient-filled bars with custom tooltip showing course counts per day | `frontEnd/src/pages/AnalyticsPage.tsx` |
| **Key Metrics Cards** | Total Courses, Active Range, Peak Date, Average per period | `frontEnd/src/pages/AnalyticsPage.tsx` |
| **Date Range Filter** | Dropdown with This Week / This Month / This Year | `frontEnd/src/pages/AnalyticsPage.tsx` |
| **Loading State** | Spinner during data fetch | `frontEnd/src/pages/AnalyticsPage.tsx` |
| **Theme-Aware Colors** | Chart accent color configurable via props | `frontEnd/src/pages/AnalyticsPage.tsx` |
| **Holographic Character Display** | Animated ORION agent with rotating tech rings, scanlines, data streams | `frontEnd/src/pages/AnalyticsPage.tsx` |

---

## 11. UI/UX Features

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Framer Motion Page Transitions** | Animated route changes with AnimatePresence wrapper | `frontEnd/src/App.tsx` |
| **Animated Particle Background** | Canvas/TSParticle-based animated background on auth pages | `frontEnd/src/pages/LoginPage.tsx`, `RegistrationPage.tsx` |
| **Dark Theme** | Full dark mode with gradient backgrounds throughout app | `frontEnd/src/index.css`, `AppLayout.tsx` |
| **Sidebar Navigation** | Collapsible sidebar with Home, Course, Analytics links | `frontEnd/src/layout/AppLayout.tsx` |
| **Responsive Mobile Menu** | Hamburger toggle with backdrop overlay | `frontEnd/src/layout/AppLayout.tsx` |
| **Scroll-to-Top Button** | Appears after 300px scroll threshold | `frontEnd/src/layout/AppLayout.tsx` |
| **Toast Notifications** | react-toastify with dark theme, auto-close, max 3 visible | `frontEnd/src/App.tsx` |
| **Real-Time Progress Bars** | For audio/podcast/ebook generation, module blueprinting, slide generation, refinement | `HeroPage.tsx`, `CourseCreatorForm.tsx`, `ModuleGen.tsx` |
| **Avatar System** | react-easy-crop + upload + display in header/sidebar | `frontEnd/src/layout/AppLayout.tsx` |
| **Loading Screen** | Full-screen animated spinner during long AI operations | `frontEnd/src/components/CourseCreateor/CourseCreatorForm.tsx` |
| **Orion Guidance Cards** | First-time user step-by-step instructions on home page | `frontEnd/src/pages/HomePage.tsx` |

---

## 12. Course Data Management

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Context API Provider** | Global course data state management via React Context | `frontEnd/src/contextAPI/courseAPI.tsx` |
| **Local Draft Saving** | Saves course form data to database during wizard progression | `routes/authRoutes.js` (`/api/courses/save-draft`) |
| **Reset Course Data** | sessionStorage flag to clear form on new course creation | `frontEnd/src/contextAPI/courseAPI.tsx` |
| **Course ID Tracking** | Cross-component course ID synchronization via context | `frontEnd/src/contextAPI/courseAPI.tsx` |
| **Auto-Duration/Module Suggestions** | Based on selected level (Beginner→24h/10modules, Professional→96modules) | `frontEnd/src/components/CourseCreatorForm.tsx` |

---

## 13. Security

| Feature | Details | Key Files |
|---------|---------|-----------|
| **JWT Authentication** | JSON Web Token with configurable secret (7-day expiry) | `routes/authRoutes.js`, `middlewares/authMiddleware.js` |
| **Password Requirements** | Min 8 characters, must include uppercase + lowercase + number | `routes/authRoutes.js` |
| **Bcrypt Password Hashing** | Salt rounds = 10 | `routes/authRoutes.js` |
| **CORS Whitelisting** | Restricts API access to known origins | `Backend/index.js` |
| **Express Sessions** | Server-side session management | `Backend/index.js` |
| **Token Expiry** | 7 days for login, 4 hours initial registration token | `routes/authRoutes.js` |

---

## 14. DevOps & Deployment

| Feature | Details | Key Files |
|---------|---------|-----------|
| **Vercel Serverless** | Exported as default app for Vercel deployment | `Backend/index.js` |
| **Vercel Config** | Rewrites, headers, redirects for SPA routing | `frontEnd/vercel.json` |
| **Docker Support** | Dockerfile for containerized deployment | `Backend/Dockerfile` |
| **Environment Variables** | MongoDB URI, OpenAI key, ElevenLabs key, Gamma key, JWT secret, SMTP config, etc. | `Backend/.env` (template) |
| **Static File Serving** | Public directory serves audio, ebook files | `Backend/index.js` |

---

## Appendix: API Route Map

All routes are defined in `Backend/routes/authRoutes.js` (~5900 lines). The frontend base URL is configured in `frontEnd/src/utils/api.ts`.

### Auth Routes (`/api/auth`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register` | Register new user |
| POST | `/verify-otp` | Verify email with OTP |
| POST | `/resend-otp` | Resend verification OTP |
| POST | `/login` | Login, returns JWT |
| POST | `/forgot-password` | Send password reset OTP |
| POST | `/reset-password` | Reset password with OTP |
| POST | `/change-password` | Change password (auth required) |
| POST | `/delete-password` | Delete password-protected course data |
| GET | `/user` | Get user profile |
| POST | `/user/avatar` | Update avatar |
| GET | `/notifications` | Get user notifications |
| PUT | `/notifications/mark-all-read` | Mark all notifications read |
| PUT | `/notifications/mark-read` | Mark single notification read |
| DELETE | `/notifications/delete-all` | Delete all notifications |

### Course Routes (`/api/courses`)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Create course |
| GET | `/user-courses` | Get user's courses (with search) |
| GET | `/:id` | Get course by ID |
| PUT | `/:id` | Update course |
| DELETE | `/:id` | Delete course |
| POST | `/save-draft` | Save course draft |
| POST | `/generate-modules` | Generate all module outlines |
| POST | `/generate-slides` | Generate slides for a module |
| POST | `/regen-slides` | Regenerate a module's slides |
| POST | `/refine-module` | Refine module with AI prompt |
| POST | `/refine-description` | Refine course description |
| POST | `/generate-audio` | Generate audiobook |
| POST | `/generate-podcast` | Generate podcast |
| POST | `/generate-ebook` | Generate ebook PDF |
| POST | `/generate-assistant-ebook` | Generate ebook via OpenAI Assistant |
| GET | `/download-ebook/:id` | Download ebook PDF |
| GET | `/export-pptx/:courseId/:moduleId` | Export module as PPTX |
| GET | `/download-pptx/:courseId/:moduleId` | Download PPTX file |
| GET | `/analytics` | Get course creation analytics |

---

## Appendix: Data Models

### Course Model (`Backend/models/courseModel.js`)
- `userId`, `title`, `description`, `audience`, `courseType`, `level`, `country`, `industry`, `standards`, `courseStyle`, `duration`, `durationUnit`, `moduleCount`, `resources[]`, `modules[]` (embedded), `audio`, `ebook`, `podcast`, `pptx`, `status`, `createdAt`

### Module Model (`Backend/models/moduleModel.js`)
- `userId`, `courseId`, `moduleIndex`, `title`, `objectives`, `teachingContent[]`, `caseStudy`, `quizzes[]`, `visualDescriptions[]`, `furtherStudy[]`

### User Model (`Backend/models/userModel.js`)
- `username`, `email`, `password`, `organisation`, `avatar`, `notifications[]`, `otp`, `otpExpiry`, `resetOtp`, `resetOtpExpiry`, `isVerified`, `elevenlabsCredits`, `courseCount`
