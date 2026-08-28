/**
 * Rule: Employer Exit Date (v1)
 *
 * Policy references:
 *   • EPF Scheme 1952, Para 72(5) — withdrawal only after cessation of employment
 *   • EPFO Circular No. Pension/2014/EDLI/2010 — employer must update exit date
 *     in the UAN Employer Portal within 30 days of separation
 *   • EPFO FAQ on Form 19 (epfindia.gov.in): exit date update is mandatory for
 *     final settlement; member cannot bypass this without employer action
 *
 * Claim-type notes:
 *   • FINAL_SETTLEMENT (Form 19): exit date MUST be present — BLOCKING if missing
 *   • PARTIAL_WITHDRAWAL (Form 31): exit date NOT required — member still employed
 *   • PENSION (Form 10C): exit date MUST be present — BLOCKING if missing
 */

export const RULE_ID      = 'employerExit'
export const RULE_VERSION = 'v1.0'
export const POLICY_REF   = 'EPF Scheme 1952 Para 72(5); EPFO UAN Employer Portal SOP'

/**
 * @param {object} user       Full user object
 * @param {string} claimType  'FINAL_SETTLEMENT' | 'PARTIAL_WITHDRAWAL' | 'PENSION'
 * @returns {CheckResult}
 */
export function evaluate(user, claimType) {
  // Form 31 (partial withdrawal) — member is still employed, no exit date needed
  if (claimType === 'PARTIAL_WITHDRAWAL') {
    return {
      status:          'PASS',
      explanation:     'Employer exit date is not required for partial withdrawals (Form 31). You are filing while still employed.',
      hindiExplanation:'Form 31 के लिए नियोक्ता निकास तिथि आवश्यक नहीं है। आप नौकरी में रहते हुए आंशिक निकासी कर रहे हैं।',
      resolution:      'NO_ACTION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  // Final settlement / Pension — exit date is mandatory
  if (user.exitUpdated && user.employerExitDate) {
    return {
      status:          'PASS',
      explanation:     `Your employer has correctly updated your exit date as ${user.employerExitDate} in the EPFO UAN portal.`,
      hindiExplanation:`आपके नियोक्ता ने UAN पोर्टल में आपकी निकास तिथि ${user.employerExitDate} सही तरह से दर्ज की है।`,
      resolution:      'NO_ACTION',
      policyRef:       POLICY_REF,
      ruleVersion:     RULE_VERSION,
    }
  }

  return {
    status:          'FAIL',
    explanation:     `Your previous employer has not updated your exit date in the EPFO UAN Employer Portal. EPFO cannot process ${claimType === 'PENSION' ? 'pension withdrawal' : 'final settlement'} while you appear as an active employee. You must contact your employer or file a grievance on EPFiGMS.`,
    hindiExplanation:'आपके नियोक्ता ने UAN पोर्टल में निकास तिथि अपडेट नहीं की है। जब तक यह नहीं होता, EPFO दावे पर विचार नहीं करेगा।',
    resolution:      'EMPLOYER_ACTION',
    policyRef:       POLICY_REF,
    ruleVersion:     RULE_VERSION,
  }
}
