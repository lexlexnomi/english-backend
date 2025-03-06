const express = require('express');
const pool = require('../database/db');

const router = express.Router();

// Listar todos os recursos
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM recursos';
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se uma categoria já existe
async function verificarOuCriarCategoria(categoria) {
    const query = 'SELECT id FROM categorias WHERE nome = $1';
    try {
        const { rows } = await pool.query(query, [categoria]);
        if (rows.length > 0) {
            return rows[0].id;
        } else {
            const insertQuery = "INSERT INTO categorias (nome) VALUES ($1) RETURNING id";
            const { rows: insertRows } = await pool.query(insertQuery, [categoria]);
            return insertRows[0].id;
        }
    } catch (err) {
        console.error("Erro ao verificar/criar categoria:", err);
        throw err;
    }
}

// Adicionar um novo recurso
router.post('/', async (req, res) => {
    const { nome, categoria, url, descricao } = req.body;

    try {
        console.log("Recebendo dados:", req.body); // Verifique se os dados estão corretos
        
        const categoriaId = await verificarOuCriarCategoria(categoria);
        const query = "INSERT INTO recursos (nome, categoria_id, url, descricao) VALUES ($1, $2, $3, $4) RETURNING id";
        const { rows } = await pool.query(query, [nome, categoriaId, url, descricao]);

        res.json({ id: rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
