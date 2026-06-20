import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import { MdPersonAdd, MdMailOutline, MdWorkOutline } from "react-icons/md";
import toast from "react-hot-toast";
import "./Home.css";

const API = "https://backend-sag-50g0.onrender.com/funcionarios";
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(valor) || 0);
};

export default function Home() {
  const navigate = useNavigate();
  const [funcionarios, setFuncionarios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchFuncionarios() {
      try {
        const resposta = await fetch(API);
        const dados = await resposta.json();
        setFuncionarios(dados);
      } catch (error) {
        console.error("Erro ao carregar funcionários:", error);
      }
    }
    fetchFuncionarios();
  }, []);

  async function executarExclusao(id) {
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setFuncionarios((listaAntiga) =>
        listaAntiga.filter((func) => func.id !== id),
      );
      toast.success("Funcionário removido com sucesso!");
    } catch (error) {
      console.error("Erro ao remover:", error);
      toast.error("Não foi possível remover o funcionário.");
    }
  }

  function removerFuncionario(id) {
    toast(
      (t) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            minWidth: "300px",
          }}
        >
          <span
            style={{
              fontWeight: 700,
              color: "var(--texto-principal)",
              fontSize: "16px",
            }}
          >
            Deseja excluir este funcionário?
          </span>
          <span
            style={{
              fontSize: "14px",
              color: "var(--texto-secundario)",
              lineHeight: "1.4",
            }}
          >
            Esta ação é irreversível e removerá todos os dados permanentemente.
          </span>

          <div className="toast-actions">
            <button
              className="toast-btn toast-btn-cancel"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancelar
            </button>
            <button
              className="toast-btn toast-btn-confirm"
              onClick={() => {
                toast.dismiss(t.id);
                executarExclusao(id);
              }}
            >
              Sim, Excluir
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
        id: `toast-confirm-${id}`,
        style: {
          padding: "20px",
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      },
    );
  }

  function exportarCSV() {
    window.location.href = "https://backend-sag-50g0.onrender.com/exportar";
  }

  const funcionariosFiltrados = funcionarios.filter((f) => {
    const query = searchQuery.toLowerCase();
    return (
      f.nome?.toLowerCase().includes(query) ||
      f.cargo?.toLowerCase().includes(query) ||
      f.departamento?.toLowerCase().includes(query)
    );
  });

  const totalItens = funcionariosFiltrados.length;
  const totalPages = Math.ceil(totalItens / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = funcionariosFiltrados.slice(startIndex, endIndex);
  const startItem = totalItens === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + itemsPerPage, totalItens);

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Header
        searchQuery={searchQuery}
        setSearchQuery={(valorDigitado) => {
          setSearchQuery(valorDigitado);
          setCurrentPage(1);
        }}
        toggleSidebar={() => setIsSidebarOpen(true)}
      />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>Diretório de Funcionários</h2>
            <p>Gerencie a sua equipe e departamentos.</p>
          </div>
          <div className="actions-group">
            <button className="btn btn-success" onClick={exportarCSV}>
              Exportar CSV
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/cadastro")}
            >
              <MdPersonAdd size={20} />
              Novo Funcionário
            </button>
          </div>
        </div>

        <div className="employee-grid">
          {currentItems.map((func) => (
            <div key={func.id} className="employee-card">
              <div className="card-header">
                <div className="avatar">
                  {func.nome ? func.nome.charAt(0).toUpperCase() : "?"}
                </div>
                <span
                  className={`status-badge ${func.status === "Ativo" ? "status-ativo" : "status-inativo"}`}
                >
                  {func.status}
                </span>
              </div>

              <div className="card-body">
                <h3>{func.nome}</h3>
                <div className="info-line">
                  <MdWorkOutline size={16} />
                  <span>
                    {func.cargo} • {func.departamento}
                  </span>
                </div>
                <div className="info-line">
                  <MdMailOutline size={16} />
                  <span>{func.email}</span>
                </div>

                <div className="employee-salary">
                  <span>Salário base:</span>
                  <strong>{formatarMoeda(func.salario)}</strong>
                </div>
              </div>

              <div className="card-footer">
                <button
                  className="botao-acao editar"
                  onClick={() => navigate(`/cadastro?id=${func.id}`)}
                >
                  Editar
                </button>
                <button
                  className="botao-acao excluir"
                  onClick={() => removerFuncionario(func.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 0 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              <span>
                A apresentar <b>{startItem}</b> a <b>{endItem}</b> de{" "}
                <b>{totalItens}</b> resultados
              </span>
              <div className="rows-per-page">
                <span>Por página:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={16}>16</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>

            <div className="pagination-container">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`pagination-number ${currentPage === index + 1 ? "active" : ""}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
