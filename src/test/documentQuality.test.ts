import { describe, it, expect } from 'vitest';
import { evaluateDocumentQuality } from '../utils/documentQuality';

describe('Phase 7: Document Quality Analysis', () => {
  it('passes high resolution document with optimal lighting and sharpness', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;

    const report = evaluateDocumentQuality(canvas);

    expect(report.resolution.isAdequate).toBe(true);
    expect(report.brightness.status).toBe('optimal');
    expect(report.sharpness.status).toBe('sharp');
    expect(report.isAcceptable).toBe(true);
    expect(report.actionableTips.length).toBeGreaterThan(0);
  });

  it('flags low resolution document with actionable suggestion', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;

    const report = evaluateDocumentQuality(canvas);

    expect(report.resolution.isAdequate).toBe(false);
    expect(report.isAcceptable).toBe(false);
    expect(report.actionableTips.some((tip) => tip.includes('Hold the camera closer'))).toBe(true);
  });

  it('detects underexposed / dark lighting with actionable lighting tips', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Mock dark pixels
    const customCtx = {
      getImageData: () => ({
        data: new Uint8ClampedArray([10, 10, 10, 255, 12, 12, 12, 255]),
        width: 2,
        height: 1,
        colorSpace: 'srgb',
      }),
    } as any;

    const report = evaluateDocumentQuality(canvas, customCtx);

    expect(report.brightness.status).toBe('dark');
    expect(report.isAcceptable).toBe(false);
    expect(report.actionableTips.some((tip) => tip.includes('light source'))).toBe(true);
  });

  it('detects severe direct glare with tilt angle suggestions', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    // Mock glare white pixels
    const customCtx = {
      getImageData: () => ({
        data: new Uint8ClampedArray([250, 250, 250, 255, 255, 255, 255, 255]),
        width: 2,
        height: 1,
        colorSpace: 'srgb',
      }),
    } as any;

    const report = evaluateDocumentQuality(canvas, customCtx);

    expect(report.brightness.status).toBe('bright');
    expect(report.isAcceptable).toBe(false);
    expect(report.actionableTips.some((tip) => tip.includes('Tilt the document'))).toBe(true);
  });
});

