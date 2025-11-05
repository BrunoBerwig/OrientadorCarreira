import 'dotenv/config'; 

import pg from 'pg';

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export const query = (text, params) => pool.query(text, params);

export async function createTables() {
    const createUsersTableQuery = `
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            senha_hash VARCHAR(255) NOT NULL,
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    const createAnalisesTableQuery = `
        CREATE TABLE IF NOT EXISTS analises (
            id SERIAL PRIMARY KEY,
            usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE, -- Chave estrangeira
            respostas_json JSONB NOT NULL,
            sugestao_ia JSONB,
            pdf_url VARCHAR(255),
            data_criacao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `;
    
    try {
        console.log('Conectando ao banco de dados...');
        await pool.query(createUsersTableQuery);
        console.log('Tabela "usuarios" verificada/criada com sucesso.');
        
        await pool.query(createAnalisesTableQuery);
        console.log('Tabela "analises" verificada/criada com sucesso (com FK).');

    } catch (err) {
        console.error('ERRO ao criar as tabelas:', err.message);
    }
}