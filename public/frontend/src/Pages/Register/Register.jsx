import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { valida } from "../../utils/validacao.js";

export default function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        nome: "",
        email: "",
        cargo: "",
        departamento: "",
        salario: "",
        data_admissao: "",
        status: "Ativo"
    });

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

        const formularioValido = [...inputs].every(input => input.validity.valid);

        if (!formularioValido) return;

        await fetch("http://localhost:3000/funcionarios", {
            method: "POST",
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

                <h1>Novo Funcionário</h1>

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
                            Cadastrar
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