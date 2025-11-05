// projeto/frontend/src/components/Register.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = ({ switchToLogin }) => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(nome, email, senha);
            // Redirecionamento implícito (mudança de estado no App.js)
        } catch (err) {
            const message = err.response?.data?.message || 'Erro ao tentar fazer cadastro.';
            setError(message);
        }
    };

    return (
        <div className="auth-form">
            <h2>Criar Conta</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <label>Nome Completo</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                />
                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>Senha</label>
                <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />
                <button type="submit">Cadastrar e Entrar</button>
            </form>
            <p className="switch-link">
                Já tem conta? <a onClick={switchToLogin}>Acesse aqui</a>
            </p>
        </div>
    );
};

export default Register;