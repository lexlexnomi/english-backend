const express = require('express');
const pool = require('../database/db');

const router = express.Router();

// Listar todos os textos
router.get('/', async (req, res) => {
    const query = `
        SELECT textos.*, aulas.numero as numero_aula, aulas.data 
        FROM textos
        JOIN aulas ON textos.aula_id = aulas.id`;
    try {
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar textos por aula
router.get('/aula/:numeroAula', async (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando textos para a aula ${numeroAula}`);
    const query = `
        SELECT textos.*, aulas.numero as numero_aula, aulas.data 
        FROM textos
        JOIN aulas ON textos.aula_id = aulas.id
        WHERE aulas.numero = $1`;
    try {
        const { rows } = await pool.query(query, [numeroAula]);
        console.log("Resultado da consulta:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar textos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar um texto pelo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM textos WHERE id = $1';
    try {
        const { rows } = await pool.query(query, [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Texto não encontrado.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se um tema já existe
async function verificarOuCriarTema(tema) {
    const query = 'SELECT id FROM temas WHERE nome = $1';
    try {
        const { rows } = await pool.query(query, [tema]);
        if (rows.length > 0) {
            return rows[0].id;
        } else {
            const insertQuery = "INSERT INTO temas (nome) VALUES ($1) RETURNING id";
            const { rows: insertRows } = await pool.query(insertQuery, [tema]);
            return insertRows[0].id;
        }
    } catch (err) {
        console.error("Erro ao verificar/criar tema:", err);
        throw err;
    }
}

// Adicionar um novo texto
router.post('/', async (req, res) => {
    const { titulo, numero_aula, tema, conteudo } = req.body;

    try {
        const temaId = await verificarOuCriarTema(tema);
        const query = "INSERT INTO textos (titulo, numero_aula, tema_id, conteudo) VALUES ($1, $2, $3, $4) RETURNING id";
        const { rows } = await pool.query(query, [titulo, numero_aula, temaId, conteudo]);

        res.json({ id: rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
