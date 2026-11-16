/**
 * OnboardKit Vanilla Embed Library
 * Provides OnboardKit.mount(target, options) via iframe and window.postMessage.
 */
(function (global) {
  'use strict';

  var OnboardKit = {
    mount: function (target, options) {
      options = options || {};
      var container = typeof target === 'string' ? document.querySelector(target) : target;

      if (!container) {
        throw new Error('[OnboardKit] Target container element "' + target + '" was not found.');
      }

      container.innerHTML = '';

      var iframe = document.createElement('iframe');
      iframe.src = options.src || '/';
      iframe.title = 'OnboardKit Verification Flow';
      iframe.setAttribute('role', 'region');
      iframe.setAttribute('aria-label', 'KYC Verification Flow');

      // Crucial for camera access inside iframe
      iframe.allow = 'camera; microphone; display-capture';
      iframe.setAttribute('allow', 'camera; microphone; display-capture');

      iframe.style.width = '100%';
      iframe.style.minHeight = '680px';
      iframe.style.border = 'none';
      iframe.style.display = 'block';
      iframe.style.borderRadius = (options.config && options.config.theme && options.config.theme.borderRadius) || '16px';
      iframe.style.transition = 'all 0.2s ease-in-out';

      if (options.className) {
        iframe.className = options.className;
      }

      if (options.style) {
        Object.assign(iframe.style, options.style);
      }

      function sendConfig(cfg) {
        if (!cfg || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage(
          {
            type: 'ONBOARDKIT_SET_CONFIG',
            config: cfg,
          },
          '*'
        );
      }

      function handleMessage(event) {
        if (event.source !== iframe.contentWindow) return;

        var data = event.data;
        if (!data || typeof data !== 'object') return;

        if (data.type === 'ONBOARDKIT_READY') {
          if (options.config) {
            iframe.contentWindow.postMessage(
              {
                type: 'ONBOARDKIT_INIT',
                config: options.config,
              },
              '*'
            );
          }
        } else if (data.type === 'ONBOARDKIT_EVENT') {
          if (typeof options.onEvent === 'function') {
            options.onEvent(data.event, data.payload);
          }

          if (data.event === 'step_completed' && typeof options.onStepCompleted === 'function') {
            options.onStepCompleted(data.payload);
          } else if (data.event === 'flow_completed' && typeof options.onFlowCompleted === 'function') {
            options.onFlowCompleted(data.payload);
          }
        }
      }

      window.addEventListener('message', handleMessage);

      iframe.onload = function () {
        if (options.config) {
          sendConfig(options.config);
        }
      };

      container.appendChild(iframe);

      return {
        unmount: function () {
          window.removeEventListener('message', handleMessage);
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        },
        setConfig: function (newConfig) {
          sendConfig(newConfig);
        },
        getIframe: function () {
          return iframe;
        },
      };
    },
  };

  global.OnboardKit = OnboardKit;
})(typeof window !== 'undefined' ? window : this);

