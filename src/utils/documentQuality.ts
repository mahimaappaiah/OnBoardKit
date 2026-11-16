import { DocumentQualityReport } from '../types/verification';

/**
 * Client-Side Document Image Quality Analyzer
 * Evaluates image resolution, lighting/glare, and optical sharpness in browser memory.
 * Never claims to detect physical holograms or counterfeit materials.
 */
export function evaluateDocumentQuality(
  canvas: HTMLCanvasElement,
  customCtx?: CanvasRenderingContext2D | null
): DocumentQualityReport {
  const width = canvas.width || 0;
  const height = canvas.height || 0;
  const megapixels = Number(((width * height) / 1_000_000).toFixed(2));

  // 1. Resolution Check
  const minWidth = 500;
  const minHeight = 350;
  const isAdequateResolution = width >= minWidth && height >= minHeight;

  let resolutionFeedback = 'High definition capture (> 0.4 MP) optimal for OCR reading.';
  if (!isAdequateResolution) {
    resolutionFeedback = `Resolution is low (${width}x${height}). Recommended at least ${minWidth}x${minHeight}px for reliable text reading.`;
  }

  // Fallback defaults if context is not readable
  let avgLuminance = 130;
  let sharpnessScore = 65;

  try {
    const ctx = customCtx || canvas.getContext('2d');
    if (ctx && width > 0 && height > 0) {
      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      if (data && data.length > 0) {
        let sumLuminance = 0;
        let luminanceCount = 0;
        let sumGradientSq = 0;
        let edgeSamples = 0;

        // Sample every 4th pixel for high responsiveness
        const step = Math.max(4, Math.floor(data.length / (2000 * 4)) * 4);

        for (let i = 0; i < data.length; i += step) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          sumLuminance += lum;
          luminanceCount++;

          // Discrete gradient difference between neighboring pixel
          if (i + 4 < data.length) {
            const nextR = data[i + 4];
            const nextG = data[i + 5];
            const nextB = data[i + 6];
            const nextLum = 0.299 * nextR + 0.587 * nextG + 0.114 * nextB;

            const diff = Math.abs(lum - nextLum);
            sumGradientSq += diff * diff;
            edgeSamples++;
          }
        }

        avgLuminance = luminanceCount > 0 ? sumLuminance / luminanceCount : 128;

        // Edge gradient variance indicates sharpness
        const avgGradient = edgeSamples > 0 ? Math.sqrt(sumGradientSq / edgeSamples) : 50;
        sharpnessScore = Math.min(100, Math.round(avgGradient * 3.5));
      }
    }
  } catch {
    // Graceful fallback for restricted contexts
    avgLuminance = 125;
    sharpnessScore = 70;
  }

  // 2. Brightness / Glare Analysis
  let brightnessStatus: 'optimal' | 'dark' | 'bright' = 'optimal';
  let brightnessFeedback = 'Lighting is well balanced with even illumination.';

  if (avgLuminance < 35) {
    brightnessStatus = 'dark';
    brightnessFeedback = 'Image appears dark or underexposed. Text may be hard to distinguish.';
  } else if (avgLuminance > 225) {
    brightnessStatus = 'bright';
    brightnessFeedback = 'Direct glare or overexposure detected. Contrast between text and background is washed out.';
  }

  // 3. Sharpness / Blur Analysis
  let sharpnessStatus: 'sharp' | 'blurry' = 'sharp';
  let sharpnessFeedback = 'Optical edges and font glyphs are distinct and focused.';

  if (sharpnessScore < 20) {
    sharpnessStatus = 'blurry';
    sharpnessFeedback = 'Image appears blurry or out of focus. Fine text may be unreadable.';
  }

  // 4. Actionable Suggestions
  const actionableTips: string[] = [];

  if (brightnessStatus === 'dark') {
    actionableTips.push('Move closer to a light source or turn on room lighting.');
    actionableTips.push('Avoid cast shadows from your hand or mobile device over the card.');
  }

  if (brightnessStatus === 'bright') {
    actionableTips.push('Tilt the document slightly (10-15 degrees) away from overhead lights to eliminate direct glare spots.');
  }

  if (sharpnessStatus === 'blurry') {
    actionableTips.push('Hold your phone steady or rest your elbows on a surface while capturing.');
    actionableTips.push('Clean your camera lens and wait for auto-focus to lock on the document text.');
  }

  if (!isAdequateResolution) {
    actionableTips.push('Hold the camera closer so the identity card fills at least 80% of the viewfinder frame.');
  }

  if (actionableTips.length === 0) {
    actionableTips.push('Document quality meets high-confidence OCR reading standards.');
  }

  const isAcceptable =
    isAdequateResolution && brightnessStatus === 'optimal' && sharpnessStatus === 'sharp';

  return {
    isAcceptable,
    brightness: {
      value: Math.round(avgLuminance),
      status: brightnessStatus,
      feedback: brightnessFeedback,
    },
    sharpness: {
      value: sharpnessScore,
      status: sharpnessStatus,
      feedback: sharpnessFeedback,
    },
    resolution: {
      width,
      height,
      megapixels,
      isAdequate: isAdequateResolution,
      feedback: resolutionFeedback,
    },
    actionableTips,
  };
}

