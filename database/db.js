const sqlite3 = require('better-sqlite3');

// Conectar ao banco de dados (ou criar se não existir)
const db = sqlite3('./database/estudos.db');

// Verificar a conexão
console.log('Conectado ao banco de dados SQLite.');

// Função para criar tabelas
function criarTabelas() {
    db.run(`
        CREATE TABLE IF NOT EXISTS aulas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero INTEGER NOT NULL UNIQUE,
            data TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS temas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS atividades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            aula_id INTEGER NOT NULL,
            concluida BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (aula_id) REFERENCES aulas(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS textos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            aula_id INTEGER NOT NULL,
            tema_id INTEGER NOT NULL,
            conteudo TEXT NOT NULL,
            FOREIGN KEY (aula_id) REFERENCES aulas(id),
            FOREIGN KEY (tema_id) REFERENCES temas(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS vocabularios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aula_id INTEGER NOT NULL,
            palavra TEXT NOT NULL,
            significado TEXT NOT NULL,
            tema_id INTEGER NOT NULL,
            frase_exemplo TEXT,
            FOREIGN KEY (aula_id) REFERENCES aulas(id),
            FOREIGN KEY (tema_id) REFERENCES temas(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS duvidas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            aula_id INTEGER NOT NULL,
            tag_id TEXT NOT NULL,
            resolvida BOOLEAN DEFAULT FALSE,
            descricao TEXT NOT NULL,
            comentarios TEXT,
            FOREIGN KEY (aula_id) REFERENCES aulas(id),
            FOREIGN KEY (tag_id) REFERENCES tags(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS recursos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            categoria_id INTEGER NOT NULL,
            url TEXT NOT NULL,
            descricao TEXT,
            FOREIGN KEY (categoria_id) REFERENCES gategorias(id)
        )
    `);

    console.log('Tabelas criadas com sucesso.');
}

module.exports = db;
