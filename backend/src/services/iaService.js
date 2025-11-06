import { GoogleGenAI } from '@google/genai'; 
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "") {
    console.error("ERRO CRÍTICO: GEMINI_API_KEY não está definida no .env ou está vazia.");
    throw new Error("GEMINI_API_KEY não configurada."); 
}

const ai = new GoogleGenAI({ apiKey }); 

const SYSTEM_PROMPT = `
Você é um Orientador de Carreira Sênior e Analista de Perfil Profissional.
Sua tarefa é analisar cuidadosamente as respostas fornecidas por um indivíduo e gerar uma análise de carreira detalhada.
O output DEVE ser um objeto JSON válido, aderindo estritamente ao seguinte esquema:
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
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: fullPrompt, 
            config: {
                responseMimeType: "application/json",
            }
        });
        const jsonText = response.text.trim(); 
        
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Erro na comunicação com a Gemini API:", error);
        
        if (error instanceof SyntaxError) {
             console.error("ERRO DE SINTAXE: A resposta da API não foi um JSON válido.");
        }
        throw new Error('Falha ao gerar análise da IA. Verifique os logs do servidor e a chave da API.');
    }
}