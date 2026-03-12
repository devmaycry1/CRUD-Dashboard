export default function UserTable({ funcionarios, onEditar, onExcluir }) {

    function formatarData(dataISO) {
        if (!dataISO) return "";
        return new Date(dataISO).toLocaleDateString("pt-BR");
    }

    function formatarSalario(valor) {
        if (!valor) return "";
        return Number(valor).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    return (
        <div className="table-container">

            <table className="tabela-funcionarios">

                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th>Salário</th>
                        <th>Admissão</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>

                    {funcionarios.length === 0 ? (
                        <tr>
                            <td colSpan="8">
                                Nenhum funcionário cadastrado
                            </td>
                        </tr>
                    ) : (

                        funcionarios.map((f) => (

                            <tr key={f.id}>

                                <td>{f.nome}</td>
                                <td>{f.email}</td>
                                <td>{f.cargo}</td>
                                <td>{f.departamento}</td>

                                <td>
                                    {formatarSalario(f.salario)}
                                </td>

                                <td>
                                    {formatarData(f.data_admissao)}
                                </td>

                                <td>
                                    {f.status}
                                </td>

                                <td>

                                    <button
                                        className="botao-editar"
                                        onClick={() => onEditar(f.id)}
                                    >
                                        Editar
                                    </button>

                                    <button
                                        className="botao-excluir"
                                        onClick={() => onExcluir(f.id)}
                                    >
                                        Excluir
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>
    );
}