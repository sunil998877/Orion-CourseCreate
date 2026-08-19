# Orion Course Creator — Comprehensive System Architecture

This document provides a complete technical blueprint of the **Orion Course Creator** platform, detailing its system components, authentication mechanics, credit & wallet engine, subscription plan models, recharge workflows, AI generation pipelines, database schemas, and API interfaces.

---

## 1. High-Level System Architecture

Orion is built using a modern **Decoupled Client-Server Monorepo** pattern:

```mermaid
flowchart TD
    subgraph Client["Frontend Layer (React + Vite + TypeScript)"]
        UI[User Interface & Wizard]
        CTX[Credits & Auth Context State]
        SVC[Frontend API Client Services]
    end

    subgraph Server["Backend Layer (Node.js + Express API)"]
        MW[JWT Auth & Middleware]
        CTL[Controllers Layer]
        SER[Services & Logic Engine]
    end

    subgraph Data["Database Layer"]
        MGO[(MongoDB Database)]
    end

    subgraph External["External Services Layer"]
        OAI[OpenAI API - Curriculum & Text]
        EL[ElevenLabs API - Narration & TTS]
        GMA[Gamma API - Slide Deck Generation]
        STR[Stripe API - Checkout & Webhooks]
        SMTP[SMTP Nodemailer - Email OTPs]
    end

    UI --> CTX
    CTX --> SVC
    SVC -->|REST + Bearer JWT| MW
    MW --> CTL
    CTL --> SER
    SER --> MGO
    SER --> OAI
    SER --> EL
    SER --> GMA
    SER --> STR
    SER --> SMTP
```

---

## 2. Authentication System Architecture

Authentication is stateless and uses **JSON Web Tokens (JWT)** combined with **OTP Email Verification** for signup security and password recovery.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant Mail as SMTP Service

    User->>FE: Enter Details (Email, Password, Avatar)
    FE->>BE: POST /api/auth/register (multipart/form-data)
    BE->>DB: Save Unverified User & Generate OTP
    BE->>Mail: Send 6-Digit Verification OTP
    BE-->>FE: OTP Sent Response
    User->>FE: Enter 6-Digit OTP
    FE->>BE: POST /api/auth/verify-registration-otp
    BE->>DB: Mark isVerified=true & Create Initial Free Wallet
    BE-->>FE: Return User Data + 7-Day JWT Token
    FE->>FE: Save Token to localStorage & Init Context
```

### Key Auth Features & Endpoints

| Endpoint | Method | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Registers user, hashes password with Bcrypt, sends OTP email. |
| `/api/auth/verify-registration-otp` | `POST` | Public | Verifies signup OTP, activates user, initializes Free Credit Wallet. |
| `/api/auth/login` | `POST` | Public | Authenticates credentials, issues 7-day JWT. |
| `/api/auth/forgot-password` | `POST` | Public | Sends 6-digit password reset OTP (1-hour expiry). |
| `/api/auth/reset-password` | `POST` | Public | Resets password upon valid OTP input. |
| `/api/auth/change-password` | `POST` | Bearer JWT | Authenticated password change requiring current password verification. |
| `/api/auth/user` | `GET` | Bearer JWT | Fetches profile metadata and active wallet reference. |
| `/api/auth/profile/avatar` | `POST` | Bearer JWT | Updates user profile image. |

---

## 3. Credit Wallet & Pricing Engine

Orion uses a **Unit-Based Credit System** to meter and control resource consumption across AI generation services (OpenAI, ElevenLabs, Gamma).

```mermaid
flowchart LR
    subgraph CreditEngine["Credit Engine Workflow"]
        Req[AI Task Triggered] --> Est[Estimate Cost]
        Est --> Check{Balance >= Cost?}
        Check -- No --> Reject[Error: Insufficient Credits]
        Check -- Yes --> Reserve[Create RESERVE Transaction]
        Reserve --> Exec[Execute AI Call]
        Exec -- Success --> Reconcile[Create RECONCILE Ledger Entry]
        Exec -- Failure --> Refund[Create REFUND Entry & Restore Balance]
    end
```

### Credit Pricing Rules (`PricingRule` Model)

| Action Key | Provider | Credit Cost | Description |
| :--- | :--- | :--- | :--- |
| `Generate Course` | OpenAI | 250 credits | Complete end-to-end course generation. |
| `Generate Course Outline` | OpenAI | 10 credits | Curriculum module structure & lesson titles. |
| `Generate Module` | OpenAI | 20 credits | Full section content generation. |
| `Generate Quiz / Assessment` | OpenAI | 8 credits | Quizzes and interactive assessments. |
| `Generate Questions` | OpenAI | 5 credits | Individual question synthesis. |
| `Generate Podcast / Voiceover` | ElevenLabs | 15 credits/min | Studio voicebook narration generation. |
| `Generate Slide Deck` | Gamma | 50 credits | AI presentation slide orchestration. |

---

## 4. Subscription Plans & Recharge System

Users can access credits via **Monthly Subscription Plans** or **One-Time Credit Top-Ups**.

```mermaid
classDiagram
    class Plan {
        +String name ("Free", "Pro", "Team")
        +Number monthlyCreditAllotment
        +Number priceInINR
        +Boolean rolloverAllowed
    }

    class Wallet {
        +ObjectId user
        +ObjectId plan
        +Number balance
        +Number reserved
        +Number lifetimeUsed
        +Date renewsOn
    }

    class CreditTransaction {
        +ObjectId wallet
        +String type ("RESERVE", "RECONCILE", "REFUND", "RECHARGE", "PLAN_RESET")
        +Number amount
        +String referenceId
    }

    Wallet "1" --> "1" Plan : subscribed to
    CreditTransaction "*" --> "1" Wallet : logs activity
```

### Subscription Tiers

| Tier Name | Monthly Credits Allotment | Price (INR) | Credit Rollover |
| :--- | :--- | :--- | :--- |
| **Free** | 1,000 credits / mo | ₹0 | No |
| **Pro** | 8,000 credits / mo | ₹499 | Yes |
| **Team** | 15,000 credits / mo | ₹1,499 | Yes |

### Credit Top-Up Packages

| Package ID | Credits Added | Price | Badge / Popularity |
| :--- | :--- | :--- | :--- |
| `pkg-100` | 100 credits | $9 | Standard |
| `pkg-500` | 500 credits | $39 | Most Popular ⭐ |
| `pkg-1000` | 1,000 credits | $69 | Value Pack |
| `pkg-5000` | 5,000 credits | $249 | Enterprise Pack |

### Wallet API Endpoints (`/api/wallet`)

* `GET /api/wallet/`: Fetch current wallet balance, reserved credits, and active plan details.
* `GET /api/wallet/transactions/`: Fetch paginated audit ledger of all credit movements.
* `POST /api/wallet/estimate/`: Preview credit cost for an action key prior to execution.
* `POST /api/wallet/recharge/`: Execute a credit package top-up.
* `POST /api/wallet/recharge/stripe-session/`: Create Stripe checkout session for credit top-up.
* `GET /api/wallet/plans/`: Fetch all available subscription tiers.
* `POST /api/wallet/plans/subscribe/`: Upgrade or downgrade user plan.
* `POST /api/wallet/plans/stripe-session/`: Create Stripe checkout session for plan subscription.

---

## 5. Course & Asset Generation Pipeline

```mermaid
flowchart TD
    WIZ[Course Creation Wizard] --> S1[Step 1: Topic, Audience, Level & Style Setup]
    S1 --> S2[Step 2: AI Description Synthesis & Duration]
    S2 --> S3[Step 3: Curriculum Architecture & Module Outline]
    S3 --> S4[Step 4: Asset Synthesis Engine]
    
    subgraph Synthesis["Multi-Format Asset Synthesis Engine"]
        S4 -->|OpenAI GPT-4o| MOD[Module & Quiz Text Generator]
        S4 -->|ElevenLabs| AUD[Voicebook & Narration MP3s]
        S4 -->|Gamma API| SLD[Interactive Split-Screen Slide Decks]
        S4 -->|Mermaid + HTML2PDF| EBK[Narrative Ebook PDF Publishing]
    end

    MOD --> DASH[Centralized Review Dashboard]
    AUD --> DASH
    SLD --> DASH
    EBK --> DASH
```

---

## 6. Frontend Architecture & State Management

```
frontEnd/src/
├── App.tsx                     # Main Router & Provider Tree
├── contextAPI/
│   └── CreditsContext.tsx      # Global Wallet, Balance & Transaction State
├── services/
│   ├── walletService.ts        # Unified Wallet & Plan Client API
│   ├── rechargeService.ts      # Credit Package Top-up Client API
│   ├── planService.ts          # Subscription Plan Client API
│   └── aiService.ts            # Course Generation Client API
├── pages/
│   ├── AddCreditsPage.tsx      # Credit Top-up & Subscription Page
│   ├── CourseCreatorPage.tsx   # Step-by-Step Wizard Page
│   └── EbookPreviewPage.tsx    # Ebook PDF Reader Page
└── components/
    ├── credits/                # Plan Cards, Credit Package Cards, Billing Modals
    └── CourseCreator/          # Step Form Components & Slide Generators
```

---

## 7. Database Models Summary

1. **User Model (`userModel.js`)**: User identity, password hash, verification state, avatar URL, notifications array.
2. **Wallet Model (`wallet.js`)**: Linked 1-to-1 with User. Stores credit `balance`, `reserved` amount, `lifetimeUsed`, and `renewsOn` date.
3. **Plan Model (`plain.js`)**: Defines `Free`, `Pro`, `Team` tiers with monthly allotments and pricing.
4. **PricingRule Model (`pricingRule.js`)**: Maps action keys (`Generate Course`, `Generate Slide Deck`, etc.) to credit costs.
5. **CreditTransaction Model (`creditTransaction.js`)**: Immutable audit log recording every credit addition, reservation, deduction, or refund.
6. **Course Model (`courseModel.js`)**: Stores curriculum hierarchy, modules, lessons, style configurations, and generated asset metadata.
