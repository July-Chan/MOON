import React, { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import { Star, X, ChevronDown, FolderPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Для перекладів
import '../App.css';
import './Discover.css'; 

const Discover = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1);
  
  const [showInfo, setShowInfo] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cardRefs, setCardRefs] = useState([]);

  // --- Стейт для модальних вікон ---
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const userEmail = localStorage.getItem('userEmail');

  // Пам'ять "бачених" фільмів
  const getSeenMovies = () => JSON.parse(localStorage.getItem('moon_seen_movies')) || [];
  const addSeenMovie = (id) => {
    const seen = getSeenMovies();
    if (!seen.includes(id)) {
      localStorage.setItem('moon_seen_movies', JSON.stringify([...seen, id]));
    }
  };

  const fetchMovies = async (pageNum) => {
    setIsLoadingMore(true);
    try {
      const res = await axios.get(`https://moon-z1lm.onrender.com/api/movies/popular?language=uk-UA&page=${pageNum}`);
      const seenIds = getSeenMovies();
      const newMovies = res.data.filter(m => !seenIds.includes(m.id));

      if (newMovies.length === 0) {
        setPage(pageNum + 1);
        fetchMovies(pageNum + 1);
        return;
      }

      setMovies(newMovies);
      setCardRefs(Array(newMovies.length).fill(0).map(() => React.createRef()));
      const lastIndex = newMovies.length - 1;
      setCurrentIndex(lastIndex);
      currentIndexRef.current = lastIndex;
    } catch (error) {
      console.error("Помилка:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => { fetchMovies(1); }, []);

  // --- Логіка оцінювання (відправка на бекенд) ---
  const handleRate = async (ratingValue) => {
    if (!userEmail) return alert(t('loginRequiredRate'));
    if (!currentMovie) return;

    try {
      await axios.post(`https://moon-z1lm.onrender.com/api/movie/${currentMovie.id}/rate`, {
        userId: userEmail,
        rating: ratingValue,
        title: currentMovie.title,
        poster_path: currentMovie.poster_path
      });
      setIsRateModalOpen(false);
      setHoverRating(0);
      // Можна додати маленький Toast-нотіфікейшн "Дякуємо за оцінку!"
    } catch (error) {
      console.error("Помилка збереження оцінки:", error);
    }
  };

  const handleSwipe = (direction, movie) => {
    setShowInfo(false);
    addSeenMovie(movie.id);

    if (direction === 'right') {
      setCurrentMovie(movie); // Запам'ятовуємо фільм, який свайпнули
      setIsRateModalOpen(true); // Відкриваємо модалку
    } else if (direction === 'down') {
      setCurrentMovie(movie);
      setShowInfo(true);
    }

    const nextIndex = currentIndexRef.current - 1;
    setCurrentIndex(nextIndex);
    currentIndexRef.current = nextIndex;

    if (nextIndex < 0 && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };

  const swipeProgrammatically = (dir) => {
    const idx = currentIndexRef.current;
    if (idx >= 0 && cardRefs[idx]?.current) {
      cardRefs[idx].current.swipe(dir);
    }
  };

  return (
    <div className="discover-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '85vh', position: 'relative', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%', justifyContent: 'center' }}>
        
        {/* Кнопка СКІП */}
        <button className="desktop-swipe-btn" onClick={() => swipeProgrammatically('left')} disabled={isLoadingMore} style={btnStyle}>
          <X size={30} color="#a0a0b5" />
        </button>

        {/* СТЕК КАРТОК */}
        <div className="card-stack" style={{ position: 'relative', width: '320px', height: '480px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {isLoadingMore && <div style={{ color: '#8a3ffc', fontWeight: 'bold' }}>{t('radarSearching', 'Шукаємо...')}</div>}

          {!isLoadingMore && movies.map((movie, index) => (
            <TinderCard
              ref={cardRefs[index]}
              key={movie.id}
              className="swipe"
              onSwipe={(dir) => handleSwipe(dir, movie)}
              preventSwipe={['up']}
            >
              <div className="movie-swipe-card" style={{ ...cardStyle, backgroundImage: `linear-gradient(to bottom, transparent 40%, #0f0f1a), url(${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'})` }}>
                <h2 style={titleStyle}>{movie.title}</h2>
                <span style={metaStyle}>{movie.vote_average?.toFixed(1)}★ TMDB</span>
              </div>
            </TinderCard>
          ))}
        </div>

        {/* Кнопка ОЦІНИТИ */}
        <button className="desktop-swipe-btn" onClick={() => swipeProgrammatically('right')} disabled={isLoadingMore} style={{ ...btnStyle, borderColor: 'rgba(138, 63, 252, 0.5)', background: 'rgba(138, 63, 252, 0.2)' }}>
          <Star size={30} fill="#8a3ffc" color="#8a3ffc" />
        </button>
      </div>

      <button onClick={() => swipeProgrammatically('down')} style={infoBtnStyle}>
        <ChevronDown size={20} /> {t('moreInfo')}
      </button>

      {/* 🔮 МОДАЛЬНЕ ВІКНО ОЦІНКИ (Твоє замовлення!) */}
      {isRateModalOpen && currentMovie && (
        <div onClick={() => setIsRateModalOpen(false)} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalContainerStyle}>
            <button onClick={() => setIsRateModalOpen(false)} style={closeButtonStyle}><X size={20} /></button>
            
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: 'white' }}>{t('rateMovieTitle', 'Оціни фільм')}</h3>
            <p style={{ color: '#8a3ffc', fontSize: '15px', fontWeight: 'bold', marginBottom: '25px' }}>{currentMovie.title}</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || 0);
                return (
                  <Star
                    key={star}
                    size={36}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                    color={isFilled ? '#8a3ffc' : '#4e4e6a'}
                    fill={isFilled ? '#8a3ffc' : 'transparent'}
                    style={{ cursor: 'pointer', transition: 'transform 0.1s', filter: isFilled ? 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))' : 'none' }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Панель Інфо (свайп вниз) */}
      {showInfo && currentMovie && (
        <div className="info-panel" style={infoPanelStyle}>
          <h3 style={{ color: 'white', marginTop: 0 }}>{currentMovie.title}</h3>
          <p style={{ color: '#a0a0b5', fontSize: '14px', lineHeight: '1.4' }}>{currentMovie.overview?.slice(0, 160)}...</p>
          <button onClick={() => alert('Тут логіка списків')} style={addToListBtnStyle}>
            <FolderPlus size={18} /> {t('addToList')}
          </button>
        </div>
      )}
    </div>
  );
};

// --- Стилі ---
const cardStyle = { backgroundColor: '#1a1a2e', backgroundSize: 'cover', backgroundPosition: 'center', width: '100%', height: '100%', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '25px', cursor: 'grab' };
const titleStyle = { color: 'white', margin: '0 0 5px 0', textShadow: '0 2px 5px rgba(0,0,0,0.8)', fontSize: '22px' };
const metaStyle = { color: '#b19cd9', fontSize: '14px', fontWeight: 'bold' };
const btnStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '64px', height: '64px', cursor: 'pointer', display: window.innerWidth > 768 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', zIndex: 10 };
const infoBtnStyle = { marginTop: '30px', background: '#141424', border: '1px solid #4e4e6a', padding: '12px 25px', borderRadius: '30px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(10, 10, 18, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 };
const modalContainerStyle = { background: '#141424', border: '1px solid rgba(138, 63, 252, 0.4)', padding: '40px', borderRadius: '24px', textAlign: 'center', position: 'relative', minWidth: '300px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' };
const closeButtonStyle = { position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#a0a0b5', cursor: 'pointer' };
const infoPanelStyle = { position: 'absolute', bottom: '5%', background: '#141424', padding: '25px', borderRadius: '20px', width: '320px', zIndex: 100, border: '1px solid #8a3ffc', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' };
const addToListBtnStyle = { width: '100%', background: '#8a3ffc', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '15px' };

export default Discover;