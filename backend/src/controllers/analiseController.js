// backend/src/controllers/analiseController.js
import { salvarRespostas, atualizarAnalise } from '../services/analiseService.js';
import { analisarComIA } from '../services/iaService.js';
import { gerarRelatorioPDF } from '../services/pdfService.js';

export async function iniciarAnalise(req, res) {
    const usuarioId = req.userId; 
    const nomeUsuario = req.userName; 
    const emailUsuario = req.userEmail; // <-- MUDANÇA AQUI
    const { respostas } = req.body; 

    if (!respostas) {
        return res.status(400).json({ message: "Dados do formulário incompletos (respostas ausentes)." });
    }

    let analiseId;

    try {
        // Passa o e-mail do usuário para salvar no banco
        const result = await salvarRespostas(usuarioId, nomeUsuario, emailUsuario, respostas); // <-- MUDANÇA AQUI
        analiseId = result.id;
        
        const sugestaoIA = await analisarComIA(respostas);

        const pdfFileName = `relatorio_${usuarioId}_${analiseId}_${Date.now()}.pdf`;
        const pdfPath = await gerarRelatorioPDF(sugestaoIA, nomeUsuario, pdfFileName); 

        await atualizarAnalise(analiseId, sugestaoIA, pdfPath);
        
        return res.status(201).json({ 
            message: "Análise concluída e relatório gerado com sucesso!", 
            pdfUrl: `/download/${pdfFileName}`, 
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