const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@libsql/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

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
          "Busca todos os dados atuais de funcionários, salários, departamentos e datas de admissão do sistema SAG. Use esta função para qualquer análise, previsão ou consulta sobre a equipa.",
      },
    ],
  },
];

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  tools: tools,
});

db.execute(
  `
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
`,
)
  .then(() => console.log("Banco de dados pronto!"))
  .catch((err) => console.error("Erro ao verificar tabela:", err.message));

app.post("/chat", async (req, res) => {
  try {
    const { mensagem } = req.body;
    console.log("Mensagem recebida:", mensagem);

    const chat = model.startChat();
    let result = await chat.sendMessage(mensagem);

    // Log para ver se a IA tentou chamar a ferramenta
    console.log("IA respondeu. Chamou ferramenta?", !!result.functionCalls);

    let call = result.functionCalls && result.functionCalls[0];

    if (call && call.name === "getDadosRH") {
      console.log("IA solicitou getDadosRH. Buscando dados no banco...");
      const dbResult = await db.execute("SELECT * FROM funcionarios");

      console.log("Dados buscados. Enviando de volta para a IA...");
      result = await chat.sendMessage([
        {
          functionResponse: {
            name: "getDadosRH",
            response: { result: JSON.stringify(dbResult.rows) },
          },
        },
      ]);
    }

    const respostaFinal = result.response.text();
    console.log("Resposta final da IA gerada com sucesso.");
    res.json({ resposta: respostaFinal });
  } catch (error) {
    // ESTA LINHA VAI MOSTRAR O ERRO NO LOG DO RENDER
    console.error("ERRO DETALHADO NO CHAT:", error);
    res
      .status(500)
      .json({ erro: "Erro ao processar solicitação: " + error.message });
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
      sql: `INSERT INTO funcionarios (nome, email, cargo, departamento, salario, data_admissao, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [nome, email, cargo, departamento, salario, data_admissao, status],
    });
    res.status(201).json({
      id: Number(resultado.lastInsertRowid),
      mensagem: "Funcionário criado",
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
    res.json({ mensagem: "Funcionário atualizado" });
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
    res.json({ mensagem: "Funcionário removido" });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.get("/exportar", async (req, res) => {
  try {
    const resultado = await db.execute("SELECT * FROM funcionarios");
    let csv = "id,nome,email,cargo,departamento,salario,data_admissao,status\n";
    resultado.rows.forEach(
      (f) =>
        (csv += `${f.id},${f.nome},${f.email},${f.cargo},${f.departamento},${f.salario},${f.data_admissao},${f.status}\n`),
    );
    res.header("Content-Type", "text/csv");
    res.attachment("funcionarios.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
