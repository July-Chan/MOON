import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../App.css';
import './Home.css';
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

  // 1. ЗАВАНТАЖЕННЯ БАЗОВИХ ДАНИХ
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const langParam = i18n.language === 'uk' ? 'uk-UA' : 'en-US';
        const nowPlayingRes = await fetch(`https://moon-z1lm.onrender.com/api/movies/now-playing?language=${langParam}`);
        const nowPlayingData = await nowPlayingRes.json();
        
        if (nowPlayingData && nowPlayingData.length > 0) {
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
        setRecommendedMovies([]); 
        setIsLoadingRecs(false);
        return;
      }
      
      setIsLoadingRecs(true);
      setRecommendedMovies([]);

      try {
        const pythonRes = await axios.get(`https://moon-recommender.onrender.com/api/recommend/${userEmail}`);
        
        if (pythonRes.data.recommendations && pythonRes.data.recommendations.length > 0) {
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
    <div className="home-container">
      
      {/* 🎬 ВЕЛИКИЙ HERO-БАНЕР (Динамічний фон залишаємо інлайном, решту — в КЛАС) */}
      {heroMovie && (
        <div 
          className="hero-banner"
          style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 15, 26, 0.1), #0f0f1a), url(https://image.tmdb.org/t/p/original${heroMovie.backdrop_path})` }}
        >
          <div className="hero-banner-content">
            <h1>{heroMovie.title}</h1>
            <p>
              {heroMovie.overview 
                ? (heroMovie.overview.length > 180 ? `${heroMovie.overview.slice(0, 180)}...` : heroMovie.overview) 
                : t('noDescription')
              }
            </p>
            <button className="hero-more-btn" onClick={() => navigate(`/movie/${heroMovie.id}`)}>
              <Info size={18} /> {t('moreInfo')}
            </button>
          </div>
        </div>
      )}

      {/* ✨ БЛОК РЕКОМЕНДАЦІЙ ШТУЧНОГО ІНТЕЛЕКТУ ✨ */}
      {userEmail && (
        <div className="home-section">
          <h2>
            {t('recommendations')}
            <span className="ai-badge">SVD AI</span>
          </h2>

          {isLoadingRecs ? (
            /* Використовуємо ту саму сітку для скелетонів завантаження */
            <div className="movies-grid-layout">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="movie-card" style={{ background: 'rgba(255,255,255,0.05)', aspectRatio: '2/3', borderRadius: '12px', animation: 'pulse 1.5s infinite' }}></div>
              ))}
            </div>
          ) : recommendedMovies.length > 0 ? (
            /* 🔥 ТУТ: Абсолютно та ж сама сітка та структура карток, що й у Популярних! */
            <div className="movies-grid-layout">
              {recommendedMovies.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id}>
                  <div className="movie-card">
                    <img
                      src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'}
                      alt={movie.title}
                    />
                    <span className="movie-title">{movie.title}</span>
                    <span className="movie-meta">
                      {movie.release_date?.substring(0, 4) || '----'} • {movie.vote_average?.toFixed(1)}★
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-recs-banner">
              <p>{t('notEnoughRatings')}</p>
            </div>
          )}
        </div>
      )}

      {/* 📊 СЕКЦІЯ: ПОПУЛЯРНО НА MOON */}
      <div className="home-section" style={{ paddingBottom: '40px' }}>
          <h2>{t('popularTitle', 'Популярно на MOON')}</h2>
          
          <div className="movies-grid-layout">
              {popularMovies.map(movie => (
                  <Link to={`/movie/${movie.id}`} key={movie.id}>
                      <div className="movie-card">
                          <img 
                              src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'} 
                              alt={movie.title} 
                          />
                          <span className="movie-title">{movie.title}</span>
                          <span className="movie-meta">
                              {movie.release_date?.substring(0, 4) || '----'} • {movie.vote_average?.toFixed(1)}★
                          </span>
                      </div>
                  </Link>
              ))}
          </div>
      </div>

    </div>
  );
};

export default Home;