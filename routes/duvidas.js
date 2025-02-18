const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todas as dúvidas
router.get('/', (req, res) => {
    const query = `
        SELECT duvidas.*, aulas.numero as numero_aula, aulas.data 
        FROM duvidas
        JOIN aulas ON duvidas.aula_id = aulas.id`;
    try {
        const rows = db.prepare(query).all(); // Método síncrono
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar duvidas por aula
router.get('/aula/:numeroAula', (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando dúvidas para a aula ${numeroAula}`);
    const query = `
        SELECT duvidas.*, aulas.numero as numero_aula, aulas.data 
        FROM duvidas
        JOIN aulas ON duvidas.aula_id = aulas.id
        WHERE aulas.numero = ?`;
    try {
        const rows = db.prepare(query).all(numeroAula); // Método síncrono com parâmetro
        console.log('Resultado da consulta:', rows); // Log de depuração
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar dúvidas:', err.message); // Log de erro
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se uma tag já existe
function verificarOuCriarTag(tag) {
    const query = 'SELECT id FROM tags WHERE nome = ?';
    const row = db.prepare(query).get(tag); // Método síncrono

    if (row) {
        // Tag já existe, retorna o ID
        return row.id;
    } else {
        // Tag não existe, cria uma nova
        const insertQuery = 'INSERT INTO tags (nome) VALUES (?)';
        const stmt = db.prepare(insertQuery);
        const result = stmt.run(tag);
        return result.lastInsertRowid; // Retorna o ID da nova tag
    }
}

// Adicionar uma nova dúvida
router.post('/', (req, res) => {
    const { titulo, numero_aula, tag, descricao } = req.body;

    try {
        // Verifica se a tag já existe ou cria uma nova
        const tagId = verificarOuCriarTag(tag);

        // Insere a dúvida no banco de dados
        const query = 'INSERT INTO duvidas (titulo, numero_aula, tag_id, descricao) VALUES (?, ?, ?, ?)';
        const stmt = db.prepare(query);
        const result = stmt.run(titulo, numero_aula, tagId, descricao);

        res.json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Marcar dúvida como resolvida
router.put('/:id/resolver', (req, res) => {
    const { id } = req.params;
    const { resolvida } = req.body;
    const query = 'UPDATE duvidas SET resolvida = ? WHERE id = ?';
    try {
        const stmt = db.prepare(query); // Preparando a consulta
        stmt.run(resolvida, id); // Executando de forma síncrona
        res.json({ message: 'Status da dúvida atualizado.' });
    } catch (err) {
        console.error('Erro ao atualizar duvida:', err.message); // Log de erro
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
