import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';

export const ProgressBar: React.FC = () => {
  const { currentStepIndex, totalSteps, t, state } = useOnboarding();

  if (state.isComplete) {
    return null;
  }

  // Calculate percentage (1-based for progress representation)
  const currentStepNum = currentStepIndex + 1;
  const progressPercent = Math.min(100, Math.round((currentStepNum / totalSteps) * 100));

  return (
    <div className="mb-6" aria-label="Onboarding Progress">
      <div className="flex justify-between items-center text-xs font-semibold text-theme-muted mb-2">
        <span>{t.common.stepOf(currentStepNum, totalSteps)}</span>
        <span>{progressPercent}%</span>
      </div>

      {/* Progress track */}
      <div
        className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Step ${currentStepNum} of ${totalSteps}`}
      >
        <div
          className="h-full bg-theme-primary transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step dot indicators */}
      <div className="flex justify-between items-center mt-2 px-0.5" aria-hidden="true">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-colors duration-200 ${
              idx <= currentStepIndex
                ? 'bg-theme-primary'
                : 'bg-slate-300 dark:bg-slate-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

