// backend/src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

export function protect(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido ou formato incorreto.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id; 
        req.userName = decoded.nome;
        req.userEmail = decoded.email; // <-- MUDANÇA AQUI
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Token expirado. Por favor, faça login novamente.' });
        }
        return res.status(401).json({ message: 'Token inválido ou corrompido.' });
    }
}