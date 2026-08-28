/**
 * Validation engine — orchestrates the rule registry.
 *
 * Runs each rule in sequence, calling onCheckUpdate() after each one
 * so the UI can show real-time progress. Rules are defined in
 * src/rules/index.js and are fully decoupled from this orchestrator.
 */

import { RULES, REGISTRY_VERSION } from '../rules/index.js'
import { sleep }                   from './utils.js'

/**
 * Run all validation rules for the given user and claim type.
 *
 * @param {object}   user          User object from authStore
 * @param {string}   claimType     Selected claim type ID
 * @param {Function} onCheckUpdate Called after each rule: (ruleId, result) => void
 */
export async function runValidation(user, claimType, onCheckUpdate) {
  console.info(`[validationEngine] registry v${REGISTRY_VERSION}, claimType=${claimType}`)

  for (const rule of RULES) {
    // Signal that this check is running
    onCheckUpdate(rule.RULE_ID, { status: 'RUNNING' })

    // Small delay so the UI animates each check visibly
    await sleep(200)

    try {
      const result = await rule.evaluate(user, claimType)
      onCheckUpdate(rule.RULE_ID, result)
    } catch (err) {
      console.error(`[validationEngine] rule "${rule.RULE_ID}" threw:`, err)
      // Any rule that crashes falls back to a safe ADVISORY
      onCheckUpdate(rule.RULE_ID, {
        status:          'ADVISORY',
        explanation:     'This check could not be completed. Please verify this item manually before submitting.',
        hindiExplanation:'यह जांच पूरी नहीं हो सकी। कृपया जमा करने से पहले इसे मैन्युअल रूप से सत्यापित करें।',
        resolution:      null,
        policyRef:       rule.POLICY_REF,
        ruleVersion:     rule.RULE_VERSION,
      })
    }

    // Brief pause between checks for UI breathing room
    await sleep(600)
  }
}
