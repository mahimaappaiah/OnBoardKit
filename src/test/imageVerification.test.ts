import { describe, it, expect } from 'vitest';
import { analyzeCanvasImage } from '../utils/imageVerification';

describe('Image Quality & Verification Analyzer', () => {
  it('analyzes standard canvas image and returns verified status for ID', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;

    const result = analyzeCanvasImage(canvas, 'id');
    expect(result.status).toBe('verified');
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.clarity).toBe('High');
    expect(result.checks.some((c) => c.includes('MRZ'))).toBe(true);
  });

  it('analyzes selfie mode and returns biometric match details', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const result = analyzeCanvasImage(canvas, 'selfie');
    expect(result.status).toBe('verified');
    expect(result.checks.some((c) => c.includes('Facial landmarks'))).toBe(true);
  });

  it('analyzes document mode and verifies issue validity window', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;

    const result = analyzeCanvasImage(canvas, 'document');
    expect(result.status).toBe('verified');
    expect(result.checks.some((c) => c.includes('90 days'))).toBe(true);
  });

  it('detects pitch dark images when pixels are black', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mock pitch black pixels
      ctx.getImageData = () => ({
        data: new Uint8ClampedArray([0, 0, 0, 255, 5, 5, 5, 255]),
        width: 2,
        height: 1,
        colorSpace: 'srgb',
      });
    }

    const result = analyzeCanvasImage(canvas, 'id', ctx);
    expect(result.status).toBe('warning');
    expect(result.lighting).toBe('Dark');
    expect(result.checks.some((c) => c.includes('Insufficient lighting'))).toBe(true);
  });

  it('detects direct glare when pixels are saturated white', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mock pure white saturated pixels
      ctx.getImageData = () => ({
        data: new Uint8ClampedArray([255, 255, 255, 255, 250, 250, 250, 255]),
        width: 2,
        height: 1,
        colorSpace: 'srgb',
      });
    }

    const result = analyzeCanvasImage(canvas, 'id', ctx);
    expect(result.status).toBe('warning');
    expect(result.lighting).toBe('Glare');
    expect(result.checks.some((c) => c.includes('glare detected'))).toBe(true);
  });
});

