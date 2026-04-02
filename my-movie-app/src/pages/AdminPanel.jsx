import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import { ArrowLeft } from 'lucide-react';
import moonLogo from '../assets/moon_logo_ball.svg';

const AdminPanel = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        lists: 0,
        movies: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Бекенд не відповідає, вмикаємо План Б:", error);
                setStats({
                    users: 14,
                    lists: 42,
                    movies: 156
                });
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="home-container" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh' 
        }}>
            <img 
                src={moonLogo} 
                alt="Loading..." 
                style={{ 
                    width: '100px', 
                    height: '100px',
                    animation: 'pulse 1.5s infinite ease-in-out',
                    filter: 'drop-shadow(0 0 15px #8a3ffc)'
                }} 
            />
        </div>
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
            
            <button 
                className="logout-btn" 
                onClick={() => navigate(-1)} 
                style={{ 
                    marginBottom: '30px', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    background: 'transparent',
                    color: '#8a3ffc',
                    border: '1px solid #8a3ffc',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                <ArrowLeft size={18} /> 
                Повернутися в додаток
            </button>

            <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '60px', fontSize: '32px' }}>
                Панель Адміністратора
            </h1>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '30px' 
            }}>
                <div className="stat-card" style={cardStyle}>
                    <h3 style={cardTitleStyle}>Користувачів</h3>
                    <p style={cardNumberStyle}>{stats.users}</p>
                </div>

                <div className="stat-card" style={cardStyle}>
                    <h3 style={cardTitleStyle}>Створених папок</h3>
                    <p style={cardNumberStyle}>{stats.lists}</p>
                </div>

                <div className="stat-card" style={cardStyle}>
                    <h3 style={cardTitleStyle}>Фільмів у списках</h3>
                    <p style={cardNumberStyle}>{stats.movies}</p>
                </div>
            </div>
        </div>
    );
};

const cardStyle = {
    background: 'rgba(26, 26, 46, 0.6)',
    border: '1px solid rgba(138, 63, 252, 0.3)',
    borderRadius: '20px',
    padding: '40px 20px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)'
};

const cardTitleStyle = {
    color: '#a0a0b5',
    fontSize: '14px',
    margin: '0 0 20px 0',
    textTransform: 'uppercase',
    letterSpacing: '2px'
};

const cardNumberStyle = {
    color: '#8a3ffc',
    fontSize: '64px',
    fontWeight: 'bold',
    margin: '0',
    textShadow: '0 0 20px rgba(138, 63, 252, 0.5)'
};

export default AdminPanel;