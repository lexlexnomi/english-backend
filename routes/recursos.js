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
            console.log("Categoria já existe:", categoria);
            return rows[0].id;  // Retorna o ID da categoria existente
        } else {
            const insertQuery = "INSERT INTO categorias (nome) VALUES ($1) RETURNING id";
            const { rows: insertRows } = await pool.query(insertQuery, [categoria]);
            console.log("Categoria criada:", categoria);
            return insertRows[0].id;  // Retorna o ID da nova categoria
        }
    } catch (err) {
        console.error("Erro ao verificar/criar categoria:", err);
        throw err;
    }
}

// Adicionar um novo recurso
router.post('/', async (req, res) => {
    const { nome, categorias, url, descricao } = req.body;

    // Verifique o corpo da requisição
    console.log("Dados recebidos:", req.body);

    if (!nome || !categorias || !categorias.length || !url || !descricao) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios e a categoria não pode estar vazia.' });
    }

    try {
        // Inicializar um array para armazenar os IDs das categorias
        const categoriaIds = [];

        // Se categorias estiver vazia, aborta o processo
        if (categorias.length === 0) {
            return res.status(400).json({ error: 'A lista de categorias não pode estar vazia.' });
        }

        // Iterar sobre todas as categorias para verificar ou criar
        for (let categoria of categorias) {
            console.log("Nome da categoria recebido:", categoria);
            const categoriaId = await verificarOuCriarCategoria(categoria);

            if (categoriaId) {
                categoriaIds.push(categoriaId); // Adiciona o ID da categoria ao array
            } else {
                console.log(`Categoria não encontrada ou não criada para: ${categoria}`);
                return res.status(500).json({ error: `Erro ao associar a categoria ${categoria}` });
            }
        }

        // Adicionar o recurso na tabela 'recursos'
        const query = "INSERT INTO recursos (nome, url, descricao) VALUES ($1, $2, $3) RETURNING id";
        const { rows } = await pool.query(query, [nome, url, descricao]);
        const recursoId = rows[0].id;

        // Inserir todas as associações
        const insertAssociationsQuery = `
        INSERT INTO recursos_categorias (recurso_id, categoria_id)
        VALUES ($1, $2)
        `;

        // Para cada categoria associada ao recurso, vamos inserir a associação
        for (let categoriaId of categoriaIds) {
            console.log("Associando Recurso ID:", recursoId, "Categoria ID:", categoriaId);

            if (!categoriaId) {
                console.error("Erro: categoriaId é undefined ou null");
                continue;  // Pular inserção se categoriaId estiver indefinido
            }

            try {
                // Inserir na tabela intermediária
                const result = await pool.query(insertAssociationsQuery, [recursoId, categoriaId]);
                console.log(`Categoria ${categoriaId} associada ao recurso ${recursoId}`);
            } catch (error) {
                console.error("Erro ao associar categoria ao recurso:", error);
                return res.status(500).json({ error: `Erro ao associar categoria ${categoriaId} ao recurso.` });
            }
        }

        res.json({ id: recursoId });
    } catch (error) {
        console.error("Erro:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
