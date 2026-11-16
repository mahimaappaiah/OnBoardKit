import {
  ComprehensiveVerificationInput,
  VerificationDecision,
  VerificationCheck,
  VerificationOutcome,
} from '../types/verification';

/**
 * Deterministic KYC Verification Rule Engine
 * Evaluates submitted applicant data, OCR extraction, document quality,
 * and selfie presence against defined compliance policies.
 * Never claims to perform biometric face matching or fake government database lookups.
 */
export function evaluateVerification(input: ComprehensiveVerificationInput): VerificationDecision {
  const completedChecks: VerificationCheck[] = [];
  const failedChecks: VerificationCheck[] = [];
  const flaggedChecks: VerificationCheck[] = [];

  const referenceId = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
  const timestamp = Date.now();

  const { details, extractedDocFields, documentQuality, idCapture, selfieCapture } = input;

  // 1. Check: Document Media Presence
  if (!idCapture) {
    failedChecks.push({
      id: 'ID_PRESENCE',
      name: 'Identity Document Upload',
      status: 'FAILED',
      message: 'No identity document photo was provided.',
    });
  } else {
    completedChecks.push({
      id: 'ID_PRESENCE',
      name: 'Identity Document Upload',
      status: 'PASSED',
      message: 'Government identity document image successfully uploaded.',
    });
  }

  // 2. Check: Selfie Liveness Capture Presence
  if (!selfieCapture) {
    failedChecks.push({
      id: 'SELFIE_PRESENCE',
      name: 'Liveness Selfie Capture',
      status: 'FAILED',
      message: 'No front-facing selfie check was provided.',
      isDemoCheck: true,
    });
  } else {
    completedChecks.push({
      id: 'SELFIE_PRESENCE',
      name: 'Liveness Selfie Capture',
      status: 'PASSED',
      message: 'Front-facing selfie capture completed in client-side sandbox.',
      isDemoCheck: true,
    });
  }

  // 3. Check: Document Validity & Expiry Date
  let isExpired = false;
  let isExpiringSoon = false;

  if (extractedDocFields && extractedDocFields.expiryDate) {
    const expiryDateObj = new Date(extractedDocFields.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isNaN(expiryDateObj.getTime())) {
      if (expiryDateObj < today) {
        isExpired = true;
        failedChecks.push({
          id: 'DOC_EXPIRY',
          name: 'Document Validity & Expiry',
          status: 'FAILED',
          message: `Document expired on ${extractedDocFields.expiryDate}. Expired documents cannot be accepted.`,
        });
      } else {
        // Check if expiring within 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        if (expiryDateObj <= thirtyDaysFromNow) {
          isExpiringSoon = true;
          flaggedChecks.push({
            id: 'DOC_EXPIRY_WARNING',
            name: 'Document Validity & Expiry',
            status: 'FLAGGED',
            message: `Document expires soon (${extractedDocFields.expiryDate}). Requires manual compliance note.`,
          });
        } else {
          completedChecks.push({
            id: 'DOC_EXPIRY',
            name: 'Document Validity & Expiry',
            status: 'PASSED',
            message: `Document is valid until ${extractedDocFields.expiryDate}.`,
          });
        }
      }
    }
  } else {
    flaggedChecks.push({
      id: 'DOC_EXPIRY_NOT_DETECTED',
      name: 'Document Validity & Expiry',
      status: 'FLAGGED',
      message: 'Expiry date could not be automatically extracted from document text.',
    });
  }

  // 4. Check: Age Eligibility (Must be 18+)
  let isUnderage = false;
  const userDob = details.dateOfBirth;

  if (userDob) {
    const dobDate = new Date(userDob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      isUnderage = true;
      failedChecks.push({
        id: 'AGE_VERIFICATION',
        name: 'Age Requirement (18+)',
        status: 'FAILED',
        message: `Applicant age (${age} years) does not meet the minimum requirement of 18 years.`,
      });
    } else {
      completedChecks.push({
        id: 'AGE_VERIFICATION',
        name: 'Age Requirement (18+)',
        status: 'PASSED',
        message: `Applicant is ${age} years of age (meets minimum 18 requirement).`,
      });
    }
  }

  // 5. Check: Name Consistency (Form Name vs Document OCR Name)
  let nameDiscrepancy = false;
  if (extractedDocFields && extractedDocFields.fullName && details.fullName) {
    const normUser = normalizeName(details.fullName);
    const normDoc = normalizeName(extractedDocFields.fullName);

    const similarity = computeTokenSimilarity(normUser, normDoc);

    if (similarity >= 0.75) {
      completedChecks.push({
        id: 'NAME_MATCH',
        name: 'Name Consistency Check',
        status: 'PASSED',
        message: `Form name ("${details.fullName}") matches document name ("${extractedDocFields.fullName}").`,
      });
    } else {
      nameDiscrepancy = true;
      flaggedChecks.push({
        id: 'NAME_MATCH',
        name: 'Name Consistency Check',
        status: 'FLAGGED',
        message: `Name discrepancy detected: Form has "${details.fullName}", but document OCR detected "${extractedDocFields.fullName}".`,
      });
    }
  } else {
    flaggedChecks.push({
      id: 'NAME_MATCH_SKIPPED',
      name: 'Name Consistency Check',
      status: 'FLAGGED',
      message: 'Full name could not be extracted from document text for automated cross-check.',
    });
  }

  // 6. Check: Document Image Quality
  let severeQualityFailure = false;
  if (documentQuality) {
    if (documentQuality.isAcceptable) {
      completedChecks.push({
        id: 'IMAGE_QUALITY',
        name: 'Image Quality & Optical Sharpness',
        status: 'PASSED',
        message: `Optimal resolution (${documentQuality.resolution.width}x${documentQuality.resolution.height}), sharpness score: ${documentQuality.sharpness.value}.`,
      });
    } else {
      if (documentQuality.brightness.status === 'dark' || documentQuality.sharpness.status === 'blurry') {
        severeQualityFailure = true;
        failedChecks.push({
          id: 'IMAGE_QUALITY',
          name: 'Image Quality & Optical Sharpness',
          status: 'FAILED',
          message: `${documentQuality.brightness.feedback} ${documentQuality.sharpness.feedback}`,
        });
      } else {
        flaggedChecks.push({
          id: 'IMAGE_QUALITY',
          name: 'Image Quality & Optical Sharpness',
          status: 'FLAGGED',
          message: `${documentQuality.resolution.feedback}`,
        });
      }
    }
  }

  // 7. Check: Document Identification Number
  if (extractedDocFields && extractedDocFields.documentNumber) {
    completedChecks.push({
      id: 'DOC_NUMBER',
      name: 'Document Identification Number',
      status: 'PASSED',
      message: `Document ID detected: ${extractedDocFields.documentNumber} (${extractedDocFields.documentType}).`,
    });
  }

  // 8. Outcome Determination
  let outcome: VerificationOutcome = 'APPROVED';
  let summary = 'Verification Approved';
  let reason = 'All automated KYC requirements and quality checks were satisfied.';
  let recommendedNextAction = 'Your identity is verified. You can now access all portal features.';

  // Hard rejection criteria
  if (isExpired || isUnderage || severeQualityFailure || !idCapture || !selfieCapture) {
    outcome = 'REJECTED';
    summary = 'Verification Rejected';

    if (isExpired) {
      reason = 'Submitted document has expired and cannot be accepted for KYC compliance.';
      recommendedNextAction = 'Please retake with a valid, currently unexpired government ID.';
    } else if (isUnderage) {
      reason = 'Applicant does not meet the minimum age requirement of 18 years.';
      recommendedNextAction = 'Account registration is limited to individuals 18 years of age or older.';
    } else if (severeQualityFailure) {
      reason = 'Document image quality is too low (excessive blur or insufficient lighting) to reliably read.';
      recommendedNextAction = 'Please recapture your document in a brightly lit room, keeping the camera focused.';
    } else {
      reason = 'Required identity documentation or selfie verification was missing.';
      recommendedNextAction = 'Please provide both a government ID and a front-facing selfie check.';
    }
  } else if (flaggedChecks.length > 0 || nameDiscrepancy || isExpiringSoon) {
    // Manual review criteria
    outcome = 'MANUAL_REVIEW';
    summary = 'Manual Review Required';
    reason = 'Certain automated checks flagged potential discrepancies that require human compliance agent review.';
    recommendedNextAction = 'A compliance officer will review your submission within 1 business day. No further action needed.';
  }

  return {
    outcome,
    summary,
    reason,
    completedChecks,
    failedChecks,
    flaggedChecks,
    recommendedNextAction,
    timestamp,
    referenceId,
  };
}

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim();
}

/**
 * Calculates word token overlap similarity (Jaccard-like) between two names
 */
function computeTokenSimilarity(nameA: string, nameB: string): number {
  if (!nameA || !nameB) return 0;
  if (nameA === nameB) return 1;

  const tokensA = new Set(nameA.split(/\s+/).filter(Boolean));
  const tokensB = new Set(nameB.split(/\s+/).filter(Boolean));

  let intersection = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersection++;
    }
  });

  const union = new Set([...tokensA, ...tokensB]).size;
  return union > 0 ? intersection / union : 0;
}

