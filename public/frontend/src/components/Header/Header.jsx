import { useNavigate } from "react-router-dom";

export default function Header() {

  const navigate = useNavigate();

  function exportarCSV() {
    window.location.href = "crud-dashboard-production.up.railway.app/exportar";
  }

  function abrirDashboard() {
    window.open(
      "https://docs.google.com/spreadsheets/d/1QDD_ImMmftsl1sLyHBjkkoq12IZtos5gXOhMgkjti8E/edit?usp=sharing"
    );
  }

  return (
    <div className="dashboard-header">

      <div>
        <h1>Funcionários</h1>
        <p>Gerencie sua equipe</p>
      </div>

      <div className="actions">

        <button
          className="btn dashboard"
          onClick={abrirDashboard}
        >
          Dashboard
        </button>

        <button
          className="btn secondary"
          onClick={exportarCSV}
        >
          Exportar CSV
        </button>

        <button
          className="btn primary"
          onClick={() => navigate("/cadastro")}
        >
          Novo Funcionário
        </button>

      </div>

    </div>
  );
}