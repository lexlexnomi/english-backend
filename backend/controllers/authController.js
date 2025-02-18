const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Dados dos usuários (você pode adicionar manualmente)
const users = [
    {
        id: 1,
        username: 'alexs.oliveira1998@gmail.com',
        password: '$2a$10$kRqoP5ucpZ9VvUjHtyboy.T.AKz4s3ItfGssSg9BI2SNuxWIoob3e', // Senha: "16091998"
        name: 'Alex Oliveira',
        avatar: 'images/user-avatar.png'
    },
    {
        id: 2,
        username: 'carol8novembro@gmail.com',
        password: '$2a$10$9fniutN7LEc7wpMFZPqF.eCDcoNYWS8Hj.ohnUbWIsBctTC6s.qne', // Senha: "08111997"
        name: 'teacher Carol',
        avatar: 'images/prof-avatar.png'
    }
];

// Função para fazer login
const login = (req, res) => {
    const { username, password } = req.body;

    // Encontrar o usuário pelo username
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Verificar a senha
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Senha incorreta.' });
    }

    // Gerar token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, 'segredo', { expiresIn: '1h' });

    // Retornar o token e os dados do usuário
    res.json({ token, user: { name: user.name, avatar: user.avatar } });
};

// Função para verificar o token (middleware)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    jwt.verify(token, 'segredo', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido.' });
        }

        req.userId = decoded.id;
        next();
    });
};

module.exports = { login, verifyToken };
