import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Film, X, FolderPlus, Folder } from 'lucide-react';
import { useTranslation } from 'react-i18next'; 
import '../App.css';
import moonLogo from '../assets/moon_logo_ball.svg';

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [moonAverage, setMoonAverage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const userEmail = localStorage.getItem('userEmail'); 

  const [userLists, setUserLists] = useState([]); 
  const [isListModalOpen, setIsListModalOpen] = useState(false); 
  const [listMessage, setListMessage] = useState(''); 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const fetchDetailsAndRating = async () => {
      try {
        const currentLang = i18n.language || '';
        const langParam = currentLang.includes('uk') || currentLang.includes('ua') ? 'uk-UA' : 'en-US';

        const response = await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}?language=${langParam}`);
        const data = await response.json();
        setMovie(data);

        try {
          const avgResponse = await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}/average`);
          const avgData = await avgResponse.json();
          if (avgData.average) {
            setMoonAverage(avgData.average); // Зберігаємо середню оцінку в стейт
          }
        } catch (error) {
          console.error("Не вдалося отримати середню оцінку MOON:", error);
        }

        if (userEmail) {
          const ratingResponse = await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}/rate/${userEmail}`);
          const ratingData = await ratingResponse.json();
          setUserRating(ratingData.rating || 0);
        }
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetailsAndRating();
    return () => window.removeEventListener('resize', handleResize);
  }, [id, userEmail, i18n.language]);

  const openListModal = async () => {
    if (!userEmail) return alert(t('loginRequiredLists', 'Будь ласка, увійдіть в акаунт, щоб керувати списками!'));
    setIsListModalOpen(true);
    setListMessage('');
    
    try {
      const response = await fetch(`https://moon-z1lm.onrender.com/api/lists?userId=${userEmail}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setUserLists(data);
      }
    } catch (error) {
      console.error("Помилка при отриманні списків:", error);
    }
  };

  const getImageUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http')
    ? path
    : `https://image.tmdb.org/t/p/original${path}`;
};

  const handleAddMovieToList = async (listId) => {
    try {
      const response = await fetch(`https://moon-z1lm.onrender.com/api/lists/${listId}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId: movie.id,
          title: movie.title,
          posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster',
          releaseDate: movie.release_date || 'Невідомо'
        })
      });

      const data = await response.json();

      if (response.ok) {
        setListMessage(t('movieAddedSuccess', 'Фільм успішно додано до списку! 🎉'));
        setTimeout(() => setIsListModalOpen(false), 1500); 
      } else {
        setListMessage(data.error || t('movieAlreadyInList', 'Цей фільм уже є у списку.'));
      }
    } catch (error) {
      console.error("Помилка додавання фільму до списку:", error);
      setListMessage(t('movieAddError', 'Сталася помилка при додаванні.'));
    }
  };

  const handleRate = async (ratingValue) => {
    if (!userEmail) return alert(t('loginRequiredRate', 'Будь ласка, увійдіть в акаунт, щоб ставити оцінки!'));
    setUserRating(ratingValue);
    setIsModalOpen(false); 

    try {
      await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userEmail, 
          rating: ratingValue,
          title: movie.title,
          poster_path: movie.poster_path
        })
      });
    } catch (error) {
      console.error("Помилка при збереженні оцінки:", error);
    }
  };

  const handleDeleteRating = async () => {
    if (!userEmail) return;
    setUserRating(0); 
    setIsModalOpen(false); 

    try {
      await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}/rate/${userEmail}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error("Помилка при видаленні оцінки:", error);
    }
  };

  if (loading) return (
      <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <img src={moonLogo} alt="Loading..." style={{ width: '100px', height: '100px', animation: 'pulse 1.5s infinite ease-in-out', filter: 'drop-shadow(0 0 15px #8a3ffc)' }} />
          <p style={{ marginTop: '20px', color: '#8a3ffc', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.8 }}>
            {t('loadingHome', 'ЗАВАНТАЖЕННЯ...')}
          </p>
      </div>
  ); 

  if (!movie || movie.success === false || movie.error) return (
    <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px', color: 'white' }}>
      {t('movieNotFound', 'Фільм не знайдено :(')}
    </div>
  );


  return (
    <div className="home-container" style={{ padding: 0, overflowX: 'hidden', paddingTop: '60px', color: 'white' }}>
      
      {/* ФОНОВИЙ БАНЕР */}
    <div style={{
      position: 'relative',
      width: '100%',
      height: isMobile ? '40vh' : '50vh',
      backgroundImage: `
        linear-gradient(to bottom, rgba(15, 15, 26, 0.3), #0f0f1a),
        url(${getImageUrl(movie.backdrop_path || movie.poster_path)})
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'flex-end',
      padding: isMobile ? '0 20px 20px' : '0 50px 40px'
    }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            position: 'absolute', top: isMobile ? '15px' : '30px', left: isMobile ? '15px' : '30px',
            background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white',
            padding: isMobile ? '8px 15px' : '10px 20px', borderRadius: '12px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', backdropFilter: 'blur(10px)',
            fontSize: isMobile ? '14px' : '16px'
          }}
          className="logout-btn"
        >
          <ArrowLeft size={isMobile ? 16 : 20} /> {t('backBtn', 'Назад')}
        </button>

        <h1 style={{ fontSize: isMobile ? '28px' : '48px', margin: 0, textShadow: '0 4px 10px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>
            {movie.title}
        </h1>
      </div>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '25px' : '40px', padding: isMobile ? '20px' : '40px 50px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* ПОСТЕР */}
        <div style={{ flexShrink: 0 }}>
          <img 
            src={
                  movie.poster_path?.startsWith('http')
                    ? movie.poster_path
                    : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            }
            alt={movie.title} 
            style={{ width: isMobile ? '200px' : '300px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* ДЕТАЛІ */}
        <div style={{ flex: 1 }}>
          {movie.tagline && (
            <p style={{ color: '#8a3ffc', fontStyle: 'italic', fontSize: isMobile ? '16px' : '18px', marginBottom: '20px' }}>— {movie.tagline}</p>
          )}

          {/* 🔥 БЛОК ІЗ ЖАНРАМИ ТА ІНФО (ЗМІНЕНО) */}
          <div style={{ display: 'flex', gap: isMobile ? '12px' : '20px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* Оцінки */}
            <div 
              onClick={() => setIsModalOpen(true)} style={infoBadgeStyle}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 63, 252, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(138, 63, 252, 0.1)'}
              title={t('clickToRate', 'Натисніть, щоб оцінити фільм')}
            >
              <Star size={18} color="#ffcc00" fill="#ffcc00" />
              <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                {movie.vote_average?.toFixed(1)} (TMDB)
                
                {/* Виводимо середню оцінку MOON, якщо вона є */}
                {moonAverage && (
                  <span style={{ color: '#b19cd9', marginLeft: '8px' }}>
                    • MOON: {moonAverage.toFixed(1)}★
                  </span>
                )}

                {/* Виводимо особисту оцінку користувача */}
                {userRating > 0 && (
                  <span style={{ color: '#8a3ffc', marginLeft: '8px' }}>
                    • {t('yourRating', 'Твоя:')} {userRating}★
                  </span>
                )}
              </span>
            </div>

            {/* Додати до списку */}
            <div 
              onClick={openListModal}
              style={{ ...infoBadgeStyle, borderColor: 'rgba(138, 63, 252, 0.4)', background: 'rgba(138, 63, 252, 0.05)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(138, 63, 252, 0.2)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(138, 63, 252, 0.05)'; e.currentTarget.style.transform = 'scale(1)'; }}
              title={t('addToListTooltip', 'Додати цей фільм до своєї папки')}
            >
              <FolderPlus size={18} color="#8a3ffc" />
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#b19cd9' }}>{t('addToList', 'Додати до списку')}</span>
            </div>
            
            <div style={infoItemStyle}>
              <Calendar size={18} color="#a0a0b5" />
              <span style={{ fontSize: '15px' }}>{movie.release_date ? new Date(movie.release_date).getFullYear() : '—'}</span>
            </div>

            {movie.runtime && (
              <div style={infoItemStyle}>
                <Clock size={18} color="#a0a0b5" />
                <span style={{ fontSize: '15px' }}>{movie.runtime} {t('minutesAbbr', 'хв')}</span>
              </div>
            )}
          </div>

          {/* 🔥 ВИВЕДЕННЯ ВСІХ ЖАНРІВ (НОВИЙ РЯДОК) */}
          {movie.genres && movie.genres.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '30px' }}>
              <Film size={18} color="#a0a0b5" style={{ alignSelf: 'center' }} />
              {movie.genres.map((genre, index) => (
                <span 
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    color: '#e0e0e0'
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: isMobile ? '18px' : '22px', marginBottom: '15px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px' }}>
            {t('movieDescriptionTitle', 'Опис фільму')}
          </h3>
          <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.6', color: '#a0a0b5', textAlign: 'left', marginBottom: '30px' }}>
            {movie.overview || t('noDescription', 'Опис відсутній.')}
          </p>

          {/* 🔥 БЛОК КОМАНДИ ФІЛЬМУ (РЕЖИСЕР ТА АКТОРИ) КОЛОНКОЮ */}
          {(movie.director || (movie.cast && movie.cast.length > 0)) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              
              {movie.director && (
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '5px' : '15px' }}>
                  <span style={{ color: '#8a3ffc', fontWeight: 'bold', minWidth: '120px' }}>{t('director', 'Режисер:')}</span>
                  <span style={{ color: 'white' }}>{movie.director}</span>
                </div>
              )}
              
              {movie.cast && movie.cast.length > 0 && (
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '5px' : '15px' }}>
                  <span style={{ color: '#8a3ffc', fontWeight: 'bold', minWidth: '120px' }}>{t('cast', 'У ролях:')}</span>
                  <span style={{ color: '#a0a0b5', lineHeight: '1.5' }}>
                    {movie.cast.join(', ')}
                  </span>
                </div>
              )}

            </div>
          )}

          {/* Країна та бюджет */}
          {(movie.production_countries || movie.budget) && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', fontSize: isMobile ? '14px' : '16px' }}>
              {movie.production_countries && <p style={{ margin: '5px 0' }}><strong style={{ color: '#8a3ffc' }}>{t('country', 'Країна:')}</strong> {movie.production_countries?.map(c => c.name).slice(0, 2).join(', ')}</p>}
              {movie.budget ? <p style={{ margin: '5px 0' }}><strong style={{ color: '#8a3ffc' }}>{t('budget', 'Бюджет:')}</strong> ${movie.budget?.toLocaleString()}</p> : null}
            </div>
          )}
        </div>
      </div>


      {/* 🔮 МОДАЛЬНЕ ВІКНО ДЛЯ ОЦІНЮВАННЯ */}
      {isModalOpen && (
        <div onClick={() => setIsModalOpen(false)} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalContainerStyle}>
            <button onClick={() => setIsModalOpen(false)} style={closeButtonStyle}><X size={20} /></button>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{t('rateMovieTitle', 'Оціни фільм')}</h3>
            <p style={{ color: '#8a3ffc', fontSize: '14px', fontWeight: 'bold', margin: '0 0 20px 0' }}>{movie.title}</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || userRating);
                return (
                  <Star
                    key={star}
                    size={32}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    color={isFilled ? '#8a3ffc' : '#4e4e6a'}
                    fill={isFilled ? '#8a3ffc' : 'transparent'}
                    style={{ cursor: 'pointer', transition: 'transform 0.1s', filter: isFilled ? 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))' : 'none' }}
                  />
                );
              })}
            </div>
            {userRating > 0 && (
              <button onClick={handleDeleteRating} style={deleteRatingButtonStyle}>{t('removeRating', 'Прибрати оцінку')}</button>
            )}
          </div>
        </div>
      )}

      {/* 📁 НОВЕ МОДАЛЬНЕ ВІКНО: ВИБІР ПАПКИ/СПИСКУ */}
      {isListModalOpen && (
        <div onClick={() => setIsListModalOpen(false)} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...modalContainerStyle, minWidth: '320px', maxWidth: '400px' }}>
            <button onClick={() => setIsListModalOpen(false)} style={closeButtonStyle}><X size={20} /></button>
            
            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{t('addToList', 'Додати до списку')}</h3>
            <p style={{ color: '#a0a0b5', fontSize: '13px', marginBottom: '20px' }}>
              {t('chooseFolderFor', 'Оберіть папку для фільму')} <strong>{movie.title}</strong>
            </p>

            {listMessage && (
              <div style={{ 
                padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px',
                background: listMessage.includes('🎉') ? 'rgba(0, 230, 115, 0.1)' : 'rgba(255, 77, 77, 0.1)',
                color: listMessage.includes('🎉') ? '#00e673' : '#ff4d4d',
                width: '100%', boxSizing: 'border-box'
              }}>
                {listMessage}
              </div>
            )}

            <div style={{ width: '100%', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '5px', scrollbarWidth: 'thin' }}>
              {userLists.length === 0 ? (
                <p style={{ color: '#4e4e6a', fontStyle: 'italic', fontSize: '14px', margin: '20px 0' }}>
                  {t('noListsFound', 'У вас ще немає створених списків. Створіть їх у профілі!')}
                </p>
              ) : (
                userLists.map(list => (
                  <div
                    key={list.id}
                    onClick={() => handleAddMovieToList(list.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'left'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(138, 63, 252, 0.1)'; e.currentTarget.style.borderColor = 'rgba(138, 63, 252, 0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
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

    </div>
  );
};

// Стилі
const infoItemStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white' };
const infoBadgeStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', color: 'white', cursor: 'pointer',
  background: 'rgba(138, 63, 252, 0.1)', padding: '6px 14px', borderRadius: '8px',
  border: '1px solid rgba(138, 63, 252, 0.2)', transition: 'all 0.2s ease', height: '32px', boxSizing: 'border-box'
};
const modalOverlayStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
  background: 'rgba(10, 10, 18, 0.8)', backdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyCenter: 'center', justifyContent: 'center', zIndex: 10000,
};
const modalContainerStyle = {
  background: '#141424', border: '1px solid rgba(138, 63, 252, 0.4)',
  boxShadow: '0 15px 40px rgba(0,0,0,0.7), 0 0 20px rgba(138, 63, 252, 0.1)',
  padding: '30px', borderRadius: '20px', textAlign: 'center', position: 'relative', minWidth: '280px'
};
const closeButtonStyle = { position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#a0a0b5', cursor: 'pointer' };
const deleteRatingButtonStyle = {
  marginTop: '15px', background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d',
  padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', width: '100%', transition: 'all 0.2s'
};

export default MovieDetails;