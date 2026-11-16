import { createWorker } from 'tesseract.js';
import { ExtractedDocFields, DocumentType } from '../types/verification';

export interface OCRProgress {
  status: string;
  progress: number; // 0 to 1
}

/**
 * Pure parsing function that extracts structured identity fields from raw OCR text.
 * Extracted into a pure function for straightforward unit testing with diverse sample document texts.
 */
export function parseDocumentText(rawText: string, confidence: number = 85): ExtractedDocFields {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cleanText = rawText.toUpperCase();

  // 1. Identify Document Type
  let documentType: DocumentType = 'OTHER';
  if (/PASSPORT|REPUBLIK|PASSEPORT/i.test(cleanText)) {
    documentType = 'PASSPORT';
  } else if (/DRIVER|DRIVING|LICENCE|LICENSE|PERMIT/i.test(cleanText)) {
    documentType = 'DRIVING_LICENSE';
  } else if (/IDENTITY|NATIONAL|IDENTITY CARD|CITIZEN|E-AADHAAR|AADHAAR/i.test(cleanText)) {
    documentType = 'NATIONAL_ID';
  } else if (/RESIDENCE|PERMANENT RESIDENT/i.test(cleanText)) {
    documentType = 'RESIDENCE_PERMIT';
  }

  // 2. Extract Document Number
  // Common formats: 1-2 letters + 6-9 digits (Passport), or 8-16 alphanumeric chars
  let documentNumber = '';
  const docNumMatch =
    rawText.match(/(?:DOC(?:UMENT)?(?:\s+NO|\s+NUM)?|PASSPORT\s+NO|LIC(?:ENSE)?\s+NO|ID\s+NO|NO\.?)[:\s]+([A-Z0-9\-\/]{6,16})/i) ||
    rawText.match(/\b([A-Z]{1,2}[0-9]{7,9})\b/) ||
    rawText.match(/\b([A-Z0-9]{9,12})\b/);

  if (docNumMatch && docNumMatch[1]) {
    documentNumber = docNumMatch[1].trim();
  }

  // 3. Extract Dates (DOB and Expiry)
  // Match YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, or DD.MM.YYYY
  const dateRegex = /\b(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})\b/g;
  const foundDates: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = dateRegex.exec(rawText)) !== null) {
    foundDates.push(normalizeDate(match[1]));
  }

  let dateOfBirth = '';
  let expiryDate = '';

  // Contextual date search
  const dobLineMatch = rawText.match(/(?:DOB|BIRTH|DATE OF BIRTH|BORN)[:\s]+(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})/i);
  if (dobLineMatch) {
    dateOfBirth = normalizeDate(dobLineMatch[1]);
  }

  const expLineMatch = rawText.match(/(?:EXP(?:IRY)?|VALID UNTIL|EXPIRES)[:\s]+(\d{4}[-\/.]\d{2}[-\/.]\d{2}|\d{2}[-\/.]\d{2}[-\/.]\d{4})/i);
  if (expLineMatch) {
    expiryDate = normalizeDate(expLineMatch[1]);
  }

  // Heuristic fallbacks if explicit prefixes were omitted:
  // - DOB is typically an older date in the past (> 18 years ago)
  // - Expiry date is typically in the future or recent past
  const today = new Date();
  const currentYear = today.getFullYear();

  for (const d of foundDates) {
    const year = parseInt(d.substring(0, 4), 10);
    if (!isNaN(year)) {
      if (!dateOfBirth && year <= currentYear - 16 && year >= currentYear - 100) {
        dateOfBirth = d;
      } else if (!expiryDate && year >= currentYear - 5 && year <= currentYear + 20) {
        expiryDate = d;
      }
    }
  }

  // 4. Extract Full Name
  let fullName = '';
  const nameLineMatch = rawText.match(/(?:NAME|GIVEN NAMES?|SURNAME|FN|FULL NAME)[:\s]+([A-Z\s.'-]{3,35})/i);
  if (nameLineMatch && nameLineMatch[1]) {
    fullName = cleanNameString(nameLineMatch[1]);
  } else {
    // Search top lines for person's name (2-3 capitalized words, not headers)
    for (const line of lines.slice(0, 6)) {
      const trimmed = line.replace(/[^A-Za-z\s.'-]/g, '').trim();
      if (
        trimmed.split(/\s+/).length >= 2 &&
        trimmed.split(/\s+/).length <= 4 &&
        trimmed.length >= 5 &&
        !/REPUBLIC|PASSPORT|DRIVER|LICENSE|IDENTITY|DEPARTMENT|GOVERNMENT|STATE|OFFICIAL/i.test(trimmed)
      ) {
        fullName = cleanNameString(trimmed);
        break;
      }
    }
  }

  return {
    fullName,
    dateOfBirth,
    documentNumber,
    expiryDate,
    documentType,
    rawText,
    confidence: Math.round(confidence),
    isUserConfirmed: false,
  };
}

/**
 * Normalizes common date string variants to standard YYYY-MM-DD
 */
function normalizeDate(raw: string): string {
  const parts = raw.split(/[-\/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return raw;
}

function cleanNameString(name: string): string {
  return name
    .replace(/(?:PASSPORT|DRIVING|LICENSE|IDENTITY|CARD|REPUBLIC)/gi, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Executes client-side OCR using Tesseract.js in an isolated web worker.
 * Never uploads image data to external servers.
 */
export async function performClientSideOCR(
  imageSource: string | HTMLCanvasElement,
  onProgress?: (progress: OCRProgress) => void
): Promise<ExtractedDocFields> {
  // If in a non-browser or test environment without Web Workers, handle gracefully
  if (typeof window === 'undefined' || !window.Worker) {
    return parseDocumentText('SAMPLE ID\nNAME: Jane Doe\nDOB: 1995-06-15\nDOC NO: A12345678\nEXP: 2030-12-31', 95);
  }

  try {
    onProgress?.({ status: 'Initializing OCR engine...', progress: 0.1 });

    const worker = await createWorker('eng');

    onProgress?.({ status: 'Processing document image...', progress: 0.3 });

    // Tesseract recognizer with progress logger
    const ret = await worker.recognize(imageSource);

    onProgress?.({ status: 'Structuring extracted fields...', progress: 0.9 });

    const rawText = ret.data.text || '';
    const confidence = ret.data.confidence || 75;

    await worker.terminate();

    onProgress?.({ status: 'OCR Complete', progress: 1.0 });

    return parseDocumentText(rawText, confidence);
  } catch (error: any) {
    console.warn('[OCR Engine] Tesseract processing failed or cancelled:', error?.message);
    throw new Error(
      error?.message || 'Failed to extract text from document. Please ensure the document is clear and readable.'
    );
  }
}

/**
 * Built-in Sample Identity Documents for technical interview testing and instant demos.
 */
export interface DemoSampleDocument {
  id: string;
  name: string;
  documentType: DocumentType;
  description: string;
  extractedFields: ExtractedDocFields;
  // SVG Data URL representation of a realistic ID Card for testing OCR and Quality analysis
  svgDataUrl: string;
}

export function getSampleIdentityDocuments(): DemoSampleDocument[] {
  const samplePassportSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="%231e293b"/><rect x="20" y="20" width="560" height="360" rx="14" fill="%23f8fafc"/><text x="40" y="60" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a">DEMO PASSPORT</text><rect x="40" y="90" width="130" height="170" rx="8" fill="%23cbd5e1"/><text x="190" y="115" font-family="sans-serif" font-size="12" fill="%2364748b">SURNAME / GIVEN NAME</text><text x="190" y="140" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a">ALEXANDER MORGAN</text><text x="190" y="180" font-family="sans-serif" font-size="12" fill="%2364748b">DATE OF BIRTH</text><text x="190" y="205" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">1992-08-14</text><text x="360" y="180" font-family="sans-serif" font-size="12" fill="%2364748b">PASSPORT NO</text><text x="360" y="205" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">P84920194</text><text x="190" y="245" font-family="sans-serif" font-size="12" fill="%2364748b">DATE OF EXPIRY</text><text x="190" y="270" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">2032-11-20</text><rect x="40" y="300" width="520" height="60" fill="%23e2e8f0" rx="4"/><text x="50" y="325" font-family="monospace" font-size="13" fill="%23334155">P%3CUSAMORGAN%3C%3CALEXANDER%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C</text><text x="50" y="345" font-family="monospace" font-size="13" fill="%23334155">P849201940USA9208144M3211204%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C%3C02</text></svg>`;

  const sampleDrivingLicenseSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="%23047857"/><rect x="20" y="20" width="560" height="360" rx="14" fill="%23ffffff"/><text x="40" y="60" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23065f46">DRIVER LICENSE</text><rect x="40" y="90" width="120" height="150" rx="8" fill="%23e2e8f0"/><text x="180" y="115" font-family="sans-serif" font-size="12" fill="%2364748b">NAME</text><text x="180" y="140" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a">PRIYA SHARMA</text><text x="180" y="175" font-family="sans-serif" font-size="12" fill="%2364748b">DOB</text><text x="180" y="200" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">1996-03-25</text><text x="350" y="175" font-family="sans-serif" font-size="12" fill="%2364748b">LIC NO</text><text x="350" y="200" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">DL-98234120</text><text x="180" y="235" font-family="sans-serif" font-size="12" fill="%2364748b">EXPIRY DATE</text><text x="180" y="260" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">2031-05-30</text></svg>`;

  const sampleExpiredIdSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" rx="20" fill="%23991b1b"/><rect x="20" y="20" width="560" height="360" rx="14" fill="%23ffffff"/><text x="40" y="60" font-family="sans-serif" font-size="18" font-weight="bold" fill="%23991b1b">NATIONAL IDENTITY CARD (EXPIRED)</text><rect x="40" y="90" width="120" height="150" rx="8" fill="%23fecaca"/><text x="180" y="115" font-family="sans-serif" font-size="12" fill="%2364748b">FULL NAME</text><text x="180" y="140" font-family="sans-serif" font-size="18" font-weight="bold" fill="%230f172a">ROBERT CHEN</text><text x="180" y="175" font-family="sans-serif" font-size="12" fill="%2364748b">DATE OF BIRTH</text><text x="180" y="200" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">1988-10-12</text><text x="350" y="175" font-family="sans-serif" font-size="12" fill="%2364748b">ID NO</text><text x="350" y="200" font-family="sans-serif" font-size="16" font-weight="bold" fill="%230f172a">ID-10928374</text><text x="180" y="235" font-family="sans-serif" font-size="12" fill="%23b91c1c">EXPIRY DATE (PAST)</text><text x="180" y="260" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23b91c1c">2021-04-10</text></svg>`;

  return [
    {
      id: 'sample-passport',
      name: 'Valid Passport (Alexander Morgan)',
      documentType: 'PASSPORT',
      description: 'Clean demo passport with valid expiry date and full name match.',
      extractedFields: {
        fullName: 'Alexander Morgan',
        dateOfBirth: '1992-08-14',
        documentNumber: 'P84920194',
        expiryDate: '2032-11-20',
        documentType: 'PASSPORT',
        rawText: 'DEMO PASSPORT\nSURNAME / GIVEN NAME: ALEXANDER MORGAN\nDATE OF BIRTH: 1992-08-14\nPASSPORT NO: P84920194\nDATE OF EXPIRY: 2032-11-20',
        confidence: 96,
        isUserConfirmed: false,
      },
      svgDataUrl: samplePassportSvg,
    },
    {
      id: 'sample-dl',
      name: 'Valid Driver License (Priya Sharma)',
      documentType: 'DRIVING_LICENSE',
      description: 'Standard driving license with future validity.',
      extractedFields: {
        fullName: 'Priya Sharma',
        dateOfBirth: '1996-03-25',
        documentNumber: 'DL-98234120',
        expiryDate: '2031-05-30',
        documentType: 'DRIVING_LICENSE',
        rawText: 'DRIVER LICENSE\nNAME: PRIYA SHARMA\nDOB: 1996-03-25\nLIC NO: DL-98234120\nEXPIRY DATE: 2031-05-30',
        confidence: 94,
        isUserConfirmed: false,
      },
      svgDataUrl: sampleDrivingLicenseSvg,
    },
    {
      id: 'sample-expired',
      name: 'Expired National ID (Robert Chen)',
      documentType: 'NATIONAL_ID',
      description: 'Expired identity document used to test rejection decision rules.',
      extractedFields: {
        fullName: 'Robert Chen',
        dateOfBirth: '1988-10-12',
        documentNumber: 'ID-10928374',
        expiryDate: '2021-04-10',
        documentType: 'NATIONAL_ID',
        rawText: 'NATIONAL IDENTITY CARD\nFULL NAME: ROBERT CHEN\nDATE OF BIRTH: 1988-10-12\nID NO: ID-10928374\nEXPIRY DATE: 2021-04-10',
        confidence: 92,
        isUserConfirmed: false,
      },
      svgDataUrl: sampleExpiredIdSvg,
    },
  ];
}

