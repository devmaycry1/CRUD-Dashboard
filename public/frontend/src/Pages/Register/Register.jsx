import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { valida } from "../../utils/validacao.js";

const API = "https://server-crimson-haze-2799.fly.dev/funcionarios";

export default function Register() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");

    const [form, setForm] = useState({
        nome: "",
        email: "",
        cargo: "",
        departamento: "",
        salario: "",
        data_admissao: "",
        status: "Ativo"
    });

    useEffect(() => {

        if (!id) return;

        async function carregarFuncionario() {
            try {
                const resposta = await fetch(`${API}/${id}`);
                const dados = await resposta.json();

                setForm({
                    nome: dados.nome || "",
                    email: dados.email || "",
                    cargo: dados.cargo || "",
                    departamento: dados.departamento || "",
                    salario: dados.salario || "",
                    data_admissao:
                        dados.data_admissao?.split("T")[0] || "",
                    status: dados.status || "Ativo"
                });

            } catch (error) {
                console.error("Erro ao carregar funcionário:", error);
            }
        }

        carregarFuncionario();

    }, [id]);

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const inputs = e.target.querySelectorAll("input, select");

        inputs.forEach(input => valida(input));

        const formularioValido =
            [...inputs].every(input => input.validity.valid);

        if (!formularioValido) return;

        const url = id ? `${API}/${id}` : API;
        const metodo = id ? "PUT" : "POST";

        await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(form)
        });

        navigate("/");
    }

    return (
        <div className="page">
            <div className="main-content">

                {id ? "Editar Funcionário" : "Novo Funcionário"}

                <form className="form" onSubmit={handleSubmit} noValidate>

                    <div className="input-container">
                        <input
                            type="text"
                            name="nome"
                            placeholder="Nome"
                            required
                            data-tipo="nome"
                            value={form.nome}
                            onChange={handleChange}
                            onBlur={(e) => valida(e.target)}
                        />
                        <span className="input-mensagem-erro"></span>
                    </div>


                    <div className="input-container">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            required
                            data-tipo="email"
                            value={form.email}
                            onChange={handleChange}
                            onBlur={(e) => valida(e.target)}
                        />
                        <span className="input-mensagem-erro"></span>
                    </div>

                    <div className="input-container">
                        <input
                            type="text"
                            name="cargo"
                            placeholder="Cargo"
                            required
                            data-tipo="cargo"
                            value={form.cargo}
                            onChange={handleChange}
                            onBlur={(e) => valida(e.target)}
                        />
                        <span className="input-mensagem-erro"></span>
                    </div>

                    <div className="input-container">
                        <input
                            type="text"
                            name="departamento"
                            placeholder="Departamento"
                            required
                            data-tipo="departamento"
                            value={form.departamento}
                            onChange={handleChange}
                            onBlur={(e) => valida(e.target)}
                        />
                        <span className="input-mensagem-erro"></span>
                    </div>

                    <div className="input-container">
                        <input
                            type="number"
                            name="salario"
                            placeholder="Salário"
                            required
                            min="0"
                            step="0.01"
                            data-tipo="salario"
                            value={form.salario}
                            onChange={handleChange}
                            onBlur={(e) => valida(e.target)}
                        />
                        <span className="input-mensagem-erro"></span>
                    </div>

                    <div className="input-container">
                        <input
                            type="date"
                            name="data_admissao"
                            required
                            value={form.data_admissao}
                            onChange={handleChange}
                        />
                        <span className="input-mensagem-erro"></span>
                    </div>

                    <div className="input-container">
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                        >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>

                    <div className="actions">
                        <button type="submit" className="btn primary">
                            {id ? "Salvar Alterações" : "Cadastrar"}
                        </button>

                        <button
                            type="button"
                            className="btn cancel"
                            onClick={() => navigate("/")}
                        >
                            Cancelar
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}