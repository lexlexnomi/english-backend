const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db'); // Importando a conexão com PostgreSQL

// Função para fazer login
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Consultando o banco de dados para encontrar o usuário
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);

        // Se o usuário não for encontrado
        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'Usuário não encontrado.' });
        }

        const user = result.rows[0]; // Obtendo o primeiro usuário da resposta

        // Verificar a senha
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Senha incorreta.' });
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.id, username: user.username }, 'segredo', { expiresIn: '1h' });

        // Retornar o token e os dados do usuário
        res.json({ token, user: { name: user.name, avatar: user.avatar } });
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        return res.status(500).json({ message: 'Erro no servidor.' });
    }
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
