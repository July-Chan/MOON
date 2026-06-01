import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uk: {
    translation: {
      "home": "Головна",
      "account": "Акаунт",
      "searchPlaceholder": "Шукати фільм (натисніть Enter)..."
    }
  },
  en: {
    translation: {
      "home": "Home",
      "account": "Account",
      "searchPlaceholder": "Search movie (press Enter)..."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "uk",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;