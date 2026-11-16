import { SupportedLanguage } from '../types/config';

export interface Translations {
  common: {
    next: string;
    back: string;
    submit: string;
    submitting: string;
    retake: string;
    continue: string;
    stepOf: (current: number, total: number) => string;
    complete: string;
    restart: string;
  };
  steps: {
    details: {
      title: string;
      subtitle: string;
      fullNameLabel: string;
      fullNamePlaceholder: string;
      dobLabel: string;
      dobPlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
    };
    id_capture: {
      title: string;
      subtitle: string;
      cameraGuide: string;
      captureButton: string;
      retakeButton: string;
      usePhotoButton: string;
      fileFallbackTitle: string;
      fileFallbackDescription: string;
      fileUploadButton: string;
      permissionDeniedMessage: string;
      cameraUnavailableMessage: string;
    };
    selfie_capture: {
      title: string;
      subtitle: string;
      cameraGuide: string;
      captureButton: string;
      retakeButton: string;
      usePhotoButton: string;
      fileFallbackTitle: string;
      fileFallbackDescription: string;
      fileUploadButton: string;
      permissionDeniedMessage: string;
      cameraUnavailableMessage: string;
    };
    document_upload: {
      title: string;
      subtitle: string;
      dropzoneTitle: string;
      dropzoneHint: string;
      fileSelected: string;
      removeFile: string;
      fileSizeLimit: string;
      supportedFormats: string;
    };
    review: {
      title: string;
      subtitle: string;
      personalDetailsSection: string;
      idSection: string;
      selfieSection: string;
      documentSection: string;
      editButton: string;
      capturedViaCamera: string;
      uploadedViaFile: string;
      notProvided: string;
      privacyNotice: string;
      submitButton: string;
    };
    completed: {
      title: string;
      subtitle: string;
      description: string;
      demoBadge: string;
      resetFlow: string;
    };
  };
  validation: {
    fullNameRequired: string;
    fullNameInvalid: string;
    dobRequired: string;
    dobUnderage: string;
    dobInvalid: string;
    phoneRequired: string;
    phoneInvalid: string;
    emailRequired: string;
    emailInvalid: string;
    idRequired: string;
    selfieRequired: string;
    documentRequired: string;
  };
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    common: {
      next: 'Continue',
      back: 'Back',
      submit: 'Submit Verification',
      submitting: 'Verifying...',
      retake: 'Retake Photo',
      continue: 'Proceed',
      stepOf: (current, total) => `Step ${current} of ${total}`,
      complete: 'Complete',
      restart: 'Start Over',
    },
    steps: {
      details: {
        title: 'Personal Information',
        subtitle: 'Please provide your basic details as they appear on your official ID.',
        fullNameLabel: 'Full Legal Name',
        fullNamePlaceholder: 'e.g. Jane Doe',
        dobLabel: 'Date of Birth',
        dobPlaceholder: 'YYYY-MM-DD',
        phoneLabel: 'Phone Number',
        phonePlaceholder: 'e.g. +1 555 123 4567 or 9876543210',
        emailLabel: 'Email Address',
        emailPlaceholder: 'e.g. jane.doe@example.com',
      },
      id_capture: {
        title: 'ID Verification',
        subtitle: 'Capture a clear photo of your government-issued ID card or passport.',
        cameraGuide: 'Fit your ID within the card frame and avoid glare.',
        captureButton: 'Capture ID',
        retakeButton: 'Retake Photo',
        usePhotoButton: 'Use this Photo',
        fileFallbackTitle: 'Camera Unavailable or Denied',
        fileFallbackDescription: 'You can upload an ID photo from your device instead.',
        fileUploadButton: 'Upload ID Photo',
        permissionDeniedMessage: 'Camera permission was denied. Please allow camera access in browser settings or upload a photo below.',
        cameraUnavailableMessage: 'No compatible camera was detected. Please choose a photo from your device.',
      },
      selfie_capture: {
        title: 'Liveness Selfie',
        subtitle: 'Take a clear selfie to match against your identity document.',
        cameraGuide: 'Position your face in the oval frame and look directly at the camera.',
        captureButton: 'Take Selfie',
        retakeButton: 'Retake Selfie',
        usePhotoButton: 'Use this Selfie',
        fileFallbackTitle: 'Camera Unavailable or Denied',
        fileFallbackDescription: 'You can upload a front-facing selfie from your device instead.',
        fileUploadButton: 'Upload Selfie Photo',
        permissionDeniedMessage: 'Camera permission was denied. Please allow camera access in browser settings or upload a selfie below.',
        cameraUnavailableMessage: 'No compatible camera was detected. Please choose a selfie from your device.',
      },
      document_upload: {
        title: 'Supporting Document',
        subtitle: 'Upload proof of address (utility bill, bank statement) issued within the last 3 months.',
        dropzoneTitle: 'Tap or drag file to upload',
        dropzoneHint: 'Supports PDF, PNG, JPG, or WebP up to 10MB',
        fileSelected: 'Selected File:',
        removeFile: 'Remove',
        fileSizeLimit: 'Maximum file size: 10 MB',
        supportedFormats: 'Accepted: PDF, JPEG, PNG, WebP',
      },
      review: {
        title: 'Review Your Information',
        subtitle: 'Please check your submitted details before completing verification.',
        personalDetailsSection: 'Personal Details',
        idSection: 'Government ID',
        selfieSection: 'Selfie Check',
        documentSection: 'Proof of Address',
        editButton: 'Edit',
        capturedViaCamera: 'Captured via Camera',
        uploadedViaFile: 'Uploaded File',
        notProvided: 'Not provided',
        privacyNotice: 'Demo Mode: All information and media remain in your local browser memory only. No data is stored or transmitted externally.',
        submitButton: 'Confirm & Complete Verification',
      },
      completed: {
        title: 'Verification Complete!',
        subtitle: 'Your onboarding demonstration has finished successfully.',
        description: 'In a real-world system, your data would now be securely reviewed. In this demo, nothing was saved or sent anywhere.',
        demoBadge: 'Safe Demo Environment',
        resetFlow: 'Restart Demo Flow',
      },
    },
    validation: {
      fullNameRequired: 'Full name is required.',
      fullNameInvalid: 'Please enter a valid full name (at least 2 letters, alphabetic characters only).',
      dobRequired: 'Date of birth is required.',
      dobUnderage: 'You must be at least 18 years old to proceed.',
      dobInvalid: 'Please provide a valid past date of birth (YYYY-MM-DD).',
      phoneRequired: 'Phone number is required.',
      phoneInvalid: 'Please enter a valid phone number (at least 10 digits).',
      emailRequired: 'Email address is required.',
      emailInvalid: 'Please enter a valid email address (e.g., name@domain.com).',
      idRequired: 'Please capture or upload your ID before proceeding.',
      selfieRequired: 'Please take or upload your selfie before proceeding.',
      documentRequired: 'Please upload a supporting document before proceeding.',
    },
  },
  hi: {
    common: {
      next: 'आगे बढ़ें',
      back: 'पीछे जाएं',
      submit: 'सत्यापन जमा करें',
      submitting: 'सत्यापित हो रहा है...',
      retake: 'फिर से फोटो लें',
      continue: 'जारी रखें',
      stepOf: (current, total) => `चरण ${current} / ${total}`,
      complete: 'पूर्ण हुआ',
      restart: 'फिर से शुरू करें',
    },
    steps: {
      details: {
        title: 'व्यक्तिगत जानकारी',
        subtitle: 'कृपया अपना आधिकारिक विवरण दर्ज करें जैसा कि आपके पहचान पत्र पर है।',
        fullNameLabel: 'पूरा कानूनी नाम',
        fullNamePlaceholder: 'उदा. राहुल शर्मा',
        dobLabel: 'जन्म तिथि',
        dobPlaceholder: 'YYYY-MM-DD',
        phoneLabel: 'फ़ोन नंबर',
        phonePlaceholder: 'उदा. 9876543210',
        emailLabel: 'ईमेल पता',
        emailPlaceholder: 'उदा. rahul@example.com',
      },
      id_capture: {
        title: 'पहचान पत्र सत्यापन (ID)',
        subtitle: 'अपने सरकारी पहचान पत्र या पासपोर्ट की स्पष्ट तस्वीर लें।',
        cameraGuide: 'अपने पहचान पत्र को फ्रेम में रखें और चमक से बचें।',
        captureButton: 'पहचान पत्र की फोटो लें',
        retakeButton: 'दोबारा फोटो लें',
        usePhotoButton: 'यह फोटो इस्तेमाल करें',
        fileFallbackTitle: 'कैमरा उपलब्ध नहीं या अनुमति अस्वीकृत',
        fileFallbackDescription: 'आप अपने डिवाइस से पहचान पत्र की फोटो अपलोड कर सकते हैं।',
        fileUploadButton: 'फोटो अपलोड करें',
        permissionDeniedMessage: 'कैमरे की अनुमति अस्वीकृत कर दी गई थी। कृपया सेटिंग्स में अनुमति दें या नीचे से फोटो अपलोड करें।',
        cameraUnavailableMessage: 'कोई संगत कैमरा नहीं मिला। कृपया अपनी डिवाइस से फोटो चुनें।',
      },
      selfie_capture: {
        title: 'लाइव सेल्फी',
        subtitle: 'पहचान मिलान के लिए अपनी एक स्पष्ट सेल्फी लें।',
        cameraGuide: 'अपने चेहरे को अंडाकार फ्रेम में रखें और सीधे कैमरे की ओर देखें।',
        captureButton: 'सेल्फी लें',
        retakeButton: 'दोबारा सेल्फी लें',
        usePhotoButton: 'यह सेल्फी इस्तेमाल करें',
        fileFallbackTitle: 'कैमरा उपलब्ध नहीं या अनुमति अस्वीकृत',
        fileFallbackDescription: 'आप अपने डिवाइस से एक सेल्फी अपलोड कर सकते हैं।',
        fileUploadButton: 'सेल्फी अपलोड करें',
        permissionDeniedMessage: 'कैमरे की अनुमति अस्वीकृत कर दी गई थी। कृपया ब्राउज़र सेटिंग्स में अनुमति दें या नीचे से सेल्फी अपलोड करें।',
        cameraUnavailableMessage: 'कोई संगत कैमरा नहीं मिला। कृपया डिवाइस से सेल्फी चुनें।',
      },
      document_upload: {
        title: 'सहायक दस्तावेज',
        subtitle: 'पते का प्रमाण (बिजली बिल, बैंक विवरण) अपलोड करें जो पिछले 3 महीनों के भीतर जारी किया गया हो।',
        dropzoneTitle: 'अपलोड करने के लिए फ़ाइल चुनें या खींचें',
        dropzoneHint: 'PDF, PNG, JPG, WebP (अधिकतम 10MB तक)',
        fileSelected: 'चुनी गई फ़ाइल:',
        removeFile: 'हटाएं',
        fileSizeLimit: 'अधिकतम फ़ाइल आकार: 10 MB',
        supportedFormats: 'स्वीकार्य: PDF, JPEG, PNG, WebP',
      },
      review: {
        title: 'अपनी जानकारी की समीक्षा करें',
        subtitle: 'सत्यापन पूरा करने से पहले कृपया अपने विवरण की जांच करें।',
        personalDetailsSection: 'व्यक्तिगत विवरण',
        idSection: 'सरकारी पहचान पत्र',
        selfieSection: 'सेल्फी सत्यापन',
        documentSection: 'पते का प्रमाण',
        editButton: 'संपादित करें',
        capturedViaCamera: 'कैमरे द्वारा लिया गया',
        uploadedViaFile: 'अपलोड की गई फ़ाइल',
        notProvided: 'प्रदान नहीं किया गया',
        privacyNotice: 'डेमो मोड: सभी जानकारी केवल आपके स्थानीय ब्राउज़र मेमोरी में रहती है। कोई भी डेटा बाहरी रूप से संग्रहीत या भेजा नहीं जाता है।',
        submitButton: 'पुष्टि करें और सत्यापन पूरा करें',
      },
      completed: {
        title: 'सत्यापन सफल!',
        subtitle: 'आपका ऑनबोर्डिंग प्रदर्शन सफलतापूर्वक समाप्त हो गया है।',
        description: 'वास्तविक प्रणाली में, आपका डेटा सुरक्षित रूप से सत्यापित किया जाता। इस डेमो में कुछ भी संग्रहीत नहीं किया गया है।',
        demoBadge: 'सुरक्षित डेमो वातावरण',
        resetFlow: 'डेमो फिर से शुरू करें',
      },
    },
    validation: {
      fullNameRequired: 'पूरा नाम आवश्यक है।',
      fullNameInvalid: 'कृपया एक मान्य नाम दर्ज करें (कम से कम 2 अक्षर, केवल वर्णमाला)।',
      dobRequired: 'जन्म तिथि आवश्यक है।',
      dobUnderage: 'आगे बढ़ने के लिए आपकी आयु कम से कम 18 वर्ष होनी चाहिए।',
      dobInvalid: 'कृपया एक मान्य भूतपूर्व जन्म तिथि दर्ज करें (YYYY-MM-DD)।',
      phoneRequired: 'फ़ोन नंबर आवश्यक है।',
      phoneInvalid: 'कृपया एक मान्य फ़ोन नंबर दर्ज करें (कम से कम 10 अंक)।',
      emailRequired: 'ईमेल पता आवश्यक है।',
      emailInvalid: 'कृपया एक मान्य ईमेल पता दर्ज करें (उदा. name@domain.com)।',
      idRequired: 'कृपया आगे बढ़ने से पहले अपना पहचान पत्र कैप्चर या अपलोड करें।',
      selfieRequired: 'कृपया आगे बढ़ने से पहले अपनी सेल्फी लें या अपलोड करें।',
      documentRequired: 'कृपया आगे बढ़ने से पहले सहायक दस्तावेज अपलोड करें।',
    },
  },
};

