import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FolderOpen, ArrowLeft } from 'lucide-react';
import '../App.css';
import moonLogo from '../assets/moon_logo_ball.svg';

const FolderView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [folderDetails, setFolderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        const fetchFolder = async () => {
            try {
                const res = await axios.get(`http://localhost:3000/api/lists?userId=${userEmail}`);
                const currentFolder = res.data.find(list => list.id === id);
                setFolderDetails(currentFolder);
            } catch (error) {
                console.error("Помилка завантаження папки:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFolder();
    }, [id, userEmail]);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const API_KEY = 'c8282b948e28647029c446fa9bef20f8'; 
        try {
            const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}`);
            setSearchResults(res.data.results);
        } catch (error) {
            console.error("Помилка пошуку:", error);
        }
    };

    const handleAddMovie = async (movie) => {
        const isDuplicate = folderDetails.movies?.some(m => m.tmdbId === movie.id);
        if (isDuplicate) {
            alert("Цей фільм вже є у папці.");
            return;
        }
        const movieData = {
            tmdbId: movie.id,
            title: movie.title,
            posterPath: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            releaseDate: movie.release_date || 'Невідомо'
        };
        try {
            await axios.post(`http://localhost:3000/api/lists/${id}/movies`, movieData);
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
        if (!window.confirm("Дійсно хочеш прибрати цей фільм з папки?")) return;
        try {
            await axios.delete(`http://localhost:3000/api/lists/${id}/movies/${tmdbId}`);
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
            <h2>Папку не знайдено</h2>
            <button onClick={() => navigate('/')} className="logout-btn">Повернутись на головну</button>
        </div>
    );

    return (
        <div className="home-container" style={{ padding: '20px' }}>
            <button className="logout-btn" onClick={() => navigate(-1)} style={{ marginBottom: '30px', display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'transparent', color: '#8a3ffc', border: '1px solid #8a3ffc' }}>
                <ArrowLeft size={18} /> Назад до папок
            </button>
            
            <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', fontSize: '32px' }}>
                <FolderOpen size={40} color="#6a5acd" /> {folderDetails.name}
            </h1>

            <form onSubmit={handleSearch} style={{display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px'}}>
                <input 
                    type="text" 
                    placeholder="Шукати фільм..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{padding: '12px', borderRadius: '8px', width: '100%', maxWidth: '400px', backgroundColor: '#2a2a4a', color: 'white', border: 'none'}}
                />
                <button type="submit" style={{padding: '12px 24px', borderRadius: '8px', backgroundColor: '#6a5acd', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Шукати</button>
            </form>

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
                                    + ДОДАТИ
                                </div>
                            </div>
                            <p style={{ color: 'white', fontSize: '12px', marginTop: '8px', height: '30px', overflow: 'hidden' }}>{movie.title}</p>
                        </div>
                    ))}
                </div>
            )}

            <h3 style={{color: 'white', marginBottom: '20px'}}>Фільми у списку:</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {folderDetails.movies?.map((movie, index) => (
                    <div key={index} className="movie-card" style={{ width: '160px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <button className="delete-movie-btn" onClick={() => handleDeleteMovie(movie.tmdbId)} style={{ zIndex: 2 }}>✕</button>
                        <Link to={`/movie/${movie.tmdbId}`} style={{ textDecoration: 'none' }}>
                            <div className="poster-hover" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                                <img src={movie.posterPath} alt="poster" style={{ width: '100%', display: 'block' }} />
                            </div>
                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', textAlign: 'center', display: 'block', marginTop: '10px' }}>{movie.title}</span>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderView;