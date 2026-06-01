import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Info } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../App.css'; 
import moonLogo from '../assets/moon_logo_ball.svg';

const Home = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); 
  
  const [heroMovie, setHeroMovie] = useState(null);
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  const userEmail = localStorage.getItem('userEmail');

  // 1. ЗАВАНТАЖЕННЯ БАЗОВИХ ДАНИХ (Банер та Популярне)
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const langParam = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
        
        // 🔥 ПЕРЕДАЄМО langParam НА БЕКЕНД (якщо він це підтримує)
        const nowPlayingRes = await fetch(`https://moon-z1lm.onrender.com/api/movies/now-playing?language=${langParam}`);
        const nowPlayingData = await nowPlayingRes.json();
        
        if (nowPlayingData && nowPlayingData.length > 0) {
          // 🔥 ЕЛЕГАНТНИЙ ФІКС: якщо фільм уже вибрано, шукаємо його ж, але з новою мовою.
          // Це запобігає хаотичній зміні баннера при перемиканні мови.
          setHeroMovie((prevHero) => {
            if (prevHero) {
              return nowPlayingData.find(m => m.id === prevHero.id) || nowPlayingData[0];
            }
            const randomIndex = Math.floor(Math.random() * nowPlayingData.length);
            return nowPlayingData[randomIndex];
          });
        }

        const popularRes = await fetch(`https://moon-z1lm.onrender.com/api/movies/popular?language=${langParam}`);
        const popularData = await popularRes.json();
        setPopularMovies(popularData);

      } catch (error) {
        console.error("Помилка завантаження даних для головної:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [i18n.language]);

  // 2. ЗАВАНТАЖЕННЯ РЕКОМЕНДАЦІЙ
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userEmail) {
        setRecommendedMovies([]); // Очищуємо, якщо юзер вийшов
        setIsLoadingRecs(false);
        return;
      }
      
      // 🔥 Очищуємо старі рекомендації перед новим запитом, щоб уникнути спалахів старого контенту
      setIsLoadingRecs(true);
      setRecommendedMovies([]);

      try {
        const pythonRes = await axios.get(`https://moon-recommender.onrender.com/api/recommend/${userEmail}`);
        
        if (pythonRes.data.recommendations && pythonRes.data.recommendations.length > 0) {
          // ⚠️ Рекомендую замінити на process.env.REACT_APP_TMDB_API_KEY
          const API_KEY = 'c8282b948e28647029c446fa9bef20f8'; 
          
          const moviePromises = pythonRes.data.recommendations.map(async (rec) => {
            const langParam = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
            const tmdbRes = await axios.get(`https://api.themoviedb.org/3/movie/${rec.movieId}?api_key=${API_KEY}&language=${langParam}`);
            return { ...tmdbRes.data, predictedRating: rec.predicted_rating };
          });

          const moviesWithDetails = await Promise.all(moviePromises);
          setRecommendedMovies(moviesWithDetails);
        }
      } catch (error) {
        console.error("Помилка завантаження рекомендацій:", error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [userEmail, i18n.language]);

  if (loading) return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <img src={moonLogo} alt="Loading..." style={{ width: '100px', height: '100px', animation: 'pulse 1.5s infinite ease-in-out', filter: 'drop-shadow(0 0 15px #8a3ffc)' }} />
        <p style={{ marginTop: '20px', color: '#8a3ffc', fontWeight: 'bold', letterSpacing: '2px' }}>
          {t('loadingHome')}
        </p>
    </div>
  );

  return (
    <div className="home-container" style={{ color: 'white', paddingBottom: '50px' }}>
      
      {/* 🎬 ВЕЛИКИЙ HERO-БАНЕР */}
      {heroMovie && (
        <div style={{
          position: 'relative',
          width: '100%',
          height: '70vh',
          backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.1), #0f0f1a), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 50px 60px'
        }}>
          <div style={{ maxWidth: '600px', textAlign: 'left' }}>
            <h1 style={{ fontSize: '48px', margin: '0 0 15px 0', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              {heroMovie.title}
            </h1>
            <p style={{ fontSize: '16px', color: '#a0a0b5', lineHeight: '1.5', marginBottom: '25px', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
              {/* 🔥 Розумне обрізання тексту: додаємо три крапки лише якщо текст дійсно довший за 180 символів */}
              {heroMovie.overview 
                ? (heroMovie.overview.length > 180 ? `${heroMovie.overview.slice(0, 180)}...` : heroMovie.overview) 
                : t('noDescription')
              }
            </p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => navigate(`/movie/${heroMovie.id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#8a3ffc', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                <Info size={18} /> {t('moreInfo')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✨ БЛОК РЕКОМЕНДАЦІЙ ШТУЧНОГО ІНТЕЛЕКТУ ✨ */}
      {userEmail && (
        <div style={{ padding: '0 50px', marginTop: '40px' }}>
          <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', marginBottom: '20px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px' }}>
            {t('recommendations')}
            <span style={{ fontSize: '12px', background: 'rgba(138, 63, 252, 0.2)', color: '#8a3ffc', padding: '4px 10px', borderRadius: '12px', verticalAlign: 'middle', fontWeight: 'bold', border: '1px solid rgba(138, 63, 252, 0.5)' }}>
              SVD AI
            </span>
          </h2>

          {isLoadingRecs ? (
            <div style={{ display: 'flex', gap: '20px', overflowX: 'hidden' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <div key={n} style={{ minWidth: '180px', height: '270px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
              ))}
            </div>
          ) : recommendedMovies.length > 0 ? (
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollbarWidth: 'thin' }}>
              {recommendedMovies.map(movie => (
                <div 
                  key={movie.id} 
                  onClick={() => navigate(`/movie/${movie.id}`)} 
                  style={{ flexShrink: 0, width: '180px', cursor: 'pointer', transition: 'transform 0.2s' }} 
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} 
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://placehold.co/300x450/1a1a2e/ffffff?text=No+Poster'}
                    alt={movie.title}
                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid rgba(138, 63, 252, 0.3)' }}
                  />
                  <h4 style={{ color: 'white', fontSize: '14px', marginTop: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                    {movie.title}
                  </h4>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '12px', color: '#a0a0b5', textAlign: 'center', border: '1px dashed rgba(138,63,252,0.3)' }}>
              <p style={{ margin: 0 }}>{t('notEnoughRatings')}</p>
            </div>
          )}
        </div>
      )}

      {/* 🍿 РЯДОК: ПОПУЛЯРНІ ФІЛЬМИ */}
      <div style={{ padding: '0 50px', marginTop: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '20px', borderLeft: '4px solid #a0a0b5', paddingLeft: '15px', textAlign: 'left' }}>
          {t('popularMovies')}
        </h2>
        
        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollbarWidth: 'thin' }}>
          {popularMovies.map(movie => (
            <div 
              key={movie.id} 
              onClick={() => navigate(`/movie/${movie.id}`)}
              style={{ flexShrink: 0, width: '180px', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <img 
                src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://placehold.co/300x450'} 
                alt={movie.title} 
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)' }}
              />
              <h4 style={{ margin: '10px 0 5px 0', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                {movie.title}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#ffcc00' }}>
                <Star size={12} fill="#ffcc00" /> {movie.vote_average?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;