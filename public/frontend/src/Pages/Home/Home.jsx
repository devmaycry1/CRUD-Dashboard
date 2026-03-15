import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import UserTable from "../../components/UserTable/UserTable";
import { useNavigate } from "react-router-dom";

const API = "https://server-crimson-haze-2799.fly.dev/funcionarios";

export default function Home() {
    const navigate = useNavigate();

    const [funcionarios, setFuncionarios] = useState([]);

    useEffect(() => {

        let ativo = true;

        async function fetchFuncionarios() {
            try {

                const resposta = await fetch(API);
                const dados = await resposta.json();

                if (ativo) {
                    setFuncionarios(dados);
                }

            } catch (error) {
                console.error("Erro ao carregar funcionários:", error);
                alert("Erro ao carregar funcionários");
            }
        }

        fetchFuncionarios();

        return () => {
            ativo = false;
        };

    }, []);

    async function recarregarFuncionarios() {

        const resposta = await fetch(API);
        const dados = await resposta.json();

        setFuncionarios(dados);
    }

    async function removerFuncionario(id) {

        if (!confirm("Deseja excluir este funcionário?")) return;

        try {

            await fetch(`${API}/${id}`, {
                method: "DELETE"
            });

            recarregarFuncionarios();

        } catch (error) {
            console.error(error);
            alert("Erro ao remover funcionário");
        }
    }

    function editarFuncionario(id) {
        navigate(`/cadastro?id=${id}`);
    }

    return (
        <div className="page">

            <Navbar />

            <main className="main-content">

                <Header />

                <UserTable
                    funcionarios={funcionarios}
                    onEditar={editarFuncionario}
                    onExcluir={removerFuncionario}
                />

            </main>

        </div>
    );
}