const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'customError',
    'rangeUnderflow', 
    'stepMismatch'  
];

const mensagensDeErro = {
    nome: {
        valueMissing: 'O campo de nome não pode estar vazio.'
    },
    email: {
        valueMissing: 'O campo de email não pode estar vazio.',
        typeMismatch: 'O email digitado não é válido.'
    },
    cargo: {
        valueMissing: 'O campo de cargo não pode estar vazio.'
    },
    departamento: {
        valueMissing: 'O campo de departamento não pode estar vazio.'
    },
    salario: {
        valueMissing: 'O campo de salário não pode estar vazio.',
        rangeUnderflow: 'O salário não pode ser negativo.',
        stepMismatch: 'O salário deve ter no máximo duas casas decimais.'
    }
};

function mostraMensagemDeErro(tipoInput, input) {
    let mensagem = '';
    tiposDeErro.forEach(erro => {
        if (input.validity[erro]) {
            mensagem = mensagensDeErro[tipoInput]?.[erro] || 'Campo preenchido incorretamente.';
        }
    });

    return mensagem;
}

export function valida(input) {
    const tipoInput = input.dataset.tipo;


    const spanMensagemErro = input.parentElement.querySelector('.input-mensagem-erro');

    if (input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido');
        if (spanMensagemErro) spanMensagemErro.innerHTML = '';
    } else {
        input.parentElement.classList.add('input-container--invalido');
        if (spanMensagemErro) spanMensagemErro.innerHTML = mostraMensagemDeErro(tipoInput, input);
    }
}

