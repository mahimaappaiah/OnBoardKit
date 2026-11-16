import { OnboardKitConfig } from '../types/config';

export interface OnboardKitMountOptions {
  config?: Partial<OnboardKitConfig>;
  src?: string;
  className?: string;
  style?: Partial<CSSStyleDeclaration>;
  onStepCompleted?: (payload: {
    step: string;
    stepIndex: number;
    nextStep: string;
    nextIndex: number;
  }) => void;
  onFlowCompleted?: (payload: any) => void;
  onEvent?: (eventName: string, payload: any) => void;
}

export interface OnboardKitInstance {
  unmount: () => void;
  setConfig: (newConfig: Partial<OnboardKitConfig>) => void;
  getIframe: () => HTMLIFrameElement;
}

/**
 * OnboardKit Embed SDK
 * Enables any host website to embed the mobile-first KYC onboarding flow
 * into a target container via a secure, styled iframe communicating through postMessage.
 */
export const OnboardKit = {
  mount(
    target: HTMLElement | string,
    options: OnboardKitMountOptions = {}
  ): OnboardKitInstance {
    const container: HTMLElement | null =
      typeof target === 'string' ? document.querySelector(target) : target;

    if (!container) {
      throw new Error(`[OnboardKit] Target container element "${target}" was not found.`);
    }

    // Clean existing children in the mount target
    container.innerHTML = '';

    // Create responsive iframe
    const iframe = document.createElement('iframe');
    iframe.src = options.src || '/';
    iframe.title = 'OnboardKit Verification Flow';
    iframe.setAttribute('role', 'region');
    iframe.setAttribute('aria-label', 'KYC Verification Flow');

    // Crucial for WebRTC camera access inside cross-origin / same-origin iframes
    iframe.allow = 'camera; microphone; display-capture';
    iframe.setAttribute('allow', 'camera; microphone; display-capture');

    // Style iframe to blend seamlessly with host layout
    iframe.style.width = '100%';
    iframe.style.minHeight = '680px';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.borderRadius = options.config?.theme?.borderRadius || '16px';
    iframe.style.transition = 'all 0.2s ease-in-out';

    if (options.className) {
      iframe.className = options.className;
    }

    if (options.style) {
      Object.assign(iframe.style, options.style);
    }

    // Helper to send config to iframe
    const sendConfig = (cfg?: Partial<OnboardKitConfig>) => {
      if (!cfg || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: 'ONBOARDKIT_SET_CONFIG',
          config: cfg,
        },
        '*'
      );
    };

    // Message listener for events from child iframe
    const handleMessage = (event: MessageEvent) => {
      // Validate that message is from this specific iframe
      if (event.source !== iframe.contentWindow) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'ONBOARDKIT_READY') {
        // Child is ready; initialize with configured options
        if (options.config) {
          iframe.contentWindow?.postMessage(
            {
              type: 'ONBOARDKIT_INIT',
              config: options.config,
            },
            '*'
          );
        }
      } else if (data.type === 'ONBOARDKIT_EVENT') {
        options.onEvent?.(data.event, data.payload);

        if (data.event === 'step_completed') {
          options.onStepCompleted?.(data.payload);
        } else if (data.event === 'flow_completed') {
          options.onFlowCompleted?.(data.payload);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Initial config dispatch on iframe load
    iframe.onload = () => {
      if (options.config) {
        sendConfig(options.config);
      }
    };

    container.appendChild(iframe);

    return {
      unmount: () => {
        window.removeEventListener('message', handleMessage);
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      },
      setConfig: (newConfig: Partial<OnboardKitConfig>) => {
        sendConfig(newConfig);
      },
      getIframe: () => iframe,
    };
  },
};

// Expose globally on window for vanilla HTML host scripts
if (typeof window !== 'undefined') {
  (window as any).OnboardKit = OnboardKit;
}

export default OnboardKit;

