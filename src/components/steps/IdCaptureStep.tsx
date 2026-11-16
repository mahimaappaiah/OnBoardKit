import React, { useRef, useEffect, useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { LazyCameraCapture } from '../camera/LazyCameraCapture';
import {
  performClientSideOCR,
  getSampleIdentityDocuments,
  DemoSampleDocument,
  OCRProgress,
} from '../../utils/ocr';
import { evaluateDocumentQuality } from '../../utils/documentQuality';
import { ExtractedDocFields, DocumentType } from '../../types/verification';
import { CapturedImageData } from '../../types/config';

export const IdCaptureStep: React.FC = () => {
  const {
    state,
    setIdCapture,
    setExtractedDocFields,
    setDocumentQuality,
    updateDetails,
    nextStep,
    prevStep,
    t,
  } = useOnboarding();

  const headingRef = useRef<HTMLHeadingElement>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [editableFields, setEditableFields] = useState<ExtractedDocFields | null>(
    state.extractedDocFields
  );
  const [isEditing, setIsEditing] = useState(false);

  const sampleDocuments = getSampleIdentityDocuments();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Run OCR and Quality Check on captured image
  const handleCapture = async (capturedData: CapturedImageData) => {
    setIdCapture(capturedData);
    setOcrError(null);
    setOcrLoading(true);

    // Evaluate Quality
    const dummyCanvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      dummyCanvas.width = img.width || 640;
      dummyCanvas.height = img.height || 480;
      const ctx = dummyCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
      const qualityReport = evaluateDocumentQuality(dummyCanvas);
      setDocumentQuality(qualityReport);
    };
    img.src = capturedData.dataUrl;

    try {
      const extracted = await performClientSideOCR(capturedData.dataUrl, (p) => {
        setOcrProgress(p);
      });
      setExtractedDocFields(extracted);
      setEditableFields(extracted);
    } catch (err: any) {
      console.warn('[IdCaptureStep] OCR failed:', err?.message);
      setOcrError(err?.message || 'Could not extract text from document image.');
    } finally {
      setOcrLoading(false);
    }
  };

  const handleClear = () => {
    setIdCapture(null);
    setExtractedDocFields(null);
    setDocumentQuality(null);
    setEditableFields(null);
    setOcrError(null);
    setOcrProgress(null);
  };

  // Load built-in sample document for interview/demo testing
  const handleSelectSample = (sample: DemoSampleDocument) => {
    const captured: CapturedImageData = {
      dataUrl: sample.svgDataUrl,
      timestamp: Date.now(),
      source: 'file',
    };
    setIdCapture(captured);

    const dummyCanvas = document.createElement('canvas');
    dummyCanvas.width = 600;
    dummyCanvas.height = 400;
    const qualityReport = evaluateDocumentQuality(dummyCanvas);
    setDocumentQuality(qualityReport);

    setExtractedDocFields(sample.extractedFields);
    setEditableFields(sample.extractedFields);
    setOcrError(null);
    setOcrLoading(false);

    // Autofill details form with sample data if user hasn't typed anything
    if (!state.details.fullName) {
      updateDetails({
        fullName: sample.extractedFields.fullName,
        dateOfBirth: sample.extractedFields.dateOfBirth,
      });
    }
  };

  const handleFieldChange = (field: keyof ExtractedDocFields, val: any) => {
    if (!editableFields) return;
    const updated = { ...editableFields, [field]: val, isUserConfirmed: true };
    setEditableFields(updated);
    setExtractedDocFields(updated);
  };

  const handleConfirmFields = () => {
    if (editableFields) {
      const confirmed = { ...editableFields, isUserConfirmed: true };
      setExtractedDocFields(confirmed);
      setIsEditing(false);

      // Propagate user corrections to main details if empty or requested
      if (editableFields.fullName && !state.details.fullName) {
        updateDetails({ fullName: editableFields.fullName });
      }
      if (editableFields.dateOfBirth && !state.details.dateOfBirth) {
        updateDetails({ dateOfBirth: editableFields.dateOfBirth });
      }
    }
  };

  return (
    <div aria-labelledby="id-capture-heading">
      <div className="mb-4">
        <h2
          id="id-capture-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold text-theme-text outline-none"
        >
          {t.steps.id_capture.title}
        </h2>
        <p className="text-xs text-theme-muted mt-1">{t.steps.id_capture.subtitle}</p>
      </div>

      {/* Demo Sample Picker Toolbar (For Technical Interviewers / Reviewers) */}
      {!state.idCapture && (
        <div className="mb-4 p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-custom text-left text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-theme-primary flex items-center space-x-1">
              <span>⚡ Interviewer / Portfolio Demo Tool:</span>
            </span>
            <span className="text-[10px] text-theme-muted">Sample IDs</span>
          </div>
          <p className="text-[11px] text-theme-muted mb-2">
            No physical document handy? Test OCR text extraction and decision rules with pre-packaged samples:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {sampleDocuments.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="px-2 py-1.5 bg-theme-surface hover:bg-slate-100 dark:hover:bg-slate-800 border border-theme-border rounded text-[11px] font-semibold text-theme-text text-left transition truncate shadow-xs"
                title={sample.description}
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Camera / File Capture View */}
      <LazyCameraCapture
        mode="id"
        capturedImage={state.idCapture}
        onCapture={handleCapture}
        onClear={handleClear}
      />

      {/* OCR Processing State */}
      {ocrLoading && (
        <div className="mt-4 p-4 border border-theme-border rounded-custom bg-theme-background text-center space-y-2">
          <div className="w-7 h-7 mx-auto border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-theme-text">Client-Side OCR Processing...</p>
          <p className="text-[11px] text-theme-muted">
            {ocrProgress ? `${ocrProgress.status} (${Math.round((ocrProgress.progress || 0) * 100)}%)` : 'Initializing engine...'}
          </p>
          <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-theme-primary h-full transition-all duration-200"
              style={{ width: `${Math.round((ocrProgress?.progress || 0.1) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* OCR Error Notice */}
      {ocrError && (
        <div className="mt-4 p-3 rounded-custom bg-red-50 dark:bg-red-950/40 border border-theme-error text-theme-error text-xs text-left">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold block">OCR Warning</strong>
              <span>{ocrError} You can enter details manually below or retake the photo.</span>
            </div>
          </div>
        </div>
      )}

      {/* Document Quality Analysis Card */}
      {state.documentQuality && (
        <div className="mt-4 p-3.5 bg-theme-background border border-theme-border rounded-custom text-left text-xs shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-theme-border">
            <span className="font-bold text-theme-text flex items-center space-x-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  state.documentQuality.isAcceptable ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>Image Quality Analysis</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                state.documentQuality.isAcceptable
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {state.documentQuality.isAcceptable ? 'Quality Passed' : 'Quality Warning'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] mb-2 text-theme-muted">
            <div>
              Brightness: <strong className="text-theme-text block">{state.documentQuality.brightness.status} ({state.documentQuality.brightness.value})</strong>
            </div>
            <div>
              Sharpness: <strong className="text-theme-text block">{state.documentQuality.sharpness.status} ({state.documentQuality.sharpness.value})</strong>
            </div>
            <div>
              Resolution: <strong className="text-theme-text block">{state.documentQuality.resolution.width}x{state.documentQuality.resolution.height}</strong>
            </div>
          </div>

          {state.documentQuality.actionableTips.length > 0 && (
            <div className="pt-2 border-t border-theme-border/60">
              <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-1">
                Quality Feedback & Tips:
              </span>
              <ul className="space-y-0.5 text-[11px] text-theme-text">
                {state.documentQuality.actionableTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start space-x-1">
                    <span className="text-theme-primary font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Editable OCR Extracted Fields Form */}
      {editableFields && (
        <div className="mt-4 p-4 border border-theme-border rounded-custom bg-theme-surface text-left shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-theme-border">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Extracted Document Fields</span>
              </h3>
              <span className="text-[10px] text-theme-muted block mt-0.5">
                Verify or correct extracted text before proceeding
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-semibold text-theme-primary hover:underline"
            >
              {isEditing ? 'Done Editing' : 'Edit Fields'}
            </button>
          </div>

          <div className="space-y-3">
            {/* Full Name */}
            <div>
              <label htmlFor="extracted-name" className="block text-[11px] font-semibold text-theme-muted mb-0.5">
                Full Name (on Document)
              </label>
              <input
                id="extracted-name"
                type="text"
                value={editableFields.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-2.5 py-1.5 text-xs rounded border border-theme-border bg-theme-background text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* DOB */}
              <div>
                <label htmlFor="extracted-dob" className="block text-[11px] font-semibold text-theme-muted mb-0.5">
                  Date of Birth
                </label>
                <input
                  id="extracted-dob"
                  type="date"
                  value={editableFields.dateOfBirth}
                  onChange={(e) => handleFieldChange('dateOfBirth', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-theme-border bg-theme-background text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label htmlFor="extracted-exp" className="block text-[11px] font-semibold text-theme-muted mb-0.5">
                  Document Expiry Date
                </label>
                <input
                  id="extracted-exp"
                  type="date"
                  value={editableFields.expiryDate}
                  onChange={(e) => handleFieldChange('expiryDate', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-theme-border bg-theme-background text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Document Number */}
              <div>
                <label htmlFor="extracted-doc-num" className="block text-[11px] font-semibold text-theme-muted mb-0.5">
                  Document Number
                </label>
                <input
                  id="extracted-doc-num"
                  type="text"
                  value={editableFields.documentNumber}
                  onChange={(e) => handleFieldChange('documentNumber', e.target.value)}
                  placeholder="e.g. P12345678"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-theme-border bg-theme-background text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary font-mono"
                />
              </div>

              {/* Document Type */}
              <div>
                <label htmlFor="extracted-doc-type" className="block text-[11px] font-semibold text-theme-muted mb-0.5">
                  Document Type
                </label>
                <select
                  id="extracted-doc-type"
                  value={editableFields.documentType}
                  onChange={(e) => handleFieldChange('documentType', e.target.value as DocumentType)}
                  className="w-full px-2 py-1.5 text-xs rounded border border-theme-border bg-theme-background text-theme-text focus:outline-none focus:ring-1 focus:ring-theme-primary"
                >
                  <option value="PASSPORT">Passport</option>
                  <option value="DRIVING_LICENSE">Driver License</option>
                  <option value="NATIONAL_ID">National ID Card</option>
                  <option value="RESIDENCE_PERMIT">Residence Permit</option>
                  <option value="OTHER">Other Official ID</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-theme-muted">
                Confidence: <strong>{editableFields.confidence}%</strong>
              </span>
              <button
                type="button"
                onClick={handleConfirmFields}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold shadow-xs transition"
              >
                Confirm Information
              </button>
            </div>
          </div>

          <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-900/50 rounded border border-theme-border/60 text-[10px] text-theme-muted leading-relaxed">
            ℹ️ <strong>Honesty Disclosure:</strong> Client-side OCR reads text glyphs directly in your browser. It does not certify official government authenticity, security thread validity, or physical card integrity.
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between items-center pt-4 border-t border-theme-border">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 text-sm font-medium text-theme-muted hover:text-theme-text rounded-custom border border-theme-border bg-theme-surface transition"
        >
          {t.common.back}
        </button>
        <button
          type="button"
          onClick={nextStep}
          disabled={!state.idCapture || ocrLoading}
          className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-custom transition shadow-sm focus-visible:ring-2 focus-visible:ring-theme-primary"
        >
          {t.common.next}
        </button>
      </div>
    </div>
  );
};
