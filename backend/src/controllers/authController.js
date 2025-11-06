import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { createUser, findUserByEmail } from '../services/userService.js';

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @param {number} id
 * @param {string} nome
 * @param {string} email
 * @returns {string}
 */
const generateToken = (id, nome, email) => {
   return jwt.sign({ id, nome, email }, JWT_SECRET, { expiresIn: '1d' });
};

export async function registerUser(req, res) {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: "Dados de registro incompletos." });
    }

    try {
        const existingUser = await findUserByEmail(email);
         if (existingUser) {
             return res.status(409).json({ message: "Email já cadastrado." });
         }


        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

         const newUser = await createUser(nome, email, senhaHash);

         const token = generateToken(newUser.id, newUser.nome, newUser.email);

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

        const user = await findUserByEmail(email);
           if (!user) {
     return res.status(401).json({ message: "Credenciais inválidas." });
     }


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