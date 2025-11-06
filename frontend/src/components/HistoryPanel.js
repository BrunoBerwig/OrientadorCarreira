// frontend/src/components/HistoryPanel.js (NOVO ARQUIVO)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HistoryPanel = ({ API_BASE_URL, token }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError('');
            try {
                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                const response = await axios.get(`${API_BASE_URL}/analises/historico`, config);
                
                setHistory(response.data.historico || []);
                
            } catch (err) {
                console.error("Erro ao buscar histórico:", err);
                setError('Não foi possível carregar o histórico de análises. Verifique sua conexão ou status de login.');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [API_BASE_URL, token]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    };

    if (loading) {
        return <div className="history-container loading-state"><div className="spinner"></div> Carregando Histórico...</div>;
    }

    if (error) {
        return <div className="history-container error-message">{error}</div>;
    }

    return (
        <div className="history-container form-container">
            <h2>Histórico de Relatórios Gerados</h2>
            
            {history.length === 0 ? (
                <p className="no-history-message">Você ainda não gerou nenhum relatório. Clique em "Novo Formulário" para começar!</p>
            ) : (
                <div className="history-list">
                    {history.map((item, index) => (
                        <div key={item.id || index} className="history-item">
                            <div className="history-details">
                                <strong>Análise #{history.length - index}</strong> 
                                <span className="history-date">Gerado em: {formatDate(item.dataCriacao)}</span>
                                <span className={`history-status status-${item.status?.toLowerCase() || 'concluído'}`}>Status: {item.status || 'Concluído'}</span>
                            </div>
                            <a 
                                href={`${API_BASE_URL}${item.pdfUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="download-button small-download-button"
                            >
                                Baixar PDF
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryPanel;