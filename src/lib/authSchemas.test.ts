import { describe, expect, it } from 'vitest'
import { firstProblem, NewPasswordForm, SignInForm, SignUpForm } from './authSchemas'

describe('login and sign-up form checks (Zod)', () => {
  it('rejects a bad email', () => {
    expect(firstProblem(SignInForm, { email: 'student@', password: 'x' })).toBe(
      'Enter a valid email address.',
    )
  })

  it('accepts a normal sign-in, even with an older short password', () => {
    expect(firstProblem(SignInForm, { email: ' a@b.co ', password: 'abc' })).toBeNull()
  })

  it('asks for a password when it is empty', () => {
    expect(firstProblem(SignInForm, { email: 'a@b.co', password: '' })).toBe('Enter your password.')
  })

  it('needs at least 8 characters for a new account', () => {
    expect(firstProblem(SignUpForm, { email: 'a@b.co', password: '1234567' })).toBe(
      'Use at least 8 characters.',
    )
    expect(firstProblem(SignUpForm, { email: 'a@b.co', password: '12345678' })).toBeNull()
  })

  it('checks that the two new passwords match', () => {
    expect(firstProblem(NewPasswordForm, { password: 'abcdefgh', confirm: 'abcdefgx' })).toBe(
      'The two passwords do not match.',
    )
    expect(firstProblem(NewPasswordForm, { password: 'abcdefgh', confirm: 'abcdefgh' })).toBeNull()
  })
})
