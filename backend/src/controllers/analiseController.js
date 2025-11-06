// projeto/backend/src/controllers/analiseController.js (VERSÃO FINAL COM RESILIÊNCIA A DADOS ANTIGOS)
import { salvarRespostas, atualizarAnalise, buscarHistoricoPorUsuario } from '../services/analiseService.js';
import { analisarComIA } from '../services/iaService.js';
import { gerarRelatorioPDF } from '../services/pdfService.js';

export async function iniciarAnalise(req, res) {
    const usuarioId = req.userId; 
    const nomeUsuario = req.userName; 
    const emailUsuario = req.userEmail; 
    const { respostas } = req.body; 

    if (!respostas) {
        return res.status(400).json({ message: "Dados do formulário incompletos (respostas ausentes)." });
    }

    let analiseId;

    try {
        const result = await salvarRespostas(usuarioId, nomeUsuario, emailUsuario, respostas); 
        analiseId = result.id;
        
        const sugestaoIA = await analisarComIA(respostas);

        const pdfFileName = `relatorio_${usuarioId}_${analiseId}_${Date.now()}.pdf`;
        
        // pdfPath agora recebe APENAS o nome do arquivo (pdfFileName)
        const nomeDoArquivo = await gerarRelatorioPDF(sugestaoIA, nomeUsuario, pdfFileName); 

        // Salva o nome do arquivo no banco (no campo pdf_url)
        await atualizarAnalise(analiseId, sugestaoIA, nomeDoArquivo); 
        
        return res.status(201).json({ 
            message: "Análise concluída e relatório gerado com sucesso!", 
            // Monta a URL correta para o frontend usar (ex: /download/relatorio_1_7.pdf)
            pdfUrl: `/download/${nomeDoArquivo}`, 
            analiseId: analiseId
        });

    } catch (error) {
        console.error(`ERRO no processamento da Análise ${analiseId || 'nova'}:`, error);
        return res.status(500).json({ 
            message: "Erro interno no processamento da análise.",
            details: error.message 
        });
    }
}

export async function getHistoricoAnalises(req, res) {
    const usuarioId = req.userId;

    try {
        const historico = await buscarHistoricoPorUsuario(usuarioId);

        // Mapeia o histórico para corrigir URLs antigas e garantir o prefixo /api
        const historicoMapeado = historico.map(analise => {
            let nomeArquivo = analise.pdfUrl;

            // Lógica de resiliência: Se o path contém separadores de diretório ou dois pontos, 
            // é um caminho absoluto (registro antigo). Extrai o nome do arquivo.
            if (nomeArquivo && (nomeArquivo.includes('/') || nomeArquivo.includes('\\') || nomeArquivo.includes(':'))) {
                // Extrai o nome do arquivo após a última barra (funciona para Windows e Linux paths)
                nomeArquivo = nomeArquivo.split(/[/\\]/).pop(); 
            }

            return {
                ...analise,
                // Monta a URL completa esperada pelo frontend, incluindo o prefixo /api
                pdfUrl: `/api/download/${nomeArquivo}` 
            };
        });

        return res.status(200).json({
            historico: historicoMapeado 
        });

    } catch (error) {
        console.error(`ERRO ao buscar histórico do usuário ${usuarioId}:`, error);
        return res.status(500).json({
            message: "Erro interno ao buscar o histórico de análises."
        });
    }
}