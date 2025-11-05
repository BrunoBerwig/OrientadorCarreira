// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; 

import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './context/AuthContext'; 

const API_BASE_URL = 'http://localhost:3001/api';

const App = () => {

    const { user, token, logout, isLoading } = useAuth();
    
    const [isRegistering, setIsRegistering] = useState(false); 
    
    const [step, setStep] = useState(1);
    
    const [respostas, setRespostas] = useState({
        nivelExperiencia: '',
        formacao: '',
        habilidadesTecnicas: '',
        softSkills: '',
        areasInteresse: '',
        tecnologiasAprender: '',
        areasSemInteresse: '',
        tipoAmbiente: '',
        objetivoLongoPrazo: '',
        motivacao: ''
    });

    const [status, setStatus] = useState({ 
        message: 'Preencha o formulário para gerar sua análise.', 
        loading: false, 
        pdfUrl: '' 
    });

    const handleRespostasChange = (e) => {
        setRespostas({ ...respostas, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const requiredFields = [
            'nivelExperiencia', 
            'habilidadesTecnicas', 
            'softSkills', 
            'areasInteresse', 
            'tecnologiasAprender', 
            'tipoAmbiente', 
            'objetivoLongoPrazo'
        ];
        
        const isFormIncomplete = requiredFields.some(field => !respostas[field] || respostas[field].trim() === '');

        if (isFormIncomplete) {
            setStatus({ message: 'Por favor, preencha todos os campos obrigatórios (*).', loading: false, pdfUrl: '' });
            return;
        }

        setStatus({ message: 'Enviando dados para análise da IA...', loading: true, pdfUrl: '' });

        try {
            const payload = { respostas };
            const response = await axios.post(`${API_BASE_URL}/analise`, payload);
            
            setStatus({
                message: response.data.message || 'Relatório gerado com sucesso!',
                loading: false,
                pdfUrl: `${API_BASE_URL}${response.data.pdfUrl}`
            });

        } catch (error) {
            console.error('Erro ao processar análise:', error);
            const msg = error.response?.data?.message || 'Erro de comunicação. Você pode precisar logar novamente.';

            if (error.response?.status === 401) {
                logout(); 
            }
            
            setStatus({ message: msg, loading: false, pdfUrl: '' });
        }
    };
    
    // Funções de navegação
    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (isLoading) {
        return <div className="loading-state">Carregando aplicação...</div>;
    }

    if (!user) {
        return (
            <div className="App auth-page-container">
                {isRegistering ? (
                    <Register switchToLogin={() => setIsRegistering(false)} />
                ) : (
                    <Login switchToRegister={() => setIsRegistering(true)} />
                )}
            </div>
        );
    }
    
    return (
        <div className="App">
            <header className="App-header">
                <h1>Orientador de Carreira Inteligente</h1>
                <p>Olá, {user.nome}! Gerador de Relatório de Perfil de Carreira.</p>
                <button className="logout-button" onClick={logout}>Sair ({user.email})</button>
            </header>
            
            <form className="form-container" onSubmit={handleSubmit}>
                <div className="step-progress-container">
                    <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
                    <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>3</div>
                </div>
                {step === 1 && (
                    <div className="form-step">
                        <h3>Etapa 1: Perfil Atual</h3>

                        <label htmlFor="nivelExperiencia">Qual seu nível de experiência atual? *</label>
                        <select id="nivelExperiencia" name="nivelExperiencia" value={respostas.nivelExperiencia} onChange={handleRespostasChange} required>
                            <option value="">Selecione seu nível</option>
                            <option value="Estudante">Estudante (buscando 1ª vaga)</option>
                            <option value="Iniciante">Iniciante (0-1 ano)</option>
                            <option value="Júnior">Júnior (1-3 anos)</option>
                            <option value="Pleno">Pleno (3-5 anos)</option>
                            <option value="Sênior">Sênior (5+ anos)</option>
                        </select>

                        <label htmlFor="formacao">Qual sua formação principal? (Curso, faculdade, etc.)</label>
                        <input type="text" id="formacao" name="formacao" value={respostas.formacao} onChange={handleRespostasChange} placeholder="Ex: Ciência da Computação, ADS, Autodidata..." />
                        
                        <label htmlFor="habilidadesTecnicas">Principais Habilidades Técnicas (Hard Skills) *</label>
                        <textarea id="habilidadesTecnicas" name="habilidadesTecnicas" rows="4" value={respostas.habilidadesTecnicas} onChange={handleRespostasChange} placeholder="Ex: React, Node.js, Python, SQL, Git..." required></textarea>
                        
                        <label htmlFor="softSkills">Principais Habilidades Comportamentais (Soft Skills) *</label>
                        <textarea id="softSkills" name="softSkills" rows="4" value={respostas.softSkills} onChange={handleRespostasChange} placeholder="Ex: Comunicação clara, Proatividade, Liderança, Trabalho em equipe..." required></textarea>

                        <div className="form-navigation">
                            <button type="button" style={{ visibility: 'hidden' }}>Voltar</button>
                            <button type="button" onClick={nextStep}>Próximo &rarr;</button>
                        </div>
                    </div>
                )}

                {/* ETAPA 2: INTERESSES */}
                {step === 2 && (
                    <div className="form-step">
                        <h3>Etapa 2: Interesses e Tecnologias</h3>

                        <label htmlFor="areasInteresse">Quais áreas de tecnologia você MAIS se interessa? *</label>
                        <textarea id="areasInteresse" name="areasInteresse" rows="4" value={respostas.areasInteresse} onChange={handleRespostasChange} placeholder="Ex: Desenvolvimento Frontend, Backend, Data Science, Mobile (iOS/Android), DevOps, IA..." required></textarea>

                        <label htmlFor="tecnologiasAprender">Quais tecnologias você quer APRENDER no próximo ano? *</label>
                        <textarea id="tecnologiasAprender" name="tecnologiasAprender" rows="4" value={respostas.tecnologiasAprender} onChange={handleRespostasChange} placeholder="Ex: Go, Rust, Flutter, AWS, Kubernetes..." required></textarea>
                        
                        <label htmlFor="areasSemInteresse">Existem áreas que você NÃO tem interesse?</label>
                        <textarea id="areasSemInteresse" name="areasSemInteresse" rows="3" value={respostas.areasSemInteresse} onChange={handleRespostasChange} placeholder="Ex: Não gosto de mexer com infraestrutura, prefiro focar em UI/UX..."></textarea>
                        
                        <div className="form-navigation">
                            <button type="button" className="back-button" onClick={prevStep}>&larr; Voltar</button>
                            <button type="button" onClick={nextStep}>Próximo &rarr;</button>
                        </div>
                    </div>
                )}

                {/* ETAPA 3: OBJETIVOS */}
                {step === 3 && (
                    <div className="form-step">
                        <h3>Etapa 3: Ambiente e Objetivos</h3>
                        
                        <label>Qual tipo de ambiente de trabalho você prefere? *</label>
                        <div className="radio-group">
                            <label><input type="radio" name="tipoAmbiente" value="Startup (Ágil e Dinâmico)" checked={respostas.tipoAmbiente === "Startup (Ágil e Dinâmico)"} onChange={handleRespostasChange} /> Startup (Ágil e Dinâmico)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Empresa Grande (Estável e Estruturada)" checked={respostas.tipoAmbiente === "Empresa Grande (Estável e Estruturada)"} onChange={handleRespostasChange} /> Empresa Grande (Estável e Estruturada)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Remoto (Total Home Office)" checked={respostas.tipoAmbiente === "Remoto (Total Home Office)"} onChange={handleRespostasChange} /> Remoto (Total Home Office)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Híbrido (Remoto e Presencial)" checked={respostas.tipoAmbiente === "Híbrido (Remoto e Presencial)"} onChange={handleRespostasChange} /> Híbrido (Remoto e Presencial)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Indiferente" checked={respostas.tipoAmbiente === "Indiferente"} onChange={handleRespostasChange} /> Indiferente</label>
                        </div>

                        <label>Qual seu objetivo de carreira a longo prazo? *</label>
                         <div className="radio-group">
                            <label><input type="radio" name="objetivoLongoPrazo" value="Especialista Técnico (Ex: Arquiteto, Sênior Principal)" checked={respostas.objetivoLongoPrazo === "Especialista Técnico (Ex: Arquiteto, Sênior Principal)"} onChange={handleRespostasChange} /> Ser um Especialista Técnico (Arquiteto, Sênior)</label>
                            <label><input type="radio" name="objetivoLongoPrazo" value="Gestão de Pessoas (Ex: Tech Lead, Gerente)" checked={respostas.objetivoLongoPrazo === "Gestão de Pessoas (Ex: Tech Lead, Gerente)"} onChange={handleRespostasChange} /> Seguir para Gestão de Pessoas (Tech Lead, Gerente)</label>
                            <label><input type="radio" name="objetivoLongoPrazo" value="Empreender (Ex: Abrir minha própria empresa/consultoria)" checked={respostas.objetivoLongoPrazo === "Empreender (Ex: Abrir minha própria empresa/consultoria)"} onChange={handleRespostasChange} /> Empreender (Abrir meu próprio negócio)</label>
                        </div>
                        
                        <label htmlFor="motivacao">O que mais te motiva profissionalmente?</label>
                        <textarea id="motivacao" name="motivacao" rows="3" value={respostas.motivacao} onChange={handleRespostasChange} placeholder="Ex: Resolver problemas complexos, aprender coisas novas, ter autonomia, estabilidade financeira..."></textarea>

                        <div className="form-navigation">
                            <button type="button" className="back-button" onClick={prevStep}>&larr; Voltar</button>
                            <button type="submit" disabled={status.loading}>
                                {status.loading ? '⚙️ Processando Análise...' : 'Gerar Relatório de Carreira'}
                            </button>
                        </div>
                    </div>
                )}

            </form>

            <div className="status-area">
                <p className={status.loading ? 'loading-message' : ''}>
                    {status.message}
                </p>
                
                {status.loading && <div className="spinner"></div>}

                {status.pdfUrl && (
                    <a href={status.pdfUrl} target="_blank" rel="noopener noreferrer" className="download-button">
                        📥 Clique para Baixar seu Relatório PDF
                    </a>
                )}
            </div>
        </div>
    );
};

export default App;