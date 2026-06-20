import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import toast from "react-hot-toast";

const API = "https://backend-sag-50g0.onrender.com/funcionarios";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargo: "",
    departamento: "",
    salario: "",
    data_admissao: "",
    status: "Ativo",
  });

  useEffect(() => {
    if (!id) return;
    async function carregarFuncionario() {
      const resposta = await fetch(`${API}/${id}`);
      const dados = await resposta.json();
      setForm({
        nome: dados.nome || "",
        email: dados.email || "",
        cargo: dados.cargo || "",
        departamento: dados.departamento || "",
        salario: dados.salario || "",
        data_admissao: dados.data_admissao?.split("T")[0] || "",
        status: dados.status || "Ativo",
      });
    }
    carregarFuncionario();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const metodo = id ? "PUT" : "POST";
    const url = id ? `${API}/${id}` : API;

    try {
      await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (id) {
        toast.success("Perfil atualizado com sucesso!");
      } else {
        toast.success("Novo funcionário cadastrado!");
      }

      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao guardar os dados.");
    }
  }

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Header toggleSidebar={() => setIsSidebarOpen(true)} />

      <main
        className="main-content"
        style={{ overflowY: "auto", display: "block" }}
      >
        <div
          className="page-header"
          style={{ maxWidth: "800px", margin: "0 auto 32px auto" }}
        >
          <div>
            <h2>
              {id
                ? "Editar Perfil do Funcionário"
                : "Cadastrar Novo Funcionário"}
            </h2>
            <p>Preencha os dados abaixo para atualizar o diretório.</p>
          </div>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-section">
            <h4>Informações Pessoais</h4>
            <div className="form-grid">
              <div className="input-group col-span-2">
                <label>Nome Completo</label>
                <input
                  type="text"
                  name="nome"
                  placeholder="Ex: João Silva"
                  required
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group col-span-2">
                <label>E-mail Corporativo</label>
                <input
                  type="email"
                  name="email"
                  placeholder="joao.silva@empresa.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h4>Detalhes Profissionais</h4>
            <div className="form-grid">
              <div className="input-group">
                <label>Departamento</label>
                <input
                  type="text"
                  name="departamento"
                  placeholder="Ex: Tecnologia"
                  required
                  value={form.departamento}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Cargo</label>
                <input
                  type="text"
                  name="cargo"
                  placeholder="Ex: Desenvolvedor Front-end"
                  required
                  value={form.cargo}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Salário Base (R$)</label>
                <input
                  type="number"
                  name="salario"
                  placeholder="0.00"
                  required
                  value={form.salario}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Data de Admissão</label>
                <input
                  type="date"
                  name="data_admissao"
                  required
                  value={form.data_admissao}
                  onChange={handleChange}
                />
              </div>

              <div className="input-group">
                <label>Status na Empresa</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              {id ? (
                <div className="input-group">
                  <label>ID do Funcionário</label>
                  <input
                    type="text"
                    value={`EP-00${id}`}
                    readOnly
                    className="input-readonly"
                  />
                </div>
              ) : (
                <div></div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/home")}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {id ? "Salvar Alterações" : "Cadastrar"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
