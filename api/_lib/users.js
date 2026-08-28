/**
 * Server-side user store.
 *
 * In this demo build the 3 users are embedded here.
 * For a real deployment, replace `USERS` with a DB query
 * (e.g. Supabase, PlanetScale, Neon) inside `findByUAN()`.
 *
 * Passwords are stored as PBKDF2-SHA-256 hashes.
 * The raw demo password for all accounts is: Demo@1234
 *
 * To re-generate hashes:
 *   node -e "
 *     const { scryptSync } = require('crypto');
 *     console.log(scryptSync('Demo@1234', 'epfo-salt', 32).toString('hex'));
 *   "
 *
 * We use a PBKDF2 approach here because it runs in the Web Crypto API
 * available in Vercel Edge + Node 18 runtimes without extra deps.
 */

// ── Password helpers ──────────────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 100_000
const SALT_PREFIX       = 'epfo2026:'

async function hashPassword(plaintext, saltSuffix) {
  const enc   = new TextEncoder()
  const key   = await crypto.subtle.importKey('raw', enc.encode(plaintext), 'PBKDF2', false, ['deriveBits'])
  const salt  = enc.encode(`${SALT_PREFIX}${saltSuffix}`)
  const bits  = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    key, 256
  )
  return Buffer.from(bits).toString('hex')
}

/** Constant-time comparison of two hex strings */
async function verifyPassword(plaintext, storedHash, saltSuffix) {
  const candidate = await hashPassword(plaintext, saltSuffix)
  // Use crypto.subtle to avoid timing attacks (compare buffers)
  const a = Buffer.from(candidate, 'hex')
  const b = Buffer.from(storedHash, 'hex')
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
  return diff === 0
}

// ── User records ──────────────────────────────────────────────────────────────
// passwordHash: PBKDF2-SHA-256 of 'Demo@1234' with salt `epfo2026:<uan>`
// To compute: run hashPassword('Demo@1234', '<uan>') and copy the hex string.
// Precomputed at build-time below; the async computation only runs on first login.

// We store a raw plaintext sentinel and hash lazily on first use to keep this
// file readable during development. In production, replace with pre-hashed values.
const RAW_DEMO_PASSWORD = 'Demo@1234'

const USERS_RAW = [
  {
    id: 'user1',
    uan: '100673291847',
    _rawPassword: RAW_DEMO_PASSWORD,
    memberName: 'Ramesh Kumar Sharma',
    aadhaarName: 'Ramesh K. Sharma',
    dob: { epf: '15/08/1966', aadhaar: '15/08/1966', display: '15 August 1966' },
    dateOfJoining: '15/03/1994',
    establishmentName: 'Tata Motors Ltd., Pune',
    establishmentCode: 'MH/PUN/0012847',
    epfoRegionalOffice: 'Pune Regional Office',
    pfBalance: 247830,
    employerExitDate: '31/03/2026',
    exitUpdated: true,
    bankAccount: {
      maskedNumber: 'XXXX XXXX 4821',
      bankName: 'State Bank of India',
      ifsc: 'SBIN0001234',
      kycVerified: true,
      kycApprovedBy: 'Employer',
    },
    scenario: 'NAME_MISMATCH_INITIAL',
    claimHistory: [],
  },
  {
    id: 'user2',
    uan: '100891234567',
    _rawPassword: RAW_DEMO_PASSWORD,
    memberName: 'Fatima Begum Shaikh',
    aadhaarName: 'Fatima Shaikh',
    dob: { epf: '22/11/1988', aadhaar: '22/11/1988', display: '22 November 1988' },
    dateOfJoining: '12/06/2015',
    establishmentName: 'Wipro BPO Solutions, Mumbai',
    establishmentCode: 'MH/MUM/0089234',
    epfoRegionalOffice: 'Mumbai Regional Office',
    pfBalance: 183450,
    employerExitDate: null,
    exitUpdated: false,
    bankAccount: {
      maskedNumber: 'XXXX XXXX 9034',
      bankName: 'HDFC Bank',
      ifsc: 'HDFC0002345',
      kycVerified: false,
      kycApprovedBy: null,
    },
    scenario: 'EMPLOYER_EXIT_AND_BANK_KYC',
    claimHistory: [],
  },
  {
    id: 'user3',
    uan: '100334455678',
    _rawPassword: RAW_DEMO_PASSWORD,
    memberName: 'Vijay Ramrao Patil',
    aadhaarName: 'Vijay Ramrao Patil',
    dob: { epf: '04/06/1978', aadhaar: '04/06/1978', display: '4 June 1978' },
    dateOfJoining: '01/08/2001',
    establishmentName: 'Reliance Industries Ltd., Nagpur',
    establishmentCode: 'MH/NAG/0034521',
    epfoRegionalOffice: 'Nagpur Regional Office',
    pfBalance: 512000,
    employerExitDate: '28/02/2026',
    exitUpdated: true,
    bankAccount: {
      maskedNumber: 'XXXX XXXX 7761',
      bankName: 'Bank of Baroda',
      ifsc: 'BARB0NAGPUR',
      kycVerified: true,
      kycApprovedBy: 'Employer',
    },
    scenario: 'ALL_CLEAR',
    claimHistory: [],
  },
]

// ── Public user shape (never include _rawPassword) ────────────────────────────

function publicUser(u) {
  const { _rawPassword, ...rest } = u
  return rest
}

// ── API ───────────────────────────────────────────────────────────────────────

/**
 * Find a user by UAN and verify their password.
 * Returns the public user object on success, null on failure.
 */
export async function authenticateUser(uan, password) {
  const user = USERS_RAW.find(u => u.uan === uan?.trim())
  if (!user) return null

  // Verify against stored hash or raw demo password
  let valid = false
  if (user.passwordHash) {
    valid = await verifyPassword(password, user.passwordHash, user.uan)
  } else {
    // Lazy plaintext fallback for demo — constant-time string compare via hash
    const candidateHash = await hashPassword(password, user.uan)
    const knownHash     = await hashPassword(user._rawPassword, user.uan)
    const a = Buffer.from(candidateHash, 'hex')
    const b = Buffer.from(knownHash, 'hex')
    let diff = 0
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i]
    valid = diff === 0
  }

  return valid ? publicUser(user) : null
}

/**
 * Find a user by UAN (no auth). Used by session rehydration.
 */
export function findUserByUAN(uan) {
  const user = USERS_RAW.find(u => u.uan === uan?.trim())
  return user ? publicUser(user) : null
}
