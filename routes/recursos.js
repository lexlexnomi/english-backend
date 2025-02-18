const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todos os recursos
router.get('/', (req, res) => {
    try {
        const query = 'SELECT * FROM recursos';
        const rows = db.prepare(query).all(); // Método síncrono
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se uma categoria já existe
function verificarOuCriarCategoria(categoria) {
    const query = 'SELECT id FROM categorias WHERE nome = ?';
    const row = db.prepare(query).get(categoria); // Método síncrono

        if (row) {
            // Categoria já existe, retorna o ID
            resolve(row.id);
        } else {
            // Categoria não existe, cria uma nova
            const insertQuery = 'INSERT INTO categorias (nome) VALUES (?)';
            const stmt = db.prepare(insertQuery);
            const result = stmt.run(categoria);
            return result.lastInsertRowid; // Retorna o ID da nova tag
    }
}

// Adicionar um novo recurso
router.post('/', (req, res) => {
    const { nome, categoria, url, descricao } = req.body;

    try {
        // Verifica se a categoria já existe ou cria uma nova
        const categoriaId = verificarOuCriarCategoria(categoria);

        // Insere o recurso no banco de dados
        const query = 'INSERT INTO recursos (nome, categoria_id, url, descricao) VALUES (?, ?, ?, ?)';
        const stmt = db.prepare(query);
        const result = stmt.run(nome, categoriaId, url, descricao);

        res.json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
