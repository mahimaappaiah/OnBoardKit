# OnboardKit

> **A configurable, mobile-first, KYC (Know Your Customer) identity verification platform.**  
> Built with **React 18, TypeScript, Vite, Tailwind CSS, Tesseract.js, and Vitest**.  
> Designed as an authentic portfolio-grade identity verification system featuring **client-side OCR, optical quality assessment, a deterministic compliance rule engine, and 100% in-browser privacy** (zero server uploads, zero persistent document tracking, and mock/demo branding).

---

## Architecture & Verification Pipeline

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
                              (Isolated React Context State)
                                             │
 ┌──────────────┬────────────────────────────┼────────────────────────────┬──────────────┐
 ▼              ▼                            ▼                            ▼              ▼
[Details]  [ID Capture]                [Selfie Capture]              [Document]     [Review Step]
 (Form)     (Camera / File)             (Camera / File)               (Upload)           │
                │                            │                            │              ▼
                ├────────────────────────┐   │                            │       [Verification]
                ▼                        ▼   ▼                            │        (Rule Engine)
        [Tesseract.js OCR]       [Quality Analysis]                       │              │
      (In-Browser Web Worker)   (Resolution/Light/Blur)                   │              ▼
                │                        │                                │    ┌────────────────────┐
                ▼                        ▼                                │    │ Three Outcomes:    │
       [Editable OCR Form]      [Actionable Tips]                         │    │ 1. APPROVED        │
      (User correction loop)                                              │    │ 2. MANUAL_REVIEW   │
                │                                                         │    │ 3. REJECTED        │
                └────────────────────────┬────────────────────────────────┘    └────────────────────┘
                                         ▼                                               │
                           [ Completed / Result Screen ] ◄───────────────────────────────┘
                          (Detailed Checks & Next Action)
                                         │
                                         ▼
                            [ Embed SDK / Host Portal ]
                         (via iframe & window.postMessage)
```

---

## Real vs. Simulated Capabilities (Engineering Transparency)

To maintain absolute professional integrity in technical interviews and code audits, the boundary between real client-side algorithms and demonstration constraints is clearly defined:

| Capability | Implementation Type | Technical Mechanism |
|---|---|---|
| **Document OCR** | **REAL** | Runs client-side **Tesseract.js** in an isolated browser Web Worker. Extracts raw text glyphs and parses document numbers, names, DOB, and expiry dates via heuristic regexes. |
| **Editable Field Correction** | **REAL** | Extracted fields populate an interactive form, giving the user control to verify and fix OCR mistakes before submission. |
| **Document Quality Analysis** | **REAL** | Evaluates image dimensions (resolution), pixel luminance via the **ITU-R BT.601** formula (under/overexposure), and discrete gradient variance (sharpness/blur). |
| **Actionable Quality Feedback** | **REAL** | Diagnoses lighting and blur issues in real time and provides tailored advice (e.g. tilt angle, distance, lighting). |
| **Deterministic Decision Engine**| **REAL** | Evaluates compliance rules to return **Approved**, **Manual Review**, or **Rejected** with specific reason codes and audit checklists. |
| **Hardware Camera Control** | **REAL** | Live WebRTC video feed with camera-switching, canvas snapshots, track termination on unmount, and fallback to HTML5 file inputs (`capture`). |
| **Dynamic Theming & i18n** | **REAL** | CSS custom variables applied at runtime; complete English and Hindi translation dictionaries. |
| **Iframe Embedding & Messaging** | **REAL** | Cross-window `postMessage` protocol relaying step changes and completed verification payloads with hardware sandbox permissions (`allow="camera"`). |
| **Biometric Liveness & Matching**| **SIMULATED** | Labeled as a **Demonstration Check**. True 3D depth biometric facial matching and anti-spoofing require server-side certified biometrics (e.g., iBeta Level 2). |
| **Document Authenticity Check** | **SIMULATED** | Client-side OCR extracts textual patterns; it **cannot** certify official paper watermarks, RFID chips, or holographic threads. |
| **Government Registry Database** | **SIMULATED** | No remote calls are made to government databases (e.g., DMV, Interpol, Aadhaar). Everything stays in browser memory. |

---

## Verification Decision Rules Table

The verification engine ([src/utils/verificationEngine.ts](file:///C:/Users/AASTHA/.gemini/antigravity/scratch/onboardkit/src/utils/verificationEngine.ts)) evaluates submitted data deterministically against predefined compliance criteria:

| Outcome | Trigger Condition | Example Reason | Recommended Next Action |
|---|---|---|---|
| **REJECTED** | Expired identity document (`expiryDate < today`) | *"Submitted document expired on 2021-04-10. Expired documents cannot be accepted."* | *"Please retake with a valid, currently unexpired government ID."* |
| **REJECTED** | Underage applicant (`age < 18`) | *"Applicant age (16 years) does not meet the minimum requirement of 18 years."* | *"Account registration is limited to individuals 18 years of age or older."* |
| **REJECTED** | Severe image degradation (pitch black `< 20` luminance or extreme blur) | *"Document image is unreadable due to severe blur or underexposure."* | *"Please recapture your document in a brightly lit room, keeping the camera focused."* |
| **REJECTED** | Missing required identity photo or selfie | *"Required identity documentation or selfie verification was missing."* | *"Please provide both a government ID and a front-facing selfie check."* |
| **MANUAL_REVIEW** | Name discrepancy between form and document | *"Name on form ('Alex Morgan') does not match document name ('Alexander Morgan')."* | *"A compliance officer will review your submission within 1 business day."* |
| **MANUAL_REVIEW** | Document expiring within 30 days | *"Document expires soon (2026-12-01). Requires manual compliance note."* | *"Manual confirmation required for documents nearing validity expiration."* |
| **MANUAL_REVIEW** | Borderline quality warning (minor glare or low resolution) | *"Document resolution is borderline (450x320px)."* | *"Document readability will be confirmed by an onboarding agent."* |
| **MANUAL_REVIEW** | OCR confidence below 70% | *"Automated text extraction confidence is below 70%."* | *"Manual review queued to verify extracted fields."* |
| **APPROVED** | All automated rules satisfied | *"All automated KYC requirements and quality checks were satisfied."* | *"Your identity is verified. You can now access all portal features."* |

---

## Screen Walkthroughs (ASCII Previews)

````carousel
```
┌──────────────────────────────────────┐
│  [OK] OnboardKit          🇮🇳 हिन्दी  │
│  Step 2 of 5                     40% │
├──────────────────────────────────────┤
│  ID Verification                     │
│  Capture or upload government ID     │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ ⚡ Technical Interview Tool:   │  │
│  │ [Passport]  [License]  [Expired]│  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ 📹 Live Stream (getUserMedia)  │  │
│  │  ┌──────────────────────────┐  │  │
│  │  │ ─── Laser Scanline ───   │  │  │
│  │  │ Align card in brackets   │  │  │
│  │  └──────────────────────────┘  │  │
│  └────────────────────────────────┘  │
│           [ 📷 Capture ID ]          │
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  Extracted Document Fields (OCR)     │
│  Tesseract.js Engine (Confidence: 96%)│
├──────────────────────────────────────┤
│  Full Name (on Document):            │
│  [ ALEXANDER MORGAN                ] │
│                                      │
│  Date of Birth:      Expiry Date:    │
│  [ 1992-08-14 ]     [ 2032-11-20 ]   │
│                                      │
│  Document Number:    Document Type:  │
│  [ P84920194  ]     [ Passport     ] │
│                                      │
│  [✓ Confirm & Use Extracted Data]    │
│                                      │
│  ℹ️ Client-side OCR reads text glyphs│
│  in browser memory. Does not certify │
│  official government authenticity.   │
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  Document Quality Analysis           │
├──────────────────────────────────────┤
│  Brightness: Optimal (134/255)       │
│  Sharpness:  Sharp (78/100)          │
│  Resolution: 1280x720 (0.92 MP)      │
│                                      │
│  Quality Feedback:                   │
│  • Optical edges and font glyphs are │
│    distinct and focused.             │
│  • Lighting is well balanced with    │
│    even illumination.                │
└──────────────────────────────────────┘
```
<!-- slide -->
```
┌──────────────────────────────────────┐
│  [ ✓ ] Verification Result Dashboard │
│  Outcome: Identity Verified (Approved│
├──────────────────────────────────────┤
│  Reference ID:       OK-849201       │
│  Decision Protocol:  Rules Engine v2 │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ Recommended Next Action:       │  │
│  │ Your identity is verified. You │  │
│  │ can access all portal features.│  │
│  └────────────────────────────────┘  │
│                                      │
│  Completed Checks Passed (6):        │
│  ✓ Document Upload: Complete         │
│  ✓ Age Requirement: 34 yrs (18+)     │
│  ✓ Document Validity: Valid 2032     │
│  ✓ Name Consistency: Matched         │
│  ✓ Image Quality: Optimal            │
│  ✓ Liveness Check: Demo Aligned      │
│                                      │
│  [ Restart Demo / Test Another ID ]  │
└──────────────────────────────────────┘
```
````

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
- Standalone Verification Flow: `http://localhost:5173/`
- Embedded Host Portal Demo: `http://localhost:5173/sample-host.html`

### 3. Run the Vitest Test Suite
```bash
npm run test
```
*Current test suite:* **56 passing tests across 10 test suites**.

### 4. Run Coverage Reporting
```bash
npm run test:coverage
```

### 5. Build for Production
```bash
npm run build
```

---

## Testing Tools for Technical Interviews

To allow engineers and hiring managers to quickly test all verification paths without having to upload real IDs, OnboardKit includes pre-packaged demo documents accessible directly on the ID Capture screen:

1. **Valid Passport (Alexander Morgan)**:
   - Tests clean text extraction, matching name, future expiry date (2032), and leads to **APPROVED**.
2. **Valid Driver License (Priya Sharma)**:
   - Tests alternate document format, license number parsing, and leads to **APPROVED**.
3. **Expired National ID (Robert Chen)**:
   - Tests document expiry rule (`expiryDate: '2021-04-10'`) and leads deterministically to **REJECTED** with actionable feedback.
4. **Editable Input Testing**:
   - Change the extracted name to test the **MANUAL_REVIEW** branch (name mismatch detection).

---

## Embed SDK Integration (`OnboardKit.mount`)

Host applications can embed the flow using the standalone embed script:

```html
<div id="onboarding-container"></div>
<script src="/onboardkit-embed.js"></script>
<script>
  const kit = OnboardKit.mount('#onboarding-container', {
    src: '/',
    config: {
      theme: { primaryColor: '#2563eb', logoText: 'FinBank Verify' },
      language: 'en'
    },
    onStepCompleted: function (event) {
      console.log('Step finished:', event.step, 'Next:', event.nextStep);
    },
    onFlowCompleted: function (payload) {
      console.log('Verification completed with outcome:', payload);
    }
  });
</script>
```

---

## Security & Privacy Disclosures

- **Zero Server Uploads**: No identity document images, extracted text, selfie captures, or personally identifiable information (PII) are ever transmitted to an external server or persistent cloud database.
- **In-Memory Web Worker**: Tesseract.js runs entirely in client-side Web Worker memory.
- **No Permanent Tracking**: Refreshing or resetting the flow completely purges all in-memory data structures.
