# OnboardKit

> **A configurable, mobile-first, KYC-style user onboarding flow.**  
> Built with **React 18, TypeScript, Vite, Tailwind CSS, and Vitest**.  
> Designed as a high-performance portfolio demo with **100% client-side data privacy** (zero uploads, zero persistent tracking, and mock/fake branding).

---

## Visual Flow & Architecture

```
                                 [ config.json ]
                                        │
             ┌──────────────────────────┴──────────────────────────┐
             ▼                                                     ▼
     Theme (CSS Variables)                                Language Dictionaries
  --color-primary, --border-radius                         English (en) / हिन्दी (hi)
             │                                                     │
             └──────────────────────────┬──────────────────────────┘
                                        ▼
                            [ OnboardingProvider ]
                         (Isolated Context State)
                                        │
 ┌──────────────┬───────────────────────┼───────────────────────┬──────────────┐
 ▼              ▼                       ▼                       ▼              ▼
[Details]  [ID Capture]*       [Selfie Capture]*       [Document]  [Review & Submit]
 (Form)     (Camera / File)     (Camera / File)         (Upload)    (Verification)
                │                       │
                └───────────┬───────────┘
                            ▼
             *Lazy-Loaded Camera Chunk
          (getUserMedia + Fallback Upload)
                            │
                            ▼
               [ Host Portal / Embed SDK ]
            (via iframe & window.postMessage)
```

---

## Screen Walkthroughs (ASCII & Text Previews)

````carousel
```
┌──────────────────────────────────────┐
│  [OK] OnboardKit          🇮🇳 हिन्दी  │
│  Step 1 of 5                     20% │
│  ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
├──────────────────────────────────────┤
│  Personal Information                │
│  Please provide your basic details   │
│                                      │
│  Full Legal Name *                   │
│  [ Jane Doe                        ] │
│                                      │
│  Date of Birth (18+) *               │
│  [ 1995-06-15                      ] │
│                                      │
│  Phone Number *                      │
│  [ +1 555 123 4567                 ] │
│                                      │
│  Email Address *                     │
│  [ jane.doe@example.com            ] │
│                                      │
│                 [ Continue (Next) ->]│
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  [OK] OnboardKit          🇮🇳 हिन्दी  │
│  Step 2 of 5                     40% │
├──────────────────────────────────────┤
│  ID Verification                     │
│  Capture government-issued ID card   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📹 Live Stream (getUserMedia)  │  │
│  │   ┌────────────────────────┐   │  │
│  │   │   [ID Card Outline]    │   │  │
│  │   │  Align ID card here    │   │  │
│  │   └────────────────────────┘   │  │
│  └────────────────────────────────┘  │
│                                      │
│           [ 📷 Capture ID ]          │
│                                      │
│  (Or fallback to file upload below)  │
│  [<- Back]                 [Continue]│
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  [OK] OnboardKit          🇮🇳 हिन्दी  │
│  Step 3 of 5                     60% │
├──────────────────────────────────────┤
│  Liveness Selfie                     │
│  Match face against ID document      │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📹 Front Camera (user facing)  │  │
│  │        ╭────────────╮          │  │
│  │        │ Center face│          │  │
│  │        │    here    │          │  │
│  │        ╰────────────╯          │  │
│  └────────────────────────────────┘  │
│                                      │
│          [ 🤳 Take Selfie ]          │
│                                      │
│  [<- Back]                 [Continue]│
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  [OK] OnboardKit          🇮🇳 हिन्दी  │
│  Step 4 of 5                     80% │
├──────────────────────────────────────┤
│  Supporting Document                 │
│  Proof of address (utility bill)     │
│                                      │
│  ┌ - - - - - - - - - - - - - - - - ┐ │
│  │  📄 Tap or drag file to upload  │ │
│  │  PDF, PNG, JPG up to 10MB       │ │
│  └ - - - - - - - - - - - - - - - - ┘ │
│                                      │
│  [<- Back]                 [Continue]│
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  [OK] OnboardKit          🇮🇳 हिन्दी  │
│  Step 5 of 5                    100% │
├──────────────────────────────────────┤
│  Review Your Information             │
│  ┌────────────────────────────────┐  │
│  │ Personal Details       [Edit]  │  │
│  │ Jane Doe • 1995-06-15          │  │
│  │ +1 555 123 4567 • jane@...     │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │ ID Photo [Ready] Selfie [Ready]│  │
│  │ Utility_Bill.pdf (1.2 MB)      │  │
│  └────────────────────────────────┘  │
│  🔒 Demo Mode: Data stays in browser │
│                                      │
│  [<- Back]  [Confirm & Complete Flow]│
└──────────────────────────────────────┘
```
````

---

## Key Features

1. **Config-Driven Architecture**:
   - The entire onboarding flow, step sequence, theming, and language are governed by `config.json`.
   - Changing `config.json` instantly rearranges or omits steps (e.g. omitting document upload for a 4-step fast track).
   - Theme properties dynamically inject CSS variables (`--color-primary`, `--border-radius`, etc.) into the DOM for runtime re-theming without stylesheet recompilation.
   - Built-in internationalization with comprehensive English (`en`) and Hindi (`hi`) dictionaries.

2. **Hardware Camera Integration with Graceful Fallback**:
   - Live camera preview via `navigator.mediaDevices.getUserMedia`.
   - Automatic `facingMode`: `environment` (rear) for ID card alignment, and `user` (front) for selfie capture.
   - Real-time frame capture via hidden HTML5 Canvas downscaled to high-quality JPEG data URL.
   - Interactive preview with retake and track cleanup on unmount (prevents camera hardware light from staying active).
   - **Permission-denied & Hardware-missing Fallback**: If permissions are denied or camera hardware is absent, an accessible alert explains the issue and presents a mobile-friendly file input using the HTML5 `capture` attribute (`capture="environment"` / `capture="user"`).

3. **Pure Function Form Validation**:
   - Separated into isolated, pure functions in `src/utils/validation.ts` for comprehensive testing.
   - **Full Legal Name**: Enforces character minimums and supports multilingual Unicode letters (`\p{L}`) and combining vowel marks (`\p{M}`) for Indian (Devanagari) and accented names.
   - **Date of Birth**: Validates format, historical past date, and strictly enforces the legal **18+ years** age requirement.
   - **Phone & Email**: Validates standard 10–15 digit phone formats (with optional international prefixes) and RFC-compliant email formats.
   - Inline errors with `aria-invalid` and `aria-describedby` associations.

4. **Accessibility (WCAG AA) & Mobile Performance**:
   - Focus management: Heading (`h2`) with `tabIndex={-1}` is automatically focused when transitioning between steps so screen readers immediately announce step changes.
   - Full keyboard navigability with visible focus rings (`:focus-visible`).
   - Progress bar with ARIA progress roles (`role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
   - **Lazy Loading**: The camera module is lazy-loaded using `React.lazy` and `Suspense`, separating the camera bundle chunk (`CameraCapture-*.js`) from the initial load to target 90+ on mobile Lighthouse.

5. **Embeddable SDK (`OnboardKit.mount`)**:
   - Lightweight script allowing any third-party host website to embed the onboarding flow inside a container via an isolated `<iframe>`.
   - Fully enables WebRTC hardware access within the iframe via `allow="camera; microphone; display-capture"`.
   - Emits bidirectional `window.postMessage` events (`step_completed`, `flow_completed`, `ONBOARDKIT_SET_CONFIG`).
   - Includes a sample host portal (`sample-host.html`) with live event logging and dynamic host configuration controls.

---

## Quick Start & Setup

### Prerequisites
- Node.js `v18+` (tested on Node `v24.12.0`)
- npm `v9+` (tested on npm `v11.6.2`)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
- Open `http://localhost:5173/` in your browser to view the standalone mobile flow.
- Open `http://localhost:5173/sample-host.html` to test the embedded host portal with real-time event logging and dynamic configuration controls.

### 3. Run the Test Suite
```bash
npm run test
```

### 4. Run Coverage Reporting
```bash
npm run test:coverage
```
*Current test suite:* **37 passing unit & integration tests** across 6 suites with **>91% statement & line coverage**.

### 5. Production Build
```bash
npm run build
```

---

## Configuration Schema (`config.json`)

The flow is configured through a single JSON object. Example:

```json
{
  "theme": {
    "primaryColor": "#2563eb",
    "primaryHoverColor": "#1d4ed8",
    "backgroundColor": "#f8fafc",
    "surfaceColor": "#ffffff",
    "textColor": "#0f172a",
    "textMutedColor": "#64748b",
    "errorColor": "#ef4444",
    "borderColor": "#e2e8f0",
    "borderRadius": "12px",
    "logoText": "OnboardKit"
  },
  "language": "en",
  "steps": [
    "details",
    "id_capture",
    "selfie_capture",
    "document_upload",
    "review"
  ],
  "title": "Identity Verification",
  "description": "Secure, fast, and accessible digital onboarding flow."
}
```

### Configuration Parameters

| Field | Type | Description |
|---|---|---|
| `theme.primaryColor` | `string` (hex) | Main brand color for primary buttons, focus rings, and active step dots. |
| `theme.primaryHoverColor` | `string` (hex) | Hover and active state color for primary buttons. |
| `theme.backgroundColor` | `string` (hex) | App background color. |
| `theme.surfaceColor` | `string` (hex) | Card container surface color. |
| `theme.textColor` | `string` (hex) | Primary text color. |
| `theme.textMutedColor` | `string` (hex) | Secondary/muted label and hint color. |
| `theme.errorColor` | `string` (hex) | Validation error text and border highlight color. |
| `theme.borderRadius` | `string` | CSS border-radius value (e.g. `"12px"` or `"0.75rem"`). |
| `theme.logoText` | `string` | Header brand logo title text. |
| `language` | `"en"` \| `"hi"` | Default active language dictionary (English or Hindi). |
| `steps` | `StepId[]` | Ordered array of steps: `details`, `id_capture`, `selfie_capture`, `document_upload`, `review`. |

---

## Embed SDK (`OnboardKit.mount`)

Host websites can embed the flow using the standalone embed script:

```html
<!-- Container element -->
<div id="kyc-container"></div>

<!-- Load OnboardKit Embed SDK -->
<script src="/onboardkit-embed.js"></script>

<script>
  const instance = OnboardKit.mount('#kyc-container', {
    src: '/', // URL to OnboardKit app
    config: {
      theme: {
        primaryColor: '#059669',
        logoText: 'FinBank Verify'
      },
      language: 'en',
      steps: ['details', 'id_capture', 'selfie_capture', 'review']
    },
    onStepCompleted: function (payload) {
      console.log('User finished step:', payload.step);
      console.log('Proceeding to step:', payload.nextStep);
    },
    onFlowCompleted: function (payload) {
      console.log('KYC flow submitted successfully:', payload.details);
    }
  });

  // To update configuration dynamically:
  // instance.setConfig({ language: 'hi' });

  // To clean up and remove iframe:
  // instance.unmount();
</script>
```

### Dispatched `postMessage` Events

| Event Name | Direction | Payload Structure |
|---|---|---|
| `ONBOARDKIT_READY` | Iframe $\to$ Host | `{ type: "ONBOARDKIT_READY" }` |
| `ONBOARDKIT_INIT` | Host $\to$ Iframe | `{ type: "ONBOARDKIT_INIT", config: { ... } }` |
| `ONBOARDKIT_SET_CONFIG` | Host $\to$ Iframe | `{ type: "ONBOARDKIT_SET_CONFIG", config: { ... } }` |
| `step_completed` | Iframe $\to$ Host | `{ step: "details", stepIndex: 0, nextStep: "id_capture", nextIndex: 1 }` |
| `flow_completed` | Iframe $\to$ Host | `{ details: { fullName, dateOfBirth, phone, email }, hasIdCapture: true, ... }` |

---

## Key Design Decisions

1. **State Management: React Context vs. External Stores (Zustand/Redux)**:
   - **Decision**: Built using standard React Context (`OnboardingContext`).
   - **Rationale**:
     - Keeps the demo **100% dependency-free** and ultra-lightweight.
     - Guarantees **instance isolation**: when multiple OnboardKit instances are mounted or embedded on the same page, each maintains isolated state without global store collisions.
     - State survives component unmounts as users navigate back and forth between steps.

2. **Theming via CSS Variables**:
   - **Decision**: Mapped Tailwind classes to CSS custom properties (`var(--color-primary)`, `var(--border-radius)`).
   - **Rationale**: Enables live, instantaneous runtime re-theming from `config.json` or parent `postMessage` without rebuilding or reloading stylesheets.

3. **Pure Validation Functions**:
   - **Decision**: Separated all validation into standalone pure functions in `src/utils/validation.ts`.
   - **Rationale**: High testability, zero side effects, clean decoupling from UI components, and reusability.

4. **Iframe Isolation for Embedding**:
   - **Decision**: Embeds the flow inside a styled iframe with `allow="camera; microphone; display-capture"`.
   - **Rationale**:
     - Complete CSS style encapsulation: host styles (e.g., reset CSS, fonts, utility clashes) cannot break the onboarding card.
     - Security boundary: host scripts cannot tamper with sensitive media canvas inputs.

5. **Performance & Chunk Splitting**:
   - **Decision**: Lazy loaded camera components with `React.lazy` and animated skeleton loading.
   - **Rationale**: Keeps the initial JS bundle small (`~55 kB` gzipped), meeting high mobile Lighthouse performance benchmarks.

---

## Known Limitations

- **Client-Side Portfolio Demo**:
  - All form entries, captured photos, and uploaded documents reside **exclusively in browser memory**. No data is stored, uploaded to S3/cloud buckets, or persisted across browser tab refreshes.
- **Camera Permissions in Insecure Contexts**:
  - WebRTC `navigator.mediaDevices.getUserMedia` requires a secure context (`https://` or `localhost`). Browsers automatically block camera access over plain `http://` on remote hosts. (The built-in fallback file upload is provided specifically to handle this limitation).
- **Iframe WebRTC Restrictions**:
  - If embedded in a third-party domain without `allow="camera; microphone"`, browsers will block camera access. The embed SDK explicitly attaches this attribute.
- **Biometric Liveness**:
  - The demo uses a simulated selfie alignment guide. Real-world KYC flows typically integrate proprietary biometric SDKs (e.g. face mesh blink detection) via backend verification services.

