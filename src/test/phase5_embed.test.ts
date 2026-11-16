import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OnboardKit } from '../embed/onboardkit-embed';

describe('Phase 5: Embed Script & PostMessage Communication', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'embed-target';
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('mounts an accessible iframe with camera permissions in target container', () => {
    const instance = OnboardKit.mount('#embed-target', {
      src: '/custom-flow',
      config: {
        language: 'hi',
        theme: {
          primaryColor: '#059669',
          primaryHoverColor: '#047857',
          backgroundColor: '#ffffff',
          surfaceColor: '#ffffff',
          textColor: '#0f172a',
          textMutedColor: '#64748b',
          errorColor: '#ef4444',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          logoText: 'Partner FinTech',
        },
      },
    });

    const iframe = container.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe?.src).toContain('/custom-flow');
    // Verify WebRTC camera permission is enabled on iframe
    const allowAttr = iframe?.getAttribute('allow') || (iframe as any)?.allow || '';
    expect(allowAttr).toContain('camera');
    expect(iframe?.style.borderRadius).toBe('16px');

    // Unmount and verify cleanup
    instance.unmount();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('throws an error if target container is not found', () => {
    expect(() => {
      OnboardKit.mount('#non-existent-id');
    }).toThrow(/Target container element/);
  });

  it('relays step_completed and flow_completed events from iframe to host callbacks', () => {
    const onStepCompleted = vi.fn();
    const onFlowCompleted = vi.fn();
    const onEvent = vi.fn();

    const instance = OnboardKit.mount(container, {
      onStepCompleted,
      onFlowCompleted,
      onEvent,
    });

    const iframe = instance.getIframe();
    const mockContentWindow = {} as Window;
    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      configurable: true,
    });

    // 1. Simulate step_completed event
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockContentWindow,
        data: {
          type: 'ONBOARDKIT_EVENT',
          event: 'step_completed',
          payload: {
            step: 'details',
            stepIndex: 0,
            nextStep: 'id_capture',
            nextIndex: 1,
          },
        },
      })
    );

    expect(onEvent).toHaveBeenCalledWith('step_completed', {
      step: 'details',
      stepIndex: 0,
      nextStep: 'id_capture',
      nextIndex: 1,
    });
    expect(onStepCompleted).toHaveBeenCalledWith({
      step: 'details',
      stepIndex: 0,
      nextStep: 'id_capture',
      nextIndex: 1,
    });

    // 2. Simulate flow_completed event
    window.dispatchEvent(
      new MessageEvent('message', {
        source: mockContentWindow,
        data: {
          type: 'ONBOARDKIT_EVENT',
          event: 'flow_completed',
          payload: {
            details: { fullName: 'Test User' },
            hasIdCapture: true,
          },
        },
      })
    );

    expect(onFlowCompleted).toHaveBeenCalledWith({
      details: { fullName: 'Test User' },
      hasIdCapture: true,
    });

    instance.unmount();
  });

  it('sends updated configuration to iframe when setConfig is invoked', () => {
    const postMessageMock = vi.fn();
    const instance = OnboardKit.mount(container);
    const iframe = instance.getIframe();

    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage: postMessageMock },
      configurable: true,
    });

    instance.setConfig({
      language: 'hi',
      theme: {
        primaryColor: '#ff0000',
        primaryHoverColor: '#cc0000',
        backgroundColor: '#ffffff',
        surfaceColor: '#ffffff',
        textColor: '#000000',
        textMutedColor: '#666666',
        errorColor: '#ff0000',
        borderColor: '#cccccc',
        borderRadius: '8px',
        logoText: 'New Brand',
      },
    });

    expect(postMessageMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ONBOARDKIT_SET_CONFIG',
        config: expect.objectContaining({
          language: 'hi',
        }),
      }),
      '*'
    );

    instance.unmount();
  });
});

