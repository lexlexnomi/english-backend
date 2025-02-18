const express = require('express');
const db = require('../database/db');

const router = express.Router();

// Listar todos os vocabulários
router.get('/', (req, res) => {
    const query = `
        SELECT vocabularios.*, aulas.numero as numero_aula, aulas.data 
        FROM vocabularios
        JOIN aulas ON vocabularios.aula_id = aulas.id`;
    try {
        const rows = db.prepare(query).all(); // Método síncrono
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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
    try {
        const rows = db.prepare(query).all(numeroAula); // Método síncrono com parâmetro
        console.log('Resultado da consulta:', rows); // Log de depuração
        res.json(rows);
    } catch (err) {
        console.error('Erro ao buscar vocabulários:', err.message); // Log de erro
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se um tema já existe
function verificarOuCriarTema(tema) {
    const query = 'SELECT id FROM temas WHERE nome = ?';
    const row = db.prepare(query).get(tema); // Método síncrono
        if (row) {
            // Tema já existe, retorna o ID
            resolve(row.id);
        } else {
            // Tema não existe, cria um novo
            const insertQuery = 'INSERT INTO temas (nome) VALUES (?)';
            const stmt = db.prepare(insertQuery);
            const result = stmt.run(tema);
            return result.lastInsertRowid; // Retorna o ID da nova tag
        }
}

// Adicionar um novo vocabulário
router.post('/', (req, res) => {
    const { numero_aula, palavra, significado, tema, frase_exemplo } = req.body;

    try {
        // Verifica se o tema já existe ou cria um novo
        const temaId = verificarOuCriarTema(tema);

        // Insere o texto no banco de dados
        const query = 'INSERT INTO vocabularios (numero_aula, palavra, significado, tema_id, frase_exemplo) VALUES (?, ?, ?, ?, ?)';
        const stmt = db.prepare(query);
        const result = stmt.run(numero_aula, palavra, significado, temaId, frase_exemplo);

        res.json({ id: result.lastInsertRowid });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
