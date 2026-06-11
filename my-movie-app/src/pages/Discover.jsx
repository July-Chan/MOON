import React, { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import axios from 'axios';
import { Star, X, ChevronDown, FolderPlus, Calendar, Clock, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 
import '../App.css';
import './Discover.css'; 

const Discover = () => {
  const { t, i18n } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const currentIndexRef = useRef(-1);
  
  const [showInfo, setShowInfo] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cardRefs, setCardRefs] = useState([]);

  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);

  const [userLists, setUserLists] = useState([]); 
  const [listMessage, setListMessage] = useState('');

  const userEmail = localStorage.getItem('userEmail');

  const excludedIdsRef = useRef(new Set());
  const [isAppReady, setIsAppReady] = useState(false);

  const getSeenMovies = () => JSON.parse(localStorage.getItem('moon_seen_movies')) || [];
  const addSeenMovie = (id) => {
    const seen = getSeenMovies();
    if (!seen.includes(id)) {
      localStorage.setItem('moon_seen_movies', JSON.stringify([...seen, id]));
    }
  };

  useEffect(() => {
    const initializeDiscover = async () => {
      if (userEmail) {
        try {
          const [ratingsRes, listsRes] = await Promise.all([
            axios.get(`https://moon-z1lm.onrender.com/api/users/${userEmail}/ratings`),
            axios.get(`https://moon-z1lm.onrender.com/api/lists?userId=${userEmail}`)
          ]);

          const excluded = new Set();
          if (Array.isArray(ratingsRes.data)) {
            ratingsRes.data.forEach(r => excluded.add(String(r.movieId)));
          }
          if (Array.isArray(listsRes.data)) {
            listsRes.data.forEach(list => {
              if (Array.isArray(list.movies)) {
                list.movies.forEach(m => excluded.add(String(m.tmdbId)));
              }
            });
          }
          excludedIdsRef.current = excluded;
        } catch (error) {
          console.error("Помилка ініціалізації:", error);
        }
      }
      setIsAppReady(true);
    };
    initializeDiscover();
  }, [userEmail]);

  useEffect(() => {
    if (isAppReady) {
      fetchMovies(1);
    }
  }, [isAppReady, i18n.language]);

  const fetchMovies = async (pageNum) => {
    setIsLoadingMore(true);
    try {
      
      const langParam = t('tmdbLangParam', 'uk-UA'); 
      const res = await axios.get(`https://moon-z1lm.onrender.com/api/movies/popular?language=${langParam}&page=${pageNum}`);
      const seenIds = getSeenMovies();
      
      const newMovies = res.data.filter(m => {
        const idStr = String(m.id);
        return !seenIds.includes(m.id) && !excludedIdsRef.current.has(idStr);
      });

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
      excludedIdsRef.current.add(String(currentMovie.id));
    } catch (error) {
      console.error("Помилка збереження оцінки:", error);
    }
  };

  const openListModal = async () => {
    if (!userEmail) return alert(t('loginRequiredLists'));
    setIsListModalOpen(true);
    setListMessage('');
    
    try {
      const response = await axios.get(`https://moon-z1lm.onrender.com/api/lists?userId=${userEmail}`);
      if (Array.isArray(response.data)) {
        setUserLists(response.data);
      }
    } catch (error) {
      console.error("Помилка при отриманні списків:", error);
    }
  };

  const handleAddMovieToList = async (listId) => {
    try {
      await axios.post(`https://moon-z1lm.onrender.com/api/lists/${listId}/movies`, {
        tmdbId: currentMovie.id,
        title: currentMovie.title,
        posterPath: currentMovie.poster_path ? `https://image.tmdb.org/t/p/w500${currentMovie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster',
        releaseDate: currentMovie.release_date || t('unknownDate')
      });

      setListMessage(t('movieAddedSuccess'));
      excludedIdsRef.current.add(String(currentMovie.id));
      setTimeout(() => setIsListModalOpen(false), 1500); 
    } catch (error) {
      console.error("Помилка додавання:", error);
      setListMessage(error.response?.data?.error || t('movieAlreadyInList'));
    }
  };

  const handleSwipe = (direction, movie) => {
    setShowInfo(false);
    addSeenMovie(movie.id);

    if (direction === 'right') {
      setCurrentMovie(movie); 
      setIsRateModalOpen(true); 
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

  const toggleInfo = () => {
    const idx = currentIndexRef.current;
    if (idx >= 0 && movies[idx]) {
      setCurrentMovie(movies[idx]);
      setShowInfo(!showInfo);
    }
  };

  if (!isAppReady) {
    return (
      <div className="discover-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' }}>
        <p style={{ color: '#8a3ffc', fontWeight: 'bold', letterSpacing: '2px', animation: 'pulse 1.5s infinite' }}>
          {t('loadingRadar')}
        </p>
      </div>
    );
  }

  return (
    <div className="discover-wrapper" style={{ position: 'relative', width: '100%', height: 'calc(100dvh - 70px)', overflow: 'hidden' }}>
      
      <div className="discover-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: '100%', padding: '10px', paddingTop: '8vh', boxSizing: 'border-box' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', justifyContent: 'center' }}>
          
          <button className="desktop-swipe-btn" onClick={() => swipeProgrammatically('left')} disabled={isLoadingMore} style={btnDesktopStyle}>
            <X size={30} color="#a0a0b5" />
          </button>

          <div className="card-stack" style={{ position: 'relative', width: '100%', maxWidth: '360px', height: '65vh', maxHeight: '550px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {isLoadingMore && <div style={{ color: '#8a3ffc', fontWeight: 'bold' }}>{t('radarSearching')}</div>}

            {!isLoadingMore && movies.map((movie, index) => (
              <TinderCard
                ref={cardRefs[index]}
                key={movie.id}
                className="swipe"
                onSwipe={(dir) => handleSwipe(dir, movie)}
                preventSwipe={['up', 'down']}
                style={{ position: 'absolute', width: '100%', height: '100%' }} 
              >
                <div className="movie-swipe-card" style={{ ...cardStyle, backgroundImage: `linear-gradient(to bottom, transparent 40%, #0f0f1a), url(${movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : `https://placehold.co/500x750/1a1a2e/ffffff?text=${t('noPosterText')}`})` }}>
                  <h2 style={titleStyle}>{movie.title}</h2>
                  <span style={metaStyle}>{movie.vote_average?.toFixed(1)}★ TMDB</span>
                </div>
              </TinderCard>
            ))}
          </div>

          <button className="desktop-swipe-btn" onClick={() => swipeProgrammatically('right')} disabled={isLoadingMore} style={{ ...btnDesktopStyle, borderColor: 'rgba(138, 63, 252, 0.5)', background: 'rgba(138, 63, 252, 0.2)' }}>
            <Star size={30} fill="#8a3ffc" color="#8a3ffc" />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '25px', zIndex: 10 }}>
          
          <button className="mobile-swipe-btn" onClick={() => swipeProgrammatically('left')} disabled={isLoadingMore} style={btnMobileStyle}>
            <X size={24} color="#a0a0b5" />
          </button>

          <button onClick={toggleInfo} style={infoBtnStyle}>
            <ChevronDown size={20} style={{ transform: showInfo ? 'rotate(180deg)' : 'none', transition: '0.3s' }} /> 
            {showInfo ? t('hideInfo') : t('moreInfo')}
          </button> 

          <button className="mobile-swipe-btn" onClick={() => swipeProgrammatically('right')} disabled={isLoadingMore} style={{ ...btnMobileStyle, borderColor: 'rgba(138, 63, 252, 0.5)', background: 'rgba(138, 63, 252, 0.15)' }}>
            <Star size={24} fill="#8a3ffc" color="#8a3ffc" />
          </button>

        </div>

        {/* 🔮 МОДАЛЬНЕ ВІКНО ОЦІНКИ */}
        {isRateModalOpen && currentMovie && (
          <div onClick={() => setIsRateModalOpen(false)} style={modalOverlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={modalContainerStyle}>
              <button onClick={() => setIsRateModalOpen(false)} style={closeButtonStyle}><X size={20} /></button>
              
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: 'white' }}>{t('rateMovieTitle')}</h3>
              <p style={{ color: '#8a3ffc', fontSize: '15px', fontWeight: 'bold', marginBottom: '25px', padding: '0 20px' }}>{currentMovie.title}</p>
              
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || 0);
                  return (
                    <Star
                      key={star}
                      size={window.innerWidth > 768 ? 36 : 32} 
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

        {/* 📁 МОДАЛЬНЕ ВІКНО СПИСКІВ */}
        {isListModalOpen && currentMovie && (
          <div onClick={() => setIsListModalOpen(false)} style={modalOverlayStyle}>
            <div onClick={(e) => e.stopPropagation()} style={{ ...modalContainerStyle, padding: '25px' }}>
              <button onClick={() => setIsListModalOpen(false)} style={closeButtonStyle}><X size={20} /></button>
              
              <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: 'white' }}>{t('addToList')}</h3>
              <p style={{ color: '#a0a0b5', fontSize: '13px', marginBottom: '20px' }}>
                {t('chooseFolderFor')} <strong style={{color: 'white'}}>{currentMovie.title}</strong>
              </p>

              {listMessage && (
                <div style={{ padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', background: listMessage.includes('🎉') || listMessage.includes('Success') || listMessage.includes('успішно') ? 'rgba(0, 230, 115, 0.1)' : 'rgba(255, 77, 77, 0.1)', color: listMessage.includes('🎉') || listMessage.includes('Success') || listMessage.includes('успішно') ? '#00e673' : '#ff4d4d', width: '100%', boxSizing: 'border-box' }}>
                  {listMessage}
                </div>
              )}

              <div style={{ width: '100%', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', scrollbarWidth: 'thin' }}>
                {userLists.length === 0 ? (
                  <p style={{ color: '#4e4e6a', fontStyle: 'italic', fontSize: '14px', margin: '20px 0' }}>
                    {t('noListsFound')}
                  </p>
                ) : (
                  userLists.map(list => (
                    <div
                      key={list.id}
                      onClick={() => handleAddMovieToList(list.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left' }}
                    >
                      <Folder size={18} color="#8a3ffc" fill="rgba(138, 63, 252, 0.2)" />
                      <span style={{ fontSize: '15px', fontWeight: '500', color: 'white' }}>{list.name}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 📖 ПАНЕЛЬ ІНФО */}
        {showInfo && currentMovie && (
          <div className="info-panel" style={infoPanelStyle}>
            <h3 style={{ color: 'white', marginTop: 0 }}>{currentMovie.title}</h3>
            <p style={{ color: '#a0a0b5', fontSize: '13px', lineHeight: '1.4', maxHeight: '110px', overflowY: 'auto', scrollbarWidth: 'none' }}>
              {currentMovie.overview ? currentMovie.overview : t('noDescription')}
            </p>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px', alignItems: 'center' }}>
              <div 
                onClick={openListModal}
                style={{ ...infoBadgeStyle, borderColor: 'rgba(138, 63, 252, 0.4)', background: 'rgba(138, 63, 252, 0.05)' }}
              >
                <FolderPlus size={16} color="#8a3ffc" />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#b19cd9' }}>{t('addToListShort')}</span>
              </div>
              
              <div style={infoItemStyle}>
                <Calendar size={16} color="#a0a0b5" />
                <span style={{ fontSize: '13px', color: '#a0a0b5' }}>
                  {currentMovie.release_date ? new Date(currentMovie.release_date).getFullYear() : '—'}
                </span>
              </div>

              {currentMovie.runtime && (
                <div style={infoItemStyle}>
                  <Clock size={16} color="#a0a0b5" />
                  <span style={{ fontSize: '13px', color: '#a0a0b5' }}>{currentMovie.runtime} {t('minutesAbbr')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Стилі ---
const cardStyle = { backgroundColor: '#1a1a2e', backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', width: '100%', height: '100%', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', cursor: 'grab', userSelect: 'none' };
const titleStyle = { color: 'white', margin: '0 0 5px 0', textShadow: '0 2px 5px rgba(0,0,0,0.9)', fontSize: '22px', lineHeight: '1.2' };
const metaStyle = { color: '#b19cd9', fontSize: '14px', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.8)' };

const btnDesktopStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', minWidth: '60px', height: '60px', cursor: 'pointer', display: window.innerWidth > 768 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', zIndex: 10 };
const btnMobileStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', minWidth: '50px', height: '50px', cursor: 'pointer', display: window.innerWidth <= 768 ? 'flex' : 'none', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s', zIndex: 10 };

const infoBtnStyle = { background: '#141424', border: '1px solid #4e4e6a', padding: window.innerWidth > 768 ? '12px 25px' : '10px 20px', borderRadius: '30px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, fontSize: '14px', minWidth: '130px', justifyContent: 'center' };

const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', background: 'rgba(10, 10, 18, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '15px', boxSizing: 'border-box' };
const modalContainerStyle = { background: '#141424', border: '1px solid rgba(138, 63, 252, 0.4)', padding: '30px 20px', borderRadius: '24px', textAlign: 'center', position: 'relative', width: '100%', maxWidth: '340px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', boxSizing: 'border-box' };
const closeButtonStyle = { position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#a0a0b5', cursor: 'pointer', padding: '5px' };
const infoPanelStyle = { position: 'absolute', bottom: '2%', background: '#141424', padding: '20px', borderRadius: '20px', width: '92%', maxWidth: '360px', zIndex: 100, border: '1px solid #8a3ffc', boxShadow: '0 10px 40px rgba(138, 63, 252, 0.15), 0 20px 40px rgba(0,0,0,0.5)', boxSizing: 'border-box' };
const infoItemStyle = { display: 'flex', alignItems: 'center', gap: '4px', color: 'white' };
const infoBadgeStyle = { display: 'flex', alignItems: 'center', gap: '6px', color: 'white', cursor: 'pointer', background: 'rgba(138, 63, 252, 0.1)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(138, 63, 252, 0.2)', transition: 'all 0.2s ease', boxSizing: 'border-box' };

export default Discover;