import assert from 'node:assert/strict'
import test from 'node:test'
import { createHmac, webcrypto } from 'node:crypto'
import { createSessionToken, verifySessionToken } from '../../api/_lib/session.js'

globalThis.crypto ??= webcrypto
const secret = 'test-only-session-key-not-a-live-secret-12345'
function env(t, values) {
  for (const [key, value] of Object.entries(values)) {
    const old = process.env[key]
    t.after(() => old === undefined ? delete process.env[key] : process.env[key] = old)
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
}
function signed(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return body + '.' + createHmac('sha256', secret).update(body).digest('base64url')
}
for (const hosted of [{ NODE_ENV: 'production', VERCEL: undefined }, { NODE_ENV: 'test', VERCEL: '1' }]) {
  test(`refuses unsigned configuration in ${JSON.stringify(hosted)}`, async t => {
    env(t, { ...hosted, SESSION_SECRET: undefined })
    await assert.rejects(createSessionToken({ uan: '000000000000' }), /SESSION_SECRET/)
    const body = Buffer.from(JSON.stringify({ uan: '000000000000', iat: Math.floor(Date.now() / 1000) })).toString('base64url')
    const token = body + '.' + createHmac('sha256', 'dev-fallback-session-secret-at-least-32-characters-long').update(body).digest('base64url')
    assert.equal(await verifySessionToken(token), null)
  })
}
test('rejects configured secrets shorter than the documented32characters', async t => {
  env(t, { SESSION_SECRET: '0123456789abcdef', NODE_ENV: 'production' })
  await assert.rejects(createSessionToken({}), /SESSION_SECRET/)
})
for (const iat of [undefined, null, 0, '123', Infinity, Math.floor(Date.now() / 1000) + 3600, Math.floor(Date.now() / 1000) - 28801]) {
  test(`rejects invalid or expired timestamp ${String(iat)}`, async t => {
    env(t, { SESSION_SECRET: secret })
    assert.equal(await verifySessionToken(signed({ uan: '000000000000', iat })), null)
  })
}
test('valid sessions round-trip and reject a tampered signature', async t => {
  env(t, { SESSION_SECRET: secret })
  const token = await createSessionToken({ uan: '000000000000' })
  assert.equal((await verifySessionToken(token)).uan, '000000000000')
  assert.equal(await verifySessionToken(token + 'x'), null)
})
test('local development can still create a session without production credentials', async t => {
  env(t, { SESSION_SECRET: undefined, NODE_ENV: 'development', VERCEL: undefined })
  const token = await createSessionToken({ uan: '000000000000' })
  assert.equal((await verifySessionToken(token)).uan, '000000000000')
})
