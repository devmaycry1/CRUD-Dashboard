const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json());

const dbPath = process.env.DATABASE_URL || '/data/database.db';
const db = new sqlite3.Database(dbPath);

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


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
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

app.get("/funcionarios/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM funcionarios WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (!row) {
      return res.status(404).json({ erro: "Funcionário não encontrado" });
    }

    res.json(row);
  });
});


app.post('/funcionarios', (req, res) => {
  const { nome, email, cargo, departamento, salario, data_admissao, status } = req.body;

  const sql = `
    INSERT INTO funcionarios (nome, email, cargo, departamento, salario, data_admissao, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [nome, email, cargo, departamento, salario, data_admissao, status], function (err) {
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

  db.run(sql, [nome, email, cargo, departamento, salario, data_admissao, status, id], function (err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: "Funcionário atualizado" });
  });
});

app.delete('/funcionarios/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM funcionarios WHERE id=?", id, function (err) {
    if (err) {
      res.status(500).json({ erro: err.message });
      return;
    }
    res.json({ mensagem: "Funcionário removido" });
  });
});

app.get('/exportar', (req, res) => {
  db.all("SELECT * FROM funcionarios", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    let csv = "id,nome,email,cargo,departamento,salario,data_admissao,status\n";

    rows.forEach(f => {
      csv += `${f.id},${f.nome},${f.email},${f.cargo},${f.departamento},${f.salario},${f.data_admissao},${f.status}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("funcionarios.csv");
    res.send(csv);
  });
})