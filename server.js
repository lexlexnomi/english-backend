console.log('Servidor iniciado...');
const express = require('express');
const db = require('./database/db');
const authRoutes = require('./routes/authRoutes');
const aulasRoutes = require('./routes/aulas');
const atividadesRoutes = require('./routes/atividades');
const textosRoutes = require('./routes/textos');
const vocabulariosRoutes = require('./routes/vocabularios');
const duvidasRoutes = require('./routes/duvidas');
const recursosRoutes = require('./routes/recursos');

const path = require('path'); // Importe o módulo 'path'
const app = express();
const PORT = 3000;

// Middleware para permitir o uso de JSON no corpo das requisições
console.log('Antes do middleware JSON');
app.use(express.json());
console.log('Depois do middleware JSON');

// Configurar o Express para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Conexão com o banco de dados
try {
    const rows = db.prepare('SELECT * FROM usuarios').all();
    console.log('Usuários:', rows);
} catch (err) {
    console.error('Erro ao buscar usuários:', err.message);
}

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
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
