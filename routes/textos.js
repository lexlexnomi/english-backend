const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todos os textos
router.get('/', (req, res) => {
    const query = `
        SELECT textos.*, aulas.numero as numero_aula, aulas.data 
        FROM textos
        JOIN aulas ON textos.aula_id = aulas.id`;
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Rota para buscar textos por aula
router.get('/aula/:numeroAula', (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando textos para a aula ${numeroAula}`);
    const query = `
        SELECT textos.*, aulas.numero as numero_aula, aulas.data 
        FROM textos
        JOIN aulas ON textos.aula_id = aulas.id
        WHERE aulas.numero = ?`;
    db.all(query, [numeroAula], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar textos:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log('Resultado da consulta:', rows); // Log de depuração
            res.json(rows);
        }
    });
});

// Rota para buscar um texto pelo ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM textos WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Texto não encontrado.' });
        }
    });
});

// Função para verificar se um tema já existe
async function verificarOuCriarTema(tema) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM temas WHERE nome = ?';
        db.get(query, [tema], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // Tema já existe, retorna o ID
                resolve(row.id);
            } else {
                // Tema não existe, cria um novo
                const insertQuery = 'INSERT INTO temas (nome) VALUES (?)';
                db.run(insertQuery, [tema], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID); // Retorna o ID do novo tema
                    }
                });
            }
        });
    });
}

// Adicionar um novo texto
router.post('/', async (req, res) => {
    const { titulo, numero_aula, tema, conteudo } = req.body;

    try {
        // Verifica se o tema já existe ou cria um novo
        const temaId = await verificarOuCriarTema(tema);

        // Insere o texto no banco de dados
        const query = 'INSERT INTO textos (titulo, numero_aula, tema_id, conteudo) VALUES (?, ?, ?, ?)';
        db.run(query, [titulo, numero_aula, temaId, conteudo], function (err) {
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

module.exports = router;

console.log('Rotas de textos carregadas'); // Log de depuração