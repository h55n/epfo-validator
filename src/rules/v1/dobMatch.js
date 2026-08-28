/**
 * Rule: Date of Birth Match (v1)
 *
 * Policy references:
 *   • EPFO SOP for Correction of Member Details (Form 11 / Joint Declaration)
 *   • EPFO Circular dated 10-Apr-2018 — "Aadhaar seeding and KYC verification"
 *   • Para 36A, EPF Scheme 1952: member details must match Aadhaar
 *
 * This is a purely deterministic rule — no AI required.
 * DOB must match exactly between EPF records and Aadhaar.
 *
 * Claim-type notes:
 *   All three claim types (FINAL_SETTLEMENT, PARTIAL_WITHDRAWAL, PENSION)
 *   require DOB to match for KYC to pass. No divergence across claim types.
 */

export const RULE_ID      = 'dobMatch'
export const RULE_VERSION = 'v1.0'
export const POLICY_REF   = 'EPF Scheme 1952 Para 36A; EPFO Circular 10-Apr-2018'

/**
 * @param {object} user       Full user object
 * @param {string} _claimType Selected claim type ID
 * @returns {CheckResult}     Synchronous — no async needed
 */
export function evaluate(user, _claimType) {
  const epfDob    = user.dob?.epf
  const aadhaarDob = user.dob?.aadhaar

  if (!epfDob || !aadhaarDob) {
    return {
      status:          'FAIL',
      explanation:     'Date of birth data is missing. Please verify your EPF records and Aadhaar.',
      hindiExplanation:'जन्म तिथि का डेटा उपलब्ध नहीं है। कृपया अपने EPF रिकॉर्ड और Aadhaar की जांच करें।',
      resolution:      'DOB_CORRECTION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  if (epfDob === aadhaarDob) {
    return {
      status:          'PASS',
      explanation:     `Date of birth matches in both EPF records and Aadhaar (${epfDob}).`,
      hindiExplanation:`जन्म तिथि EPF रिकॉर्ड और Aadhaar दोनों में सही है (${epfDob})।`,
      resolution:      'NO_ACTION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  return {
    status:          'FAIL',
    explanation:     `Date of birth in EPF records (${epfDob}) does not match Aadhaar (${aadhaarDob}). EPFO will reject the claim until these are reconciled.`,
    hindiExplanation:`EPF रिकॉर्ड में जन्म तिथि (${epfDob}) Aadhaar (${aadhaarDob}) से मेल नहीं खाती। इसे ठीक करना जरूरी है।`,
    resolution:      'DOB_CORRECTION',
    policyRef:       POLICY_REF,
    ruleVersion:     RULE_VERSION,
  }
}
