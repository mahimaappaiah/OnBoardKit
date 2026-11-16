import { describe, it, expect } from 'vitest';
import {
  validateFullName,
  validateDateOfBirth,
  validatePhone,
  validateEmail,
  validateUserDetails,
} from '../utils/validation';
import { translations } from '../i18n/translations';

describe('Phase 4: Pure Form Validation Functions', () => {
  const tEn = translations.en;
  const tHi = translations.hi;

  describe('Full Name Validation', () => {
    it('rejects empty or whitespace-only names', () => {
      expect(validateFullName('', tEn)).toBe(tEn.validation.fullNameRequired);
      expect(validateFullName('   ', tEn)).toBe(tEn.validation.fullNameRequired);
      expect(validateFullName('', tHi)).toBe(tHi.validation.fullNameRequired);
    });

    it('rejects single character names', () => {
      expect(validateFullName('A', tEn)).toBe(tEn.validation.fullNameInvalid);
    });

    it('rejects names with numbers or special symbols', () => {
      expect(validateFullName('John123', tEn)).toBe(tEn.validation.fullNameInvalid);
      expect(validateFullName('Jane@Doe', tEn)).toBe(tEn.validation.fullNameInvalid);
      expect(validateFullName('Test#Name', tEn)).toBe(tEn.validation.fullNameInvalid);
    });

    it('accepts valid single and multi-part names, hyphens, apostrophes, and unicode characters', () => {
      expect(validateFullName('Jane Doe', tEn)).toBeUndefined();
      expect(validateFullName("Jean-Luc O'Connor", tEn)).toBeUndefined();
      expect(validateFullName('Renée Müller', tEn)).toBeUndefined();
      expect(validateFullName('राहुल शर्मा', tHi)).toBeUndefined();
    });
  });

  describe('Date of Birth Validation (18+ Age Check)', () => {
    it('rejects empty date of birth', () => {
      expect(validateDateOfBirth('', tEn)).toBe(tEn.validation.dobRequired);
      expect(validateDateOfBirth('', tHi)).toBe(tHi.validation.dobRequired);
    });

    it('rejects malformed date strings', () => {
      expect(validateDateOfBirth('invalid-date', tEn)).toBe(tEn.validation.dobInvalid);
      expect(validateDateOfBirth('2020/01/01', tEn)).toBe(tEn.validation.dobInvalid);
      expect(validateDateOfBirth('31-12-1990', tEn)).toBe(tEn.validation.dobInvalid);
    });

    it('rejects future dates', () => {
      const nextYear = new Date().getFullYear() + 1;
      expect(validateDateOfBirth(`${nextYear}-01-01`, tEn)).toBe(tEn.validation.dobInvalid);
    });

    it('rejects applicants younger than 18 years', () => {
      const today = new Date();
      // Someone born 16 years ago
      const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      const dobStr = sixteenYearsAgo.toISOString().split('T')[0];
      expect(validateDateOfBirth(dobStr, tEn)).toBe(tEn.validation.dobUnderage);
      expect(validateDateOfBirth(dobStr, tHi)).toBe(tHi.validation.dobUnderage);
    });

    it('accepts applicants aged 18 or older', () => {
      const today = new Date();
      // Someone born 25 years ago
      const twentyFiveYearsAgo = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      const dobStr = twentyFiveYearsAgo.toISOString().split('T')[0];
      expect(validateDateOfBirth(dobStr, tEn)).toBeUndefined();
      expect(validateDateOfBirth('1985-07-20', tEn)).toBeUndefined();
    });

    it('rejects unrealistically old dates (> 120 years)', () => {
      expect(validateDateOfBirth('1850-01-01', tEn)).toBe(tEn.validation.dobInvalid);
    });
  });

  describe('Phone Number Validation', () => {
    it('rejects empty phone numbers', () => {
      expect(validatePhone('', tEn)).toBe(tEn.validation.phoneRequired);
      expect(validatePhone('', tHi)).toBe(tHi.validation.phoneRequired);
    });

    it('rejects phone numbers with fewer than 10 digits', () => {
      expect(validatePhone('12345', tEn)).toBe(tEn.validation.phoneInvalid);
      expect(validatePhone('+1 234 56', tEn)).toBe(tEn.validation.phoneInvalid);
    });

    it('rejects phone numbers with invalid letters or characters', () => {
      expect(validatePhone('98765abcd0', tEn)).toBe(tEn.validation.phoneInvalid);
    });

    it('accepts valid 10-digit, international, and formatted phone numbers', () => {
      expect(validatePhone('9876543210', tEn)).toBeUndefined();
      expect(validatePhone('+1 555 123 4567', tEn)).toBeUndefined();
      expect(validatePhone('+91 (987) 654-3210', tEn)).toBeUndefined();
      expect(validatePhone('09876543210', tEn)).toBeUndefined();
    });
  });

  describe('Email Address Validation', () => {
    it('rejects empty email addresses', () => {
      expect(validateEmail('', tEn)).toBe(tEn.validation.emailRequired);
      expect(validateEmail('', tHi)).toBe(tHi.validation.emailRequired);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('plainaddress', tEn)).toBe(tEn.validation.emailInvalid);
      expect(validateEmail('@missingusername.com', tEn)).toBe(tEn.validation.emailInvalid);
      expect(validateEmail('user@.com', tEn)).toBe(tEn.validation.emailInvalid);
      expect(validateEmail('user@domain', tEn)).toBe(tEn.validation.emailInvalid);
      expect(validateEmail('user space@domain.com', tEn)).toBe(tEn.validation.emailInvalid);
    });

    it('accepts valid email addresses', () => {
      expect(validateEmail('user@example.com', tEn)).toBeUndefined();
      expect(validateEmail('first.last@sub.domain.co.uk', tEn)).toBeUndefined();
      expect(validateEmail('customer+service123@brand.org', tEn)).toBeUndefined();
    });
  });

  describe('Composite Form Validation (validateUserDetails)', () => {
    it('returns all errors for an empty form', () => {
      const errors = validateUserDetails(
        { fullName: '', dateOfBirth: '', phone: '', email: '' },
        tEn
      );

      expect(errors.fullName).toBe(tEn.validation.fullNameRequired);
      expect(errors.dateOfBirth).toBe(tEn.validation.dobRequired);
      expect(errors.phone).toBe(tEn.validation.phoneRequired);
      expect(errors.email).toBe(tEn.validation.emailRequired);
    });

    it('returns empty error map when all fields are valid', () => {
      const errors = validateUserDetails(
        {
          fullName: 'Jane Doe',
          dateOfBirth: '1992-04-12',
          phone: '+1 555 123 4567',
          email: 'jane.doe@example.com',
        },
        tEn
      );

      expect(Object.keys(errors)).toHaveLength(0);
    });
  });
});

