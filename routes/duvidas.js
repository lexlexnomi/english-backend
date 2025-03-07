const express = require('express');
const pool = require('../database/db');

const router = express.Router();

// Listar todas as dúvidas
router.get('/', async (req, res) => {
    const query = `
        SELECT duvidas.*, aulas.numero as numero_aula, aulas.data, tags.nome as tag 
        FROM duvidas
        JOIN aulas ON duvidas.aula_id = aulas.id
        JOIN tags ON duvidas.tag_id = tags.id`;
    try {
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar duvidas por aula
router.get('/aula/:numeroAula', async (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando dúvidas para a aula ${numeroAula}`);
    const query = `
        SELECT duvidas.*, aulas.numero as numero_aula, aulas.data 
        FROM duvidas
        JOIN aulas ON duvidas.aula_id = aulas.id
        WHERE aulas.numero = $1`
        ;
    try {
        const { rows } = await pool.query(query, [numeroAula]);
        console.log("Resultado da consulta:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar dúvidas:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota de tags
router.get('/tags', async (req, res) => {
    try {
        const query = 'SELECT * FROM tags';
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se uma tag já existe ou criar
async function verificarOuCriarTag(tag) {
    const query = 'SELECT id FROM tags WHERE nome = $1';
    try {
        const { rows } = await pool.query(query, [tag]);

        if (rows.length > 0) {
            console.log("Tag já existe:", tag);
            return rows[0].id;
        } else {
            const insertQuery = "INSERT INTO tags (nome) VALUES ($1) RETURNING id";
            const { rows: insertRows } = await pool.query(insertQuery, [tag]);
            console.log("Tag criada:", tag);
            return insertRows[0].id;
        }
    } catch (err) {
        console.error("Erro ao verificar/criar tag:", err);
        throw err;
    }
}

// Adicionar uma nova dúvida
router.post('/', async (req, res) => {
    const { titulo, aula_id, tag, descricao } = req.body;

    console.log("Recebendo dados:", req.body); // Verifique se os dados estão corretos
    
    if (!titulo || !tag || !descricao || !aula_id) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Verificar ou criar a tag
        const tagId = await verificarOuCriarTag(tag);

        // Adicionar a dúvida na tabela 'duvidas'
        const query = "INSERT INTO duvidas (titulo, aula_id, tag_id, descricao) VALUES ($1, $2, $3, $4) RETURNING id";
        const { rows } = await pool.query(query, [titulo, aula_id, tagId, descricao]);

        // Enviar a resposta com a ID da nova dúvida
        res.json({ id: rows[0].id });
    } catch (error) {
        console.error("Erro ao adicionar dúvida:", error);
        res.status(500).json({ error: error.message });
    }
});

// Marcar dúvida como resolvida
router.put('/:id/resolver', async (req, res) => {
    const { id } = req.params;
    const { resolvida } = req.body;

    const query = "UPDATE duvidas SET resolvida = $1 WHERE id = $2";
    try {
        await pool.query(query, [resolvida, id]);
        res.json({ message: "Status da dúvida atualizado." });
    } catch (err) {
        console.error("Erro ao atualizar dúvida:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
