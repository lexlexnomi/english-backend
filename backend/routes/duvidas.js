const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todas as dúvidas
router.get('/', (req, res) => {
    const query = `
        SELECT duvidas.*, aulas.numero as numero_aula, aulas.data 
        FROM duvidas
        JOIN aulas ON duvidas.aula_id = aulas.id`;
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
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
    db.all(query, [numeroAula], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar dúvidas:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log('Resultado da consulta:', rows); // Log de depuração
            res.json(rows);
        }
    });
});

// Função para verificar se uma tag já existe
async function verificarOuCriarTag(tag) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM tags WHERE nome = ?';
        db.get(query, [tag], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // Tag já existe, retorna o ID
                resolve(row.id);
            } else {
                // Tag não existe, cria uma nova
                const insertQuery = 'INSERT INTO tags (nome) VALUES (?)';
                db.run(insertQuery, [tag], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID); // Retorna o ID da nova tag
                    }
                });
            }
        });
    });
}

// Adicionar uma nova dúvida
router.post('/', async (req, res) => {
    const { titulo, numero_aula, tag, descricao } = req.body;

    try {
        // Verifica se a tag já existe ou cria uma nova
        const tagId = await verificarOuCriarTag(tag);

        // Insere a dúvida no banco de dados
        const query = 'INSERT INTO duvidas (titulo, numero_aula, tag_id, descricao) VALUES (?, ?, ?, ?)';
        db.run(query, [titulo, numero_aula, tagId, descricao], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ id: this.lastID });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Marcar dúvida como resolvida
router.put('/:id/resolver', (req, res) => {
    const { id } = req.params;
    const { resolvida } = req.body;
    const query = 'UPDATE duvidas SET resolvida = ? WHERE id = ?';
    db.run(query, [resolvida, id], function (err) {
        if (err) {
            console.error('Erro ao atualizar duvida:', err.message); // Log de erro
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Status da dúvida atualizado.' });
        }
    });
});

module.exports = router;
