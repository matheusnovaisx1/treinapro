import { describe, it, expect } from 'vitest';
import { loginSchema, signupPersonalSchema, acceptInviteSchema } from './auth';

describe('loginSchema', () => {
  it('accepts a valid email/password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123456' });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '123456' });
    expect(result.success).toBe(false);
  });

  it('rejects a short password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.com', password: '123' });
    expect(result.success).toBe(false);
  });
});

describe('signupPersonalSchema', () => {
  const base = { fullName: 'João Silva', email: 'joao@example.com', password: '123456', confirmPassword: '123456' };

  it('accepts matching passwords', () => {
    expect(signupPersonalSchema.safeParse(base).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = signupPersonalSchema.safeParse({ ...base, confirmPassword: 'different' });
    expect(result.success).toBe(false);
  });

  it('rejects a missing full name', () => {
    const result = signupPersonalSchema.safeParse({ ...base, fullName: '' });
    expect(result.success).toBe(false);
  });
});

describe('acceptInviteSchema', () => {
  it('behaves like signupPersonalSchema for password confirmation', () => {
    const result = acceptInviteSchema.safeParse({
      fullName: 'Aluno Teste',
      email: 'aluno@example.com',
      password: 'abcdef',
      confirmPassword: 'zzzzzz',
    });
    expect(result.success).toBe(false);
  });
});
