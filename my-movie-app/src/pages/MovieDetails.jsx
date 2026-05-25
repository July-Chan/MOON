import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Film } from 'lucide-react';
import '../App.css';
import moonLogo from '../assets/moon_logo_ball.svg';

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Стейти для оцінок та модального вікна
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); 
  const [isModalOpen, setIsModalOpen] = useState(false); // Контроль попапу
  const userEmail = localStorage.getItem('userEmail'); 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const fetchDetailsAndRating = async () => {
      try {
        const response = await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}`);
        const data = await response.json();
        setMovie(data);

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
  }, [id, userEmail]);

  const handleRate = async (ratingValue) => {
    if (!userEmail) return alert("Будь ласка, увійдіть в акаунт, щоб ставити оцінки!");
    
    setUserRating(ratingValue);
    setIsModalOpen(false); // Автоматично закриваємо вікно після вибору оцінки

    try {
      await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userEmail, rating: ratingValue })
      });
    } catch (error) {
      console.error("Помилка при збереженні оцінки:", error);
    }
  };

  if (loading) return (
      <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <img src={moonLogo} alt="Loading..." style={{ width: '100px', height: '100px', animation: 'pulse 1.5s infinite ease-in-out', filter: 'drop-shadow(0 0 15px #8a3ffc)' }} />
          <p style={{ marginTop: '20px', color: '#8a3ffc', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.8 }}>ЗАВАНТАЖЕННЯ...</p>
      </div>
  ); 

  if (!movie || movie.success === false || movie.error) return (
    <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px', color: 'white' }}>Фільм не знайдено :(</div>
  );

  return (
    <div className="home-container" style={{ padding: 0, overflowX: 'hidden', paddingTop: '60px', color: 'white' }}>
      
      {/* ФОНОВИЙ БАНЕР */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: isMobile ? '40vh' : '50vh', 
        backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.3), #0f0f1a), url(https://image.tmdb.org/t/p/original${movie.backdrop_path || movie.poster_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        padding: isMobile ? '0 20px 20px' : '0 50px 40px'
      }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{
            position: 'absolute',
            top: isMobile ? '15px' : '30px',
            left: isMobile ? '15px' : '30px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: isMobile ? '8px 15px' : '10px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backdropFilter: 'blur(10px)',
            fontSize: isMobile ? '14px' : '16px'
          }}
          className="logout-btn"
        >
          <ArrowLeft size={isMobile ? 16 : 20} /> Назад
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
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'} 
            alt={movie.title} 
            style={{ width: isMobile ? '200px' : '300px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* ДЕТАЛІ */}
        <div style={{ flex: 1 }}>
          {movie.tagline && (
            <p style={{ color: '#8a3ffc', fontStyle: 'italic', fontSize: isMobile ? '16px' : '18px', marginBottom: '20px' }}>— {movie.tagline}</p>
          )}

          {/* ІКОНКИ ІНФО */}
          <div style={{ display: 'flex', gap: isMobile ? '15px' : '25px', marginBottom: '30px', flexWrap: 'wrap' }}>
            
            {/* ⭐️ ІНТЕРАКТИВНИЙ КЛІКАБЕЛЬНИЙ РЕЙТИНГ */}
            <div 
              onClick={() => setIsModalOpen(true)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'white', 
                cursor: 'pointer',
                background: 'rgba(138, 63, 252, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(138, 63, 252, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138, 63, 252, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(138, 63, 252, 0.1)'}
              title="Натисніть, щоб оцінити фільм"
            >
              <Star size={18} color="#ffcc00" fill="#ffcc00" />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {movie.vote_average?.toFixed(1)} (TMDB)
                {userRating > 0 && <span style={{ color: '#8a3ffc', marginLeft: '8px' }}>• Твоя: {userRating}★</span>}
              </span>
            </div>
            
            <div style={infoItemStyle}>
              <Calendar size={18} color="#a0a0b5" />
              <span style={{ fontSize: '16px' }}>{movie.release_date ? new Date(movie.release_date).getFullYear() : '—'}</span>
            </div>

            {movie.runtime && (
              <div style={infoItemStyle}>
                <Clock size={18} color="#a0a0b5" />
                <span style={{ fontSize: '16px' }}>{movie.runtime} хв</span>
              </div>
            )}

            {movie.genres && movie.genres.length > 0 && (
              <div style={infoItemStyle}>
                <Film size={18} color="#a0a0b5" />
                <span style={{ fontSize: '16px' }}>{movie.genres[0]}</span> 
              </div>
            )}
          </div>

          <h3 style={{ fontSize: isMobile ? '18px' : '22px', marginBottom: '15px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px' }}>Опис фільму</h3>
          <p style={{ fontSize: isMobile ? '14px' : '16px', lineHeight: '1.6', color: '#a0a0b5', textAlign: 'left' }}>
            {movie.overview || 'Опис українською мовою поки відсутній.'}
          </p>

          {(movie.production_countries || movie.budget) && (
            <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '15px', fontSize: isMobile ? '14px' : '16px' }}>
              {movie.production_countries && <p style={{ margin: '5px 0' }}><strong style={{ color: '#8a3ffc' }}>Країна:</strong> {movie.production_countries?.map(c => c.name).slice(0, 2).join(', ')}</p>}
              {movie.budget ? <p style={{ margin: '5px 0' }}><strong style={{ color: '#8a3ffc' }}>Бюджет:</strong> ${movie.budget?.toLocaleString()}</p> : null}
            </div>
          )}
        </div>
      </div>

      {/* 🔮 МОДАЛЬНЕ ВІКНО ДЛЯ ОЦІНЮВАННЯ */}
      {isModalOpen && (
        <div 
          onClick={() => setIsModalOpen(false)} // Закриття при кліку на задній фон
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(10, 10, 18, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()} // Зупиняємо закриття при кліку всередині вікна
            style={{
              background: '#141424',
              border: '1px solid rgba(138, 63, 252, 0.4)',
              boxShadow: '0 15px 40px rgba(0,0,0,0.7), 0 0 20px rgba(138, 63, 252, 0.1)',
              padding: '30px',
              borderRadius: '20px',
              textAlign: 'center',
              position: 'relative',
              minWidth: '280px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Кнопка закриття (хрестик) */}
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#a0a0b5', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontFamily: 'Inter, sans-serif' }}>
              Оціни фільм
            </h3>
            <p style={{ color: '#8a3ffc', fontSize: '14px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
              {movie.title}
            </p>

            {/* Зірочки */}
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
              <p style={{ fontSize: '12px', color: '#a0a0b5', margin: '10px 0 0 0' }}>
                Поточна оцінка: {userRating} з 5
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const infoItemStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white' };

export default MovieDetails;