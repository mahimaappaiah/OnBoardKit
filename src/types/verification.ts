import { UserDetails, CapturedImageData, DocumentUploadData } from './config';

export type DocumentType = 'PASSPORT' | 'DRIVING_LICENSE' | 'NATIONAL_ID' | 'RESIDENCE_PERMIT' | 'OTHER';

export interface ExtractedDocFields {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD or raw
  documentNumber: string;
  expiryDate: string; // YYYY-MM-DD or raw
  documentType: DocumentType;
  rawText: string;
  confidence: number; // 0 - 100
  isUserConfirmed?: boolean;
}

export interface DocumentQualityReport {
  isAcceptable: boolean;
  brightness: {
    value: number; // 0 - 255
    status: 'optimal' | 'dark' | 'bright';
    feedback: string;
  };
  sharpness: {
    value: number; // gradient variance score
    status: 'sharp' | 'blurry';
    feedback: string;
  };
  resolution: {
    width: number;
    height: number;
    megapixels: number;
    isAdequate: boolean;
    feedback: string;
  };
  actionableTips: string[];
}

export type VerificationOutcome = 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';

export interface VerificationCheck {
  id: string;
  name: string;
  status: 'PASSED' | 'FAILED' | 'FLAGGED';
  message: string;
  details?: string;
  isDemoCheck?: boolean;
}

export interface VerificationDecision {
  outcome: VerificationOutcome;
  summary: string;
  reason: string;
  completedChecks: VerificationCheck[];
  failedChecks: VerificationCheck[];
  flaggedChecks: VerificationCheck[];
  recommendedNextAction: string;
  timestamp: number;
  referenceId: string;
}

export interface ComprehensiveVerificationInput {
  details: UserDetails;
  extractedDocFields: ExtractedDocFields | null;
  documentQuality: DocumentQualityReport | null;
  idCapture: CapturedImageData | null;
  selfieCapture: CapturedImageData | null;
  documentUpload: DocumentUploadData | null;
}

