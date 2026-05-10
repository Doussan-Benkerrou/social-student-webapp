import { validatePasswordUpdate } from '@/lib/validations/password';

describe('validatePasswordUpdate', () => {
  it('accepts matching passwords with at least 8 characters', () => {
    expect(validatePasswordUpdate('Secure123', 'Secure123')).toBeNull();
  });

  it('rejects short passwords', () => {
    expect(validatePasswordUpdate('short', 'short')).toContain('au moins 8 caractères');
  });

  it('rejects different confirmation passwords', () => {
    expect(validatePasswordUpdate('Secure123', 'Other123')).toContain('ne correspondent pas');
  });
});
