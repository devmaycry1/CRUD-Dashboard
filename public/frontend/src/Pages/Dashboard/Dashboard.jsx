import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";

// Importações do Chart.js
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement, // Necessário para o gráfico de Pizza/Doughnut
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Registo dos componentes do Chart.js
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
    Filler
);

const API = "http://localhost:3000/funcionarios";

export default function Dashboard() {
    const [stats, setStats] = useState({
        total: 0, ativos: 0, inativos: 0, folhaMensal: 0, mediaSalarial: 0, maiorSalario: 0, cargoMaisFuncionarios: "-", cargoMaiorSalario: "-"
    });

    const [dadosBarra, setDadosBarra] = useState(null);
    const [dadosLinha, setDadosLinha] = useState(null);

    // Novos estados para os gráficos
    const [dadosMediaSalarial, setDadosMediaSalarial] = useState(null);
    const [dadosStatus, setDadosStatus] = useState(null);
    const [dadosFolhaDept, setDadosFolhaDept] = useState(null);

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const resposta = await fetch(API);
                const funcionarios = await resposta.json();

                // 1. Cálculos para os Cards (Métricas Rápidas)
                const ativos = funcionarios.filter(f => f.status === "Ativo").length;
                let folha = 0;
                let maxSal = 0;
                let cargoMaxSal = "-";
                const contagemCargos = {};

                const contagemDept = {};
                const somaSalariosDept = {};
                const statusCounts = { Ativo: 0, Inativo: 0 };
                const contagemMes = {};

                funcionarios.forEach(f => {
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

                    // Agrupamentos para os Gráficos
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
                    total: funcionarios.length, ativos, inativos: funcionarios.length - ativos, folhaMensal: folha, mediaSalarial: media, maiorSalario: maxSal, cargoMaisFuncionarios: cargoMaisComum, cargoMaiorSalario: cargoMaxSal
                });

                // 2. Gráfico 1: Funcionários por Departamento
                const labelsDept = Object.keys(contagemDept);
                setDadosBarra({
                    labels: labelsDept,
                    datasets: [{
                        label: 'Nº de Funcionários',
                        data: Object.values(contagemDept),
                        backgroundColor: '#00288e',
                        borderRadius: 4,
                        barPercentage: 0.6,
                    }]
                });

                // 3. Gráfico 2: Tendência de Contratações
                const mesesOrdenados = Object.keys(contagemMes).sort();
                setDadosLinha({
                    labels: mesesOrdenados.map(m => {
                        const [ano, mes] = m.split('-');
                        return `${mes}/${ano}`;
                    }),
                    datasets: [{
                        label: 'Novas Contratações',
                        data: mesesOrdenados.map(m => contagemMes[m]),
                        borderColor: '#00288e',
                        backgroundColor: 'rgba(0, 40, 142, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#00288e',
                    }]
                });

                // 4. Gráfico 3: Média Salarial por Departamento
                setDadosMediaSalarial({
                    labels: labelsDept,
                    datasets: [{
                        label: 'Média Salarial (R$)',
                        data: labelsDept.map(d => somaSalariosDept[d] / contagemDept[d]),
                        backgroundColor: '#10b981', // Verde
                        borderRadius: 4,
                    }]
                });

                // 5. Gráfico 4: Distribuição por Status (Doughnut)
                setDadosStatus({
                    labels: ['Ativos', 'Inativos/Licença'],
                    datasets: [{
                        data: [statusCounts.Ativo, statusCounts.Inativo],
                        backgroundColor: ['#4f46e5', '#ef4444'], // Azul Índigo e Vermelho
                        borderWidth: 0,
                    }]
                });

                // 6. Gráfico 5: Folha Total por Departamento (Barras Horizontais)
                setDadosFolhaDept({
                    labels: labelsDept,
                    datasets: [{
                        label: 'Investimento Total (R$)',
                        data: labelsDept.map(d => somaSalariosDept[d]),
                        backgroundColor: '#f59e0b', // Âmbar
                        borderRadius: 4,
                    }]
                });

            } catch (error) {
                console.error("Erro ao carregar dados para o dashboard", error);
            }
        }
        fetchDashboardData();
    }, []);

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    const opcoesGraficoBarra = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#191c1e', titleFont: { family: 'Inter', size: 13 }, bodyFont: { family: 'Inter', size: 13 }, padding: 10, cornerRadius: 4 }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#505f76' } },
            y: { beginAtZero: true, border: { display: false }, grid: { color: '#e0e3e5' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#505f76', stepSize: 1 } }
        }
    };

    const opcoesGraficoLinha = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: '#191c1e', titleFont: { family: 'Inter', size: 13 }, bodyFont: { family: 'Inter', size: 13 }, padding: 10, cornerRadius: 4 }
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#505f76' } },
            y: { beginAtZero: true, border: { display: false }, grid: { color: '#e0e3e5', borderDash: [4, 4] }, ticks: { font: { family: 'Inter', size: 11 }, color: '#505f76', stepSize: 1 } }
        }
    };

    return (
        <div className={`app-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
            <Navbar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <Header toggleSidebar={() => setIsSidebarOpen(true)} />

            <main className="main-content">
                <div className="page-header">
                    <div>
                        <h2>Painel Administrativo</h2>
                        <p>Visão geral da força de trabalho atual.</p>
                    </div>
                </div>

                {/* Carrossel de Cartões */}
                <div className="bento-grid">
                    <div className="metric-card"><p>Total de Funcionários</p><h3>{stats.total}</h3></div>
                    <div className="metric-card"><p>Ativos no Momento</p><h3>{stats.ativos}</h3></div>
                    <div className="metric-card"><p>Licença / Inativos</p><h3>{stats.inativos}</h3></div>
                    <div className="metric-card"><p>Folha Mensal</p><h3>{formatarMoeda(stats.folhaMensal)}</h3></div>
                    <div className="metric-card"><p>Média Salarial</p><h3>{formatarMoeda(stats.mediaSalarial)}</h3></div>
                    <div className="metric-card"><p>Maior Salário</p><h3>{formatarMoeda(stats.maiorSalario)}</h3></div>
                    <div className="metric-card"><p>Maior Salário (Cargo)</p><h3 style={{ fontSize: '24px' }}>{stats.cargoMaiorSalario}</h3></div>
                    <div className="metric-card"><p>Maior Equipe</p><h3 style={{ fontSize: '24px' }}>{stats.cargoMaisFuncionarios}</h3></div>
                </div>

                {/* GALERIA DE GRÁFICOS COM SCROLL HORIZONTAL */}
                <div className="charts-scroll-container">

                    {/* Gráfico 1: Funcionários por Departamento */}
                    <div className="chart-card scroll-item">
                        <div className="chart-header">
                            <h4>Funcionários por Departamento</h4>
                        </div>
                        <div className="chart-wrapper">
                            {dadosBarra ? <Bar data={dadosBarra} options={opcoesGraficoBarra} /> : <div className="chart-area-empty"><p>A carregar dados...</p></div>}
                        </div>
                    </div>

                    {/* Gráfico 2: Média Salarial por Departamento */}
                    <div className="chart-card scroll-item">
                        <div className="chart-header">
                            <h4>Média Salarial por Departamento</h4>
                        </div>
                        <div className="chart-wrapper">
                            {dadosMediaSalarial ? <Bar data={dadosMediaSalarial} options={opcoesGraficoBarra} /> : <div className="chart-area-empty"><p>A carregar dados...</p></div>}
                        </div>
                    </div>

                    {/* Gráfico 3: Distribuição por Status (Pizza) */}
                    <div className="chart-card scroll-item" style={{ minWidth: '400px' }}>
                        <div className="chart-header">
                            <h4>Distribuição por Status</h4>
                        </div>
                        <div className="chart-wrapper" style={{ height: '100%', paddingBottom: '10px' }}>
                            {dadosStatus ? (
                                <Doughnut
                                    data={dadosStatus}
                                    options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter' } } } } }}
                                />
                            ) : <div className="chart-area-empty"><p>A carregar dados...</p></div>}
                        </div>
                    </div>

                    {/* Gráfico 4: Folha Salarial por Departamento (Horizontal) */}
                    <div className="chart-card scroll-item">
                        <div className="chart-header">
                            <h4>Folha Salarial por Departamento</h4>
                        </div>
                        <div className="chart-wrapper">
                            {dadosFolhaDept ? (
                                <Bar
                                    data={dadosFolhaDept}
                                    options={{ ...opcoesGraficoBarra, indexAxis: 'y' }} // O indexAxis 'y' inverte o gráfico
                                />
                            ) : <div className="chart-area-empty"><p>A carregar dados...</p></div>}
                        </div>
                    </div>

                    {/* Gráfico 5: Tendência de Contratações */}
                    <div className="chart-card scroll-item">
                        <div className="chart-header">
                            <h4>Tendência de Contratações</h4>
                        </div>
                        <div className="chart-wrapper">
                            {dadosLinha ? <Line data={dadosLinha} options={opcoesGraficoLinha} /> : <div className="chart-area-empty"><p>A carregar dados...</p></div>}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}