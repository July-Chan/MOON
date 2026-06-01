import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  uk: {
    translation: {
      // Існуючі ключі
      "home": "Головна",
      "account": "Акаунт",
      "searchPlaceholder": "Шукати фільм...",
      "popularMovies": "Популярно на MOON",
      "recommendations": "Рекомендовано для тебе",
      "watchNow": "Дивитися зараз",
      "moreInfo": "Детальніше",
      "loadingHome": "ЗАВАНТАЖЕННЯ...",
      "noDescription": "Опис фільму тимчасово відсутній.",
      "notEnoughRatings": "Поки що недостатньо оцінок. Оціни ще кілька фільмів, щоб алгоритм зміг підібрати персональні рекомендації!",
      
      // Нові ключі для сторінки деталей фільму (MovieDetails)
      "backBtn": "Назад",
      "movieNotFound": "Фільм не знайдено :(",
      "loginRequiredLists": "Будь ласка, увійдіть в акаунт, щоб керувати списками!",
      "movieAddedSuccess": "Фільм успішно додано до списку! 🎉",
      "movieAlreadyInList": "Цей фільм уже є у списку.",
      "movieAddError": "Сталася помилка при додаванні.",
      "loginRequiredRate": "Будь ласка, увійдіть в акаунт, щоб ставити оцінки!",
      "clickToRate": "Натисніть, щоб оцінити фільм",
      "yourRating": "Твоя:",
      "addToListTooltip": "Додати цей фільм до своєї папки",
      "addToList": "Додати до списку",
      "minutesAbbr": "хв",
      "movieDescriptionTitle": "Опис фільму",
      "country": "Країна:",
      "budget": "Бюджет:",
      "rateMovieTitle": "Оціни фільм",
      "removeRating": "Прибрати оцінку",
      "chooseFolderFor": "Оберіть папку для фільму",
      "noListsFound": "У вас ще немає створених списків. Створіть їх у профілі!"
    }
  },
  en: {
    translation: {
      // Існуючі ключі
      "home": "Home",
      "account": "Account",
      "searchPlaceholder": "Search movie...",
      "popularMovies": "Popular on MOON",
      "recommendations": "Recommended for you",
      "watchNow": "Watch Now",
      "moreInfo": "More info",
      "loadingHome": "LOADING...",
      "noDescription": "Movie description is temporarily unavailable.",
      "notEnoughRatings": "Not enough ratings yet. Rate a few more movies so the algorithm can generate personal recommendations!",
      
      // Нові ключі для сторінки деталей фільму (MovieDetails)
      "backBtn": "Back",
      "movieNotFound": "Movie not found :(",
      "loginRequiredLists": "Please log in to manage your lists!",
      "movieAddedSuccess": "Movie successfully added to the list! 🎉",
      "movieAlreadyInList": "This movie is already in the list.",
      "movieAddError": "An error occurred while adding.",
      "loginRequiredRate": "Please log in to rate movies!",
      "clickToRate": "Click to rate the movie",
      "yourRating": "Yours:",
      "addToListTooltip": "Add this movie to your folder",
      "addToList": "Add to list",
      "minutesAbbr": "min",
      "movieDescriptionTitle": "Movie Description",
      "country": "Country:",
      "budget": "Budget:",
      "rateMovieTitle": "Rate Movie",
      "removeRating": "Remove rating",
      "chooseFolderFor": "Choose a folder for",
      "noListsFound": "You don't have any lists yet. Create them in your profile!"
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