const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@libsql/client');

const app = express();
app.use(cors());
app.use(express.json());

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

console.log("Tentando conectar ao banco de dados Turso...");

db.execute(`
  CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    cargo TEXT,
    departamento TEXT,
    salario REAL,
    data_admissao TEXT,
    status TEXT
  );
`).then(() => {
  console.log("Banco de dados pronto e conectado na nuvem!");
}).catch((err) => {
  console.error("Erro ao criar/verificar tabela:", err.message);
});

app.get('/', (req, res) => {
  res.send('API Funcionando com Turso!');
});

app.get('/funcionarios', async (req, res) => {
  try {
    const resultado = await db.execute("SELECT * FROM funcionarios");
    // O Turso devolve os registos na propriedade 'rows'
    res.json(resultado.rows);
  } catch (err) {
    console.error("Erro no GET:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

app.get("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await db.execute({
      sql: "SELECT * FROM funcionarios WHERE id = ?",
      args: [id]
    });

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Funcionário não encontrado" });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post('/funcionarios', async (req, res) => {
  try {
    const { nome, email, cargo, departamento, salario, data_admissao, status } = req.body;

    const resultado = await db.execute({
      sql: `INSERT INTO funcionarios (nome, email, cargo, departamento, salario, data_admissao, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [nome, email, cargo, departamento, salario, data_admissao, status]
    });

    res.status(201).json({
      id: Number(resultado.lastInsertRowid),
      mensagem: "Funcionário criado"
    });
  } catch (err) {
    console.error("Erro no POST:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

app.put('/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cargo, departamento, salario, data_admissao, status } = req.body;

    await db.execute({
      sql: `UPDATE funcionarios SET nome=?, email=?, cargo=?, departamento=?, salario=?, data_admissao=?, status=? WHERE id=?`,
      args: [nome, email, cargo, departamento, salario, data_admissao, status, id]
    });

    res.json({ mensagem: "Funcionário atualizado" });
  } catch (err) {
    console.error("Erro no PUT:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

app.delete('/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute({
      sql: "DELETE FROM funcionarios WHERE id=?",
      args: [id]
    });

    res.json({ mensagem: "Funcionário removido" });
  } catch (err) {
    console.error("Erro no DELETE:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

app.get('/exportar', async (req, res) => {
  try {
    const resultado = await db.execute("SELECT * FROM funcionarios");

    let csv = "id,nome,email,cargo,departamento,salario,data_admissao,status\n";

    resultado.rows.forEach(f => {
      csv += `${f.id},${f.nome},${f.email},${f.cargo},${f.departamento},${f.salario},${f.data_admissao},${f.status}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("funcionarios.csv");
    res.send(csv);
  } catch (err) {
    console.error("Erro na exportação:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});