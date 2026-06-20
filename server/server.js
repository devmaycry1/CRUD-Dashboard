const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { createClient } = require("@libsql/client");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

console.log("Tentando conectar ao banco de dados Turso...");

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
  .then(() => {
    console.log("Banco de dados pronto e conectado na nuvem!");
  })
  .catch((err) => {
    console.error("Erro ao criar/verificar tabela:", err.message);
  });

app.get("/", (req, res) => {
  res.send("API Funcionando com Turso!");
});

app.post("/chat", async (req, res) => {
  try {
    const { mensagem } = req.body;
    if (!mensagem)
      return res.status(400).json({ erro: "A mensagem é obrigatória." });

    const respostaAPI = await fetch(
      "https://backend-sag-50g0.onrender.com/funcionarios",
    );
    const funcionarios = await respostaAPI.json();

    const total = funcionarios.length;
    const ativos = funcionarios.filter((f) => f.status === "Ativo").length;
    const folhaTotal = funcionarios.reduce(
      (acc, f) => acc + (Number(f.salario) || 0),
      0,
    );
    const mediaSalarial = total > 0 ? folhaTotal / total : 0;

    const contagemMes = {};
    let ultimos6MesesContratacoes = 0;

    funcionarios.forEach((f) => {
      if (f.data_admissao) {
        const mesAno = f.data_admissao.substring(0, 7);
        contagemMes[mesAno] = (contagemMes[mesAno] || 0) + 1;
      }
    });

    const mesesOrdenados = Object.keys(contagemMes).sort();
    const historicoTexto = mesesOrdenados
      .map((m) => `${m}: ${contagemMes[m]} admissões`)
      .join(" | ");

    const mediaContratacoesMes =
      mesesOrdenados.length > 0
        ? (total / mesesOrdenados.length).toFixed(1)
        : 0;

    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const promptContexto = `
            Você é o Personna Copilot, um Analista de Dados de Recursos Humanos especialista em Análise Preditiva.
            
            SUA MISSÃO:
            Responda à pergunta do utilizador com base EXCLUSIVAMENTE nos dados fornecidos abaixo.
            Se o utilizador pedir previsões futuras, utilize estatística básica (média de crescimento, progressão linear) com base no histórico mensal para projetar os próximos 3 a 6 meses.
            Deixe claro que as previsões são estimativas matemáticas baseadas no comportamento passado.

            DADOS ATUAIS:
            - Funcionários Ativos: ${ativos} (de um total de ${total} registados)
            - Custo Total da Folha: R$ ${folhaTotal.toFixed(2)}
            - Média Salarial: R$ ${mediaSalarial.toFixed(2)}

            HISTÓRICO DE CRESCIMENTO (Linha do Tempo):
            - Evolução de Admissões por Mês: [ ${historicoTexto} ]
            - Taxa Média Histórica: ${mediaContratacoesMes} novas contratações por mês.

            Pergunta do utilizador: "${mensagem}"
        `;

    const result = await model.generateContent(promptContexto);
    const respostaIA = result.response.text();

    res.json({ resposta: respostaIA });
  } catch (error) {
    console.error("Erro na comunicação com o Gemini:", error);
    res
      .status(500)
      .json({
        erro: "Não foi possível processar a sua solicitação no momento.",
      });
  }
});

app.get("/funcionarios", async (req, res) => {
  try {
    const resultado = await db.execute("SELECT * FROM funcionarios");
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
      args: [id],
    });

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: "Funcionário não encontrado" });
    }

    res.json(resultado.rows[0]);
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
    console.error("Erro no POST:", err.message);
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
    console.error("Erro no PUT:", err.message);
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
    console.error("Erro no DELETE:", err.message);
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
    console.error("Erro na exportação:", err.message);
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
