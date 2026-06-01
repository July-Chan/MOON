import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Search, X } from 'lucide-react';
import axios from 'axios';
import moonLogo from '../assets/moon_logo.svg';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const { t, i18n } = useTranslation();

  // 🔍 СТЕЙТИ ДЛЯ ПОШУКУ
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Закриття випадаючого списку при кліку поза ним
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(newLang);
  };

  // 🚀 ФУНКЦІЯ ПОШУКУ
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const API_KEY = 'c8282b948e28647029c446fa9bef20f8'; 
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchQuery}&language=${i18n.language === 'uk' ? 'uk-UA' : 'en-US'}`);
      // Беремо лише перші 5 результатів для компактного меню
      setSearchResults(res.data.results.slice(0, 5));
      setIsSearchOpen(true);
    } catch (error) {
      console.error("Помилка пошуку:", error);
    }
  };

  // Перехід на фільм і очищення пошуку
  const handleSelectMovie = (id) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    navigate(`/movie/${id}`);
  };

  return (
    <nav style={{
      position: 'fixed',     
      top: 0,
      left: 0,
      width: '100%',         
      boxSizing: 'border-box', 
      zIndex: 9999,          
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 50px', 
      background: 'rgba(15, 15, 26, 0.95)', 
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(138, 63, 252, 0.2)',
    }}>
      
      {/* 🌕 ЛОГОТИП */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <img 
          src={moonLogo} 
          alt="Moon Logo" 
          style={{ 
            height: '22px', 
            display: 'block',
            filter: 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))' 
          }} 
        />
      </Link>

      {/* 🔎 РЯДОК ПОШУКУ (ПО ЦЕНТРУ) */}
      <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '400px', margin: '0 30px' }}>
        <form 
          onSubmit={handleSearch} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'rgba(255,255,255,0.05)', 
            borderRadius: '20px', 
            padding: '6px 15px', 
            border: '1px solid rgba(138, 63, 252, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#8a3ffc'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(138, 63, 252, 0.3)'}
        >
          <Search size={16} color="#a0a0b5" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              padding: '6px 10px', 
              width: '100%', 
              outline: 'none', 
              fontSize: '14px', 
              fontFamily: 'Inter, sans-serif' 
            }}
          />
          {searchQuery && (
            <X 
              size={16} 
              color="#a0a0b5" 
              style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
              onMouseEnter={(e) => e.target.style.color = 'white'}
              onMouseLeave={(e) => e.target.style.color = '#a0a0b5'}
              onClick={() => { setSearchQuery(''); setIsSearchOpen(false); }} 
            />
          )}
        </form>

        {/* 📋 ВИПАДАЮЧИЙ СПИСОК РЕЗУЛЬТАТІВ */}
        {isSearchOpen && searchResults.length > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '110%', 
            left: 0, 
            right: 0, 
            background: '#141424', 
            border: '1px solid rgba(138,63,252,0.4)', 
            borderRadius: '15px', 
            overflow: 'hidden', 
            boxShadow: '0 15px 40px rgba(0,0,0,0.9)',
            animation: 'fadeIn 0.2s ease-out',
            fontFamily: 'Inter, sans-serif'
          }}>
            {searchResults.map(movie => (
              <div 
                key={movie.id} 
                onClick={() => handleSelectMovie(movie.id)} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '10px 15px', 
                  cursor: 'pointer', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  transition: 'background 0.2s' 
                }} 
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(138,63,252,0.15)'} 
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <img 
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : 'https://placehold.co/92x138/1a1a2e/ffffff?text=No+Poster'} 
                  alt={movie.title} 
                  style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginRight: '15px' }} 
                />
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '14px', fontFamily: 'Inter, sans-serif' }}>
                    {movie.title}
                  </h4>
                  <span style={{ color: '#8a3ffc', fontSize: '12px', fontWeight: 'bold' }}>
                    {movie.release_date?.substring(0, 4)} • {movie.vote_average?.toFixed(1)}★
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🧭 КНОПКИ НАВІГАЦІЇ + ЗМІНА МОВИ */}
      <div style={{ display: 'flex', gap: '15px', flexShrink: 0, alignItems: 'center' }}>
        <Link 
          to="/" 
          style={{
            ...linkStyle,
            color: isActive('/') ? '#8a3ffc' : '#a0a0b5',
            background: isActive('/') ? 'rgba(138, 63, 252, 0.12)' : 'transparent',
          }}
        >
          <Home size={18} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive('/') ? '700' : '500' }}>
              {t('home')}
            </span>
        </Link>

        <Link 
          to="/account" 
          style={{
            ...linkStyle,
            color: isActive('/account') ? '#8a3ffc' : '#a0a0b5',
            background: isActive('/account') ? 'rgba(138, 63, 252, 0.12)' : 'transparent',
          }}
        >
          <User size={18} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive('/account') ? '700' : '500' }}>
              {t('account')}
            </span>
        </Link>

        {/* 🌐 КНОПКА ЗМІНИ МОВИ */}
        <button
          onClick={toggleLanguage}
          style={{
            background: 'transparent',
            border: '1px solid rgba(138, 63, 252, 0.5)',
            color: '#a0a0b5',
            padding: '8px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 'bold',
            fontSize: '13px',
            letterSpacing: '1px',
            transition: 'all 0.25s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '45px',
            marginLeft: '5px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#8a3ffc';
            e.currentTarget.style.background = 'rgba(138, 63, 252, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#a0a0b5';
            e.currentTarget.style.borderColor = 'rgba(138, 63, 252, 0.5)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {i18n.language === 'uk' ? 'EN' : 'UA'}
        </button>
      </div>
    </nav>
  );
};

const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  padding: '10px 18px',
  borderRadius: '12px',
  fontSize: '15px',
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.4px', 
  transition: 'all 0.25s ease',
};

export default Navbar;