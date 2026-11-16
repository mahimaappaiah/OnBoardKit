import { describe, it, expect } from 'vitest';
import defaultConfig from '../config/defaultConfig.json';
import { OnboardKitConfig } from '../types/config';
import { translations } from '../i18n/translations';
import { applyTheme } from '../utils/theme';

describe('Phase 1: Config and Setup Verification', () => {
  it('loads valid defaultConfig matching OnboardKitConfig schema', () => {
    const config = defaultConfig as OnboardKitConfig;

    expect(config.theme).toBeDefined();
    expect(config.theme.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(config.theme.logoText).toBeTruthy();
    expect(config.language).toBe('en');
    expect(Array.isArray(config.steps)).toBe(true);
    expect(config.steps).toContain('details');
    expect(config.steps).toContain('id_capture');
    expect(config.steps).toContain('selfie_capture');
    expect(config.steps).toContain('document_upload');
    expect(config.steps).toContain('review');
  });

  it('provides complete translation dictionaries for English and Hindi', () => {
    expect(translations.en).toBeDefined();
    expect(translations.hi).toBeDefined();

    // Verify critical common strings
    expect(translations.en.common.next).toBe('Continue');
    expect(translations.hi.common.next).toBe('आगे बढ़ें');

    // Verify all steps have translations in both languages
    const steps = ['details', 'id_capture', 'selfie_capture', 'document_upload', 'review'] as const;
    steps.forEach((step) => {
      expect(translations.en.steps[step].title).toBeTruthy();
      expect(translations.hi.steps[step].title).toBeTruthy();
    });
  });

  it('correctly applies theme CSS variables to DOM element', () => {
    const el = document.createElement('div');
    const mockTheme = {
      primaryColor: '#ff0000',
      primaryHoverColor: '#cc0000',
      backgroundColor: '#111111',
      surfaceColor: '#222222',
      textColor: '#ffffff',
      textMutedColor: '#888888',
      errorColor: '#ee0000',
      borderColor: '#333333',
      borderRadius: '16px',
      logoText: 'Test Brand',
    };

    applyTheme(mockTheme, el);

    expect(el.style.getPropertyValue('--color-primary')).toBe('#ff0000');
    expect(el.style.getPropertyValue('--color-primary-hover')).toBe('#cc0000');
    expect(el.style.getPropertyValue('--color-background')).toBe('#111111');
    expect(el.style.getPropertyValue('--border-radius')).toBe('16px');
  });
});

