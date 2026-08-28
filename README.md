# EPFO PF Claim Pre-Validator

> **Hackathon:** Build What Moves India 2026 · **Deadline:** August 28, 2026 at 8:00 PM IST  
> **Platform:** EPFO (Employees' Provident Fund Organisation)

A rebuilt EPFO portal that runs 4 automatic pre-validation checks before any PF claim is submitted, tells the member exactly what will cause rejection, and generates the specific document needed to fix it.

## The Problem

174 lakh PF claims were rejected in 2024-25 — 1 in every 5. The current EPFO portal rejects with a generic code. No explanation. No fix path. Workers visit EPFO offices 3 times to figure out why.

## The Solution

Pre-validation layer inserted before submission — not after rejection.

**4 checks run automatically:**
1. **Name Match** — EPF records vs. Aadhaar (AI-powered fuzzy matching via Claude API)
2. **Date of Birth** — EPF records vs. Aadhaar
3. **Employer Exit Date** — Previous employer must update UAN
4. **Bank KYC** — Account linked and employer-approved

**For each failure:** Plain-language explanation + numbered fix steps + auto-generated document (Joint Declaration, employer letter, EPFiGMS complaint).

## Quick Start

```bash
npm install
cp .env.example .env.local
# Add AI_API_KEY to .env.local (it stays server-side on Vercel)
npm run dev
```

## Demo Accounts

| Account       | UAN           | Password   | Scenario              |
|---------------|---------------|------------|-----------------------|
| Ramesh Kumar  | 100673291847  | Demo@1234  | Name mismatch         |
| Fatima Shaikh | 100891234567  | Demo@1234  | Multiple failures     |
| Vijay Patil   | 100334455678  | Demo@1234  | All clear (happy path)|

## Tech Stack

React · Vite · Tailwind CSS v4 · Framer Motion · Zustand · React Router · jsPDF · Claude API (Anthropic) · Vercel

## Deploy

```bash
npx vercel --prod
# Add AI_API_KEY in Vercel → Settings → Environment Variables
```

---

*Independent hackathon prototype. Not affiliated with EPFO or the Government of India.*
