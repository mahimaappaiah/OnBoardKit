import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OnboardingProvider } from '../context/OnboardingContext';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { OnboardKitConfig } from '../types/config';

const fullConfig: OnboardKitConfig = {
  theme: {
    primaryColor: '#2563eb',
    primaryHoverColor: '#1d4ed8',
    backgroundColor: '#ffffff',
    surfaceColor: '#ffffff',
    textColor: '#0f172a',
    textMutedColor: '#64748b',
    errorColor: '#ef4444',
    borderColor: '#e2e8f0',
    borderRadius: '12px',
    logoText: 'Full Flow Test',
  },
  language: 'en',
  steps: ['details', 'id_capture', 'selfie_capture', 'document_upload', 'review'],
};

describe('Phase 4: Complete End-to-End Onboarding Flow', () => {
  let mockTrackStop: any;
  let mockStream: any;

  beforeEach(() => {
    mockTrackStop = vi.fn();
    mockStream = {
      getTracks: vi.fn(() => [{ stop: mockTrackStop, kind: 'video' }]),
    };

    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('completes the entire onboarding journey from details to review and completion', async () => {
    const handleStepChange = vi.fn();
    const handleComplete = vi.fn();

    render(
      <OnboardingProvider
        config={fullConfig}
        onStepChange={handleStepChange}
        onComplete={handleComplete}
      >
        <OnboardingFlow />
      </OnboardingProvider>
    );

    // ==========================================
    // 1. Details Step
    // ==========================================
    expect(screen.getByText('Personal Information')).toBeInTheDocument();

    // Trigger validation error on empty submit
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();

    // Fill valid inputs
    fireEvent.change(screen.getByLabelText(/Full Legal Name/i), {
      target: { value: 'Eleanor Vance' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1993-11-20' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+1 555 987 6543' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'eleanor.vance@example.com' },
    });

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // ==========================================
    // 2. ID Capture Step
    // ==========================================
    await waitFor(() => {
      expect(screen.getByText('ID Verification')).toBeInTheDocument();
    });
    expect(handleStepChange).toHaveBeenCalledWith('id_capture', 1);

    // Capture ID
    const captureIdBtn = await screen.findByRole('button', { name: /Capture ID/i });
    fireEvent.click(captureIdBtn);

    // Next button enabled after verification analysis completes
    const idNextBtn = screen.getByRole('button', { name: /continue/i });
    await waitFor(() => {
      expect(idNextBtn).not.toBeDisabled();
    }, { timeout: 4000 });
    fireEvent.click(idNextBtn);

    // ==========================================
    // 3. Selfie Capture Step
    // ==========================================
    await waitFor(() => {
      expect(screen.getByText('Liveness Selfie')).toBeInTheDocument();
    });
    expect(handleStepChange).toHaveBeenCalledWith('selfie_capture', 2);

    const captureSelfieBtn = await screen.findByRole('button', { name: /Take Selfie/i });
    fireEvent.click(captureSelfieBtn);

    const selfieNextBtn = screen.getByRole('button', { name: /continue/i });
    await waitFor(() => {
      expect(selfieNextBtn).not.toBeDisabled();
    }, { timeout: 4000 });
    fireEvent.click(selfieNextBtn);

    // ==========================================
    // 4. Supporting Document Upload Step
    // ==========================================
    await waitFor(() => {
      expect(screen.getByText('Supporting Document')).toBeInTheDocument();
    });
    expect(handleStepChange).toHaveBeenCalledWith('document_upload', 3);

    // Upload mock document
    const mockFile = new File(['dummy pdf address proof'], 'utility_bill.pdf', {
      type: 'application/pdf',
    });
    const fileInput = document.getElementById('doc-file-input') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(screen.getByText('utility_bill.pdf')).toBeInTheDocument();
    }, { timeout: 4000 });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // ==========================================
    // 5. Review Step
    // ==========================================
    await waitFor(() => {
      expect(screen.getByText('Review Your Information')).toBeInTheDocument();
    });
    expect(handleStepChange).toHaveBeenCalledWith('review', 4);

    // Verify all details are present in summary
    expect(screen.getByText('Eleanor Vance')).toBeInTheDocument();
    expect(screen.getByText('1993-11-20')).toBeInTheDocument();
    expect(screen.getByText('+1 555 987 6543')).toBeInTheDocument();
    expect(screen.getByText('eleanor.vance@example.com')).toBeInTheDocument();
    expect(screen.getByText('utility_bill.pdf')).toBeInTheDocument();
    expect(
      screen.getByText(/Demo Mode: All information and media remain in your local browser memory only/i)
    ).toBeInTheDocument();

    // Confirm & Submit
    const submitBtn = screen.getByRole('button', {
      name: /Confirm & Complete Verification/i,
    });
    fireEvent.click(submitBtn);

    // ==========================================
    // 6. Completion Screen
    // ==========================================
    await waitFor(() => {
      expect(screen.getByText('Verification Complete!')).toBeInTheDocument();
    }, { timeout: 4000 });
    expect(screen.getByText('Safe Demo Environment')).toBeInTheDocument();
    expect(handleComplete).toHaveBeenCalledTimes(1);

    // Check reset flow
    const restartBtn = screen.getByRole('button', { name: /Restart Demo Flow/i });
    fireEvent.click(restartBtn);

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });
  });
});
