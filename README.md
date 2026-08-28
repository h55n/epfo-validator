<div align="center">

# 🚀 EPFO PF Claim Pre-Validator

<p align="center">
  <a href="https://epfo-validator.vercel.app"><strong>Live Demo</strong></a> |
  <a href="https://youtu.be/LDabAstD2R0"><strong>Watch Video</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

A rebuilt EPFO portal that runs automatic pre-validation checks **before** any PF claim is submitted, tells the member exactly what will cause rejection, and generates the specific document needed to fix it. Built for the **Build What Moves India 2026** Hackathon.

</div>

---

## 📺 Project Walkthrough

[![Watch the video](https://img.youtube.com/vi/LDabAstD2R0/maxresdefault.jpg)](https://youtu.be/LDabAstD2R0)

---

## ⚡ Core Features

| Feature | Description |
|---------|-------------|
| **Smart Pre-validation** | Runs 4 automated checks (Name Match, DOB, Exit Date, Bank KYC) *before* submission, intercepting common rejection causes instantly. |
| **AI Name Matching** | Uses GPT-4.5 fuzzy matching to compare EPF records against Aadhaar, accommodating minor spelling variations that usually trigger manual rejection. |
| **Auto-Document Generation** | Automatically drafts required legal documents (e.g., Joint Declaration) using `jsPDF` based on the specific failure reason. |
| **Actionable Resolution** | Replaces generic rejection codes with plain-language explanations, numbered fix steps, and direct links to official EPFiGMS portals. |
| **Accessible & Bilingual** | Modern, mobile-first design with English and Hindi support, completely replacing the clunky government interface. |
| **Secure Architecture** | Client-side execution with sensitive AI operations routed securely through Vercel Serverless Functions. |

---

## 🛠️ The Problem vs The Solution

**The Problem:** In 2024-25, 174 lakh PF claims were rejected — 1 in every 5. The current portal rejects with a generic code (like "Name Mismatch"). No explanation. No fix path. Workers are forced to visit EPFO offices multiple times, often losing wages just to figure out why they were rejected.

**The Solution:** A pre-validation layer inserted *before* submission. Instead of learning about a problem after rejection, members see exactly what is wrong and how to fix it in seconds. 

---

## 🎥 Workflow Demo

![App Workflow](./public/demo-workflow.gif)

---

## 🚀 Quick Install (Local Setup)

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/h55n/epfo-validator.git
   cd epfo-validator
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env.local
   ```
   *Add your `VITE_AI_PROVIDER` and `AI_API_KEY` to `.env.local`.*

3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🔑 Demo Accounts

Use these mock accounts to test different validation scenarios on the live app or locally:

| Account Name  | UAN Number    | Password   | Expected Scenario               |
|---------------|---------------|------------|---------------------------------|
| Ramesh Kumar  | 100673291847  | Demo@1234  | Name mismatch (AI validation)   |
| Fatima Shaikh | 100891234567  | Demo@1234  | Multiple failures (Exit Date)   |
| Vijay Patil   | 100334455678  | Demo@1234  | All clear (Happy path)          |

---

## 👥 Team

Divided and developed equally by:
- **MRUNMAYEE DAWARE**
- **HASSAN REHMAN**

> **Disclaimer:** This is an independent hackathon prototype and is not affiliated with the Employees' Provident Fund Organisation (EPFO) or the Government of India.
