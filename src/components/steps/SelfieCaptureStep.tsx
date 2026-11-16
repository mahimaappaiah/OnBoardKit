import React, { useRef, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { LazyCameraCapture } from '../camera/LazyCameraCapture';

export const SelfieCaptureStep: React.FC = () => {
  const { state, setSelfieCapture, nextStep, prevStep, t } = useOnboarding();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div aria-labelledby="selfie-capture-heading">
      <div className="mb-4">
        <h2
          id="selfie-capture-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold text-theme-text outline-none"
        >
          {t.steps.selfie_capture.title}
        </h2>
        <p className="text-xs text-theme-muted mt-1">{t.steps.selfie_capture.subtitle}</p>
      </div>

      {/* Positioning & Lighting Guidance */}
      {!state.selfieCapture && (
        <div className="mb-4 p-3 rounded-custom bg-theme-background border border-theme-border text-left text-xs space-y-1.5 shadow-xs">
          <span className="font-bold text-theme-text block text-[11px] uppercase tracking-wider">
            Selfie Capture Guidelines:
          </span>
          <div className="grid grid-cols-3 gap-2 text-[11px] text-theme-muted">
            <div className="flex items-center space-x-1">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Face centered</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>Even lighting</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-emerald-500 font-bold">✓</span>
              <span>No glasses/hats</span>
            </div>
          </div>
        </div>
      )}

      <LazyCameraCapture
        mode="selfie"
        capturedImage={state.selfieCapture}
        onCapture={(data) => setSelfieCapture(data)}
        onClear={() => setSelfieCapture(null)}
      />

      {/* Honest Biometrics Disclosure */}
      <div className="mt-4 p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-custom border border-theme-border/60 text-left text-[11px] text-theme-muted leading-relaxed">
        🛡️ <strong>Demonstration Check:</strong> Evaluates front-facing presence, frame centering, and optical clarity in local memory. To avoid misleading claims, actual 3D biometric matching and anti-spoofing require server-side certified biometric engines.
      </div>

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
          disabled={!state.selfieCapture}
          className="px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-custom transition shadow-sm focus-visible:ring-2 focus-visible:ring-theme-primary"
        >
          {t.common.next}
        </button>
      </div>
    </div>
  );
};
