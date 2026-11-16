import { describe, it, expect } from 'vitest';
import { parseDocumentText, getSampleIdentityDocuments } from '../utils/ocr';

describe('Phase 7: Document OCR & Field Identification', () => {
  it('identifies passport fields accurately from raw OCR text', () => {
    const rawPassportText = `
      PASSPORT / PASSEPORT
      UNITED STATES OF AMERICA
      SURNAME: MORGAN
      GIVEN NAMES: ALEXANDER
      PASSPORT NO: P84920194
      DATE OF BIRTH: 1992-08-14
      DATE OF EXPIRY: 2032-11-20
      P<USAMORGAN<<ALEXANDER<<<<<<<<<<<<<<<<<<<
      P849201940USA9208144M3211204<<<<<<<<<<<<02
    `;

    const extracted = parseDocumentText(rawPassportText, 95);

    expect(extracted.documentType).toBe('PASSPORT');
    expect(extracted.fullName).toContain('MORGAN');
    expect(extracted.documentNumber).toBe('P84920194');
    expect(extracted.dateOfBirth).toBe('1992-08-14');
    expect(extracted.expiryDate).toBe('2032-11-20');
    expect(extracted.confidence).toBe(95);
  });

  it('identifies driver license fields from raw OCR text', () => {
    const rawDLText = `
      CALIFORNIA DRIVER LICENSE
      USA
      LIC NO: DL-98234120
      NAME: PRIYA SHARMA
      DOB: 1996-03-25
      EXP: 2031-05-30
    `;

    const extracted = parseDocumentText(rawDLText, 90);

    expect(extracted.documentType).toBe('DRIVING_LICENSE');
    expect(extracted.fullName).toContain('PRIYA SHARMA');
    expect(extracted.documentNumber).toBe('DL-98234120');
    expect(extracted.dateOfBirth).toBe('1996-03-25');
    expect(extracted.expiryDate).toBe('2031-05-30');
  });

  it('identifies expired document dates correctly', () => {
    const rawExpiredText = `
      NATIONAL IDENTITY CARD
      NAME: ROBERT CHEN
      ID NO: ID-10928374
      DOB: 1988-10-12
      EXPIRES: 2021-04-10
    `;

    const extracted = parseDocumentText(rawExpiredText, 88);

    expect(extracted.documentType).toBe('NATIONAL_ID');
    expect(extracted.fullName).toContain('ROBERT CHEN');
    expect(extracted.documentNumber).toBe('ID-10928374');
    expect(extracted.dateOfBirth).toBe('1988-10-12');
    expect(extracted.expiryDate).toBe('2021-04-10');
  });

  it('provides accessible pre-packaged demo documents for instant testing', () => {
    const samples = getSampleIdentityDocuments();

    expect(samples.length).toBeGreaterThanOrEqual(3);
    const passportSample = samples.find((s) => s.documentType === 'PASSPORT');
    expect(passportSample).toBeDefined();
    expect(passportSample?.extractedFields.fullName).toBe('Alexander Morgan');
    expect(passportSample?.svgDataUrl).toContain('data:image/svg+xml');
  });
});

