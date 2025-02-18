const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Rota para listar todas as aulas por número
router.get('/', (req, res) => {
    try {
        // Usando db.prepare() para preparar a consulta e db.all() de forma síncrona
        const query = 'SELECT id, numero, data FROM aulas';
        const rows = db.prepare(query).all(); // .all() agora é síncrono
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para adicionar uma nova aula
router.post('/', (req, res) => {
    const { numero, data } = req.body;
    const query = 'INSERT INTO aulas (numero, data) VALUES (?, ?)';
    try {
        // Usando db.prepare() para preparar a consulta e db.run() de forma síncrona
        const stmt = db.prepare(query);
        const result = stmt.run(numero, data);
        res.json({ id: result.lastInsertRowid }); // Usando lastInsertRowid para retornar o ID da nova aula
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
