import React, { useRef, useEffect, useState } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { evaluateVerification } from '../../utils/verificationEngine';

export const ReviewStep: React.FC = () => {
  const {
    state,
    config,
    goToStep,
    prevStep,
    completeFlow,
    setVerificationDecision,
    t,
  } = useOnboarding();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizingStage, setFinalizingStage] = useState('Evaluating compliance rules...');

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const findStepIndex = (stepId: string) => {
    return config.steps.indexOf(stepId as any);
  };

  const handleFinalSubmit = () => {
    setIsFinalizing(true);
    setFinalizingStage('Evaluating automated compliance checks...');

    // Run structured verification engine
    const decision = evaluateVerification({
      details: state.details,
      extractedDocFields: state.extractedDocFields,
      documentQuality: state.documentQuality,
      idCapture: state.idCapture,
      selfieCapture: state.selfieCapture,
      documentUpload: state.documentUpload,
    });

    setVerificationDecision(decision);

    setTimeout(() => {
      setFinalizingStage('Packaging encrypted audit log...');
      setTimeout(() => {
        completeFlow();
      }, 250);
    }, 250);
  };

  return (
    <div aria-labelledby="review-heading" className="relative">
      {/* Final Verification Pipeline Overlay */}
      {isFinalizing && (
        <div className="absolute -inset-4 bg-slate-950/85 backdrop-blur-sm z-30 rounded-custom flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-theme-primary border-t-transparent rounded-full animate-spin" />
          <h3 className="text-sm font-bold text-white">Running KYC Verification Engine</h3>
          <p className="text-xs text-slate-300 font-medium">{finalizingStage}</p>
          <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-400 rounded-full animate-pulse w-5/6" />
          </div>
        </div>
      )}

      <div className="mb-5">
        <h2
          id="review-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold text-theme-text outline-none"
        >
          {t.steps.review.title}
        </h2>
        <p className="text-xs text-theme-muted mt-1">{t.steps.review.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Personal Details Section */}
        <section className="bg-theme-background border border-theme-border rounded-custom p-4 text-left shadow-sm">
          <div className="flex justify-between items-center mb-2 pb-2 border-b border-theme-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-theme-primary" />
              <span>{t.steps.review.personalDetailsSection}</span>
            </h3>
            {findStepIndex('details') !== -1 && (
              <button
                type="button"
                onClick={() => goToStep(findStepIndex('details'))}
                className="text-xs font-semibold text-theme-primary hover:underline"
                aria-label={`Edit ${t.steps.review.personalDetailsSection}`}
              >
                {t.steps.review.editButton}
              </button>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-theme-muted">{t.steps.details.fullNameLabel}</dt>
              <dd className="font-semibold text-theme-text mt-0.5">
                {state.details.fullName || t.steps.review.notProvided}
              </dd>
            </div>
            <div>
              <dt className="text-theme-muted">{t.steps.details.dobLabel}</dt>
              <dd className="font-semibold text-theme-text mt-0.5">
                {state.details.dateOfBirth || t.steps.review.notProvided}
              </dd>
            </div>
            <div>
              <dt className="text-theme-muted">{t.steps.details.phoneLabel}</dt>
              <dd className="font-semibold text-theme-text mt-0.5">
                {state.details.phone || t.steps.review.notProvided}
              </dd>
            </div>
            <div>
              <dt className="text-theme-muted">{t.steps.details.emailLabel}</dt>
              <dd className="font-semibold text-theme-text mt-0.5">
                {state.details.email || t.steps.review.notProvided}
              </dd>
            </div>
          </dl>
        </section>

        {/* OCR Extracted Data Review */}
        {state.extractedDocFields && (
          <section className="bg-theme-background border border-theme-border rounded-custom p-3.5 text-left shadow-sm">
            <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-theme-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Extracted Document Info (OCR)</span>
              </h3>
              {findStepIndex('id_capture') !== -1 && (
                <button
                  type="button"
                  onClick={() => goToStep(findStepIndex('id_capture'))}
                  className="text-xs font-semibold text-theme-primary hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            <dl className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-theme-muted">Doc Type</dt>
                <dd className="font-semibold text-theme-text mt-0.5">
                  {state.extractedDocFields.documentType.replace('_', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-theme-muted">Document Number</dt>
                <dd className="font-semibold text-theme-text mt-0.5 font-mono">
                  {state.extractedDocFields.documentNumber || 'Detected'}
                </dd>
              </div>
              <div>
                <dt className="text-theme-muted">Expiry Date</dt>
                <dd className="font-semibold text-theme-text mt-0.5">
                  {state.extractedDocFields.expiryDate || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-theme-muted">OCR Confidence</dt>
                <dd className="font-semibold text-emerald-600 mt-0.5">
                  {state.extractedDocFields.confidence}%
                </dd>
              </div>
            </dl>
          </section>
        )}

        {/* Media Captures Section (ID & Selfie) */}
        <div className="grid grid-cols-2 gap-3">
          {/* ID Section */}
          <section className="bg-theme-background border border-theme-border rounded-custom p-3 text-left shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                {t.steps.review.idSection}
              </h3>
              {findStepIndex('id_capture') !== -1 && (
                <button
                  type="button"
                  onClick={() => goToStep(findStepIndex('id_capture'))}
                  className="text-xs font-semibold text-theme-primary hover:underline"
                  aria-label={`Edit ${t.steps.review.idSection}`}
                >
                  {t.steps.review.editButton}
                </button>
              )}
            </div>
            {state.idCapture ? (
              <div>
                <div className="relative rounded overflow-hidden border border-theme-border mb-1.5">
                  <img
                    src={state.idCapture.dataUrl}
                    alt="Government ID"
                    className="w-full h-24 object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                    Attached
                  </span>
                </div>
                <div className="text-[10px] text-theme-muted flex items-center justify-between">
                  <span>{state.idCapture.source === 'camera' ? 'Camera' : 'File'}</span>
                  <span className="font-semibold text-emerald-600">Captured</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-theme-muted italic">{t.steps.review.notProvided}</p>
            )}
          </section>

          {/* Selfie Section */}
          <section className="bg-theme-background border border-theme-border rounded-custom p-3 text-left shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                {t.steps.review.selfieSection}
              </h3>
              {findStepIndex('selfie_capture') !== -1 && (
                <button
                  type="button"
                  onClick={() => goToStep(findStepIndex('selfie_capture'))}
                  className="text-xs font-semibold text-theme-primary hover:underline"
                  aria-label={`Edit ${t.steps.review.selfieSection}`}
                >
                  {t.steps.review.editButton}
                </button>
              )}
            </div>
            {state.selfieCapture ? (
              <div>
                <div className="relative rounded overflow-hidden border border-theme-border mb-1.5">
                  <img
                    src={state.selfieCapture.dataUrl}
                    alt="Selfie Check"
                    className="w-full h-24 object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">
                    Selfie
                  </span>
                </div>
                <div className="text-[10px] text-theme-muted flex items-center justify-between">
                  <span>{state.selfieCapture.source === 'camera' ? 'Camera' : 'File'}</span>
                  <span className="font-semibold text-emerald-600">Aligned</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-theme-muted italic">{t.steps.review.notProvided}</p>
            )}
          </section>
        </div>

        {/* Supporting Document Section */}
        {findStepIndex('document_upload') !== -1 && (
          <section className="bg-theme-background border border-theme-border rounded-custom p-3 text-left shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-muted">
                {t.steps.review.documentSection}
              </h3>
              <button
                type="button"
                onClick={() => goToStep(findStepIndex('document_upload'))}
                className="text-xs font-semibold text-theme-primary hover:underline"
                aria-label={`Edit ${t.steps.review.documentSection}`}
              >
                {t.steps.review.editButton}
              </button>
            </div>
            {state.documentUpload ? (
              <div className="text-xs text-theme-text font-medium flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">{state.documentUpload.fileName}</span>
                  <span className="text-theme-muted text-[10px]">
                    ({(state.documentUpload.fileSize / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 ml-2">Attached</span>
              </div>
            ) : (
              <p className="text-xs text-theme-muted italic">{t.steps.review.notProvided}</p>
            )}
          </section>
        )}

        {/* Client-Side Privacy Notice */}
        <div className="p-3 rounded-custom bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-theme-muted text-left">
          <div className="flex items-start space-x-2">
            <svg
              className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <div>
              <strong className="font-semibold text-theme-text block mb-0.5">
                Client-Side Sandbox Encryption (Demo Mode)
              </strong>
              <span>{t.steps.review.privacyNotice}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center pt-4 border-t border-theme-border">
        <button
          type="button"
          onClick={prevStep}
          disabled={isFinalizing}
          className="px-4 py-2 text-sm font-medium text-theme-muted hover:text-theme-text rounded-custom border border-theme-border bg-theme-surface transition disabled:opacity-50"
        >
          {t.common.back}
        </button>
        <button
          type="button"
          onClick={handleFinalSubmit}
          disabled={isFinalizing}
          className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 text-white text-sm font-semibold rounded-custom transition shadow-sm focus-visible:ring-2 focus-visible:ring-theme-primary flex items-center space-x-2"
        >
          {isFinalizing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>{t.steps.review.submitButton}</span>
          )}
        </button>
      </div>
    </div>
  );
};
