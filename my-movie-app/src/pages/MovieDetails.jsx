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

  // Стейт для особистої оцінки користувача (від 0 до 5)
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // Для красивого ефекту наведення
  const userEmail = localStorage.getItem('userEmail'); // Беремо email авторизованого юзера

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    const fetchDetailsAndRating = async () => {
      try {
        // 1. Завантажуємо деталі фільму
        const response = await fetch(`https://moon-z1lm.onrender.com/api/movie/${id}`);
        const data = await response.json();
        setMovie(data);

        // 2. Завантажуємо особисту оцінку користувача, якщо він авторизований
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

  // Функція для відправки оцінки на сервер
  const handleRate = async (ratingValue) => {
    if (!userEmail) return alert("Будь ласка, увійдіть в акаунт, щоб ставити оцінки!");
    
    setUserRating(ratingValue);

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
    <div className="home-container" style={{ padding: 0, overflowX: 'hidden', paddingTop: '60px' }}>
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
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <img 
            src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'} 
            alt={movie.title} 
            style={{ width: isMobile ? '200px' : '300px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          />

          {/* ⭐️ ІНТЕРАКТИВНИЙ БЛОК ОЦІНЮВАННЯ */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px 25px', borderRadius: '15px', border: '1px solid rgba(138, 63, 252, 0.2)', textAlign: 'center' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#a0a0b5', fontWeight: '600' }}>
              {userRating > 0 ? 'Твоя оцінка:' : 'Оціни фільм:'}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || userRating);
                return (
                  <Star
                    key={star}
                    size={28}
                    onClick={() => handleRate(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    color={isFilled ? '#8a3ffc' : '#4e4e6a'}
                    fill={isFilled ? '#8a3ffc' : 'transparent'}
                    style={{ cursor: 'pointer', transition: 'transform 0.1s', filter: isFilled ? 'drop-shadow(0 0 5px rgba(138, 63, 252, 0.5))' : 'none' }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* ДЕТАЛІ */}
        <div style={{ flex: 1 }}>
          {movie.tagline && (
            <p style={{ color: '#8a3ffc', fontStyle: 'italic', fontSize: isMobile ? '16px' : '18px', marginBottom: '20px' }}>— {movie.tagline}</p>
          )}

          {/* ІКОНКИ ІНФО */}
          <div style={{ display: 'flex', gap: isMobile ? '15px' : '25px', marginBottom: '30px', flexWrap: 'wrap' }}>
            <div style={infoItemStyle}>
              <Star size={18} color="#ffcc00" fill="#ffcc00" />
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{movie.vote_average?.toFixed(1)} (TMDB)</span>
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

          <h3 style={{ color: 'white', fontSize: isMobile ? '18px' : '22px', marginBottom: '15px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px' }}>Опис фільму</h3>
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
    </div>
  );
};

const infoItemStyle = { display: 'flex', alignItems: 'center', gap: '8px', color: 'white' };

export default MovieDetails;