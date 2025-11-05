import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.join(__dirname, '..', '..', 'reports');

if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR);
}

/**
 * @param {object} sugestaoIA
 * @param {string} nomeUsuario
 * @param {string} fileName
 * @returns {Promise<string>}
 */
export function gerarRelatorioPDF(sugestaoIA, nomeUsuario, fileName) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(REPORTS_DIR, fileName);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        stream.on('finish', () => resolve(filePath));
        stream.on('error', (err) => reject(err));

        doc.info.Title = 'Relatório Orientação de Carreira';
        doc.fontSize(24).text('Relatório de Orientação de Carreira', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(16).text(`Para: ${nomeUsuario}`, { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(14).fillColor('#3a7bd5').text('1. Resumo do Perfil', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#000000').text(sugestaoIA.resumo_perfil || 'Resumo não disponível.', { align: 'justify' });
        doc.moveDown(1);
        doc.fontSize(14).fillColor('#3a7bd5').text('2. Áreas de Atuação Sugeridas', { underline: true });
        doc.moveDown(0.5);

        (sugestaoIA.areas_sugeridas || []).forEach((item, index) => {
            doc.fontSize(12).fillColor('#000000').text(`• Área ${index + 1}: ${item.area}`, { bold: true });
            doc.fontSize(10).fillColor('#333333').text(`   Justificativa: ${item.justificativa}`, { indent: 15, align: 'justify' });
            doc.moveDown(0.5);
        });

        doc.moveDown(1);
        doc.fontSize(14).fillColor('#3a7bd5').text(`3. ${sugestaoIA.plano_desenvolvimento?.titulo || 'Plano de Desenvolvimento'}`, { underline: true });
        doc.moveDown(0.5);
        
        (sugestaoIA.plano_desenvolvimento?.passos || []).forEach((passo, index) => {
            doc.fontSize(12).fillColor('#000000').text(`Passo ${index + 1}: ${passo}`, { bullet: '✓ ' });
        });

        doc.moveDown(2);
        doc.fontSize(10).text('Relatório gerado automaticamente por um Sistema Web Inteligente.', { align: 'center' });
        doc.pipe(stream);
        doc.end();
    });
}