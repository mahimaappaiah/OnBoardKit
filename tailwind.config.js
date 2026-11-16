/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: 'var(--color-primary, #2563eb)',
          'primary-hover': 'var(--color-primary-hover, #1d4ed8)',
          background: 'var(--color-background, #f8fafc)',
          surface: 'var(--color-surface, #ffffff)',
          text: 'var(--color-text, #0f172a)',
          muted: 'var(--color-text-muted, #64748b)',
          error: 'var(--color-error, #ef4444)',
          border: 'var(--color-border, #e2e8f0)',
          success: 'var(--color-success, #10b981)',
        }
      },
      borderRadius: {
        custom: 'var(--border-radius, 0.75rem)',
      }
    },
  },
  plugins: [],
}

