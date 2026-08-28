# EPFO Validator — Validation Rules Reference

Each rule in `src/rules/v1/` maps to one pre-validation check.  
This document records the authoritative EPFO and government policy behind each rule.

---

## Rule 1 — Name Match (`nameMatch.js`)

**Version:** v1.0  
**Method:** AI-assisted (with deterministic fallback)

### Policy Sources
| Source | Reference |
|--------|-----------|
| EPFO Circular | WSU/15(1)2019/MIS/2019-20 dated 28-Jun-2019 — "Procedure for correction of member name/DOB in EPF records" |
| EPFO SOP | Joint Declaration Form — available at epfindia.gov.in → Forms |
| UIDAI | Aadhaar name correction guidelines — uidai.gov.in |

### Logic
- AI compares EPF name vs Aadhaar name
- Returns: PASS, ADVISORY, or FAIL with mismatch type
- Mismatch types: INITIAL_VS_FULL, TRANSLITERATION, MIDDLE_NAME_MISSING, SUFFIX_MISSING, ORDER_DIFFERENCE, COMPLETE_MISMATCH
- Resolution: JOINT_DECLARATION (submit at EPFO regional office) or UIDAI_CORRECTION (update Aadhaar)

### Known EPFO Name Tolerance
EPFO allows minor name variations in some cases (initials, common transliterations). A human officer at the regional office makes the final call on a case-by-case basis. This tool flags the risk so the member can act proactively.

---

## Rule 2 — Date of Birth Match (`dobMatch.js`)

**Version:** v1.0  
**Method:** Deterministic (exact string comparison)

### Policy Sources
| Source | Reference |
|--------|-----------|
| EPF Scheme 1952 | Para 36A — member details must match Aadhaar for KYC |
| EPFO Circular | Dated 10-Apr-2018 — "Aadhaar seeding and KYC verification" |

### Logic
- Exact string equality between `user.dob.epf` and `user.dob.aadhaar`
- Any mismatch is BLOCKING for all claim types
- Resolution: Joint Declaration at EPFO regional office with supporting documents (birth certificate, school leaving certificate, etc.)

---

## Rule 3 — Employer Exit Date (`employerExit.js`)

**Version:** v1.0  
**Method:** Deterministic

### Policy Sources
| Source | Reference |
|--------|-----------|
| EPF Scheme 1952 | Para 72(5) — withdrawal only after cessation of employment |
| EPFO Circular | Pension/2014/EDLI/2010 — employer must update exit in UAN portal within 30 days of separation |
| EPFO FAQ | Form 19 (epfindia.gov.in) — exit date update mandatory for final settlement |

### Claim-Type Differentiation
| Claim Type | Form | Exit Date Required? |
|------------|------|---------------------|
| Final Settlement | Form 19 | **Yes — BLOCKING** |
| Partial Withdrawal | Form 31 | **No** (member still employed) |
| EPS Pension | Form 10C | **Yes — BLOCKING** |

### Resolution Path
1. Employee writes formally to previous employer's HR/payroll
2. Employer logs into UAN Employer Portal → Member → Mark Exit
3. If employer is unresponsive (>15 days): file EPFiGMS grievance, category "Non-transfer / Exit date not updated"
4. If company is dissolved: approach EPFO regional office with proof of separation

---

## Rule 4 — Bank KYC (`bankKyc.js`)

**Version:** v1.0  
**Method:** Deterministic

### Policy Sources
| Source | Reference |
|--------|-----------|
| EPFO Circular | WSU/1(1)/2017/KYC dated 12-Apr-2017 — bank must be employer-verified |
| RBI | KYC Master Direction (2016) — applicable to EPFO fund transfers |
| EPFO Helpdesk SOP | Bank re-verification after account update |

### Logic
- Bank account must be present AND `kycVerified = true` AND `kycApprovedBy` set
- Applies to all three claim types (funds always transfer to bank)
- Common failure: account added after job change but employer not yet logged in to approve

### Resolution Path
1. Ask current/last employer to approve via UAN Employer Portal → KYC → Approve Bank
2. If employer unavailable: EPFO allows self-KYC through Aadhaar OTP in some cases (verify at your regional office)
3. EPFiGMS grievance: category "KYC — Bank account verification pending"

---

## Audit Trail

Every validation run logs:
- `REGISTRY_VERSION` (from `src/rules/index.js`)
- Each rule's `RULE_VERSION`
- Each rule's `POLICY_REF`
- Timestamp and user UAN

This enables tracing which policy version produced a specific verdict.

---

## Review History

| Date | Reviewer | Change |
|------|----------|--------|
| 2026-08-28 | Initial | Rules v1.0 created from EPFO circulars and official FAQs |

*Rules must be re-reviewed whenever EPFO issues new circulars or updates the UAN portal SOP.*
