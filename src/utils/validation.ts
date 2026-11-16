import { UserDetails } from '../types/config';
import { Translations } from '../i18n/translations';

export interface ValidationErrors {
  fullName?: string;
  dateOfBirth?: string;
  phone?: string;
  email?: string;
}

/**
 * Validates full name:
 * - Must not be empty
 * - Must be at least 2 characters
 * - Letters, spaces, apostrophes, and hyphens only
 */
export function validateFullName(name: string, t: Translations): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return t.validation.fullNameRequired;
  }
  if (trimmed.length < 2) {
    return t.validation.fullNameInvalid;
  }
  // Allow letters, unicode mark/diacritics (vital for Hindi and other scripts), spaces, dots, hyphens, and apostrophes
  const nameRegex = /^[\p{L}\p{M}\s.'-]+$/u;
  if (!nameRegex.test(trimmed)) {
    return t.validation.fullNameInvalid;
  }
  return undefined;
}

/**
 * Validates Date of Birth:
 * - Must not be empty
 * - Valid YYYY-MM-DD
 * - Must be a past date
 * - User must be at least 18 years old
 */
export function validateDateOfBirth(dob: string, t: Translations): string | undefined {
  if (!dob) {
    return t.validation.dobRequired;
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dob)) {
    return t.validation.dobInvalid;
  }

  const parsedDate = new Date(dob);
  if (isNaN(parsedDate.getTime())) {
    return t.validation.dobInvalid;
  }

  const today = new Date();
  if (parsedDate >= today) {
    return t.validation.dobInvalid;
  }

  // Calculate age accurately
  let age = today.getFullYear() - parsedDate.getFullYear();
  const monthDiff = today.getMonth() - parsedDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < parsedDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return t.validation.dobUnderage;
  }

  // Sanity check for excessive age (> 120 years)
  if (age > 120) {
    return t.validation.dobInvalid;
  }

  return undefined;
}

/**
 * Validates phone number:
 * - Must not be empty
 * - Must contain at least 10 digits
 * - Allows optional leading + and formatting characters (spaces, dashes, parens)
 */
export function validatePhone(phone: string, t: Translations): string | undefined {
  const trimmed = phone.trim();
  if (!trimmed) {
    return t.validation.phoneRequired;
  }

  const digitsOnly = trimmed.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return t.validation.phoneInvalid;
  }

  // Allow optional leading +, digits, hyphens, parentheses, and spaces
  const phoneRegex = /^\+?[0-9\s\-()]{10,20}$/;
  if (!phoneRegex.test(trimmed)) {
    return t.validation.phoneInvalid;
  }

  return undefined;
}

/**
 * Validates email address:
 * - Must not be empty
 * - Standard RFC-compliant email structure
 */
export function validateEmail(email: string, t: Translations): string | undefined {
  const trimmed = email.trim();
  if (!trimmed) {
    return t.validation.emailRequired;
  }

  // Standard safe email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return t.validation.emailInvalid;
  }

  return undefined;
}

/**
 * Validates the entire user details form.
 * Pure function: takes data and translations, returns error map.
 */
export function validateUserDetails(details: UserDetails, t: Translations): ValidationErrors {
  const errors: ValidationErrors = {};

  const nameError = validateFullName(details.fullName, t);
  if (nameError) errors.fullName = nameError;

  const dobError = validateDateOfBirth(details.dateOfBirth, t);
  if (dobError) errors.dateOfBirth = dobError;

  const phoneError = validatePhone(details.phone, t);
  if (phoneError) errors.phone = phoneError;

  const emailError = validateEmail(details.email, t);
  if (emailError) errors.email = emailError;

  return errors;
}

