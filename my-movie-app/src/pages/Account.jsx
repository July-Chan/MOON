import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import MyLists from '../components/MyLists'; 
import './Account.css';
import moonLogo from '../assets/moon_logo_ball.svg';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Account = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || t('defaultUserName', 'User'); // Переклали ім'я за замовчуванням

    const [ratedMovies, setRatedMovies] = useState([]);

    useEffect(() => {
            const fetchAndTranslateRatings = async () => {
                if (!userEmail) return;

                try {
                    // 1. Отримуємо збережені оцінки з бази (зі статичними назвами)
                    const res = await fetch(`https://moon-z1lm.onrender.com/api/users/${userEmail}/ratings`);
                    const data = await res.json();

                    if (Array.isArray(data) && data.length > 0) {
                        // 2. Формуємо мову для TMDB
                        const currentLang = i18n.language || '';
                        const langParam = currentLang.includes('uk') || currentLang.includes('ua') ? 'uk-UA' : 'en-US';
                        const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb'; // Твій ключ TMDB

                        // 3. Для кожного фільму просимо в TMDB актуальну назву
                        const translatedPromises = data.map(async (movie) => {
                            try {
                                const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.movieId}?api_key=${TMDB_API_KEY}&language=${langParam}`);
                                const tmdbData = await tmdbRes.json();
                                
                                return {
                                    ...movie, // Беремо твою оцінку, дату і т.д.
                                    title: tmdbData.title || movie.title, // 🔥 ПІДМІНЯЄМО НАЗВУ НА ПЕРЕКЛАДЕНУ
                                    poster_path: tmdbData.poster_path || movie.poster_path
                                };
                            } catch (err) {
                                return movie; // Якщо TMDB не відповів, залишаємо стару назву
                            }
                        });

                        // 4. Чекаємо, поки перекладуться всі фільми, сортуємо і зберігаємо
                        const translatedMovies = await Promise.all(translatedPromises);
                        const sorted = translatedMovies.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                        
                        setRatedMovies(sorted);
                    } else {
                        setRatedMovies([]);
                    }
                } catch (err) {
                    console.error("Помилка завантаження оцінених фільмів:", err);
                }
            };

            fetchAndTranslateRatings();
        }, [userEmail, i18n.language]); // 🔥 РЕАГУЄ НА ЗМІНУ МОВИ

        const handleLogout = () => {
            logout();
        };

    return (
        <div className="home-container" style={{ paddingTop: '80px' }}>
            <div className="home-header">
                <div className="user-info">
                    {/* 🔥 Переклали привітання */}
                    <h1>{t('helloUser', 'Hello, {{name}}!', { name: userName })}</h1>
                    <span className="user-email">{userEmail}</span>
                </div>
                
                <img 
                    src={moonLogo} 
                    alt="Moon Icon" 
                    className="header-moon-icon" 
                />
            </div>

            {userEmail === 'musukabuka@gmail.com' && (
              <button 
                  onClick={() => navigate('/admin')}
                  style={{
                      marginTop: '15px',
                      padding: '8px 16px',
                      backgroundColor: 'rgba(138, 63, 252, 0.2)',
                      color: '#b19cd9',
                      border: '1px solid #8a3ffc',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                  }}
                  onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#8a3ffc';
                      e.target.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(138, 63, 252, 0.2)';
                      e.target.style.color = '#b19cd9';
                  }}
              >
                  {/* 🔥 Переклали кнопку адмін-панелі */}
                  {t('adminPanelBtn', 'Панель адміністратора')}
              </button>
            )}

            <main className="home-main-content">
                <MyLists />

                <div style={{ marginTop: '50px', paddingBottom: '20px' }}>
                    <h2 style={{ fontSize: '22px', color: 'white', marginBottom: '20px', borderLeft: '4px solid #8a3ffc', paddingLeft: '15px', textAlign: 'left' }}>
                        {/* 🔥 Переклали заголовок "Оцінені фільми" */}
                        {t('ratedMoviesTitle', 'Оцінені фільми')}
                    </h2>
                    
                    {ratedMovies.length === 0 ? (
                        <p style={{ color: '#a0a0b5', textAlign: 'left', fontStyle: 'italic', paddingLeft: '15px', fontSize: '14px' }}>
                            {/* 🔥 Переклали текст-заглушку */}
                            {t('noRatedMoviesMessage', "Ви ще не оцінили жодного фільму. Твої оцінки з'являться тут автоматично.")}
                        </p>
                    ) : (
                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px', scrollbarWidth: 'thin' }}>
                            {ratedMovies.map(movie => (
                                <div 
                                    key={movie.movieId} 
                                    onClick={() => navigate(`/movie/${movie.movieId}`)}
                                    style={{ flexShrink: 0, width: '140px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <img 
                                        src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://placehold.co/300x450/141424/ffffff?text=No+Poster'} 
                                        alt={movie.title} 
                                        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
                                    />
                                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', color: 'white' }}>
                                        {movie.title}
                                    </h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#8a3ffc', fontWeight: 'bold' }}>
                                        <Star size={13} fill="#8a3ffc" color="#8a3ffc" /> {movie.rating} ★
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <button onClick={handleLogout} className="logout-btn" style={{ marginTop: '40px' }}>
                {t('logoutBtn', 'Вийти')}
            </button>
        </div>
    );
};

export default Account;