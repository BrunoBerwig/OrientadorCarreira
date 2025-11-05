import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ switchToRegister }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, senha);
        } catch (err) {
            const message = err.response?.data?.message || 'Erro ao tentar fazer login.';
            setError(message);
        }
    };

    return (
        <div className="auth-form">
            <h2>Acessar o Painel</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
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
                <button type="submit">Entrar</button>
            </form>
            <p className="switch-link">
                Não tem conta? <a onClick={switchToRegister}>Cadastre-se aqui</a>
            </p>
        </div>
    );
};

export default Login;