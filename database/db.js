const { Pool } = require("pg");

require('dotenv').config(); // Carrega as variáveis do .env
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT, // Padrão do PostgreSQL
  ssl: {
    rejectUnauthorized: false, // Necessário para conexões remotas no Render
  },
});

pool.connect()
  .then(() => console.log("🔥 Conectado ao PostgreSQL do Render!"))
  .catch(err => console.error("Erro ao conectar ao PostgreSQL:", err));

module.exports = { pool };
