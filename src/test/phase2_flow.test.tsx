import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OnboardingProvider } from '../context/OnboardingContext';
import { OnboardingFlow } from '../components/OnboardingFlow';
import { OnboardKitConfig } from '../types/config';

const testConfig: OnboardKitConfig = {
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
    logoText: 'Test OnboardKit',
  },
  language: 'en',
  steps: ['details', 'document_upload', 'review'],
};

describe('Phase 2: Flow and Step Navigation', () => {
  it('renders initial details step with config logo and progress indicator', () => {
    render(
      <OnboardingProvider config={testConfig}>
        <OnboardingFlow />
      </OnboardingProvider>
    );

    expect(screen.getByText('Test OnboardKit')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
  });

  it('prevents proceeding to next step when validation fails', () => {
    render(
      <OnboardingProvider config={testConfig}>
        <OnboardingFlow />
      </OnboardingProvider>
    );

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    // Validation messages appear and we stay on step 1
    expect(screen.getByText(/Full name is required/i)).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('preserves form state and advances to next step when valid', () => {
    render(
      <OnboardingProvider config={testConfig}>
        <OnboardingFlow />
      </OnboardingProvider>
    );

    // Fill valid details
    fireEvent.change(screen.getByLabelText(/Full Legal Name/i), {
      target: { value: 'Alex Morgan' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1995-06-15' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+1 555 123 4567' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'alex.morgan@example.com' },
    });

    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    // Should now be on Step 2 (which is document_upload in testConfig)
    expect(screen.getByText('Supporting Document')).toBeInTheDocument();
    expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();

    // Click back button
    const backBtn = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backBtn);

    // Back to Step 1, verify state was preserved!
    expect(screen.getByDisplayValue('Alex Morgan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('alex.morgan@example.com')).toBeInTheDocument();
  });

  it('adheres to custom steps defined in config', () => {
    const customConfig: OnboardKitConfig = {
      ...testConfig,
      steps: ['details', 'review'],
    };

    render(
      <OnboardingProvider config={customConfig}>
        <OnboardingFlow />
      </OnboardingProvider>
    );

    expect(screen.getByText(/Step 1 of 2/i)).toBeInTheDocument();

    // Fill details
    fireEvent.change(screen.getByLabelText(/Full Legal Name/i), {
      target: { value: 'Sam Smith' },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: '1990-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'sam@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Should jump straight to Review step since document_upload was omitted!
    expect(screen.getByText('Review Your Information')).toBeInTheDocument();
    expect(screen.getByText('Sam Smith')).toBeInTheDocument();
    expect(screen.getByText('sam@example.com')).toBeInTheDocument();
  });

  it('switches languages dynamically', () => {
    render(
      <OnboardingProvider config={testConfig}>
        <OnboardingFlow />
      </OnboardingProvider>
    );

    expect(screen.getByText('Personal Information')).toBeInTheDocument();

    // Switch to Hindi
    const langBtn = screen.getByRole('button', { name: /Switch language to Hindi/i });
    fireEvent.click(langBtn);

    expect(screen.getByText('व्यक्तिगत जानकारी')).toBeInTheDocument();
  });
});

