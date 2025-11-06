// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    let token;

    // 1. Verifica se o token está no cabeçalho Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extrai o token da string 'Bearer <token>'
            token = req.headers.authorization.split(' ')[1];

            // 3. Verifica o token e decodifica o payload (que deve conter o ID do usuário)
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SEGREDO_MUITO_SECRETO');

            // 4. Importante: Injeta o ID do usuário na requisição
            req.user = { id: decoded.id }; 
            
            // 5. Continua para o próximo middleware/controller
            next();

        } catch (error) {
            console.error('Erro de autorização:', error);
            return res.status(401).json({ message: 'Não autorizado, token inválido ou expirado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, token não fornecido.' });
    }
};

module.exports = { protect };