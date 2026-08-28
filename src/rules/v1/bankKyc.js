/**
 * Rule: Bank KYC Verification (v1)
 *
 * Policy references:
 *   • EPFO Circular No. WSU/1(1)/2017/KYC dated 12-Apr-2017
 *     "Bank account must be verified by employer before PF withdrawal"
 *   • EPFO FAQ: bank account must be linked AND employer-approved for funds transfer
 *   • Reserve Bank of India KYC Master Direction (2016) — applicable to EPFO transfers
 *   • EPFO Helpdesk SOP: bank KYC re-verification after account update
 *
 * Claim-type notes:
 *   • FINAL_SETTLEMENT (Form 19): bank KYC required — BLOCKING if missing
 *   • PARTIAL_WITHDRAWAL (Form 31): bank KYC required — BLOCKING if missing
 *   • PENSION (Form 10C): bank KYC required — BLOCKING if missing
 *   All three types transfer funds to the bank account, so KYC is always required.
 */

export const RULE_ID      = 'bankKyc'
export const RULE_VERSION = 'v1.0'
export const POLICY_REF   = 'EPFO Circular WSU/1(1)/2017/KYC (12-Apr-2017); RBI KYC Master Direction 2016'

/**
 * @param {object} user       Full user object
 * @param {string} _claimType Selected claim type ID
 * @returns {CheckResult}
 */
export function evaluate(user, _claimType) {
  const { kycVerified, kycApprovedBy, maskedNumber, bankName } = user.bankAccount || {}

  if (!maskedNumber || !bankName) {
    return {
      status:          'FAIL',
      explanation:     'No bank account is linked to your UAN. You must add and verify a bank account before EPFO can transfer funds.',
      hindiExplanation:'आपके UAN से कोई बैंक खाता नहीं जुड़ा है। EPFO भुगतान के लिए बैंक खाता जोड़ना और सत्यापित करना जरूरी है।',
      resolution:      'BANK_REVERIFICATION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  if (kycVerified && kycApprovedBy) {
    return {
      status:          'PASS',
      explanation:     `Your ${bankName} account (${maskedNumber}) is verified and approved by your employer. EPFO can transfer funds directly.`,
      hindiExplanation:`आपका ${bankName} खाता (${maskedNumber}) सत्यापित है और नियोक्ता द्वारा मंजूर है।`,
      resolution:      'NO_ACTION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  if (maskedNumber && !kycVerified) {
    return {
      status:          'FAIL',
      explanation:     `Your ${bankName} account (${maskedNumber}) has been added to your UAN but has not yet been approved by your employer. EPFO requires employer-verified bank KYC before transferring funds. Ask your HR/employer to approve the account in the UAN Employer Portal.`,
      hindiExplanation:`आपका ${bankName} खाता (${maskedNumber}) UAN में जुड़ा है लेकिन नियोक्ता ने अभी तक मंजूरी नहीं दी है। HR से UAN पोर्टल पर अनुमोदन के लिए कहें।`,
      resolution:      'BANK_REVERIFICATION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  // Account present but no approver recorded
  return {
    status:          'ADVISORY',
    explanation:     `Your ${bankName} account (${maskedNumber}) appears linked but the employer approval status could not be confirmed. Verify with your employer that they have approved the account in the UAN Employer Portal.`,
    hindiExplanation:`आपका ${bankName} खाता जुड़ा हुआ लगता है लेकिन नियोक्ता अनुमोदन की स्थिति अज्ञात है। कृपया HR से पुष्टि करें।`,
    resolution:      'BANK_REVERIFICATION',
    policyRef:       POLICY_REF,
    ruleVersion:     RULE_VERSION,
  }
}
