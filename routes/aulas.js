const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Rota para listar todas as aulas por número
router.get('/', (req, res) => {
    db.all('SELECT id, numero, data FROM aulas', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Rota para adicionar uma nova aula
router.post('/', (req, res) => {
    const { numero, data } = req.body;
    const query = 'INSERT INTO aulas (numero, data) VALUES (?, ?)';
    db.run(query, [numero, data], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

module.exports = router;
