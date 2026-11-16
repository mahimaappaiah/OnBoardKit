import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import {
  OnboardKitConfig,
  OnboardingState,
  StepId,
  UserDetails,
  CapturedImageData,
  DocumentUploadData,
  SupportedLanguage,
} from '../types/config';
import { translations, Translations } from '../i18n/translations';

import { applyTheme } from '../utils/theme';

import type { ExtractedDocFields, DocumentQualityReport, VerificationDecision } from '../types/verification';

interface OnboardingContextValue {
  config: OnboardKitConfig;
  state: OnboardingState;
  currentStepId: StepId | 'completed';
  currentStepIndex: number;
  totalSteps: number;
  t: Translations;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  updateDetails: (details: Partial<UserDetails>) => void;
  setIdCapture: (data: CapturedImageData | null) => void;
  setSelfieCapture: (data: CapturedImageData | null) => void;
  setDocumentUpload: (data: DocumentUploadData | null) => void;
  setExtractedDocFields: (data: ExtractedDocFields | null) => void;
  setDocumentQuality: (data: DocumentQualityReport | null) => void;
  setVerificationDecision: (data: VerificationDecision | null) => void;
  completeFlow: () => void;
  resetFlow: () => void;
}

const initialDetails: UserDetails = {
  fullName: '',
  dateOfBirth: '',
  phone: '',
  email: '',
};

const initialState: OnboardingState = {
  currentStepIndex: 0,
  details: initialDetails,
  idCapture: null,
  selfieCapture: null,
  documentUpload: null,
  extractedDocFields: null,
  documentQuality: null,
  verificationDecision: null,
  isComplete: false,
};

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  config: OnboardKitConfig;
  children: ReactNode;
  onStepChange?: (stepId: StepId, stepIndex: number) => void;
  onComplete?: (data: OnboardingState) => void;
}

/**
 * React Context is chosen for state management because:
 * 1. Zero external dependencies: keeps the demo ultra-lightweight and self-contained.
 * 2. Scope isolation: multiple embedded instances on the same host page maintain isolated state without global collision.
 * 3. Step persistence: state survives unmounts/remounts as users navigate back and forth.
 */
export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({
  config,
  children,
  onStepChange,
  onComplete,
}) => {
  const [currentConfig, setCurrentConfig] = useState<OnboardKitConfig>(config);
  const [state, setState] = useState<OnboardingState>(initialState);

  // Listen for parent postMessage initialization or config changes when embedded
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate incoming message structure
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'ONBOARDKIT_INIT' || event.data.type === 'ONBOARDKIT_SET_CONFIG') {
        if (event.data.config) {
          setCurrentConfig((prev) => ({
            ...prev,
            ...event.data.config,
            theme: { ...prev.theme, ...(event.data.config.theme || {}) },
          }));
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent window that iframe is ready to receive config
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'ONBOARDKIT_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Dynamically update CSS variables whenever the active theme changes
  React.useEffect(() => {
    applyTheme(currentConfig.theme);
  }, [currentConfig.theme]);

  const t = useMemo(() => {
    return translations[currentConfig.language] || translations.en;
  }, [currentConfig.language]);

  const totalSteps = currentConfig.steps.length;

  const currentStepId: StepId | 'completed' = state.isComplete
    ? 'completed'
    : currentConfig.steps[state.currentStepIndex] || 'details';

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentConfig((prev) => ({ ...prev, language: lang }));
  };

  const dispatchPostMessage = (eventName: string, payload: any) => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage(
        {
          type: 'ONBOARDKIT_EVENT',
          event: eventName,
          payload,
        },
        '*'
      );
    }
  };

  const nextStep = () => {
    if (state.currentStepIndex < totalSteps - 1) {
      const nextIdx = state.currentStepIndex + 1;
      const completedStep = currentConfig.steps[state.currentStepIndex];
      const nextStepId = currentConfig.steps[nextIdx];

      setState((prev) => ({ ...prev, currentStepIndex: nextIdx }));
      onStepChange?.(nextStepId, nextIdx);

      dispatchPostMessage('step_completed', {
        step: completedStep,
        stepIndex: state.currentStepIndex,
        nextStep: nextStepId,
        nextIndex: nextIdx,
      });
    } else {
      completeFlow();
    }
  };

  const prevStep = () => {
    if (state.currentStepIndex > 0 && !state.isComplete) {
      const prevIdx = state.currentStepIndex - 1;
      const prevStepId = currentConfig.steps[prevIdx];
      setState((prev) => ({ ...prev, currentStepIndex: prevIdx }));
      onStepChange?.(prevStepId, prevIdx);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setState((prev) => ({ ...prev, currentStepIndex: stepIndex, isComplete: false }));
      onStepChange?.(currentConfig.steps[stepIndex], stepIndex);
    }
  };

  const updateDetails = (details: Partial<UserDetails>) => {
    setState((prev) => ({
      ...prev,
      details: { ...prev.details, ...details },
    }));
  };

  const setIdCapture = (data: CapturedImageData | null) => {
    setState((prev) => ({ ...prev, idCapture: data }));
  };

  const setSelfieCapture = (data: CapturedImageData | null) => {
    setState((prev) => ({ ...prev, selfieCapture: data }));
  };

  const setDocumentUpload = (data: DocumentUploadData | null) => {
    setState((prev) => ({ ...prev, documentUpload: data }));
  };

  const setExtractedDocFields = (data: ExtractedDocFields | null) => {
    setState((prev) => ({ ...prev, extractedDocFields: data }));
  };

  const setDocumentQuality = (data: DocumentQualityReport | null) => {
    setState((prev) => ({ ...prev, documentQuality: data }));
  };

  const setVerificationDecision = (data: VerificationDecision | null) => {
    setState((prev) => ({ ...prev, verificationDecision: data }));
  };

  const completeFlow = () => {
    const finishedState: OnboardingState = { ...state, isComplete: true };
    setState(finishedState);
    onComplete?.(finishedState);

    dispatchPostMessage('flow_completed', {
      details: {
        fullName: finishedState.details.fullName,
        dateOfBirth: finishedState.details.dateOfBirth,
        phone: finishedState.details.phone,
        email: finishedState.details.email,
      },
      hasIdCapture: !!finishedState.idCapture,
      hasSelfieCapture: !!finishedState.selfieCapture,
      hasDocumentUpload: !!finishedState.documentUpload,
      timestamp: Date.now(),
    });
  };

  const resetFlow = () => {
    setState({
      ...initialState,
      details: { ...initialDetails },
    });
    onStepChange?.(currentConfig.steps[0], 0);
  };

  const value: OnboardingContextValue = {
    config: currentConfig,
    state,
    currentStepId,
    currentStepIndex: state.currentStepIndex,
    totalSteps,
    t,
    language: currentConfig.language,
    setLanguage,
    nextStep,
    prevStep,
    goToStep,
    updateDetails,
    setIdCapture,
    setSelfieCapture,
    setDocumentUpload,
    setExtractedDocFields,
    setDocumentQuality,
    setVerificationDecision,
    completeFlow,
    resetFlow,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

