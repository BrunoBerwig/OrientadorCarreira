// backend/src/services/userService.js

import { query } from '../config/dbConfig.js';

/**
 * Cria um novo usuário no banco de dados.
 * @param {string} nome
 * @param {string} email
 * @param {string} senhaHash - Senha já criptografada (hash)
 * @returns {Promise<object>} O novo usuário (id, nome, email, data_criacao)
 */
export async function createUser(nome, email, senhaHash) {
    const text = `
        INSERT INTO usuarios(nome, email, senha_hash)
        VALUES($1, $2, $3)
        RETURNING id, nome, email, data_criacao;
    `;
    const values = [nome, email, senhaHash];

    const result = await query(text, values);
    return result.rows[0];
}

/**
 * Busca um usuário pelo email.
 * @param {string} email
 * @returns {Promise<object | null>} O usuário ou null
 */
export async function findUserByEmail(email) {
    const text = 'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = $1;';
    const values = [email];

    const result = await query(text, values);
    return result.rows[0] || null;
}