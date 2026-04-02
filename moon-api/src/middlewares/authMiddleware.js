import jwt from 'jsonwebtoken';

const secretKey = 'super_secret_moon_key_123';

export const authenticateToken = (req, res, next) => {
  
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Доступ заборонено (401). Токен відсутній.' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        
        req.user = decoded; 
        
        next(); 
    } catch (error) {
        return res.status(401).json({ error: 'Недійсний або прострочений токен (401).' });
    }
};

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ заборонено (403). Потрібні права адміністратора.' });
    }
    next();
};