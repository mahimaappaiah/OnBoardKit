import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';
import { Header } from './Header';
import { ProgressBar } from './ProgressBar';
import { DetailsStep } from './steps/DetailsStep';
import { IdCaptureStep } from './steps/IdCaptureStep';
import { SelfieCaptureStep } from './steps/SelfieCaptureStep';
import { DocumentUploadStep } from './steps/DocumentUploadStep';
import { ReviewStep } from './steps/ReviewStep';
import { CompletedStep } from './steps/CompletedStep';

export const OnboardingFlow: React.FC = () => {
  const { currentStepId } = useOnboarding();

  const renderStep = () => {
    switch (currentStepId) {
      case 'details':
        return <DetailsStep />;
      case 'id_capture':
        return <IdCaptureStep />;
      case 'selfie_capture':
        return <SelfieCaptureStep />;
      case 'document_upload':
        return <DocumentUploadStep />;
      case 'review':
        return <ReviewStep />;
      case 'completed':
        return <CompletedStep />;
      default:
        return <DetailsStep />;
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-theme-surface rounded-custom shadow-xl border border-theme-border p-5 sm:p-6 transition-all duration-300">
      <Header />
      <ProgressBar />
      <div className="min-h-[380px] flex flex-col justify-between">
        {renderStep()}
      </div>
    </div>
  );
};
