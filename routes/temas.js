const express = require('express');
const pool = require('../database/db'); // Conexão com o banco de dados

const router = express.Router();

// Rota para listar todos os temas
router.get('/', async (req, res) => {
    const query = 'SELECT * FROM temas'; // Ajuste conforme necessário para a consulta aos temas
    try {
        const { rows } = await pool.query(query);
        res.json(rows); // Retorna a lista de temas
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;