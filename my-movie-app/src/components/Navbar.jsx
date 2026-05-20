import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Film } from 'lucide-react';
import moonLogo from '../assets/moon_logo_ball.svg';

const Navbar = () => {
  const location = useLocation();

  // Функція для перевірки, чи активна зараз сторінка (щоб підсвічувати потрібну кнопку)
  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 50px',
      background: 'rgba(15, 15, 26, 0.75)', // Напівпрозорий темний фон
      backdropFilter: 'blur(15px)', // Ефект розмитого скла
      borderBottom: '1px solid rgba(138, 63, 252, 0.2)', // Тонка фіолетова лінія знизу
    }}>
      
      {/* 🌕 ЛОГОТИП ТА НАЗВА (клік повертає на головну) */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <img 
          src={moonLogo} 
          alt="MOON Logo" 
          style={{ width: '35px', height: '35px', filter: 'drop-shadow(0 0 8px #8a3ffc)' }} 
        />
        <span style={{ 
          color: 'white', 
          fontSize: '22px', 
          fontWeight: '900', 
          letterSpacing: '3px',
          background: 'linear-gradient(45deg, #ffffff, #8a3ffc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          MOON
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '20px' }}>
        
        <Link to="/" style={{
          ...linkStyle,
          color: isActive('/') ? '#8a3ffc' : '#a0a0b5',
          background: isActive('/') ? 'rgba(138, 63, 252, 0.1)' : 'transparent',
        }}>
          <Home size={18} />
          <span>Головна</span>
        </Link>

        <Link to="/account" style={{
          ...linkStyle,
          color: isActive('/account') ? '#8a3ffc' : '#a0a0b5',
          background: isActive('/account') ? 'rgba(138, 63, 252, 0.1)' : 'transparent',
        }}>
          <User size={18} />
          <span>Мій Акаунт</span>
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
  padding: '8px 16px',
  borderRadius: '10px',
  fontSize: '15px',
  fontWeight: '600',
  transition: 'all 0.3s ease',
};

export default Navbar;