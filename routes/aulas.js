const express = require('express');
const pool = require("../database/db");

const router = express.Router();

// Rota para listar todas as aulas por número
router.get("/", async (req, res) => {
    try {
        const query = "SELECT id, numero, data::date AS data FROM aulas";
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para adicionar uma nova aula
router.post('/', async (req, res) => {
    let { numero, data } = req.body;

    try {
        // Converte a data para YYYY-MM-DD antes de inserir no banco
        const formattedDate = new Date(data).toISOString().split('T')[0]; 

        const query = "INSERT INTO aulas (numero, data) VALUES ($1, $2) RETURNING id";
        const { rows } = await pool.query(query, [numero, formattedDate]);

        res.json({ id: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;