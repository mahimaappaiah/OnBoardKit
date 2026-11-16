import { describe, it, expect } from 'vitest';
import { evaluateVerification } from '../utils/verificationEngine';
import { ComprehensiveVerificationInput } from '../types/verification';

const baseValidInput: ComprehensiveVerificationInput = {
  details: {
    fullName: 'Alexander Morgan',
    dateOfBirth: '1992-08-14',
    phone: '+1 555 123 4567',
    email: 'alexander.morgan@example.com',
  },
  extractedDocFields: {
    fullName: 'Alexander Morgan',
    dateOfBirth: '1992-08-14',
    documentNumber: 'P84920194',
    expiryDate: '2032-11-20',
    documentType: 'PASSPORT',
    rawText: 'DEMO PASSPORT\nALEXANDER MORGAN',
    confidence: 95,
    isUserConfirmed: true,
  },
  documentQuality: {
    isAcceptable: true,
    brightness: { value: 128, status: 'optimal', feedback: 'Balanced' },
    sharpness: { value: 75, status: 'sharp', feedback: 'Sharp' },
    resolution: { width: 1280, height: 720, megapixels: 0.92, isAdequate: true, feedback: 'Adequate' },
    actionableTips: ['Optimal quality'],
  },
  idCapture: {
    dataUrl: 'data:image/jpeg;base64,mockId',
    timestamp: Date.now(),
    source: 'camera',
  },
  selfieCapture: {
    dataUrl: 'data:image/jpeg;base64,mockSelfie',
    timestamp: Date.now(),
    source: 'camera',
  },
  documentUpload: null,
};

describe('Phase 7: KYC Verification Engine Rules', () => {
  it('approves verification when all compliance rules and quality checks pass', () => {
    const decision = evaluateVerification(baseValidInput);

    expect(decision.outcome).toBe('APPROVED');
    expect(decision.failedChecks).toHaveLength(0);
    expect(decision.completedChecks.length).toBeGreaterThanOrEqual(4);
    expect(decision.recommendedNextAction).toContain('verified');
  });

  it('rejects verification when the document is expired', () => {
    const expiredInput: ComprehensiveVerificationInput = {
      ...baseValidInput,
      extractedDocFields: {
        ...baseValidInput.extractedDocFields!,
        expiryDate: '2020-05-15', // Past date
      },
    };

    const decision = evaluateVerification(expiredInput);

    expect(decision.outcome).toBe('REJECTED');
    expect(decision.reason).toContain('expired');
    expect(decision.failedChecks.some((c) => c.id === 'DOC_EXPIRY')).toBe(true);
    expect(decision.recommendedNextAction).toContain('unexpired');
  });

  it('rejects verification when applicant age is under 18', () => {
    const underageInput: ComprehensiveVerificationInput = {
      ...baseValidInput,
      details: {
        ...baseValidInput.details,
        dateOfBirth: '2014-06-01', // ~12 years old
      },
    };

    const decision = evaluateVerification(underageInput);

    expect(decision.outcome).toBe('REJECTED');
    expect(decision.reason).toContain('18 years');
    expect(decision.failedChecks.some((c) => c.id === 'AGE_VERIFICATION')).toBe(true);
  });

  it('rejects verification when document has severe blur or underexposure', () => {
    const degradedInput: ComprehensiveVerificationInput = {
      ...baseValidInput,
      documentQuality: {
        isAcceptable: false,
        brightness: { value: 12, status: 'dark', feedback: 'Extremely dark' },
        sharpness: { value: 10, status: 'blurry', feedback: 'Severe blur' },
        resolution: { width: 400, height: 300, megapixels: 0.12, isAdequate: false, feedback: 'Low res' },
        actionableTips: ['Move to light'],
      },
    };

    const decision = evaluateVerification(degradedInput);

    expect(decision.outcome).toBe('REJECTED');
    expect(decision.reason).toContain('image quality');
    expect(decision.failedChecks.some((c) => c.id === 'IMAGE_QUALITY')).toBe(true);
  });

  it('routes to manual review when name discrepancy is detected', () => {
    const nameMismatchInput: ComprehensiveVerificationInput = {
      ...baseValidInput,
      extractedDocFields: {
        ...baseValidInput.extractedDocFields!,
        fullName: 'Robert Jonathan Chen', // Does not match Alexander Morgan
      },
    };

    const decision = evaluateVerification(nameMismatchInput);

    expect(decision.outcome).toBe('MANUAL_REVIEW');
    expect(decision.flaggedChecks.some((c) => c.id === 'NAME_MATCH')).toBe(true);
    expect(decision.recommendedNextAction).toContain('compliance officer');
  });

  it('routes to manual review when document is expiring within 30 days', () => {
    const nearExpiryDate = new Date();
    nearExpiryDate.setDate(nearExpiryDate.getDate() + 10);
    const nearExpiryStr = nearExpiryDate.toISOString().split('T')[0];

    const nearExpiryInput: ComprehensiveVerificationInput = {
      ...baseValidInput,
      extractedDocFields: {
        ...baseValidInput.extractedDocFields!,
        expiryDate: nearExpiryStr,
      },
    };

    const decision = evaluateVerification(nearExpiryInput);

    expect(decision.outcome).toBe('MANUAL_REVIEW');
    expect(decision.flaggedChecks.some((c) => c.id === 'DOC_EXPIRY_WARNING')).toBe(true);
  });
});

