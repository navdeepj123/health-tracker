import { validateEmail, validatePassword, validateName, validateNumber } from '../utils/validation';

describe('validateEmail', () => {
  it('rejects empty', () => expect(validateEmail('')).toBe('Email is required'));
  it('rejects invalid', () => expect(validateEmail('notvalid')).toBe('Enter a valid email address'));
  it('accepts valid', () => expect(validateEmail('a@b.com')).toBe(''));
});

describe('validatePassword', () => {
  it('rejects empty', () => expect(validatePassword('')).toBe('Password is required'));
  it('rejects short', () => expect(validatePassword('abc')).toMatch(/6 characters/));
  it('accepts valid', () => expect(validatePassword('secret123')).toBe(''));
});

describe('validateName', () => {
  it('rejects empty', () => expect(validateName('')).toBe('Name is required'));
  it('rejects single char', () => expect(validateName('A')).toMatch(/2 characters/));
  it('accepts valid', () => expect(validateName('Ramandeep')).toBe(''));
});

describe('validateNumber', () => {
  it('rejects empty', () => expect(validateNumber('', 'Calories')).toBe('Calories is required'));
  it('rejects zero', () => expect(validateNumber('0', 'Duration')).toMatch(/greater than 0/));
  it('accepts positive', () => expect(validateNumber('100', 'Amount')).toBe(''));
});
