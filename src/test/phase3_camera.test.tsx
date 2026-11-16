import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CameraCapture } from '../components/camera/CameraCapture';
import { OnboardingProvider } from '../context/OnboardingContext';
import { OnboardKitConfig, CapturedImageData } from '../types/config';

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
    logoText: 'Camera Test',
  },
  language: 'en',
  steps: ['id_capture', 'selfie_capture'],
};

describe('Phase 3: Camera Capture & Fallbacks', () => {
  let mockTrackStop: any;
  let mockStream: any;

  beforeEach(() => {
    mockTrackStop = vi.fn();
    mockStream = {
      getTracks: vi.fn(() => [
        { stop: mockTrackStop, kind: 'video' },
      ]),
    };

    // Default mock of navigator.mediaDevices
    Object.defineProperty(navigator, 'mediaDevices', {
      writable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    // Mock HTMLMediaElement play
    window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests camera stream with environment facingMode for ID capture', async () => {
    render(
      <OnboardingProvider config={testConfig}>
        <CameraCapture
          mode="id"
          onCapture={vi.fn()}
          onClear={vi.fn()}
          capturedImage={null}
        />
      </OnboardingProvider>
    );

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    });

    expect(screen.getByTestId('camera-active-container')).toBeInTheDocument();
  });

  it('stops media stream tracks when component unmounts', async () => {
    const { unmount } = render(
      <OnboardingProvider config={testConfig}>
        <CameraCapture
          mode="id"
          onCapture={vi.fn()}
          onClear={vi.fn()}
          capturedImage={null}
        />
      </OnboardingProvider>
    );

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
    });

    unmount();

    expect(mockTrackStop).toHaveBeenCalled();
  });

  it('shows permission denied message and mobile file fallback when getUserMedia is denied', async () => {
    // Mock permission denied
    const permissionError = new Error('Permission denied');
    permissionError.name = 'NotAllowedError';
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(permissionError);

    render(
      <OnboardingProvider config={testConfig}>
        <CameraCapture
          mode="id"
          onCapture={vi.fn()}
          onClear={vi.fn()}
          capturedImage={null}
        />
      </OnboardingProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('camera-fallback')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Camera permission was denied/i)
    ).toBeInTheDocument();

    // Check fallback file input with capture attribute
    const fallbackInput = screen.getByLabelText(/Upload ID Photo/i) as HTMLInputElement;
    expect(fallbackInput).toBeInTheDocument();
    expect(fallbackInput).toHaveAttribute('type', 'file');
    expect(fallbackInput).toHaveAttribute('capture', 'environment');
  });

  it('shows camera unavailable message when camera hardware is missing', async () => {
    const notFoundError = new Error('No camera found');
    notFoundError.name = 'NotFoundError';
    (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(notFoundError);

    render(
      <OnboardingProvider config={testConfig}>
        <CameraCapture
          mode="selfie"
          onCapture={vi.fn()}
          onClear={vi.fn()}
          capturedImage={null}
        />
      </OnboardingProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('camera-fallback')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/No compatible camera was detected/i)
    ).toBeInTheDocument();

    const fallbackInput = screen.getByLabelText(/Upload Selfie Photo/i) as HTMLInputElement;
    expect(fallbackInput).toHaveAttribute('capture', 'user');
  });

  it('displays photo preview and allows retake when image is already captured', () => {
    const mockImage: CapturedImageData = {
      dataUrl: 'data:image/jpeg;base64,mockphotodata',
      timestamp: Date.now(),
      source: 'camera',
    };
    const onClearMock = vi.fn();

    render(
      <OnboardingProvider config={testConfig}>
        <CameraCapture
          mode="selfie"
          onCapture={vi.fn()}
          onClear={onClearMock}
          capturedImage={mockImage}
        />
      </OnboardingProvider>
    );

    expect(screen.getByTestId('camera-preview-container')).toBeInTheDocument();
    const img = screen.getByAltText('Captured Selfie');
    expect(img).toHaveAttribute('src', mockImage.dataUrl);

    const retakeButton = screen.getByRole('button', { name: /retake selfie/i });
    fireEvent.click(retakeButton);

    expect(onClearMock).toHaveBeenCalledTimes(1);
  });
});

