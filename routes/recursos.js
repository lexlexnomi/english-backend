const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todos os recursos
router.get('/', (req, res) => {
    db.all('SELECT * FROM recursos', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Função para verificar se uma categoria já existe
async function verificarOuCriarCategoria(categoria) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT id FROM categorias WHERE nome = ?';
        db.get(query, [categoria], (err, row) => {
            if (err) {
                reject(err);
            } else if (row) {
                // Categoria já existe, retorna o ID
                resolve(row.id);
            } else {
                // Categoria não existe, cria uma nova
                const insertQuery = 'INSERT INTO categorias (nome) VALUES (?)';
                db.run(insertQuery, [categoria], function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID); // Retorna o ID da nova categoria
                    }
                });
            }
        });
    });
}

// Adicionar um novo recurso
router.post('/', async (req, res) => {
    const { nome, categoria, url, descricao } = req.body;

    try {
        // Verifica se a categoria já existe ou cria uma nova
        const categoriaId = await verificarOuCriarCategoria(categoria);

        // Insere o recurso no banco de dados
        const query = 'INSERT INTO recursos (nome, categoria_id, url, descricao) VALUES (?, ?, ?, ?)';
        db.run(query, [nome, categoriaId, url, descricao], function (err) {
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

// Rota para buscar recursos por aula
router.get('/aula/:aulaId', (req, res) => {
    const { aulaId } = req.params;
    console.log(`Buscando recursos para a aula ID ${aulaId}`);
    const query =  `
    SELECT recursos.*, aulas.numero as numero_aula, aulas.data
    FROM recursos
    JOIN aulas ON recursos.aula_id = aulas.id
    WHERE aulas.id = ?`;
    db.all(query, [aulaId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

module.exports = router;
