// backend/src/services/iaService.js (Versão Limpa)

import { GoogleGenerativeAI } from '@google/generative-ai'; 
import 'dotenv/config';

// Verifique se a chave da API está carregada
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "") {
    console.error("ERRO CRÍTICO: GEMINI_API_KEY não está definida no .env ou está vazia.");
    throw new Error("GEMINI_API_KEY não configurada."); 
}

// Inicialização da API
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_PROMPT = `
Você é um Orientador de Carreira Sênior e Analista de Perfil Profissional.
Sua tarefa é analisar cuidadosamente as respostas fornecidas por um indivíduo e gerar uma análise de carreira detalhada.
O output DEVE ser um objeto JSON válido. NÃO inclua \`\`\`json ou \`\`\` no início ou no fim. O output deve ser apenas o JSON bruto.
O JSON DEVE aderir estritamente ao seguinte esquema:
{
  "resumo_perfil": "Um parágrafo conciso sobre o perfil do usuário.",
  "areas_sugeridas": [
    {
      "area": "Nome da Área 1",
      "justificativa": "Descrição do porquê essa área se alinha."
    },
    {
      "area": "Nome da Área 2",
      "justificativa": "Descrição do porquê essa área se alinha."
    },
    {
      "area": "Nome da Área 3",
      "justificativa": "Descrição do porquê essa área se alinha."
    }
  ],
  "plano_desenvolvimento": {
    "titulo": "Plano de Desenvolvimento Inicial (Próximos 6 Meses)",
    "passos": [
      "Passo 1: ...",
      "Passo 2: ...",
      "Passo 3: ...",
      "Passo 4: ..."
    ]
  }
}
`;

/**
 * @param {object} respostas 
 * @returns {Promise<object>}
 */
export async function analisarComIA(respostas) {
    try {
        const respostasFormatadas = `
--- INÍCIO DAS RESPOSTAS DO USUÁRIO ---

**1. Perfil Atual:**
   - Nível de Experiência: ${respostas.nivelExperiencia}
   - Formação: ${respostas.formacao || 'Não informado'}
   - Habilidades Técnicas (Hard Skills): ${respostas.habilidadesTecnicas}
   - Habilidades Comportamentais (Soft Skills): ${respostas.softSkills}

**2. Interesses e Tecnologias:**
   - Áreas de Interesse: ${respostas.areasInteresse}
   - Tecnologias que quer aprender: ${respostas.tecnologiasAprender}
   - Áreas que NÃO tem interesse: ${respostas.areasSemInteresse || 'Não informado'}

**3. Ambiente e Objetivos:**
   - Tipo de Ambiente Preferido: ${respostas.tipoAmbiente}
   - Objetivo de Longo Prazo: ${respostas.objetivoLongoPrazo}
   - O que mais motiva: ${respostas.motivacao || 'Não informado'}

--- FIM DAS RESPOSTAS DO USUÁRIOS ---
`;

        const fullPrompt = `${SYSTEM_PROMPT}\n\nRESPOSTAS DO USUÁRIO:\n${respostasFormatadas}`;
        
        // Usamos o 'gemini-pro', o modelo de texto gratuito e estável
        const model = genAI.getGenerativeModel({
             model: "gemini-pro", 
        }); 

        // Chamada de API simplificada
        const result = await model.generateContent(fullPrompt);

        const response = result.response;
        let jsonText = response.text().trim();

        // Limpa a resposta caso ela venha com ```json
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.substring(7); // Remove ```json
            if (jsonText.endsWith('```')) {
                jsonText = jsonText.substring(0, jsonText.length - 3); // Remove ```
            }
        }
        jsonText = jsonText.trim(); // Limpa espaços extras

        return JSON.parse(jsonText);
        
    } catch (error) {
        console.error("Erro na comunicação com a Gemini API:", error);
        
        if (error instanceof SyntaxError) {
             console.error("ERRO DE SINTAXE: A resposta da API não foi um JSON válido. Verifique o log de erro acima.");
        }

        throw new Error('Falha ao gerar análise da IA. Verifique os logs do servidor e a chave da API.');
    }
}