/**
 * Rule: Name Match (v1)
 *
 * Policy references:
 *   • EPFO Circular WSU/15(1)2019/MIS/2019-20 dated 28-Jun-2019
 *     "Procedure for correction of name/DOB in EPF records"
 *   • EPFO SOP for Joint Declaration (Form available at epfindia.gov.in)
 *   • UIDAI Circular on name discrepancy resolution (uidai.gov.in)
 *
 * This rule is AI-assisted for nuanced name comparison.
 * If AI is unavailable, it falls back to the deterministic scenario fallback.
 */

import { validateNameMatch as aiValidateName } from '../../lib/nameValidator.js'

export const RULE_ID      = 'nameMatch'
export const RULE_VERSION = 'v1.0'
export const POLICY_REF   = 'EPFO Circular WSU/15(1)2019/MIS/2019-20 (28-Jun-2019)'

/**
 * @param {object} user       Full user object from the store
 * @param {string} _claimType Selected claim type ID (e.g. 'FINAL_SETTLEMENT')
 * @returns {Promise<CheckResult>}
 */
export async function evaluate(user, _claimType) {
  const result = await aiValidateName(user.memberName, user.aadhaarName, user.scenario)
  return {
    ...result,
    policyRef:   POLICY_REF,
    ruleVersion: RULE_VERSION,
  }
}
