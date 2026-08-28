# Claude Code Prompt — EPFO PF Claim Pre-Validator
# Build What Moves India Hackathon 2026 | Deadline: August 28, 2026 at 8:00 PM IST

---

## WHAT THIS PROJECT IS

A rebuilt EPFO portal that runs 4 automatic pre-validation checks on a member's PF claim before submission, catches the exact reason it would be rejected, and generates the specific legal document (Joint Declaration, employer escalation letter, EPFiGMS complaint) needed to fix it.

**Live tech stack:** React + Vite + Tailwind CSS v4 + Framer Motion + Zustand + React Router + jsPDF + Claude API (Anthropic) + Vercel

---

## HOW TO INITIALIZE THIS PROJECT

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local
# Then add your Anthropic API key in .env.local:
# VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here

# 3. Run development server
npm run dev

# 4. Build for production
npm run build

# 5. Deploy to Vercel (from project root)
npx vercel --prod
# Then add VITE_ANTHROPIC_API_KEY in Vercel Dashboard → Project Settings → Environment Variables
```

---

## DEMO CREDENTIALS (for evaluators)

| Account            | UAN           | Password   | Scenario                              |
|--------------------|---------------|------------|---------------------------------------|
| Ramesh Kumar       | 100673291847  | Demo@1234  | Name mismatch → Joint Declaration     |
| Fatima Shaikh      | 100891234567  | Demo@1234  | Employer exit + Bank KYC failure      |
| Vijay Patil        | 100334455678  | Demo@1234  | All clear → happy path submission     |

---

## WHAT IS ALREADY BUILT ✅

### Pages (all 7 screens)
- `/` → Landing page (hero, stats, how-it-works, demo scenarios, CTA)
- `/login` → Login with demo credential chips (auto-fill UAN + password)
- `/dashboard` → Member dashboard with PF balance, member info, bank details
- `/claim` → Claim type selector (Final Settlement / Partial Withdrawal / Pension)
- `/validate` → **CORE SCREEN** — 4 animated validation checks (AI + deterministic)
- `/resolution` → Resolution centre with downloadable documents per issue type
- `/submit` → Claim submission + post-submission success with reference + timeline

### Core AI Integration (Claude API)
- `src/lib/nameValidator.js — Fuzzy name matching via universal AI adapter (supports 10 providers) (handles initials, transliteration, middle names, suffixes). Falls back to deterministic result if API unavailable.
- `src/lib/documentGenerator.js` — Joint Declaration, employer letter, EPFiGMS complaint generation via Claude API. All have deterministic fallbacks.
- `src/lib/validationEngine.js` — Orchestrates all 4 checks sequentially with realistic delays
- `src/lib/pdfGenerator.js` — jsPDF-based PDF download with header, watermark, footer

### State Management
- `src/store/authStore.js` — Zustand auth store (login, logout, currentUser)
- `src/store/validationStore.js` — Validation results, document storage, Hindi toggle

### Data
- `src/data/mockUsers.json` — 3 fully specced mock accounts
- `src/data/fallbackResults.js` — Deterministic fallbacks per scenario (demo never breaks)

### Design System
- Full CSS custom properties in `src/index.css` (WCAG 2.1 AA compliant)
- Colors: deep navy primary, semantic status colors (pass/fail/advisory/running)
- Typography: Inter (Google Fonts) with Hindi sub-labels on key UI elements
- Components: ValidationCard (3-state animated), ResolutionCard (expandable), DocumentModal, MemberCard, StatusTimeline, Header, PrototypeBanner

---

## WHAT STILL NEEDS TO BE DONE / VERIFIED ⚠

### 1. Deploy to Vercel and confirm live URL
```bash
npx vercel --prod
# Add VITE_ANTHROPIC_API_KEY in Vercel → Project Settings → Environment Variables
# Test ALL 3 demo accounts from incognito window on a different device
```

### 2. Verify API key is working end-to-end
- The Anthropic API key must be set in `.env.local` for local dev
- For Vercel, it must be added as an environment variable
- API calls use `anthropic-dangerous-direct-browser-access: true` header (required for browser-side calls)
- If the key is missing, all 4 validation checks fall back to deterministic results — demo still works

### 3. Test all 3 user journeys in incognito
**Journey 1 — Ramesh Kumar (UAN: 100673291847)**
- Login → Dashboard → Apply for PF Claim → Select Final Settlement
- → Pre-Validation: Check 1 (name) should FAIL, checks 2-4 should PASS
- → Resolution Centre: Should show Joint Declaration card
- → Click "Download Joint Declaration" → Document modal opens → PDF downloads
- → "Copy EPFiGMS Text" → Toast confirms copy

**Journey 2 — Fatima Shaikh (UAN: 100891234567)**
- Login → Dashboard → Apply → Validate
- → Name: ADVISORY, DOB: PASS, Employer Exit: FAIL, Bank KYC: FAIL
- → Resolution: 2 critical cards + 1 advisory card
- → Employer escalation letter + EPFiGMS text both work

**Journey 3 — Vijay Patil (UAN: 100334455678)**
- Login → Dashboard → Apply → Validate
- → All 4 checks: PASS
- → "Proceed to Submit" → Claim Submission screen
- → Check declaration checkbox → Submit → Success screen with reference number

### 4. Mobile responsiveness (check at 375px)
- Open DevTools → toggle device toolbar → iPhone SE (375×667)
- All buttons must be at least 48px tall
- No horizontal scroll at any screen size
- Validation cards must stack cleanly
- Document modal must scroll on small screens

### 5. Hindi toggle verification
- Click "हिंदी" button in Header
- Sub-labels should appear under all English headings
- Toggle off: sub-labels disappear
- Resolution card steps should switch between English and Hindi

### 6. PDF download quality
- Open Ramesh Kumar → Resolution → Download Joint Declaration
- PDF should: have navy header, PROTOTYPE watermark, pre-filled member data, all sections, signature blocks
- If jsPDF fails, "Print" button opens print dialog as fallback

### 7. Performance check
- Run Lighthouse in Chrome DevTools (Production build on Vercel URL)
- Target: Performance > 85, Accessibility > 90, Best Practices > 90

---

## OPTIONAL ENHANCEMENTS (if time permits)

### A. Add smooth page transitions
In `App.jsx`, wrap `<Routes>` with Framer Motion `<AnimatePresence>` and add `motion.div` wrappers to each page component with `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}` for polished navigation.

### B. Add a "Share Results" feature
After validation, generate a shareable summary card (React → canvas via html2canvas, or a simple URL-encoded state link). This demonstrates product thinking.

### C. Add keyboard shortcut (Ctrl+D) to cycle demo accounts
On the Login page, intercept keyboard events and cycle through demo credentials automatically. Makes the demo faster to show judges.

### D. Add a progress indicator in the header
Show a step breadcrumb (Login → Claim → Validate → Resolve → Submit) with progress highlighting throughout the authenticated flow.

### E. Improve name mismatch display in PreValidation
When nameMatch fails, show a side-by-side diff view:
```
EPF Record:  "Ramesh [Kumar] Sharma"
Aadhaar:     "Ramesh [K.] Sharma"
                       ^^^  mismatch highlighted in red
```

### F. Add a "What is a Joint Declaration?" explainer modal
Link from the resolution card title. Short FAQ: what it is, where to submit, what supporting documents to bring. This shows user empathy.

---

## FILE STRUCTURE REFERENCE

```
epfo-validator/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                    ← Design system + CSS custom properties
│   ├── pages/
│   │   ├── Landing.jsx              ← Marketing landing page
│   │   ├── Login.jsx                ← Auth with demo chips
│   │   ├── Dashboard.jsx            ← Member overview + balance
│   │   ├── ClaimInitiation.jsx      ← Claim type selector
│   │   ├── PreValidation.jsx        ← 4-check animated validation (THE CORE)
│   │   ├── ResolutionCentre.jsx     ← Fix guides + document generation
│   │   └── ClaimSubmission.jsx      ← Submit + success screen
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx           ← Sticky header with Hindi toggle + logout
│   │   │   ├── PrototypeBanner.jsx  ← Amber disclaimer banner
│   │   │   └── PageWrapper.jsx      ← Max-width container
│   │   ├── validation/
│   │   │   ├── ValidationCard.jsx   ← Animated check card (3 states)
│   │   │   └── ValidationSummary.jsx← Overall result banner + CTAs
│   │   ├── resolution/
│   │   │   └── ResolutionCard.jsx   ← Per-issue fix guide + document buttons
│   │   ├── document/
│   │   │   └── DocumentModal.jsx    ← Document preview + PDF download
│   │   └── dashboard/
│   │       ├── MemberCard.jsx       ← Member info + balance card
│   │       └── StatusTimeline.jsx   ← Post-submission 3-stage tracker
│   ├── store/
│   │   ├── authStore.js             ← Zustand: auth state
│   │   └── validationStore.js       ← Zustand: check results + documents
│   ├── lib/
│   │   ├── nameValidator.js         ← Claude API fuzzy name match
│   │   ├── documentGenerator.js    ← Claude API: Joint Declaration, letters
│   │   ├── validationEngine.js     ← Orchestrates all 4 checks
│   │   ├── pdfGenerator.js         ← jsPDF rendering
│   │   └── utils.js                ← formatIndianCurrency, formatDate, cn
│   ├── data/
│   │   ├── mockUsers.json           ← 3 mock accounts
│   │   └── fallbackResults.js       ← Deterministic fallbacks per scenario
│   └── constants/
│       ├── validationTypes.js       ← Status enums
│       └── claimTypes.js            ← Form 19 / 31 / 10C definitions
├── .env.example                     ← VITE_ANTHROPIC_API_KEY placeholder
├── .env.local                       ← Your actual API key (never commit)
├── .gitignore
├── index.html
├── vercel.json                      ← SPA rewrite rules
├── vite.config.js
└── package.json
```

---

## KEY ARCHITECTURAL DECISIONS

1. **Only Check 1 (name match) calls the Claude API** during validation. Checks 2-4 are deterministic against mock data. This keeps the demo fast and reliable.

2. **API key is client-side** (acceptable for hackathon prototype). In production, this would be a server-side proxy.

3. **All AI calls have fallbacks**: If the API is unavailable, `fallbackResults.js` provides pre-defined results per scenario. The demo **never breaks** during judge evaluation.

4. **No backend**: Everything runs client-side with mock JSON. No server, no database, no authentication service.

5. **Zustand stores persist within the session** but reset on page refresh. This is intentional — each judge evaluation starts fresh.

---

## SUBMISSION CHECKLIST

Before submitting to Google Form on August 28, 2026:

- [ ] Live Vercel URL works in incognito — no access request needed
- [ ] All 3 demo accounts tested end-to-end in incognito
- [ ] PDF download works for Ramesh Kumar's Joint Declaration
- [ ] Prototype disclaimer visible on all authenticated screens
- [ ] Video is exactly 2 minutes (Minute 1: Ramesh journey, Minute 2: code walkthrough)
- [ ] Write-up is exactly 250 words
- [ ] Teammate email included (or blank if solo)
- [ ] Submitted before 8:00 PM IST on August 28, 2026
