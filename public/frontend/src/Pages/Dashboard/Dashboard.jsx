import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import {
  MdPeople,
  MdPerson,
  MdPersonOff,
  MdAttachMoney,
  MdWork,
  MdTrendingUp,
  MdTrendingFlat,
} from "react-icons/md";
import "./Dashboard.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const API = "https://backend-sag-50g0.onrender.com/funcionarios";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    ativos: 0,
    inativos: 0,
    folhaMensal: 0,
    mediaSalarial: 0,
    maiorSalario: 0,
    cargoMaisFuncionarios: "-",
    cargoMaiorSalario: "-",
  });

  const [dadosBarra, setDadosBarra] = useState(null);
  const [dadosLinha, setDadosLinha] = useState(null);
  const [dadosMediaSalarial, setDadosMediaSalarial] = useState(null);
  const [dadosStatus, setDadosStatus] = useState(null);
  const [dadosFolhaDept, setDadosFolhaDept] = useState(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const resposta = await fetch(API);
        const funcionarios = await resposta.json();

        const ativos = funcionarios.filter((f) => f.status === "Ativo").length;
        let folha = 0;
        let maxSal = 0;
        let cargoMaxSal = "-";
        const contagemCargos = {};
        const contagemDept = {};
        const somaSalariosDept = {};
        const statusCounts = { Ativo: 0, Inativo: 0 };
        const contagemMes = {};

        funcionarios.forEach((f) => {
          const salario = Number(f.salario) || 0;
          const dept = f.departamento || "Sem Departamento";
          const status = f.status || "Inativo";

          folha += salario;

          if (salario > maxSal) {
            maxSal = salario;
            cargoMaxSal = f.cargo || "Sem Cargo";
          }

          const cargo = f.cargo || "Sem Cargo";
          contagemCargos[cargo] = (contagemCargos[cargo] || 0) + 1;

          contagemDept[dept] = (contagemDept[dept] || 0) + 1;
          somaSalariosDept[dept] = (somaSalariosDept[dept] || 0) + salario;
          if (statusCounts[status] !== undefined) statusCounts[status]++;

          if (f.data_admissao) {
            const mesAno = f.data_admissao.substring(0, 7);
            contagemMes[mesAno] = (contagemMes[mesAno] || 0) + 1;
          }
        });

        const media = funcionarios.length > 0 ? folha / funcionarios.length : 0;

        let cargoMaisComum = "-";
        let maxOcorrencias = 0;
        for (const [cargo, count] of Object.entries(contagemCargos)) {
          if (count > maxOcorrencias) {
            maxOcorrencias = count;
            cargoMaisComum = cargo;
          }
        }

        setStats({
          total: funcionarios.length,
          ativos,
          inativos: funcionarios.length - ativos,
          folhaMensal: folha,
          mediaSalarial: media,
          maiorSalario: maxSal,
          cargoMaisFuncionarios: cargoMaisComum,
          cargoMaiorSalario: cargoMaxSal,
        });

        const labelsDept = Object.keys(contagemDept);
        setDadosBarra({
          labels: labelsDept,
          datasets: [
            {
              label: "Nº de Funcionários",
              data: Object.values(contagemDept),
              backgroundColor: "#2563eb", 
              borderRadius: 6,
              barPercentage: 0.6,
            },
          ],
        });

        const mesesOrdenados = Object.keys(contagemMes).sort();
        setDadosLinha({
          labels: mesesOrdenados.map((m) => {
            const [ano, mes] = m.split("-");
            return `${mes}/${ano}`;
          }),
          datasets: [
            {
              label: "Novas Contratações",
              data: mesesOrdenados.map((m) => contagemMes[m]),
              borderColor: "#00f2fe", // Cyan Neon
              backgroundColor: "rgba(0, 242, 254, 0.1)",
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: "#ffffff",
              pointBorderColor: "#00f2fe",
              pointBorderWidth: 2,
              pointRadius: 4,
            },
          ],
        });

        setDadosMediaSalarial({
          labels: labelsDept,
          datasets: [
            {
              label: "Média Salarial (R$)",
              data: labelsDept.map(
                (d) => somaSalariosDept[d] / contagemDept[d],
              ),
              backgroundColor: "#60a5fa", // Azul Claro
              borderRadius: 6,
            },
          ],
        });

        setDadosStatus({
          labels: ["Ativos", "Inativos/Licença"],
          datasets: [
            {
              data: [statusCounts.Ativo, statusCounts.Inativo],
              backgroundColor: ["#2563eb", "#cbd5e1"], // Azul forte vs Cinza neutro
              borderWidth: 0,
              hoverOffset: 4,
            },
          ],
        });

        setDadosFolhaDept({
          labels: labelsDept,
          datasets: [
            {
              label: "Investimento Total (R$)",
              data: labelsDept.map((d) => somaSalariosDept[d]),
              backgroundColor: "#1d4ed8", // Azul Escuro
              borderRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error("Erro ao carregar dados para o dashboard", error);
      }
    }
    fetchDashboardData();
  }, []);

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const opcoesBaseGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { family: "Poppins", size: 13, weight: "bold" },
        bodyFont: { family: "Poppins", size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Poppins", size: 11 }, color: "#64748b" },
      },
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { family: "Poppins", size: 11 },
          color: "#64748b",
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Header toggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="main-content">
        <div className="page-header">
          <div>
            <h2>Painel Administrativo</h2>
            <p>Visão geral e métricas da força de trabalho.</p>
          </div>
        </div>

        <div className="bento-grid">
          <div className="metric-card">
            <MdPeople className="metric-icon-watermark" />
            <p>Total de Funcionários</p>
            <h3>{stats.total}</h3>
            <span className="trend-indicator positive">
              <MdTrendingUp size={16} /> Estável
            </span>
          </div>
          <div className="metric-card">
            <MdPerson className="metric-icon-watermark" />
            <p>Ativos no Momento</p>
            <h3>{stats.ativos}</h3>
            <span className="trend-indicator positive">
              <MdTrendingUp size={16} /> Operacional
            </span>
          </div>
          <div className="metric-card">
            <MdPersonOff className="metric-icon-watermark" />
            <p>Licença / Inativos</p>
            <h3>{stats.inativos}</h3>
            <span className="trend-indicator neutral">
              <MdTrendingFlat size={16} /> Sem alterações
            </span>
          </div>
          <div className="metric-card">
            <MdAttachMoney className="metric-icon-watermark" />
            <p>Folha Mensal</p>
            <h3>{formatarMoeda(stats.folhaMensal)}</h3>
          </div>
          <div className="metric-card">
            <MdAttachMoney className="metric-icon-watermark" />
            <p>Média Salarial</p>
            <h3>{formatarMoeda(stats.mediaSalarial)}</h3>
          </div>
          <div className="metric-card">
            <MdAttachMoney className="metric-icon-watermark" />
            <p>Maior Salário</p>
            <h3>{formatarMoeda(stats.maiorSalario)}</h3>
            <span className="trend-indicator neutral">
              <MdWork size={14} style={{ marginRight: "2px" }} />{" "}
              {stats.cargoMaiorSalario}
            </span>
          </div>
          <div className="metric-card">
            <MdWork className="metric-icon-watermark" />
            <p>Maior Equipe</p>
            <h3 style={{ fontSize: "28px" }}>{stats.cargoMaisFuncionarios}</h3>
          </div>
        </div>

        <div className="charts-scroll-container">
          <div className="chart-card scroll-item">
            <div className="chart-header">
              <h4>Funcionários por Departamento</h4>
            </div>
            <div className="chart-wrapper">
              {dadosBarra ? (
                <Bar data={dadosBarra} options={opcoesBaseGrafico} />
              ) : (
                <div className="chart-area-empty">
                  <p>A carregar dados...</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card scroll-item">
            <div className="chart-header">
              <h4>Média Salarial por Departamento</h4>
            </div>
            <div className="chart-wrapper">
              {dadosMediaSalarial ? (
                <Bar data={dadosMediaSalarial} options={opcoesBaseGrafico} />
              ) : (
                <div className="chart-area-empty">
                  <p>A carregar dados...</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card scroll-item" style={{ minWidth: "350px" }}>
            <div className="chart-header">
              <h4>Distribuição por Status</h4>
            </div>
            <div
              className="chart-wrapper"
              style={{ height: "100%", paddingBottom: "10px" }}
            >
              {dadosStatus ? (
                <Doughnut
                  data={dadosStatus}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { font: { family: "Poppins", size: 13 } },
                      },
                    },
                    cutout: "75%",
                  }}
                />
              ) : (
                <div className="chart-area-empty">
                  <p>A carregar dados...</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card scroll-item">
            <div className="chart-header">
              <h4>Folha Salarial por Departamento</h4>
            </div>
            <div className="chart-wrapper">
              {dadosFolhaDept ? (
                <Bar
                  data={dadosFolhaDept}
                  options={{ ...opcoesBaseGrafico, indexAxis: "y" }}
                />
              ) : (
                <div className="chart-area-empty">
                  <p>A carregar dados...</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card scroll-item">
            <div className="chart-header">
              <h4>Tendência de Contratações</h4>
            </div>
            <div className="chart-wrapper">
              {dadosLinha ? (
                <Line data={dadosLinha} options={opcoesBaseGrafico} />
              ) : (
                <div className="chart-area-empty">
                  <p>A carregar dados...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
