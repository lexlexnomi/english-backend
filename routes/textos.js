const express = require('express');
const pool = require('../database/db');
import fetch from 'node-fetch';  // Para realizar requisições HTTP para a API de temas

const router = express.Router();

// Listar todos os textos
router.get('/', async (req, res) => {
    const query = `
        SELECT textos.*, aulas.numero as numero_aula, aulas.data, temas.nome as tema
        FROM textos
        JOIN aulas ON textos.aula_id = aulas.id
        JOIN temas ON textos.tema_id = temas.id`;
    try {
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar textos por aula
router.get('/aula/:numeroAula', async (req, res) => {
    const { numeroAula } = req.params;
    console.log(`Buscando textos para a aula ${numeroAula}`);
    const query = `
        SELECT textos.*, aulas.numero as numero_aula, aulas.data 
        FROM textos
        JOIN aulas ON textos.aula_id = aulas.id
        WHERE aulas.numero = $1`;
    try {
        const { rows } = await pool.query(query, [numeroAula]);
        console.log("Resultado da consulta:", rows);
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar textos:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// Rota para buscar um texto pelo ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM textos WHERE id = $1';
    try {
        const { rows } = await pool.query(query, [id]);
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Texto não encontrado.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Adicionar um novo texto
router.post('/', async (req, res) => {
    const { titulo, aula_id, tema, conteudo } = req.body;

    try {
        console.log("Recebendo dados:", req.body); // Verifique se os dados estão corretos

        // Buscando o tema na API de temas
        const temaResponse = await fetch(`http://localhost:3000/api/temas?nome=${tema}`);
        const temaData = await temaResponse.json();
        const temaId = temaData.id;  // A API deve retornar o ID do tema
        
        const query = "INSERT INTO textos (titulo, aula_id, tema_id, conteudo) VALUES ($1, $2, $3, $4) RETURNING id";
        const { rows } = await pool.query(query, [titulo, aula_id, temaId, conteudo]);

        res.json({ id: rows[0].id });
    } catch (error) {
        console.error("Erro ao adicionar texto:", error.message); // Adicionando logs detalhados
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
