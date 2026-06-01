import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uk: {
    translation: {
      "home": "Головна",
      "popular": "Популярно на MOON",
      "recommendations": "Рекомендовано для тебе",
      // сюди потім додаси інші слова
    }
  },
  en: {
    translation: {
      "home": "Home",
      "popular": "Popular on MOON",
      "recommendations": "Recommended for you",
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