import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "app_title": "NeuroMind AI",
      "dashboard": "Dashboard",
      "patients": "Patients",
      "appointments": "Appointments",
      "reports": "Reports",
      "settings": "Settings",
      "logout": "Logout",
      "upload_scan": "Upload Scan",
      "ai_assistant": "AI Assistant",
      "find_hospital": "Find Hospital",
      "welcome": "Welcome back",
      "risk_level": "Risk Level",
      "prediction": "Prediction",
      "confidence": "Confidence",
    }
  },
  hi: {
    translation: {
      "app_title": "न्यूरोमाइंड एआई",
      "dashboard": "डैशबोर्ड",
      "patients": "मरीज",
      "appointments": "नियुक्तियाँ",
      "reports": "रिपोर्ट्स",
      "settings": "सेटिंग्स",
      "logout": "लॉग आउट",
      "upload_scan": "स्कैन अपलोड करें",
      "ai_assistant": "एआई सहायक",
      "find_hospital": "अस्पताल खोजें",
      "welcome": "वापसी पर स्वागत है",
      "risk_level": "जोखिम स्तर",
      "prediction": "भविष्यवाणी",
      "confidence": "आत्मविश्वास",
    }
  },
  mr: {
    translation: {
      "app_title": "न्यूरोमाइंड एआय",
      "dashboard": "डॅशबोर्ड",
      "patients": "रुग्ण",
      "appointments": "भेटी",
      "reports": "अहवाल",
      "settings": "सेटिंग्ज",
      "logout": "लॉग आउट",
      "upload_scan": "स्कॅन अपलोड करा",
      "ai_assistant": "एआय सहाय्यक",
      "find_hospital": "रुग्णालय शोधा",
      "welcome": "पुन्हा स्वागत आहे",
      "risk_level": "धोक्याची पातळी",
      "prediction": "अंदाज",
      "confidence": "आत्मविश्वास",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
