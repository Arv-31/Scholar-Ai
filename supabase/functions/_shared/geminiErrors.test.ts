import { describe, expect, it } from 'vitest'
import { classifyGeminiError } from './geminiErrors.ts'

// Real shapes Google sends back, so the mapping cannot quietly break.
describe('classifyGeminiError', () => {
  it('treats an invalid key as BAD_KEY', () => {
    const r = classifyGeminiError({
      status: 400,
      googleStatus: 'INVALID_ARGUMENT',
      reason: 'API_KEY_INVALID',
      message: 'API key not valid. Please pass a valid API key.',
    })
    expect(r.code).toBe('BAD_KEY')
    expect(r.message).toContain('API key not valid')
  })

  it('treats an expired key as BAD_KEY even without a reason', () => {
    const r = classifyGeminiError({ status: 400, message: 'API key expired. Please renew the API key.' })
    expect(r.code).toBe('BAD_KEY')
  })

  it('does NOT call a plain 400 a bad key', () => {
    const r = classifyGeminiError({
      status: 400,
      googleStatus: 'INVALID_ARGUMENT',
      message: 'Invalid JSON payload received.',
    })
    expect(r.code).toBe('AI_FAILED')
  })

  it('maps an unsupported location to REGION', () => {
    const r = classifyGeminiError({
      status: 400,
      googleStatus: 'FAILED_PRECONDITION',
      message: 'User location is not supported for the API use.',
    })
    expect(r.code).toBe('REGION')
  })

  it('maps permission denied to NO_ACCESS', () => {
    const r = classifyGeminiError({
      status: 403,
      googleStatus: 'PERMISSION_DENIED',
      message: 'Method doesn\'t allow unregistered callers.',
    })
    expect(r.code).toBe('NO_ACCESS')
  })

  it('maps a missing model to MODEL_UNAVAILABLE', () => {
    const r = classifyGeminiError({
      status: 404,
      googleStatus: 'NOT_FOUND',
      message: 'models/gemini-x is not found for API version v1beta.',
    })
    expect(r.code).toBe('MODEL_UNAVAILABLE')
  })

  it('maps quota errors to RATE_LIMIT', () => {
    const r = classifyGeminiError({ status: 429, googleStatus: 'RESOURCE_EXHAUSTED', message: 'Quota exceeded.' })
    expect(r.code).toBe('RATE_LIMIT')
    expect(r.httpStatus).toBe(429)
  })

  it('maps high demand to BUSY', () => {
    const r = classifyGeminiError({
      status: 503,
      googleStatus: 'UNAVAILABLE',
      message: 'This model is currently experiencing high demand.',
    })
    expect(r.code).toBe('BUSY')
  })

  it('shortens long Google messages', () => {
    const r = classifyGeminiError({ status: 500, message: 'x'.repeat(500) })
    expect(r.message.length).toBeLessThan(260)
  })
})
