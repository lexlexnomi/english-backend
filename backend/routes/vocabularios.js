const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todos os vocabulários
router.get('/', (req, res) => {
    const query = `
        SELECT vocabularios.*, aulas.numero as numero_aula, aulas.data 
        FROM vocabularios
        JOIN aulas ON vocabularios.aula_id = aulas.id`;
    db.all(query, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Rota para buscar vocabularios por aula
router.get('/aula/:numeroAula', (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando vocabulários para a aula ${numeroAula}`);
    const query = `
        SELECT vocabularios.*, aulas.numero as numero_aula, aulas.data 
        FROM vocabularios
        JOIN aulas ON vocabularios.aula_id = aulas.id
        WHERE aulas.numero = ?`;
    db.all(query, [numeroAula], (err, rows) => {
        if (err) {
            console.error('Erro ao buscar vocabulários:', err.message);
            res.status(500).json({ error: err.message });
        } else {
            console.log('Resultado da consulta:', rows); // Log de depuração
            res.json(rows);
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

// Adicionar um novo vocabulário
router.post('/', async (req, res) => {
    const { numero_aula, palavra, significado, tema, frase_exemplo } = req.body;

    try {
        // Verifica se o tema já existe ou cria um novo
        const temaId = await verificarOuCriarTema(tema);

        // Insere o texto no banco de dados
        const query = 'INSERT INTO vocabularios (numero_aula, palavra, significado, tema_id, frase_exemplo) VALUES (?, ?, ?, ?, ?)';
        db.run(query, [numero_aula, palavra, significado, temaId, frase_exemplo], function (err) {
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
