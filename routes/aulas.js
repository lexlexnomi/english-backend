const express = require('express');
const pool = require("../database/db");

const router = express.Router();

// Rota para listar todas as aulas por número
router.get("/", async (req, res) => {
    try {
        const query = "SELECT id, numero, data FROM aulas";
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para adicionar uma nova aula
router.post('/', async (req, res) => {
    const { numero, data } = req.body;
    const query = "INSERT INTO aulas (numero, data) VALUES ($1, $2) RETURNING id";

    try {
        const { rows } = await pool.query(query, [numero, data]);
        res.json({ id: rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
