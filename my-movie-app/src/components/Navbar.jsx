import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import moonLogo from '../assets/moon_logo.svg';

const Navbar = () => {
  const location = useLocation();

  // Функція для перевірки, чи активна зараз сторінка
  const isActive = (path) => location.pathname === path;

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
      padding: '12px 50px', // Трохи зменшили вертикальний падінг для компактності
      background: 'rgba(15, 15, 26, 0.95)', 
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(138, 63, 252, 0.2)',
    }}>
      
      {/* 🌕 ЛОГОТИП */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <img 
          src={moonLogo} 
          alt="Moon Logo" 
          style={{ 
            height: '24px', 
            display: 'block',
            filter: 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))' 
          }} 
        />
      </Link>

      {/* 🧭 КНОПКИ НАВІГАЦІЇ */}
      <div style={{ display: 'flex', gap: '15px' }}>
        
        <Link 
          to="/" 
          style={{
            ...linkStyle,
            color: isActive('/') ? '#8a3ffc' : '#a0a0b5',
            background: isActive('/') ? 'rgba(138, 63, 252, 0.12)' : 'transparent',
            fontWeight: isActive('/') ? '700' : '500', // Робимо активний пункт жирнішим
          }}
          onMouseEnter={(e) => {
            if (!isActive('/')) e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            if (!isActive('/')) e.currentTarget.style.color = '#a0a0b5';
          }}
        >
          <Home size={18} />
          <span>Головна</span>
        </Link>

        <Link 
          to="/account" 
          style={{
            ...linkStyle,
            color: isActive('/account') ? '#8a3ffc' : '#a0a0b5',
            background: isActive('/account') ? 'rgba(138, 63, 252, 0.12)' : 'transparent',
            fontWeight: isActive('/account') ? '700' : '500',
          }}
          onMouseEnter={(e) => {
            if (!isActive('/account')) e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            if (!isActive('/account')) e.currentTarget.style.color = '#a0a0b5';
          }}
        >
          <User size={18} />
          <span>Мій Акаунт</span>
        </Link>

      </div>
    </nav>
  );
};

// 🎨 ОНОВЛЕНІ СТИЛІ ШРИФТУ ДЛЯ МАКСИМАЛЬНОЇ ЧИТАБЕЛЬНОСТІ
const linkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  padding: '10px 18px',
  borderRadius: '12px',
  fontSize: '15px',
  // Задаємо чіткий, сучасний набір шрифтів
  fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  letterSpacing: '0.4px', // Додає "повітря" між літерами, що покращує читабельність
  transition: 'all 0.25s ease',
};

export default Navbar;