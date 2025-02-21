const express = require('express');
const pool = require('../database/db');

const router = express.Router();

// Listar todas as atividades
router.get('/', async (req, res) => {
    const query = `
        SELECT atividades.*, aulas.numero as numero_aula, aulas.data 
        FROM atividades
        JOIN aulas ON atividades.aula_id = aulas.id`;
    try {
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar atividades por aula
router.get('/aula/:numeroAula', async (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Requisição recebida para a aula ${numeroAula}`);
    const query = `
        SELECT atividades.*, aulas.numero as numero_aula, aulas.data 
        FROM atividades
        JOIN aulas ON atividades.aula_id = aulas.id
        WHERE aulas.numero = $1`;
    try {
        const { rows } = await pool.query(query, [numeroAula]);
        console.log('Resultado da consulta:', rows); // Log de depuração
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar atividades:', err.message); // Log de erro
        res.status(500).json({ error: err.message });
    }
});

// Adicionar uma nova atividade
router.post('/', async (req, res) => {
    const { titulo, data, numero_aula } = req.body;
    const query = 'INSERT INTO atividades (titulo, data, numero_aula) VALUES ($1, $2, $3) RETURNING id';
    try {
        const { rows } = await pool.query(query, [titulo, data, numero_aula]);
        res.json({ id: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Marcar atividade como concluída
router.put('/:id/concluir', async (req, res) => {
    const { id } = req.params;
    const { concluida } = req.body;
    const query = 'UPDATE atividades SET concluida = $1 WHERE id = $2';
    try {
        await pool.query(query, [concluida, id]);
        res.json({ message: "Status da atividade atualizado." });
    } catch (err) {
        console.error("Erro ao atualizar atividade:", err.message);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
