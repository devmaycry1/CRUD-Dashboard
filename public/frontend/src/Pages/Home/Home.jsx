import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import { MdPersonAdd, MdMailOutline, MdWorkOutline } from "react-icons/md";
import toast from "react-hot-toast";
import "./Home.css";

const API = "https://backend-sag-50g0.onrender.com/funcionarios";

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
            gap: "12px",
            minWidth: "250px",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "var(--texto-principal)",
              fontSize: "15px",
            }}
          >
            Deseja excluir este funcionário?
          </span>
          <span style={{ fontSize: "13px", color: "var(--texto-secundario)" }}>
            Esta ação não poderá ser desfeita.
          </span>

          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "8px",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                background: "transparent",
                color: "var(--texto-secundario)",
                border: "1px solid var(--cor-borda)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                transition: "0.2s",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                executarExclusao(id);
              }}
              style={{
                background: "var(--status-inativo-bg)",
                color: "var(--status-inativo-texto)",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                transition: "0.2s",
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
