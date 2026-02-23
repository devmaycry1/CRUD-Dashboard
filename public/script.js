const API = 'http://localhost:3000/funcionarios';
const tabela = document.getElementById('tabelaFuncionarios');
const form = document.getElementById('formCadastro');
let idEmEdicao = null;
const botaoSalvar = document.getElementById('botaoSalvar')
const botaoCancelar = document.getElementById('botaoCancelar')

window.addEventListener('load', carregarFuncionarios)
botaoCancelar.addEventListener('click', cancelarEdicao)
form.addEventListener('submit', salvarFuncionario)

async function carregarFuncionarios() {
    const resposta = await fetch(API);
    const funcionarios = await resposta.json();

    tabela.innerHTML = "";

    funcionarios.forEach(f => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
      <td>${f.nome}</td>
      <td>${f.email ?? ""}</td>
      <td>${f.cargo ?? ""}</td>
      <td>${f.departamento ?? ""}</td>
      <td>R$ ${f.salario ?? ""}</td>
      <td>${formatarData(f.data_admissao)}</td>
      <td>${f.status ?? ""}</td>
    `;

        const tdAcoes = document.createElement("td");

        const botaoEditar = document.createElement("button");
        botaoEditar.textContent = "Editar";
        botaoEditar.classList.add('botao-editar')
        botaoEditar.addEventListener("click", () => editarFuncionario(f.id));

        const botaoExcluir = document.createElement("button");
        botaoExcluir.textContent = "Excluir";
        botaoExcluir.classList.add('botao-excluir')
        botaoExcluir.addEventListener("click", () => removerFuncionario(f.id));

        tdAcoes.appendChild(botaoEditar);
        tdAcoes.appendChild(botaoExcluir);

        linha.appendChild(tdAcoes);
        tabela.appendChild(linha);

    });
}

carregarFuncionarios();

async function salvarFuncionario(e) {
    e.preventDefault();

    const funcionario = {
        nome: form.nome.value,
        email: form.email.value,
        cargo: form.cargo.value,
        departamento: form.departamento.value,
        salario: form.salario.value,
        data_admissao: form.data_admissao.value,
        status: form.status.value
    };

    try {

        if (idEmEdicao !== null) {

            await fetch(`${API}/${idEmEdicao}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(funcionario)
            });

            idEmEdicao = null;
        }

        else {

            await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(funcionario)
            });

        }

        form.reset();
        botaoSalvar.textContent = "Cadastrar";
        botaoSalvar.classList.remove("editando");

        carregarFuncionarios();

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao salvar funcionário");
    }
}

async function removerFuncionario(id) {
    if (!confirm("Deseja excluir este funcionário?")) return;

    await fetch(`${API}/${id}`, {
        method: "DELETE"
    });

    carregarFuncionarios();
}

async function editarFuncionario(id) {
    const resposta = await fetch(`${API}/${id}`);
    const f = await resposta.json();

    form.nome.value = f.nome;
    form.email.value = f.email;
    form.cargo.value = f.cargo;
    form.departamento.value = f.departamento;
    form.salario.value = f.salario;
    form.data_admissao.value = f.data_admissao;
    form.status.value = f.status;

    idEmEdicao = id;

    botaoSalvar.textContent = "Atualizar";
    botaoSalvar.classList.add("editando");
    botaoCancelar.style.display = "inline-block";
}

function cancelarEdicao() {
    form.reset();
    idEmEdicao = null;

    botaoSalvar.textContent = "Cadastrar";
    botaoSalvar.classList.remove("editando");

    botaoCancelar.style.display = "none";
}

function formatarData(dataISO) {
    if (!dataISO) return "";

    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
}