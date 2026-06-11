import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Search, X, Menu, Radar } from 'lucide-react'; // 🔥 Додали Radar
import moonLogo from '../assets/moon_logo.svg';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const { t, i18n } = useTranslation();

  // 🔍 СТЕЙТ ДЛЯ ТЕКСТУ ЗАПИТУ
  const [searchQuery, setSearchQuery] = useState('');

  // 📱 СТЕЙТ ДЛЯ МОБІЛЬНОГО МЕНЮ
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'uk' ? 'en' : 'uk';
    i18n.changeLanguage(newLang);
    setIsMobileMenuOpen(false);
  };

  // 🚀 ФУНКЦІЯ ПОШУКУ
  const handleSearch = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsMobileMenuOpen(false); 
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`); 
    setSearchQuery(''); 
  };

  return (
    <nav className="custom-navbar">
      
      {/* 🌕 ЛОГОТИП */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
        <img 
          src={moonLogo} 
          alt="Moon Logo" 
          style={{ height: '22px', display: 'block', filter: 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))' }} 
        />
      </Link>

      {/* 📱 ГАМБУРГЕР-КНОПКА */}
      <button 
        className="hamburger-menu-btn" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={28} color="#a0a0b5" /> : <Menu size={28} color="#a0a0b5" />}
      </button>

      {/* БЛОК З НАВІГАЦІЄЮ ТА ПОШУКОМ */}
      <div className={`navbar-content ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        
        {/* 🔎 РЯДОК ПОШУКУ */}
        <div className="search-container" style={{ position: 'relative', flex: 1, maxWidth: '400px', margin: '0 30px' }}>
          <div 
            style={{ 
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', 
              borderRadius: '20px', padding: '6px 15px', border: '1px solid rgba(138, 63, 252, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#8a3ffc'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(138, 63, 252, 0.3)'}
          >
            <Search size={16} color="#a0a0b5" onClick={handleSearch} style={{ cursor: 'pointer' }} />
            
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(e); 
                }
              }}
              style={{ 
                background: 'transparent', border: 'none', color: 'white', padding: '6px 10px', 
                width: '100%', outline: 'none', fontSize: '14px', fontFamily: 'Inter, sans-serif' 
              }}
            />
            {searchQuery && (
              <X 
                size={16} color="#a0a0b5" style={{ cursor: 'pointer', transition: 'color 0.2s' }} 
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = '#a0a0b5'}
                onClick={() => setSearchQuery('')} 
              />
            )}
          </div>
        </div>

        {/* 🧭 КНОПКИ НАВІГАЦІЇ + ЗМІНА МОВИ */}
        <div className="nav-links-container" style={{ display: 'flex', gap: '15px', flexShrink: 0, alignItems: 'center' }}>
          
          <Link 
            to="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...linkStyle, color: isActive('/') ? '#8a3ffc' : '#a0a0b5',
              background: isActive('/') ? 'rgba(138, 63, 252, 0.12)' : 'transparent',
            }}
          >
            <Home size={18} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive('/') ? '700' : '500' }}>
              {t('home')}
            </span>
          </Link>

          {/* 📡 НОВА КНОПКА: РАДАР */}
          <Link 
            to="/radar" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...linkStyle, color: isActive('/radar') ? '#8a3ffc' : '#a0a0b5',
              background: isActive('/radar') ? 'rgba(138, 63, 252, 0.12)' : 'transparent',
            }}
          >
            <Radar size={18} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive('/radar') ? '700' : '500' }}>
              {t('radar')}
            </span>
          </Link>

          <Link 
            to="/account" 
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...linkStyle, color: isActive('/account') ? '#8a3ffc' : '#a0a0b5',
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
              background: 'transparent', border: '1px solid rgba(138, 63, 252, 0.5)', color: '#a0a0b5',
              padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              fontWeight: 'bold', fontSize: '13px', letterSpacing: '1px', transition: 'all 0.25s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '45px', marginLeft: '5px'
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
      </div>
    </nav>
  );
};

const linkStyle = {
  display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '10px 18px',
  borderRadius: '12px', fontSize: '15px', fontFamily: 'Inter, sans-serif', letterSpacing: '0.4px', 
  transition: 'all 0.25s ease',
};

export default Navbar;