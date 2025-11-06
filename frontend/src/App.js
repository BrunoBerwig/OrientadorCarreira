// frontend/src/App.js (COMPLETO E FINAL COM NOVO HEADER)
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

import Login from './components/Login';
import Register from './components/Register';
import HistoryPanel from './components/HistoryPanel';
import { useAuth } from './context/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api';

const App = () => {

    const { user, token, logout, isLoading } = useAuth();

    const [isRegistering, setIsRegistering] = useState(false);
    const [view, setView] = useState('form');

    const [step, setStep] = useState(1);
    const [validationErrors, setValidationErrors] = useState({});

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
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    const validateStep = (currentStep) => {
        const errors = {};
        let isValid = true;
        let fieldsToValidate = [];

        if (currentStep === 1) {
            fieldsToValidate = ['nivelExperiencia', 'habilidadesTecnicas', 'softSkills'];
        } else if (currentStep === 2) {
            fieldsToValidate = ['areasInteresse', 'tecnologiasAprender'];
        } else if (currentStep === 3) {
            fieldsToValidate = ['tipoAmbiente', 'objetivoLongoPrazo'];
        }

        fieldsToValidate.forEach(field => {
            if (!respostas[field] || String(respostas[field]).trim() === '') {
                errors[field] = 'Este campo é obrigatório.';
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };


    const nextStep = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            setStatus({ ...status, message: 'Continue preenchendo o formulário.' });
        } else {
            setStatus({ ...status, message: 'Por favor, preencha todos os campos obrigatórios da etapa atual.', pdfUrl: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(3)) {
            setStatus({ message: 'Por favor, preencha todos os campos obrigatórios da etapa final.', loading: false, pdfUrl: '' });
            return;
        }

        setStatus({ message: 'Enviando dados para análise da IA...', loading: true, pdfUrl: '' });

        try {
            const payload = { respostas };
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            const response = await axios.post(`${API_BASE_URL}/analise`, payload, config);

            setStatus({
                message: 'Relatório gerado com sucesso! Redirecionando para o Histórico...',
                loading: false,
                pdfUrl: `${API_BASE_URL}${response.data.pdfUrl}`
            });

            // Redireciona para o histórico após um pequeno atraso para exibir a mensagem de sucesso
            setTimeout(() => {
                setView('history');
                setStep(1);
            }, 3000); 

        } catch (error) {
            console.error('Erro ao processar análise:', error);
            const msg = error.response?.data?.message || 'Erro de comunicação. Você pode precisar logar novamente.';

            if (error.response?.status === 401) {
                logout();
            }

            setStatus({ message: msg, loading: false, pdfUrl: '' });
        }
    };

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

    const stepTitles = ['Perfil Atual', 'Interesses', 'Objetivos'];
    
    const CharCounter = ({ fieldName, minChars = 10, maxChars = 500 }) => {
        const count = respostas[fieldName]?.length || 0;
        const isWarning = count > 0 && count < minChars;
        const isOverLimit = count > maxChars;
        
        return (
            <div className={`char-counter ${isWarning ? 'warning' : ''} ${isOverLimit ? 'error' : ''}`}>
                {count} / {maxChars} caracteres. ({isWarning && `Mínimo recomendado: ${minChars}`})
            </div>
        );
    };

    const renderForm = () => (
        <>
            <form className="form-container" onSubmit={handleSubmit}>
                <h2>Formulário de Análise de Perfil</h2>
                <div className="step-progress-container">
                    {stepTitles.map((title, index) => (
                        <div key={index} className="step-wrapper">
                            <div className={`step-indicator ${step >= index + 1 ? 'active' : ''}`}>{index + 1}</div>
                            <span className={`step-title ${step >= index + 1 ? 'active' : ''}`}>{title}</span>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="form-step">
                        <h3>Etapa 1: Perfil Atual</h3>

                        <label htmlFor="nivelExperiencia">Qual seu nível de experiência atual?<span className="required-asterisk">*</span></label>
                        <select id="nivelExperiencia" name="nivelExperiencia" value={respostas.nivelExperiencia} onChange={handleRespostasChange} >
                            <option value="">Selecione seu nível</option>
                            <option value="Estudante">Estudante (buscando 1ª vaga)</option>
                            <option value="Iniciante">Iniciante (0-1 ano)</option>
                            <option value="Júnior">Júnior (1-3 anos)</option>
                            <option value="Pleno">Pleno (3-5 anos)</option>
                            <option value="Sênior">Sênior (5+ anos)</option>
                        </select>
                        {validationErrors.nivelExperiencia && <span className="validation-error">{validationErrors.nivelExperiencia}</span>}


                        <label htmlFor="formacao">Qual sua formação principal? (Opcional)</label>
                        <input type="text" id="formacao" name="formacao" value={respostas.formacao} onChange={handleRespostasChange} placeholder="Ex: Ciência da Computação, ADS, Autodidata..." />

                        <label htmlFor="habilidadesTecnicas">Principais Habilidades Técnicas (Hard Skills)<span className="required-asterisk">*</span></label>
                        <textarea id="habilidadesTecnicas" name="habilidadesTecnicas" rows="4" value={respostas.habilidadesTecnicas} onChange={handleRespostasChange} placeholder="Ex: React, Node.js, Python, SQL, Git..."></textarea>
                        <CharCounter fieldName="habilidadesTecnicas" minChars={20} />
                        {validationErrors.habilidadesTecnicas && <span className="validation-error">{validationErrors.habilidadesTecnicas}</span>}

                        <label htmlFor="softSkills">Principais Habilidades Comportamentais (Soft Skills)<span className="required-asterisk">*</span></label>
                        <textarea id="softSkills" name="softSkills" rows="4" value={respostas.softSkills} onChange={handleRespostasChange} placeholder="Ex: Comunicação clara, Proatividade, Liderança, Trabalho em equipe..."></textarea>
                        <CharCounter fieldName="softSkills" minChars={20} />
                        {validationErrors.softSkills && <span className="validation-error">{validationErrors.softSkills}</span>}

                        <div className="form-navigation">
                            <button type="button" style={{ visibility: 'hidden' }}>Voltar</button>
                            <button type="button" onClick={nextStep}>Próximo &rarr;</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="form-step">
                        <h3>Etapa 2: Interesses e Tecnologias</h3>

                        <label htmlFor="areasInteresse">Quais áreas de tecnologia você MAIS se interessa?<span className="required-asterisk">*</span></label>
                        <textarea id="areasInteresse" name="areasInteresse" rows="4" value={respostas.areasInteresse} onChange={handleRespostasChange} placeholder="Ex: Desenvolvimento Frontend, Backend, Data Science, Mobile (iOS/Android), DevOps, IA..."></textarea>
                        <CharCounter fieldName="areasInteresse" minChars={10} />
                        {validationErrors.areasInteresse && <span className="validation-error">{validationErrors.areasInteresse}</span>}


                        <label htmlFor="tecnologiasAprender">Quais tecnologias você quer APRENDER no próximo ano?<span className="required-asterisk">*</span></label>
                        <textarea id="tecnologiasAprender" name="tecnologiasAprender" rows="4" value={respostas.tecnologiasAprender} onChange={handleRespostasChange} placeholder="Ex: Go, Rust, Flutter, AWS, Kubernetes..."></textarea>
                        <CharCounter fieldName="tecnologiasAprender" minChars={10} />
                        {validationErrors.tecnologiasAprender && <span className="validation-error">{validationErrors.tecnologiasAprender}</span>}

                        <label htmlFor="areasSemInteresse">Existem áreas que você NÃO tem interesse? (Opcional)</label>
                        <textarea id="areasSemInteresse" name="areasSemInteresse" rows="3" value={respostas.areasSemInteresse} onChange={handleRespostasChange} placeholder="Ex: Não gosto de mexer com infraestrutura, prefiro focar em UI/UX..."></textarea>

                        <div className="form-navigation">
                            <button type="button" className="back-button" onClick={prevStep}>&larr; Voltar</button>
                            <button type="button" onClick={nextStep}>Próximo &rarr;</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="form-step">
                        <h3>Etapa 3: Ambiente e Objetivos</h3>

                        <label>Qual tipo de ambiente de trabalho você prefere?<span className="required-asterisk">*</span></label>
                        <div className="radio-group">
                            <label><input type="radio" name="tipoAmbiente" value="Startup (Ágil e Dinâmico)" checked={respostas.tipoAmbiente === "Startup (Ágil e Dinâmico)"} onChange={handleRespostasChange} /> Startup (Ágil e Dinâmico)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Empresa Grande (Estável e Estruturada)" checked={respostas.tipoAmbiente === "Empresa Grande (Estável e Estruturada)"} onChange={handleRespostasChange} /> Empresa Grande (Estável e Estruturada)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Remoto (Total Home Office)" checked={respostas.tipoAmbiente === "Remoto (Total Home Office)"} onChange={handleRespostasChange} /> Remoto (Total Home Office)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Híbrido (Remoto e Presencial)" checked={respostas.tipoAmbiente === "Híbrido (Remoto e Presencial)"} onChange={handleRespostasChange} /> Híbrido (Remoto e Presencial)</label>
                            <label><input type="radio" name="tipoAmbiente" value="Indiferente" checked={respostas.tipoAmbiente === "Indiferente"} onChange={handleRespostasChange} /> Indiferente</label>
                        </div>
                        {validationErrors.tipoAmbiente && <span className="validation-error">{validationErrors.tipoAmbiente}</span>}

                        <label>Qual seu objetivo de carreira a longo prazo?<span className="required-asterisk">*</span></label>
                        <div className="radio-group">
                            <label><input type="radio" name="objetivoLongoPrazo" value="Especialista Técnico (Ex: Arquiteto, Sênior Principal)" checked={respostas.objetivoLongoPrazo === "Especialista Técnico (Ex: Arquiteto, Sênior Principal)"} onChange={handleRespostasChange} /> Ser um Especialista Técnico (Arquiteto, Sênior)</label>
                            <label><input type="radio" name="objetivoLongoPrazo" value="Gestão de Pessoas (Ex: Tech Lead, Gerente)" checked={respostas.objetivoLongoPrazo === "Gestão de Pessoas (Ex: Tech Lead, Gerente)"} onChange={handleRespostasChange} /> Seguir para Gestão de Pessoas (Tech Lead, Gerente)</label>
                            <label><input type="radio" name="objetivoLongoPrazo" value="Empreender (Ex: Abrir minha própria empresa/consultoria)" checked={respostas.objetivoLongoPrazo === "Empreender (Ex: Abrir minha própria empresa/consultoria)"} onChange={handleRespostasChange} /> Empreender (Abrir meu próprio negócio)</label>
                        </div>
                        {validationErrors.objetivoLongoPrazo && <span className="validation-error">{validationErrors.objetivoLongoPrazo}</span>}

                        <label htmlFor="motivacao">O que mais te motiva profissionalmente? (Opcional)</label>
                        <textarea id="motivacao" name="motivacao" rows="3" value={respostas.motivacao} onChange={handleRespostasChange} placeholder="Ex: Resolver problemas complexos, aprender coisas novas, ter autonomia, estabilidade financeira..."></textarea>
                        <CharCounter fieldName="motivacao" minChars={0} />

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
                <p className={status.loading ? 'loading-message' : (status.pdfUrl ? 'success-message' : '')}>
                    {status.message}
                </p>

                {status.loading && <div className="spinner"></div>}

                {status.pdfUrl && view !== 'history' && (
                    <a href={status.pdfUrl} target="_blank" rel="noopener noreferrer" className="download-button">
                        📥 Clique para Baixar seu Relatório PDF
                    </a>
                )}
            </div>
        </>
    );

    return (
        <div className="App">
            <header className="App-header">
                <div className="header-top-row">
                    <div className="welcome-section">
                        <h1>Orientador de Carreira Inteligente</h1>
                        <p>Olá, {user.nome}! Escolha uma opção abaixo.</p>
                    </div>
                    
                    <button className="logout-button" onClick={logout}>
                        Sair ({user.email}) &rarr;
                    </button>
                </div>

                <div className="main-navigation">
                    <button 
                        className={`nav-button ${view === 'form' ? 'active' : ''}`} 
                        onClick={() => setView('form')}
                    >
                        📝 Novo Formulário
                    </button>
                    <button 
                        className={`nav-button ${view === 'history' ? 'active' : ''}`} 
                        onClick={() => setView('history')}
                    >
                        📚 Meu Histórico
                    </button>
                </div>
                
            </header>

            {view === 'form' && renderForm()}
            {view === 'history' && <HistoryPanel API_BASE_URL={API_BASE_URL} token={token} />}
        </div>
    );
};

export default App;