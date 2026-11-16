import React, { Suspense, lazy } from 'react';
import { CapturedImageData } from '../../types/config';

// Lazy load the camera module chunk on-demand
const CameraCapture = lazy(() => import('./CameraCapture'));

interface LazyCameraCaptureProps {
  mode: 'id' | 'selfie';
  onCapture: (data: CapturedImageData) => void;
  onClear: () => void;
  capturedImage: CapturedImageData | null;
}

const CameraSkeleton: React.FC<{ mode: 'id' | 'selfie' }> = ({ mode }) => (
  <div
    className={`w-full rounded-custom bg-slate-200 dark:bg-slate-800 animate-pulse flex flex-col items-center justify-center ${
      mode === 'selfie' ? 'aspect-square max-w-[280px] mx-auto' : 'aspect-[3/2]'
    }`}
  >
    <div className="w-10 h-10 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mb-3" />
    <span className="text-xs text-slate-500 font-medium">Initializing camera module...</span>
  </div>
);

export const LazyCameraCapture: React.FC<LazyCameraCaptureProps> = (props) => {
  return (
    <Suspense fallback={<CameraSkeleton mode={props.mode} />}>
      <CameraCapture {...props} />
    </Suspense>
  );
};

export default LazyCameraCapture;

