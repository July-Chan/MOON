import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FolderOpen, ArrowLeft, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../App.css';
import moonLogo from '../assets/moon_logo_ball.svg';

const FolderView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(); 
    
    const [folderDetails, setFolderDetails] = useState(null);
    const [localizedMovies, setLocalizedMovies] = useState([]); // 🔥 Стейт для збереження динамічних перекладів
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const userEmail = localStorage.getItem('userEmail');

    const API_KEY = 'c8282b948e28647029c446fa9bef20f8';

    // 1. Завантажуємо базові дані папки з твого бекенду
    useEffect(() => {
        const fetchFolder = async () => {
            try {
                const res = await axios.get(`https://moon-z1lm.onrender.com/api/lists?userId=${userEmail}`);
                const currentFolder = res.data.find(list => list.id === id);
                setFolderDetails(currentFolder);
            } catch (error) {
                console.error("Помилка завантаження папки:", error);
            } finally {
                setLoading(false);
            }
        };
        if (userEmail) fetchFolder();
    }, [id, userEmail]);

    // 🔥 2. МАГІЯ ДИНАМІЧНОГО ПЕРЕКЛАДУ: Хук відстежує зміну мови або масиву фільмів
    useEffect(() => {
        const fetchTranslations = async () => {
            if (!folderDetails?.movies || folderDetails.movies.length === 0) {
                setLocalizedMovies([]);
                return;
            }

            const currentLang = i18n.language || '';
            const langParam = currentLang.includes('uk') || currentLang.includes('ua') ? 'uk-UA' : 'en-US';

            try {
                // Робимо паралельні запити до TMDB для кожного фільму в папці
                const translatedPromises = folderDetails.movies.map(async (movie) => {
                    try {
                        const tmdbRes = await axios.get(
                            `https://api.themoviedb.org/3/movie/${movie.tmdbId}?api_key=${API_KEY}&language=${langParam}`
                        );
                        return {
                            ...movie,
                            title: tmdbRes.data.title || movie.title, // Свіжий переклад або фолбек на старий
                            posterPath: tmdbRes.data.poster_path 
                                ? `https://image.tmdb.org/t/p/w500${tmdbRes.data.poster_path}` 
                                : movie.posterPath
                        };
                    } catch (err) {
                        console.error(`Не вдалося оновити мову для фільму ${movie.tmdbId}:`, err);
                        return movie; // Якщо TMDB ліг — повертаємо збережені дані
                    }
                });

                const updatedMovies = await Promise.all(translatedPromises);
                setLocalizedMovies(updatedMovies); // Записуємо перекладені фільми в стейт
            } catch (error) {
                console.error("Помилка масового перекладу списку:", error);
            }
        };

        fetchTranslations();
    }, [folderDetails?.movies, i18n.language]); // Хук спрацює щоразу, коли ти тиснеш на UA/EN або додаєш/видаляєш фільм

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        
        const currentLang = i18n.language || '';
        const langParam = currentLang.includes('uk') || currentLang.includes('ua') ? 'uk-UA' : 'en-US';

        try {
            const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}&language=${langParam}`);
            setSearchResults(res.data.results);
        } catch (error) {
            console.error("Помилка пошуку:", error);
        }
    };

    const handleAddMovie = async (movie) => {
        const isDuplicate = folderDetails.movies?.some(m => m.tmdbId === movie.id);
        if (isDuplicate) {
            alert(t('movieAlreadyInFolder', 'Цей фільм вже є у папці.'));
            return;
        }
        const movieData = {
            tmdbId: movie.id,
            title: movie.title,
            posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            releaseDate: movie.release_date || 'Невідомо' 
        };
        try {
            await axios.post(`https://moon-z1lm.onrender.com/api/lists/${id}/movies`, movieData);
            setFolderDetails(prev => ({
                ...prev,
                movies: [...prev.movies, movieData]
            }));
            setSearchResults([]);
            setSearchQuery('');
        } catch (error) {
            console.error("Помилка додавання:", error);
        }
    };

    const handleDeleteMovie = async (tmdbId) => {
        if (!window.confirm(t('confirmRemoveMovie', 'Дійсно хочеш прибрати цей фільм з папки?'))) return; 
        try {
            await axios.delete(`https://moon-z1lm.onrender.com/api/lists/${id}/movies/${tmdbId}`);
            setFolderDetails(prev => ({
                ...prev,
                movies: prev.movies.filter(movie => movie.tmdbId !== tmdbId)
            }));
        } catch (error) {
            console.error("Помилка видалення фільму:", error);
        }
    };

    if (loading) return (
        <div className="home-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <img src={moonLogo} alt="Loading..." style={{ width: '100px', height: '100px', animation: 'pulse 1.5s infinite ease-in-out', filter: 'drop-shadow(0 0 15px #8a3ffc)' }} />
        </div>
    );

    if (!folderDetails) return (
        <div className="home-container" style={{ textAlign: 'center', paddingTop: '100px', color: 'white' }}>
            <h2>{t('folderNotFound', 'Папку не знайдено')}</h2>
            <button onClick={() => navigate('/')} className="logout-btn">{t('backToHome', 'Повернутись на головну')}</button>
        </div>
    );

    return (
        <div className="home-container" style={{ padding: '80px 40px 40px', minHeight: '100vh' }}>
            <button className="logout-btn" onClick={() => navigate(-1)} style={{ marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'transparent', color: '#8a3ffc', border: '1px solid #8a3ffc' }}>
                <ArrowLeft size={18} /> {t('backToFolders', 'Назад до папок')}
            </button>
            
            <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '32px' }}>
                <FolderOpen size={40} color="#6a5acd" /> {folderDetails.name}
            </h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '40px' }}>
                <form 
                    onSubmit={handleSearch} 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '20px', 
                        padding: '6px 18px', 
                        border: '1px solid rgba(138, 63, 252, 0.3)',
                        transition: 'all 0.3s ease',
                        width: '100%',
                        maxWidth: '400px'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#8a3ffc'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(138, 63, 252, 0.3)'}
                >
                    <Search size={18} color="#a0a0b5" />
                    <input
                        type="text"
                        placeholder={t('searchMoviePlaceholder', 'Шукати фільм...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: 'white', 
                            padding: '8px 12px', 
                            width: '100%', 
                            outline: 'none', 
                            fontSize: '16px', 
                            fontFamily: 'Inter, sans-serif' 
                        }}
                    />
                    {searchQuery && (
                        <X 
                            size={18} 
                            color="#a0a0b5" 
                            style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                            onMouseEnter={(e) => e.target.style.color = 'white'}
                            onMouseLeave={(e) => e.target.style.color = '#a0a0b5'}
                            onClick={() => { setSearchQuery(''); setSearchResults([]); }} 
                        />
                    )}
                </form>

                <button 
                    onClick={handleSearch} 
                    style={{
                        padding: '0 25px', 
                        borderRadius: '20px', 
                        backgroundColor: '#8a3ffc', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        fontSize: '15px',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 15px rgba(138, 63, 252, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#9b59b6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#8a3ffc';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {t('searchBtn', 'Шукати')}
                </button>
            </div>

            {/* РЕЗУЛЬТАТИ ПОШУКУ */}
            {searchResults.length > 0 && (
                <div style={{
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                    gap: '20px', 
                    padding: '20px', 
                    backgroundColor: 'rgba(26, 26, 46, 0.4)', 
                    borderRadius: '15px', 
                    marginBottom: '40px'
                }}>
                    {searchResults.map(movie => (
                        <div key={movie.id} 
                             className="search-item-card" 
                             onClick={() => handleAddMovie(movie)}
                             style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div className="poster-container" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                                <img 
                                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : 'https://placehold.co/200x300/2a2a4a/ffffff?text=No+Poster'} 
                                    alt="poster" 
                                    style={{ width: '100%', display: 'block', transition: '0.3s' }} 
                                />
                                <div className="hover-overlay" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(138, 63, 252, 0.4)', opacity: 0, transition: '0.3s', color: 'white', fontWeight: 'bold' }}>
                                    + {t('addBtn', 'ДОДАТИ')}
                                </div>
                            </div>
                            <p style={{ color: 'white', fontSize: '12px', marginTop: '8px', height: '30px', overflow: 'hidden' }}>{movie.title}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* СПИСОК ФІЛЬМІВ У ПАПЦІ (Тепер рендериться з локалізованого масиву) */}
            <div className="movies-grid-layout">
                {localizedMovies.map((movie, index) => (
                    <div key={index} className="movie-card">
                        
                        {/* Кнопка видалення (завжди видима) */}
                        <button className="delete-movie-btn" onClick={() => handleDeleteMovie(movie.tmdbId)}>
                            ✕
                        </button>
                        
                        <Link to={`/movie/${movie.tmdbId}`}>
                            <div className="poster-hover">
                                <img src={movie.posterPath} alt={movie.title} />
                            </div>
                            <span className="movie-title">
                                {movie.title}
                            </span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderView;