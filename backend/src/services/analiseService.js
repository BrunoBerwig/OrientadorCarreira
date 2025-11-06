// projeto/backend/src/services/analiseService.js (COMPLETO E CORRIGIDO)
import { query } from '../config/dbConfig.js';

/**
 * @param {number} usuarioId
 * @param {string} nomeUsuario
 * @param {string} emailUsuario 
 * @param {object} respostas
 * @returns {Promise<object>}
 */
export async function salvarRespostas(usuarioId, nomeUsuario, emailUsuario, respostas) { 
    // ... (Mantido da sua estrutura)
    const text = 'INSERT INTO analises(usuario_id, nome_usuario, email_usuario, respostas_json) VALUES($1, $2, $3, $4) RETURNING id, data_criacao;';
    const values = [usuarioId, nomeUsuario, emailUsuario, respostas]; 

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

/**
 * NOVO: Busca o histórico de análises pelo ID do usuário.
 * @param {number} usuarioId
 * @returns {Promise<Array<object>>} Lista de análises formatadas.
 */
export async function buscarHistoricoPorUsuario(usuarioId) {
    const text = `
        SELECT 
            id,
            data_criacao AS "dataCriacao",
            pdf_url AS "pdfUrl",
            CASE WHEN sugestao_ia IS NOT NULL THEN 'Concluído' ELSE 'Processando' END AS status 
        FROM analises 
        WHERE usuario_id = $1
        ORDER BY data_criacao DESC;
    `;
    const values = [usuarioId];

    const result = await query(text, values);
    return result.rows;
}