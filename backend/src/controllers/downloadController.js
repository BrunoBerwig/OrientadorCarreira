import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORTS_DIR = path.join(__dirname, '..', '..', 'reports');

export async function downloadRelatorio(req, res) {
    const { fileName } = req.params;
    const filePath = path.join(REPORTS_DIR, fileName);
    if (path.basename(filePath) !== fileName) {
        return res.status(403).send('Acesso negado.');
    }

    res.download(filePath, (err) => {
        if (err) {
            console.error(`Erro ao enviar o arquivo ${fileName}:`, err);
            if (err.code === 'ENOENT') {
                return res.status(404).send('Relatório não encontrado.');
            }
            res.status(500).send('Erro interno ao processar o download.');
        }
    });
}