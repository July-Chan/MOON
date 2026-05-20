import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User } from 'lucide-react';
import moonLogo from '../assets/moon_logo.svg';

const Navbar = () => {
  const location = useLocation();
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
      padding: '12px 50px', 
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
            height: '22px', 
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
          }}
        >
          <Home size={18} />
          {/* Прописуємо шрифт прямо на спан з !important через звичайний стиль */}
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: isActive('/') ? '700' : '500' }}>
            Головна
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
            Мій Акаунт
          </span>
        </Link>

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