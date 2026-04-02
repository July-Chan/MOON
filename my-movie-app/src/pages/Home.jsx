import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MyLists from '../components/MyLists'; 
import './Home.css';
import moonLogo from '../assets/moon_logo_ball.svg';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    // Беремо функцію виходу з контексту
    const { logout } = useContext(AuthContext);

    const navigate = useNavigate();
    
    // БЕРЕМО ПОШТУ ТА ІМ'Я З LOCAL STORAGE
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName') || 'User'; // Додали змінну userName!

    // Проста функція для кнопки виходу
    const handleLogout = () => {
        logout();
    };

    return (
        <div className="home-container">
            <div className="home-header">
                <div className="user-info">
                    <h1>Hello, {userName}!</h1>
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
                  Панель адміністратора
              </button>
          )}

            <main className="home-main-content">
                <MyLists />
            </main>

            <button onClick={handleLogout} className="logout-btn">
                Вийти
            </button>
        </div>
    );
};

export default Home;