import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { auth, provider } from '../firebase'; 
import { signInWithPopup } from 'firebase/auth';
import moonLogo from '../assets/moon_logo.svg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;
            
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', email.split('@')[0]);

            login(token); 
            navigate('/');
        } catch (err) {
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Сталася помилка при вході. Спробуйте ще раз.');
            }
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const googleUser = result.user; 

            const response = await api.post('/auth/google', { 
                email: googleUser.email,
                uid: googleUser.uid 
            });

            const { token } = response.data;

            localStorage.setItem('userToken', token);
            localStorage.setItem('userEmail', googleUser.email);
            localStorage.setItem('userName', googleUser.displayName || googleUser.email.split('@')[0]);

            login(token); 
            navigate('/');
        } catch (err) {
            setError('Помилка входу через Google');
            console.error(err);
        }
    };

    return (
        <div style={{ 
            maxWidth: '400px', 
            margin: '80px auto', 
            padding: '30px', 
            background: '#1a1a2e',
            border: '1px solid rgba(138, 63, 252, 0.3)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            borderRadius: '15px', 
            fontFamily: 'Inter, sans-serif',
            color: 'white' 
        }}>
            
            {/* 2. ОНОВЛЕНИЙ ЗАГОЛОВОК З ЛОГОТИПОМ */}
            <h2 style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px', /* Відстань між текстом і картинкою */
                marginBottom: '25px', 
                fontSize: '28px',
                margin: '0 0 25px 0'
            }}>
                Вхід у 
                <img 
                    src={moonLogo} 
                    alt="Moon Logo" 
                    style={{ 
                        height: '35px', /* Розмір іконки підігнаний під текст */
                        filter: 'drop-shadow(0 0 8px rgba(138, 63, 252, 0.6))' /* Легке фіолетове світіння */
                    }} 
                />
            </h2>
            
            {error && <div style={{ color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
            
            <form onSubmit={handleLogin}>
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
                    <label style={{ fontSize: '14px', opacity: 0.8, display: 'block', marginBottom: '8px' }}>Пароль:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="••••••••"
                        style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                    />
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#8a3ffc', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }}>
                    Увійти
                </button>
                
                <div style={{ textAlign: 'center', margin: '15px 0', opacity: 0.5, fontSize: '14px' }}>або</div>

                <button onClick={handleGoogleLogin} type="button" style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: '0.3s' }}>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{marginRight: '10px', width: '20px'}}/>
                    Увійти через Google
                </button>
            </form>
            
            <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px', opacity: 0.8 }}>
                Ще немає акаунта? <Link to="/register" style={{ color: '#8a3ffc', textDecoration: 'none', fontWeight: 'bold' }}>Зареєструватися</Link>
            </p>
        </div>
    );
};

export default Login;