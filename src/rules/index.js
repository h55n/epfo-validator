/**
 * Rules registry — versioned validation engine.
 *
 * Exports a single `RULES` array in execution order.
 * Each rule module exports:
 *   - RULE_ID:      string — matches the key in validationStore.checks
 *   - RULE_VERSION: string — semver for audit trail
 *   - POLICY_REF:   string — official EPFO/govt policy reference
 *   - evaluate(user, claimType): CheckResult | Promise<CheckResult>
 *
 * REGISTRY_VERSION bumps whenever any rule changes materially.
 * Log this alongside every validation run for auditability.
 */

import * as nameMatchRule    from './v1/nameMatch.js'
import * as dobMatchRule     from './v1/dobMatch.js'
import * as employerExitRule from './v1/employerExit.js'
import * as bankKycRule      from './v1/bankKyc.js'

export const REGISTRY_VERSION = '1.0.0'

/**
 * Ordered list of rules.
 * Validation runs them in this order — earlier rules surface first.
 */
export const RULES = [
  nameMatchRule,
  dobMatchRule,
  employerExitRule,
  bankKycRule,
]

/**
 * Manifest for display / debugging.
 */
export const RULE_MANIFEST = RULES.map(r => ({
  id:        r.RULE_ID,
  version:   r.RULE_VERSION,
  policyRef: r.POLICY_REF,
}))
