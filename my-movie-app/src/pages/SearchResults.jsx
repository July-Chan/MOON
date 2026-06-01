import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Search } from 'lucide-react';
import moonLogo from '../assets/moon_logo.svg'; // Використовуємо твій логотип
import '../App.css'; 

const SearchResults = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    // Дістаємо параметр ?q= з адреси (наприклад, /search?q=Матриця)
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }
            
            setLoading(true);
            const API_KEY = 'c8282b948e28647029c446fa9bef20f8'; // Твій ключ TMDB
            const currentLang = i18n.language || '';
            const langParam = currentLang.includes('uk') || currentLang.includes('ua') ? 'uk-UA' : 'en-US';

            try {
                const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=${langParam}`);
                setMovies(res.data.results);
            } catch (error) {
                console.error("Помилка пошуку:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, i18n.language]);

    if (loading) return (
        <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <img src={moonLogo} alt="Loading..." style={{ width: '100px', height: 'auto', animation: 'pulse 1.5s infinite ease-in-out', filter: 'drop-shadow(0 0 15px #8a3ffc)' }} />
        </div>
    );

    return (
        <div className="home-container" style={{ padding: '100px 40px 40px', minHeight: '100vh' }}>
            {/* Кнопка повернення */}
            <button className="logout-btn" onClick={() => navigate(-1)} style={{ marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'transparent', color: '#8a3ffc', border: '1px solid #8a3ffc' }}>
                <ArrowLeft size={18} /> {t('backBtn', 'Назад')}
            </button>
            
            {/* Заголовок запиту */}
            <h2 style={{ fontSize: '28px', color: 'white', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                <Search size={28} color="#8a3ffc" /> 
                {t('searchResultFor', 'Результати для:')} <span style={{ color: '#8a3ffc' }}>"{query}"</span>
            </h2>

            {movies.length === 0 ? (
                <p style={{ color: '#a0a0b5', fontSize: '16px', textAlign: 'left' }}>{t('noResults', 'На жаль, нічого не знайдено.')}</p>
            ) : (
                /* Красива сітка фільмів */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '30px' }}>
                    {movies.map(movie => (
                        <Link to={`/movie/${movie.id}`} key={movie.id} style={{ textDecoration: 'none' }}>
                            <div 
                                className="movie-card" 
                                style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <img 
                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://placehold.co/500x750/1a1a2e/ffffff?text=No+Poster'} 
                                    alt={movie.title} 
                                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}
                                />
                                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', textAlign: 'left', marginTop: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                                    {movie.title}
                                </span>
                                <span style={{ color: '#8a3ffc', fontSize: '12px', fontWeight: 'bold', marginTop: '4px', textAlign: 'left', display: 'block' }}>
                                    {movie.release_date?.substring(0, 4) || '----'} • {movie.vote_average?.toFixed(1)}★
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchResults;