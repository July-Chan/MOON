import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import moonLogo from '../assets/moon_logo.svg';


const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/register', { email, password });
            
            setSuccess('Успішно! Зараз ви будете перенаправлені на вхід... ');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else {
                setError('Сталася помилка при реєстрації.');
            }
        }
    };

    return (
        <div style={{ 
            maxWidth: '460px', 
            margin: '80px auto', 
            padding: '30px 40px',
            background: '#1a1a2e', 
            border: '1px solid rgba(138, 63, 252, 0.3)', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', 
            borderRadius: '15px', 
            fontFamily: 'Inter, sans-serif',
            color: 'white'
        }}>
            <h2 style={{ display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                marginBottom: '25px', 
                fontSize: '24px',
                margin: '0 0 25px 0',
                whiteSpace: 'nowrap' }}>Реєстрація у
                
                <img 
                    src={moonLogo} 
                    alt="Moon Logo" 
                    style={{ 
                     height: '28px',
                     filter: 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))'
                    }} 
                />

            </h2>
            
            {error && <div style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
            {success && <div style={{ color: '#4CAF50', background: 'rgba(76, 175, 80, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{success}</div>}
            
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '8px' }}>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="your@email.com"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                    />
                </div>
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '8px' }}>Пароль (мін. 8 симв.):</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        minLength={8} 
                        placeholder="••••••••"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#8a3ffc', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                    Створити акаунт
                </button>
            </form>
            
            <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
                Вже є акаунт? <Link to="/login" style={{ color: '#8a3ffc', textDecoration: 'none', fontWeight: 'bold' }}>Увійти</Link>
            </p>
        </div>
    );
};

export default Register;