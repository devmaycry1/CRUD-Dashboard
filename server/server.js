const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { createClient } = require("@libsql/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const requiredEnv = [
  "GEMINI_API_KEY",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
];
requiredEnv.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Variável de ambiente ${envVar} não configurada.`);
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const tools = [
  {
    functionDeclarations: [
      {
        name: "getDadosRH",
        description:
          "Obtém dados atualizados dos funcionários da empresa SAG. Deve ser utilizada para perguntas sobre funcionários, salários, cargos, departamentos, admissões e análises de RH.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    ],
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  tools,
  systemInstruction: `
    Você é o Personna Copilot.
    REGRAS:
    1. Para qualquer pergunta relacionada a funcionários, salários, cargos, departamentos, admissões, RH, estatísticas ou previsões, VOCÊ DEVE utilizar a ferramenta getDadosRH.
    2. Nunca invente dados.
    3. Caso os dados não existam, informe claramente.
    4. Seja breve, profissional e objetivo.
    5. Não exponha dados brutos desnecessariamente.
    6. Gere análises e previsões apenas após consultar os dados reais.
    7. Não utilize SAG nas respostas
  `,
});

(async () => {
  try {
    await db.execute(`
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
    `);
    console.log("Banco de dados pronto!");
  } catch (err) {
    console.error("Erro ao verificar tabela:", err);
  }
})();

app.post("/chat", async (req, res) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({ erro: "Mensagem é obrigatória." });
    }

    console.log("Mensagem recebida:", mensagem);

    const chat = model.startChat();
    let result = await chat.sendMessage(mensagem);

    const functionCalls = result.response.functionCalls?.() || [];
    const call = functionCalls[0];

    if (call?.name === "getDadosRH") {
      console.log("Ferramenta getDadosRH solicitada.");

      const dbResult = await db.execute(`
        SELECT id, nome, cargo, departamento, salario, data_admissao, status
        FROM funcionarios LIMIT 500
      `);

      result = await chat.sendMessage([
        {
          functionResponse: {
            name: "getDadosRH",
            response: { funcionarios: dbResult.rows },
          },
        },
      ]);
    }

    const respostaFinal =
      result.response.text() || "Não foi possível gerar uma resposta.";
    res.json({ resposta: respostaFinal });
  } catch (error) {
    console.error("ERRO NO CHAT:", error);
    res.status(500).json({ erro: error.message });
  }
});

app.get("/funcionarios", async (req, res) => {
  try {
    const resultado = await db.execute("SELECT * FROM funcionarios");
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.post("/funcionarios", async (req, res) => {
  try {
    const { nome, email, cargo, departamento, salario, data_admissao, status } =
      req.body;
    const resultado = await db.execute({
      sql: `INSERT INTO funcionarios (nome, email, cargo, departamento, salario, data_admissao, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [nome, email, cargo, departamento, salario, data_admissao, status],
    });
    res.status(201).json({
      id: Number(resultado.lastInsertRowid),
      mensagem: "Funcionário criado com sucesso.",
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.put("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cargo, departamento, salario, data_admissao, status } =
      req.body;
    await db.execute({
      sql: `UPDATE funcionarios SET nome=?, email=?, cargo=?, departamento=?, salario=?, data_admissao=?, status=? WHERE id=?`,
      args: [
        nome,
        email,
        cargo,
        departamento,
        salario,
        data_admissao,
        status,
        id,
      ],
    });
    res.json({ mensagem: "Funcionário atualizado." });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await db.execute({
      sql: "SELECT * FROM funcionarios WHERE id = ?",
      args: [id],
    });
    if (resultado.rows.length === 0)
      return res.status(404).json({ erro: "Funcionário não encontrado" });
    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.delete("/funcionarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({
      sql: "DELETE FROM funcionarios WHERE id=?",
      args: [id],
    });
    res.json({ mensagem: "Funcionário removido." });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get("/exportar", async (req, res) => {
  try {
    const resultado = await db.execute("SELECT * FROM funcionarios");
    let csv = "id,nome,email,cargo,departamento,salario,data_admissao,status\n";
    resultado.rows.forEach((f) => {
      csv += `${f.id},${f.nome},${f.email},${f.cargo},${f.departamento},${f.salario},${f.data_admissao},${f.status}\n`;
    });
    res.header("Content-Type", "text/csv");
    res.attachment("funcionarios.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    servico: "SAG Backend",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
