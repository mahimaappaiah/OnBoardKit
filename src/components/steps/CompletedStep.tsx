import React, { useRef, useEffect } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { VerificationOutcome } from '../../types/verification';

export const CompletedStep: React.FC = () => {
  const { state, resetFlow, t } = useOnboarding();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const decision = state.verificationDecision;
  const outcome: VerificationOutcome = decision?.outcome || 'APPROVED';

  const isApproved = outcome === 'APPROVED';
  const isReview = outcome === 'MANUAL_REVIEW';
  const isRejected = outcome === 'REJECTED';

  const badgeStyles = {
    APPROVED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    MANUAL_REVIEW: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    REJECTED: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-800',
  }[outcome];

  return (
    <div className="text-center py-2" aria-labelledby="completed-heading">
      {/* Dynamic Status Icon */}
      <div
        className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-xs ring-4 ${
          isApproved
            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 ring-emerald-50 dark:ring-emerald-950/20'
            : isReview
            ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 ring-amber-50 dark:ring-amber-950/20'
            : 'bg-red-100 dark:bg-red-950/40 text-red-600 ring-red-50 dark:ring-red-950/20'
        }`}
      >
        {isApproved && (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isReview && (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {isRejected && (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </div>

      {/* Outcome Status Badge */}
      <div className={`inline-block px-3 py-0.5 mb-2 rounded-full border text-[11px] font-bold uppercase tracking-wider ${badgeStyles}`}>
        {t.steps.completed.demoBadge}
      </div>

      <h2
        id="completed-heading"
        ref={headingRef}
        tabIndex={-1}
        className="text-2xl font-bold text-theme-text outline-none"
      >
        {decision?.summary || (isApproved ? t.steps.completed.title : 'Verification Assessment')}
      </h2>

      <p className="text-xs text-theme-muted mt-1 max-w-sm mx-auto">
        {decision?.reason || t.steps.completed.subtitle}
      </p>

      {/* Structured KYC Decision Dashboard */}
      <div className="my-5 p-4 rounded-custom bg-theme-background border border-theme-border text-left space-y-3.5 shadow-xs">
        {/* Header Metadata */}
        <div className="flex justify-between items-center text-xs pb-2 border-b border-theme-border">
          <div>
            <span className="text-[10px] text-theme-muted uppercase tracking-wider block">Reference ID</span>
            <span className="font-mono font-bold text-theme-primary">{decision?.referenceId || 'OK-DEMO-01'}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-theme-muted uppercase tracking-wider block">Decision Protocol</span>
            <span className="font-semibold text-theme-text text-[11px]">Deterministic Rules v2.1</span>
          </div>
        </div>

        {/* Recommended Next Action Callout */}
        <div
          className={`p-3 rounded border text-xs text-left ${
            isApproved
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-300'
              : isReview
              ? 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-300'
              : 'bg-red-50/70 border-red-200 text-red-900 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <strong className="block text-[11px] font-bold uppercase tracking-wider mb-0.5">
            Recommended Next Action:
          </strong>
          <span>{decision?.recommendedNextAction || 'No further action required.'}</span>
        </div>

        {/* Failed / Flagged Checks Section */}
        {((decision?.failedChecks?.length || 0) > 0 || (decision?.flaggedChecks?.length || 0) > 0) && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted block">
              Flagged or Failed Checks ({ (decision?.failedChecks?.length || 0) + (decision?.flaggedChecks?.length || 0) }):
            </span>

            {decision?.failedChecks.map((check) => (
              <div key={check.id} className="flex items-start space-x-2 text-xs p-2 rounded bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-800 dark:text-red-300">
                <span className="text-red-600 font-bold flex-shrink-0">✕</span>
                <div>
                  <strong className="font-semibold block">{check.name}</strong>
                  <span className="text-[11px] opacity-90">{check.message}</span>
                </div>
              </div>
            ))}

            {decision?.flaggedChecks.map((check) => (
              <div key={check.id} className="flex items-start space-x-2 text-xs p-2 rounded bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                <span className="text-amber-600 font-bold flex-shrink-0">⚠️</span>
                <div>
                  <strong className="font-semibold block">{check.name}</strong>
                  <span className="text-[11px] opacity-90">{check.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completed Checks Section */}
        {decision?.completedChecks && decision.completedChecks.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted block">
              Completed Checks Passed ({decision.completedChecks.length}):
            </span>
            <ul className="space-y-1 text-[11px] text-theme-text">
              {decision.completedChecks.map((check) => (
                <li key={check.id} className="flex items-start space-x-1.5 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500 font-bold flex-shrink-0">✓</span>
                  <div>
                    <span className="font-semibold">{check.name}:</span>{' '}
                    <span className="text-theme-muted">{check.message}</span>
                    {check.isDemoCheck && (
                      <span className="ml-1 text-[9px] bg-slate-200 dark:bg-slate-700 px-1 py-0.2 rounded text-slate-600 dark:text-slate-300">
                        Demo Check
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Privacy & Sandbox Audit Note */}
        <div className="pt-2 border-t border-theme-border flex items-center justify-between text-[10px] text-theme-muted">
          <span>Storage: Browser Memory Sandbox</span>
          <span>Zero Server Uploads ✓</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-theme-border flex justify-center space-x-3">
        <button
          type="button"
          onClick={resetFlow}
          className="px-6 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold rounded-custom transition shadow-sm focus-visible:ring-2 focus-visible:ring-theme-primary"
        >
          {isRejected ? 'Retry Verification' : t.steps.completed.resetFlow}
        </button>
      </div>
    </div>
  );
};
