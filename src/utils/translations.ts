export interface Translation {
  scanner: string;
  uploadFromGallery: string;
  camera: string;
  history: string;
  chat: string;
  listen: string;
  copy: string;
  copied: string;
  share: string;
  delete: string;
  confirm: string;
  viewDetails: string;
  showLess: string;
  noScanHistoryYet: string;
  analyzedMedicineDetails: string;
  scanYourFirstMedicine: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  daysAgo: string;
  scan: string;
  analysisResult: string;
  appTitle: string;
}

export const translations: Record<string, Translation> = {
  en: {
    scanner: "Scanner",
    uploadFromGallery: "Upload from Gallery",
    camera: "Camera",
    history: "History",
    chat: "Chat",
    listen: "Listen",
    copy: "Copy",
    copied: "Copied!",
    share: "Share",
    delete: "Delete",
    confirm: "Confirm",
    viewDetails: "View Details",
    showLess: "Show Less",
    noScanHistoryYet: "No scan history yet",
    analyzedMedicineDetails: "Your analyzed medicine details will appear here.",
    scanYourFirstMedicine: "Scan Your First Medicine",
    justNow: "Just now",
    minutesAgo: " minutes ago",
    hoursAgo: " hours ago",
    daysAgo: " days ago",
    scan: "Scan",
    analysisResult: "Analysis Result",
    appTitle: "MediCode",
  },
  // Add Tamil and Hindi keys if you support multi-language UI later
};

export const getLanguageName = (code: string) => {
  const names: Record<string, string> = {
    en: "English",
    ta: "தமிழ்",
    hi: "हिंदी",
  };
  return names[code] || code;
};
