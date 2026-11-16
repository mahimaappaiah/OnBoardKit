export type StepId = 
  | 'details'
  | 'id_capture'
  | 'selfie_capture'
  | 'document_upload'
  | 'review';

export type SupportedLanguage = 'en' | 'hi';

export interface ThemeConfig {
  primaryColor: string;
  primaryHoverColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMutedColor: string;
  errorColor: string;
  borderColor: string;
  borderRadius: string; // e.g., '12px' or '0.75rem'
  logoText: string;
}

export interface OnboardKitConfig {
  theme: ThemeConfig;
  language: SupportedLanguage;
  steps: StepId[];
  title?: string;
  description?: string;
}

// User onboarding data submitted throughout the flow
export interface UserDetails {
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  email: string;
}

export interface VerificationAnalysis {
  status: 'verified' | 'warning' | 'failed';
  score: number; // 0 - 100
  clarity: 'High' | 'Medium' | 'Low';
  lighting: 'Optimal' | 'Dark' | 'Glare';
  checks: string[];
}

export interface DocumentUploadData {
  fileName: string;
  fileSize: number;
  fileType: string;
  previewUrl: string; // Object URL or base64 preview (client-side only)
  verificationDetails?: VerificationAnalysis;
}

export interface CapturedImageData {
  dataUrl: string;
  timestamp: number;
  source: 'camera' | 'file';
  verificationDetails?: VerificationAnalysis;
}

import type { ExtractedDocFields, DocumentQualityReport, VerificationDecision } from './verification';

export interface OnboardingState {
  currentStepIndex: number;
  details: UserDetails;
  idCapture: CapturedImageData | null;
  selfieCapture: CapturedImageData | null;
  documentUpload: DocumentUploadData | null;
  extractedDocFields: ExtractedDocFields | null;
  documentQuality: DocumentQualityReport | null;
  verificationDecision: VerificationDecision | null;
  isComplete: boolean;
}

