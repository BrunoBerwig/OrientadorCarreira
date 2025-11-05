import { query } from '../config/dbConfig.js';

/**
 * @param {number} usuarioId
 * @param {string} nomeUsuario
 * @param {string} emailUsuario // <-- MUDANÇA AQUI
 * @param {object} respostas
 * @returns {Promise<object>}
 */
export async function salvarRespostas(usuarioId, nomeUsuario, emailUsuario, respostas) { // <-- MUDANÇA AQUI
    
    // CORREÇÃO: Adicionada a coluna 'email_usuario' e o valor $3
    const text = 'INSERT INTO analises(usuario_id, nome_usuario, email_usuario, respostas_json) VALUES($1, $2, $3, $4) RETURNING id, data_criacao;'; // <-- MUDANÇA AQUI
    
    const values = [usuarioId, nomeUsuario, emailUsuario, respostas]; // <-- MUDANÇA AQUI

    const result = await query(text, values);
    return result.rows[0];
}

/**
 * @param {number} analiseId
 * @param {object} sugestaoIA
 * @param {string} pdfUrl 
 */
export async function atualizarAnalise(analiseId, sugestaoIA, pdfUrl) {
    
    // CORREÇÃO: Query colocada em linha única com aspas simples.
    const text = 'UPDATE analises SET sugestao_ia = $1, pdf_url = $2 WHERE id = $3;';
    
    const values = [sugestaoIA, pdfUrl, analiseId];

    await query(text, values);
}