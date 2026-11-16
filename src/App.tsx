import React, { useEffect, useState } from 'react';
import defaultConfig from './config/defaultConfig.json';
import { OnboardKitConfig } from './types/config';
import { applyTheme } from './utils/theme';
import { OnboardingProvider } from './context/OnboardingContext';
import { OnboardingFlow } from './components/OnboardingFlow';

const THEME_PRESETS: Record<string, { primaryColor: string; primaryHoverColor: string; logoText: string }> = {
  blue: {
    primaryColor: '#2563eb',
    primaryHoverColor: '#1d4ed8',
    logoText: 'OnboardKit',
  },
  emerald: {
    primaryColor: '#059669',
    primaryHoverColor: '#047857',
    logoText: 'NeoBank KYC',
  },
  purple: {
    primaryColor: '#7c3aed',
    primaryHoverColor: '#6d28d9',
    logoText: 'Aura Identity',
  },
};

export const App: React.FC = () => {
  const [config, setConfig] = useState<OnboardKitConfig>(defaultConfig as OnboardKitConfig);
  const [isStandalone, setIsStandalone] = useState(true);

  useEffect(() => {
    // Detect if running inside iframe or standalone
    try {
      setIsStandalone(window.self === window.top);
    } catch {
      setIsStandalone(false);
    }
  }, []);

  useEffect(() => {
    applyTheme(config.theme);
  }, [config.theme]);

  const switchThemePreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        theme: {
          ...prev.theme,
          ...preset,
        },
      }));
    }
  };

  return (
    <div className="min-h-screen bg-theme-background text-theme-text flex flex-col justify-between p-3 sm:p-6 transition-colors duration-200">
      {/* Top Demo Bar for Standalone view */}
      {isStandalone && (
        <aside className="w-full max-w-md mx-auto mb-3 bg-theme-surface border border-theme-border rounded-custom p-2.5 flex items-center justify-between text-xs shadow-sm">
          <div className="flex items-center space-x-1.5">
            <span className="text-theme-muted font-medium">Theme:</span>
            <button
              type="button"
              onClick={() => switchThemePreset('blue')}
              className="w-4 h-4 rounded-full bg-blue-600 hover:scale-110 transition ring-1 ring-slate-300"
              title="Blue Theme"
              aria-label="Blue theme"
            />
            <button
              type="button"
              onClick={() => switchThemePreset('emerald')}
              className="w-4 h-4 rounded-full bg-emerald-600 hover:scale-110 transition ring-1 ring-slate-300"
              title="Emerald Theme"
              aria-label="Emerald theme"
            />
            <button
              type="button"
              onClick={() => switchThemePreset('purple')}
              className="w-4 h-4 rounded-full bg-purple-600 hover:scale-110 transition ring-1 ring-slate-300"
              title="Purple Theme"
              aria-label="Purple theme"
            />
          </div>

          <a
            href="/sample-host.html"
            className="font-semibold text-theme-primary hover:underline flex items-center space-x-1"
          >
            <span>Host Portal Demo</span>
            <span aria-hidden="true">&rarr;</span>
          </a>
        </aside>
      )}

      <main className="w-full flex-grow flex items-center justify-center py-2 sm:py-4">
        <OnboardingProvider
          config={config}
          onStepChange={(step, idx) => {
            console.log(`[OnboardKit] Step changed to ${step} (Index: ${idx})`);
          }}
          onComplete={(completedState) => {
            console.log('[OnboardKit] Verification completed:', completedState);
          }}
        >
          <OnboardingFlow />
        </OnboardingProvider>
      </main>

      <footer className="w-full max-w-md mx-auto text-center text-xs text-theme-muted pt-3 border-t border-theme-border">
        <p className="font-medium text-[11px]">
          Portfolio Demo: All operations run strictly in local browser memory. No data is stored or transmitted.
        </p>
      </footer>
    </div>
  );
};

export default App;
