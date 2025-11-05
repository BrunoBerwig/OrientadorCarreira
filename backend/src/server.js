import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { createTables } from './config/dbConfig.js';

// Importa Rotas
import analiseRoutes from './routes/analiseRoutes.js';
import authRoutes from './routes/authRoutes.js'; // NOVO IMPORT

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
// Configuração do CORS para permitir comunicação do Frontend (http://localhost:3000)
app.use(cors({ 
    origin: 'http://localhost:3000' 
}));
app.use(express.json());

// Rotas da API
app.use('/api', analiseRoutes); // Já existia
app.use('/api/auth', authRoutes); // NOVA ROTA DE AUTENTICAÇÃO

app.get('/', (req, res) => {
    res.send('API do Orientador de Carreira rodando!');
});

async function startServer() {
    console.log('Iniciando o Servidor...');
    await createTables(); // Cria/Verifica tabelas no DB

    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

startServer();