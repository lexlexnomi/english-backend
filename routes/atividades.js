const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todas as atividades
router.get('/', (req, res) => {
    const query = `
        SELECT atividades.*, aulas.numero as numero_aula, aulas.data 
        FROM atividades
        JOIN aulas ON atividades.aula_id = aulas.id`;
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
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
    db.all(query, [numeroAula], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar atividades:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log('Resultado da consulta:', rows); // Log de depuração
            res.json(rows);
        }
    });
});

// Adicionar uma nova atividade
router.post('/', (req, res) => {
    const { titulo, data, numero_aula } = req.body;
    const query = 'INSERT INTO atividades (titulo, data, numero_aula) VALUES (?, ?, ?, ?)';
    db.run(query, [titulo, data, numero_aula], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// Marcar atividade como concluída
router.put('/:id/concluir', (req, res) => {
    const { id } = req.params;
    const { concluida } = req.body;
    const query = 'UPDATE atividades SET concluida = ? WHERE id = ?';
    db.run(query, [concluida, id], function (err) {
        if (err) {
            console.error('Erro ao atualizar atividade:', err.message); // Log de erro
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Status da atividade atualizado.' });
        }
    });
});

module.exports = router;
console.log('Rotas de atividades carregadas'); // Log de depuração