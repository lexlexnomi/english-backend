const express = require('express');
const pool = require('../database/db');
const fetch = require('node-fetch');  // Para realizar requisições HTTP para a API de temas

const router = express.Router();

// Listar todos os vocabulários
router.get('/', async (req, res) => {
    const query = `
        SELECT vocabularios.*, aulas.numero as numero_aula, aulas.data, temas.nome as tema 
        FROM vocabularios
        JOIN aulas ON vocabularios.aula_id = aulas.id
        JOIN temas ON vocabularios.tema_id = temas.id`;
    try {
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar vocabularios por aula
router.get('/aula/:numeroAula', async (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando vocabulários para a aula ${numeroAula}`);
    const query = `
        SELECT vocabularios.*, aulas.numero as numero_aula, aulas.data, temas.nome as tema
        FROM vocabularios
        JOIN aulas ON vocabularios.aula_id = aulas.id
        JOIN temas ON vocabularios.tema_id = temas.id
        WHERE aulas.numero = $1`;
    try {
        const { rows } = await pool.query(query, [numeroAula]);
        console.log("Resultado da consulta:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar vocabulários:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Adicionar um novo vocabulário com tema
router.post('/', async (req, res) => {
    const { aula_id, palavra, significado, tema, frase_exemplo } = req.body;

    try {
        console.log("Recebendo dados:", req.body); // Verifique os dados recebidos

        // Buscando o tema na API de temas
        const temaResponse = await fetch(`http://localhost:3000/api/temas?nome=${tema}`);
        const temaData = await temaResponse.json();
        const temaId = temaData.id;  // A API deve retornar o ID do tema
        
        const query = "INSERT INTO vocabularios (aula_id, palavra, significado, tema_id, frase_exemplo) VALUES ($1, $2, $3, $4, $5) RETURNING id";
        const { rows } = await pool.query(query, [aula_id, palavra, significado, temaId, frase_exemplo]);

        res.json({ id: rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
