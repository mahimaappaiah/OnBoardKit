import React, { useState, useEffect, useRef } from 'react';
import { useOnboarding } from '../../context/OnboardingContext';
import { validateUserDetails, ValidationErrors } from '../../utils/validation';

export const DetailsStep: React.FC = () => {
  const { state, updateDetails, nextStep, t } = useOnboarding();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Focus management: focus step heading when step mounts
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleChange = (field: keyof typeof state.details, value: string) => {
    updateDetails({ [field]: value });
    // Clear inline error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof typeof state.details) => {
    const currentErrors = validateUserDetails(state.details, t);
    if (currentErrors[field]) {
      setErrors((prev) => ({ ...prev, [field]: currentErrors[field] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateUserDetails(state.details, t);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus the first invalid input
      const firstInvalidKey = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstInvalidKey);
      element?.focus();
      return;
    }

    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-labelledby="details-heading">
      <div className="mb-5">
        <h2
          id="details-heading"
          ref={headingRef}
          tabIndex={-1}
          className="text-xl font-bold text-theme-text outline-none"
        >
          {t.steps.details.title}
        </h2>
        <p className="text-xs text-theme-muted mt-1">{t.steps.details.subtitle}</p>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold text-theme-text mb-1">
            {t.steps.details.fullNameLabel} <span className="text-theme-error">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            value={state.details.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder={t.steps.details.fullNamePlaceholder}
            className={`w-full px-3 py-2 text-sm rounded-custom border transition bg-theme-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary ${
              errors.fullName ? 'border-theme-error ring-1 ring-theme-error' : 'border-theme-border'
            }`}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            autoComplete="name"
            required
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-xs text-theme-error" role="alert">
              {errors.fullName}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-theme-text mb-1">
            {t.steps.details.dobLabel} <span className="text-theme-error">*</span>
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={state.details.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={() => handleBlur('dateOfBirth')}
            placeholder={t.steps.details.dobPlaceholder}
            className={`w-full px-3 py-2 text-sm rounded-custom border transition bg-theme-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary ${
              errors.dateOfBirth ? 'border-theme-error ring-1 ring-theme-error' : 'border-theme-border'
            }`}
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
            autoComplete="bday"
            required
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="mt-1 text-xs text-theme-error" role="alert">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-theme-text mb-1">
            {t.steps.details.phoneLabel} <span className="text-theme-error">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={state.details.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            placeholder={t.steps.details.phonePlaceholder}
            className={`w-full px-3 py-2 text-sm rounded-custom border transition bg-theme-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary ${
              errors.phone ? 'border-theme-error ring-1 ring-theme-error' : 'border-theme-border'
            }`}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            autoComplete="tel"
            required
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-theme-error" role="alert">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold text-theme-text mb-1">
            {t.steps.details.emailLabel} <span className="text-theme-error">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={state.details.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder={t.steps.details.emailPlaceholder}
            className={`w-full px-3 py-2 text-sm rounded-custom border transition bg-theme-surface text-theme-text focus:outline-none focus:ring-2 focus:ring-theme-primary ${
              errors.email ? 'border-theme-error ring-1 ring-theme-error' : 'border-theme-border'
            }`}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            autoComplete="email"
            required
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-theme-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end pt-4 border-t border-theme-border">
        <button
          type="submit"
          className="w-full sm:w-auto px-5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-sm font-semibold rounded-custom transition shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-theme-primary"
        >
          {t.common.next}
        </button>
      </div>
    </form>
  );
};

