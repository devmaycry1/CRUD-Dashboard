const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    const sql = `
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
  `;

    db.run(sql, (err) => {
        if (err) {
            console.error("Erro ao criar tabela:", err.message);
        } else {
            console.log("Banco de dados pronto.");
        }
    });
});
app.get('/', (req, res) => {
    res.send('API Funcionando!');
});


app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});

app.get('/funcionarios', (req, res) => {
  db.all("SELECT * FROM funcionarios", [], (err, rows) => {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json(rows);
  });
});


app.post('/funcionarios', (req, res) => {
  const { nome, email, cargo, departamento, salario, data_admissao, status } = req.body;

  const sql = `
    INSERT INTO funcionarios (nome, email, cargo, departamento, salario, data_admissao, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [nome, email, cargo, departamento, salario, data_admissao, status], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ id: this.lastID, mensagem: "Funcionário criado" });
  });
});

app.put('/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, cargo, departamento, salario, data_admissao, status } = req.body;

  const sql = `
    UPDATE funcionarios
    SET nome=?, email=?, cargo=?, departamento=?, salario=?, data_admissao=?, status=?
    WHERE id=?
  `;

  db.run(sql, [nome, email, cargo, departamento, salario, data_admissao, status, id], function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: "Funcionário atualizado" });
  });
});

app.delete('/funcionarios/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM funcionarios WHERE id=?", id, function(err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: "Funcionário removido" });
  });
});