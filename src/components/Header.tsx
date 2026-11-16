import React from 'react';
import { useOnboarding } from '../context/OnboardingContext';

export const Header: React.FC = () => {
  const { config, language, setLanguage } = useOnboarding();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="flex items-center justify-between pb-4 mb-4 border-b border-theme-border">
      <div className="flex items-center space-x-2">
        <div 
          className="w-9 h-9 rounded-custom flex items-center justify-center font-bold text-white bg-theme-primary text-sm shadow-sm"
          aria-hidden="true"
        >
          OK
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-theme-text leading-tight">
            {config.theme.logoText}
          </h1>
          <span className="text-[11px] text-theme-muted font-medium block">
            Client-Side KYC Demo
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={toggleLanguage}
        className="px-2.5 py-1 text-xs font-semibold rounded-custom border border-theme-border bg-theme-background text-theme-text hover:bg-slate-100 dark:hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-theme-primary"
        aria-label={`Switch language to ${language === 'en' ? 'Hindi' : 'English'}`}
      >
        {language === 'en' ? '🇮🇳 हिन्दी' : '🌐 English'}
      </button>
    </header>
  );
};

