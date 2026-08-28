export const FALLBACK_RESULTS = {
  NAME_MISMATCH_INITIAL: {
    nameMatch: {
      status: 'FAIL',
      mismatchType: 'INITIAL_VS_FULL',
      explanation: "Your EPF record shows 'Ramesh Kumar Sharma' but your Aadhaar shows 'Ramesh K. Sharma'. The middle name appears as an initial in Aadhaar, which causes EPFO's system to flag them as different people.",
      hindiExplanation: "आपके EPF रिकॉर्ड में 'Ramesh Kumar Sharma' है लेकिन आपके Aadhaar में 'Ramesh K. Sharma' है। बीच का नाम Aadhaar में सिर्फ अक्षर के रूप में है।",
      resolution: 'JOINT_DECLARATION',
      severity: 'BLOCKING',
    },
    dobMatch: { status: 'PASS', explanation: 'Date of birth matches in both EPF records and Aadhaar.', hindiExplanation: 'जन्म तिथि EPF और Aadhaar दोनों में मेल खाती है।' },
    employerExit: { status: 'PASS', explanation: 'Your employer has correctly updated your exit date as 31 March 2026.', hindiExplanation: 'आपके नियोक्ता ने आपकी निकास तिथि 31 मार्च 2026 सही तरह से दर्ज की है।' },
    bankKyc: { status: 'PASS', explanation: 'Your State Bank of India account is verified and approved by your employer.', hindiExplanation: 'आपका SBI खाता सत्यापित है और नियोक्ता द्वारा स्वीकृत है।' },
  },
  EMPLOYER_EXIT_AND_BANK_KYC: {
    nameMatch: {
      status: 'ADVISORY',
      mismatchType: 'MIDDLE_NAME_MISSING',
      explanation: "Minor middle name difference — 'Begum' appears in EPF records but is absent in Aadhaar. This may not block your claim immediately but should be corrected.",
      hindiExplanation: "'Begum' EPF रिकॉर्ड में है लेकिन Aadhaar में नहीं। यह मामूली अंतर है लेकिन इसे सुधारना चाहिए।",
      resolution: 'JOINT_DECLARATION',
      severity: 'ADVISORY',
    },
    dobMatch: { status: 'PASS', explanation: 'Date of birth matches correctly in both records.', hindiExplanation: 'जन्म तिथि दोनों रिकॉर्ड में सही है।' },
    employerExit: {
      status: 'FAIL',
      explanation: "Your previous employer at Wipro BPO has not updated your exit date in the UAN system. You appear as an active employee. EPFO cannot process final settlement for active members.",
      hindiExplanation: "Wipro BPO ने UAN सिस्टम में आपकी निकास तिथि अपडेट नहीं की है। आप अभी भी सक्रिय कर्मचारी दिख रहे हैं।",
      resolution: 'EMPLOYER_ACTION',
      severity: 'BLOCKING',
    },
    bankKyc: {
      status: 'FAIL',
      explanation: "Your HDFC Bank account was recently added but has not been approved by your employer. Bank accounts require employer verification before EPFO can transfer funds.",
      hindiExplanation: "आपका HDFC बैंक खाता जोड़ा गया है लेकिन नियोक्ता ने इसे अभी तक मंजूरी नहीं दी है।",
      resolution: 'BANK_REVERIFICATION',
      severity: 'BLOCKING',
    },
  },
  ALL_CLEAR: {
    nameMatch: { status: 'PASS', explanation: 'Name matches perfectly in both EPF records and Aadhaar.', hindiExplanation: 'नाम EPF रिकॉर्ड और Aadhaar दोनों में बिल्कुल मेल खाता है।' },
    dobMatch: { status: 'PASS', explanation: 'Date of birth matches correctly in both records.', hindiExplanation: 'जन्म तिथि दोनों रिकॉर्ड में सही है।' },
    employerExit: { status: 'PASS', explanation: 'Exit date correctly updated as 28 February 2026.', hindiExplanation: 'निकास तिथि 28 फरवरी 2026 सही तरह से दर्ज है।' },
    bankKyc: { status: 'PASS', explanation: 'Bank of Baroda account is verified and employer-approved.', hindiExplanation: 'Bank of Baroda खाता सत्यापित और नियोक्ता-स्वीकृत है।' },
  },
}
