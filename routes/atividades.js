const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todas as atividades
router.get('/', (req, res) => {
    const query = `
        SELECT atividades.*, aulas.numero as numero_aula, aulas.data 
        FROM atividades
        JOIN aulas ON atividades.aula_id = aulas.id`;
    try {
        const rows = db.prepare(query).all(); // Método síncrono
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar atividades por aula
router.get('/aula/:numeroAula', (req, res) => {
    console.log('Rota /aula/:numeroAula chamada'); // Log de depuração
    const { numeroAula } = req.params;
    console.log(`Requisição recebida para a aula ${numeroAula}`);
    const query = `
        SELECT atividades.*, aulas.numero as numero_aula, aulas.data 
        FROM atividades
        JOIN aulas ON atividades.aula_id = aulas.id
        WHERE aulas.numero = ?`;
    try {
        const rows = db.prepare(query).all(numeroAula); // Método síncrono com parâmetro
        console.log('Resultado da consulta:', rows); // Log de depuração
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar atividades:', err.message); // Log de erro
        res.status(500).json({ error: err.message });
    }
});

// Adicionar uma nova atividade
router.post('/', (req, res) => {
    const { titulo, data, numero_aula } = req.body;
    const query = 'INSERT INTO atividades (titulo, data, numero_aula) VALUES (?, ?, ?, ?)';
    try {
        const stmt = db.prepare(query); // Preparando a consulta
        const result = stmt.run(titulo, data, numero_aula); // Executando de forma síncrona
        res.json({ id: result.lastInsertRowid }); // Usando lastInsertRowid
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Marcar atividade como concluída
router.put('/:id/concluir', (req, res) => {
    const { id } = req.params;
    const { concluida } = req.body;
    const query = 'UPDATE atividades SET concluida = ? WHERE id = ?';
    try {
        const stmt = db.prepare(query); // Preparando a consulta
        stmt.run(concluida, id); // Executando de forma síncrona
        res.json({ message: 'Status da atividade atualizado.' });
    } catch (err) {
        console.error('Erro ao atualizar atividade:', err.message); // Log de erro
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
console.log('Rotas de atividades carregadas'); // Log de depuração
