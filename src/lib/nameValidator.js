import { callAI } from './aiAdapter.js'
import { FALLBACK_RESULTS } from '../data/fallbackResults.js'

export async function validateNameMatch(epfName, aadhaarName, userScenario) {
  const prompt = `You are an EPFO KYC validation expert. Compare these two names and determine if they refer to the same person. Indian names often have:
- Initials as abbreviations (R.K. Sharma = Rajesh Kumar Sharma)
- Transliteration variants (Mohammed = Mohammad = Md.)
- Middle names absent in one record
- Gendered suffixes (Devi, Bai, Kumari, Begum) missing from one record
- Name order differences

CRITICAL EPFO RULE: Even if the names logically refer to the same person, if there is ANY difference in spelling, missing middle names, or initial vs full name (e.g. "K." vs "Kumar"), you MUST flag it as a mismatch.
- For initial vs full name (e.g. Ramesh K. Sharma vs Ramesh Kumar Sharma), set severity to "BLOCKING" and resolution to "JOINT_DECLARATION".
- For missing middle names (e.g. Fatima Begum Shaikh vs Fatima Shaikh), set severity to "ADVISORY" and resolution to "JOINT_DECLARATION".

EPF Record Name: "${epfName}"
Aadhaar Name: "${aadhaarName}"

Respond ONLY with valid JSON, no markdown, no code blocks, no extra text:
{
  "isMatch": boolean,
  "confidence": number,
  "severity": "NONE" | "ADVISORY" | "BLOCKING",
  "mismatchType": "INITIAL_VS_FULL" | "TRANSLITERATION" | "MIDDLE_NAME_MISSING" | "SUFFIX_MISSING" | "ORDER_DIFFERENCE" | "COMPLETE_MISMATCH" | "NONE",
  "explanation": "One plain English sentence for a non-technical worker",
  "hindiExplanation": "Same explanation in Hindi",
  "resolution": "JOINT_DECLARATION" | "UIDAI_CORRECTION" | "NO_ACTION"
}`

  const result = await callAI(prompt, { maxTokens: 400, json: true, expectSchema: 'nameMatch' })

  if (!result) {
    console.info('[nameValidator] Using deterministic fallback for scenario:', userScenario)
    return buildFallback(userScenario)
  }

  let status = 'PASS'
  if (result.severity === 'BLOCKING') status = 'FAIL'
  else if (result.severity === 'ADVISORY') status = 'ADVISORY'

  return {
    status,
    mismatchType: result.mismatchType || 'NONE',
    explanation:  result.explanation,
    hindiExplanation: result.hindiExplanation,
    resolution:   result.resolution,
    severity:     result.severity,
    confidence:   result.confidence,
  }
}

function buildFallback(scenario) {
  const r = FALLBACK_RESULTS[scenario]
  if (r?.nameMatch) return r.nameMatch
  return {
    status: 'PASS', mismatchType: 'NONE',
    explanation: 'Names match in both records.',
    hindiExplanation: 'दोनों रिकॉर्ड में नाम मेल खाते हैं।',
    resolution: 'NO_ACTION', severity: 'NONE',
  }
}
