import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uk: {
    translation: {
      "home": "Головна",
      "account": "Акаунт",
      "searchPlaceholder": "Шукати фільм...",
      "popularMovies": "Популярно на MOON",
      "recommendations": "Рекомендовано для тебе",
      "watchNow": "Дивитися зараз",
      "moreInfo": "Детальніше",
      "loadingHome": "ЗАВАНТАЖЕННЯ ГОЛОВНОЇ...",
      "noDescription": "Опис фільму тимчасово відсутній.",
      "notEnoughRatings": "Поки що недостатньо оцінок. Оціни ще кілька фільмів, щоб алгоритм зміг підібрати персональні рекомендації!"
    }
  },
  en: {
    translation: {
      "home": "Home",
      "account": "Account",
      "searchPlaceholder": "Search movie...",
      "popularMovies": "Popular on MOON",
      "recommendations": "Recommended for you",
      "watchNow": "Watch Now",
      "moreInfo": "More info",
      "loadingHome": "LOADING HOME...",
      "noDescription": "Movie description is temporarily unavailable.",
      "notEnoughRatings": "Not enough ratings yet. Rate a few more movies so the algorithm can generate personal recommendations!"
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