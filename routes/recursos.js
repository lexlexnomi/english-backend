const express = require('express');
const pool = require('../database/db');

const router = express.Router();

// Listar todos os recursos
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT * FROM recursos';
        const { rows } = await pool.query(query);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Função para verificar se uma categoria já existe ou criar
async function verificarOuCriarCategoria(categoria) {
    const query = 'SELECT id FROM categorias WHERE nome = $1';
    try {
        const { rows } = await pool.query(query, [categoria]);
        if (rows.length > 0) {
            return rows[0].id;
        } else {
            const insertQuery = "INSERT INTO categorias (nome) VALUES ($1) RETURNING id";
            const { rows: insertRows } = await pool.query(insertQuery, [categoria]);
            return insertRows[0].id;
        }
    } catch (err) {
        console.error("Erro ao verificar/criar categoria:", err);
        throw err;
    }
}

// Adicionar um novo recurso
router.post('/', async (req, res) => {
    const { nome, categorias, url, descricao } = req.body;

    // Verificar o corpo da requisição
    console.log("Dados recebidos:", req.body); // Isso ajuda a ver o que realmente está sendo enviado

    try {
        // Inicializar um array para armazenar os IDs das categorias
        const categoriaIds = [];

        // Iterar sobre todas as categorias para verificar ou criar
        for (let categoria of categorias) {
            console.log("Nome da categoria recebido:", categoria); // Imprime o nome da categoria
            const categoriaId = await verificarOuCriarCategoria(categoria);
            categoriaIds.push(categoriaId); // Adiciona o ID da categoria ao array
        }

        // Adicionar o recurso na tabela 'recursos'
        const query = "INSERT INTO recursos (nome, url, descricao) VALUES ($1, $2, $3) RETURNING id";
        const { rows } = await pool.query(query, [nome, url, descricao]);
        const recursoId = rows[0].id;

        // Agora associamos o recurso com as categorias na tabela 'recursos_categorias'
        const insertAssociationsQuery = `
            INSERT INTO recursos_categorias (recurso_id, categoria_id)
            VALUES 
            ($1, $2), 
            ($1, $3), 
            ($1, $4)
        `;

        // Inserir todas as associações
        await pool.query(insertAssociationsQuery, [recursoId, categoriaIds[0], categoriaIds[1], categoriaIds[2]]);

        res.json({ id: recursoId });
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
