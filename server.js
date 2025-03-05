console.log('Servidor iniciado...');
const express = require('express');
const cors = require('cors');
const pool = require('./database/db');
const authRoutes = require('./routes/authRoutes');
const aulasRoutes = require('./routes/aulas');
const atividadesRoutes = require('./routes/atividades');
const textosRoutes = require('./routes/textos');
const vocabulariosRoutes = require('./routes/vocabularios');
const duvidasRoutes = require('./routes/duvidas');
const recursosRoutes = require('./routes/recursos');

const path = require('path'); // Importe o módulo 'path'
const app = express();
const PORT = process.env.PGPORT || 3000;

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());

// Configurar o Express para servir arquivos estáticos
//app.use(express.static(path.join(__dirname, 'frontend/public')));

// Ou permitir apenas o frontend específico
app.use(cors({
    origin: 'https://englishclass-fitf.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
}));

// Conexão com o banco de dados
(async () => {
    try {
        const result = await pool.query('SELECT * FROM usuarios');
        console.log('Usuários:', result.rows); // Acesso aos dados retornados do PostgreSQL
    } catch (err) {
        console.error('Erro ao buscar usuários:', err.message);
    }
})();

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/aulas', aulasRoutes);
app.use('/api/atividades', atividadesRoutes);
app.use('/api/textos', textosRoutes);
app.use('/api/vocabularios', vocabulariosRoutes);
app.use('/api/duvidas', duvidasRoutes);
app.use('/api/recursos', recursosRoutes);
console.log('Rotas configuradas com sucesso'); // Log de depuração

// Rota padrão para o frontend
//app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
//});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
