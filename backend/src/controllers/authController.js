// backend/src/controllers/authController.js

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { createUser, findUserByEmail } from '../services/userService.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Gera um JWT para o usuário.
 * @param {number} id - ID do usuário.
 * @param {string} nome - Nome do usuário.
 * @param {string} email - Email do usuário. // <-- MUDANÇA AQUI
 * @returns {string} Token JWT
 */
const generateToken = (id, nome, email) => { // <-- MUDANÇA AQUI
    return jwt.sign({ id, nome, email }, JWT_SECRET, { expiresIn: '1d' }); // <-- MUDANÇA AQUI
};

export async function registerUser(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Dados de registro incompletos." });
    }

    try {
        // 1. Verificar se o usuário já existe
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Email já cadastrado." });
        }

        // 2. Criar o hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // 3. Criar o usuário no DB
        const newUser = await createUser(nome, email, senhaHash);

        // 4. Gerar o token
        const token = generateToken(newUser.id, newUser.nome, newUser.email); // <-- MUDANÇA AQUI
        
        // Remove a senha (hash) do objeto de resposta
        const userWithoutHash = { id: newUser.id, nome: newUser.nome, email: newUser.email };

        return res.status(201).json({ 
            message: 'Usuário registrado com sucesso!', 
            token, 
            user: userWithoutHash 
        });

    } catch (error) {
        console.error('ERRO no registro de usuário:', error);
        return res.status(500).json({ 
            message: "Erro interno do servidor ao tentar registrar o usuário." 
        });
    }
}

export async function loginUser(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    try {
        // 1. Encontrar o usuário
        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // 2. Comparar a senha
        const isMatch = await bcrypt.compare(senha, user.senha_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // 3. Gerar o token
        const token = generateToken(user.id, user.nome, user.email); // <-- MUDANÇA AQUI

        // Remove a senha (hash) do objeto de resposta
        const userWithoutHash = { id: user.id, nome: user.nome, email: user.email };

        return res.status(200).json({ 
            message: 'Login bem-sucedido!', 
            token, 
            user: userWithoutHash 
        });

    } catch (error) {
        console.error('ERRO no login de usuário:', error);
        return res.status(500).json({ 
              message: "Erro interno do servidor ao tentar fazer login." 
        });
    }
}