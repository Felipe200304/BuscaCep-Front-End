window.onload = async () => {
    await listarFavoritos();
};

async function exibirFavoritos(){

    await listarFavoritos();

    const historicoElement = document.getElementById("historicoFavoritos");
    historicoElement.innerHTML = "<strong>Histórico de favoritos:</strong><br>";
    historicodefavoritos.forEach(endereco => {
        historicoElement.innerHTML += 
        `
        <br>
        <div>
        <p>CEP: ${endereco.cep}</p>
        <p>Logradouro: ${endereco.logradouro}</p>
        <p>Bairro: ${endereco.bairro}</p>
        <p>Cidade: ${endereco.localidade}</p>
        <p>Estado: ${endereco.uf}</p>
        </div> 
        <br>
        <br>
        `

    });
}

function ocultarFavoritos(){
    const historicoElement = document.getElementById("historicoFavoritos");
    historicoElement.innerHTML = "<strong>Histórico de favoritos:</strong><br>";
    historicoElement.innerHTML = " ";
}

async function getCep(cepValue) {
    if (cepValue === null || cepValue === "") {
        return;
    } 

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar informações do CEP');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Erro ao obter informações do CEP: ' + error.message);
    }
}

historicoPesquisas = []; // Array para armazenar o histórico de pesquisas.
const enderecos = []; // Array para armazenar os endereços e persistir no banco de dados.
let historicodefavoritos = []; //Array para armazenar os endereços favoritos no banco.

function adicionarAoHistorico(cep) {
    if (!historicoPesquisas.includes(cep)) {
        historicoPesquisas.push(cep);
        exibirHistorico();
    }
}

function adicionarAlistaDeFavoritos(endereco) {
//Limpa a lista de endereços para pegar somente o primeiro item da lista
    enderecos.length = 0;
    enderecos.push(endereco);
}

async function adicionarAosFavoritos() {

    var novoEndereco = enderecos[0];

    try {
        const response = await fetch(`https://soft-foot-production.up.railway.app/enderecos/salvar`, {
            method: "POST",
            mode: "cors",
            body: JSON.stringify(novoEndereco),
            headers: {
                "Content-type": "application/json"
            }
        })
        .then(res => {
            if (novoEndereco === undefined || novoEndereco === null || novoEndereco === "") {
                throw new Error('O CEP não pode ser vazio');
            }

            res.json();
            if (res.status === 400) {
                throw new Error('Já possui um endereço como o mesmo CEP salvo anteriormente ');
            }
        })
        .then(data => (data));

    } catch (error) {
        console.error('Erro ao obter informações do CEP:', error);
        // Exibe uma mensagem de erro se ocorrer algum problema na solicitação da API
        const resultado = document.getElementById("resultadoBusca");
        resultado.textContent = 'Erro ao buscar informações do CEP:  ' + error;
    }
}

function exibirHistorico() {
    const historicoElement = document.getElementById("historicoPesquisas");
    historicoElement.innerHTML = "<strong>Histórico de Pesquisas:</strong><br>";
    historicoPesquisas.forEach(cep => {
        historicoElement.innerHTML += `<span>${cep}</span><br>`;
    });
}

async function exibirCep(enderecos) {
    const cepInput = document.getElementById("cepInput");
    const cepValue = cepInput.value.trim();

    // Verifica se o CEP é válido
    if (validarCep(cepValue)) {
        try {
            // Obtém informações do CEP da API ViaCep
            const data = await getCep(cepValue);

            if (data) {
                // Exibe as informações do CEP na tela
                const resultado = document.getElementById("resultadoBusca");
                resultado.innerHTML = `
                    <p>CEP: ${data.cep}</p>
                    <p>Logradouro: ${data.logradouro}</p>
                    <p>Bairro: ${data.bairro}</p>
                    <p>Cidade: ${data.localidade}</p>
                    <p>Estado: ${data.uf}</p>
                `;
                
                // Adiciona este CEP ao histórico
                adicionarAoHistorico(cepValue);
                adicionarAlistaDeFavoritos(data);
            } else {
                // Se não houver dados, exibe uma mensagem de erro
                const resultado = document.getElementById("resultadoBusca");
                resultado.textContent = 'CEP não encontrado';
            }
        } catch (error) {
            console.error('Erro ao obter informações do CEP:', error);
            // Exibe uma mensagem de erro se ocorrer algum problema na solicitação da API
            const resultado = document.getElementById("resultadoBusca");
            resultado.textContent = 'Erro ao buscar informações do CEP';
        }
    } else {
        // Se o CEP não for válido, exibe uma mensagem de erro
        const resultado = document.getElementById("resultadoBusca");
        resultado.textContent = 'CEP inválido: ' + cepValue;
    }
}

async function listarFavoritos() { 

    historicodefavoritos = []; 
    
    try {
        const response = await fetch(`https://soft-foot-production.up.railway.app/enderecos`, {
            method: "GET",
            mode: "cors"
        })
        .then(res => res.json())
        .then(data => {
            historicodefavoritos = data
        });

    } catch (error) {
        console.error('Erro ao obter informações do CEP:', error);
        // Exibe uma mensagem de erro se ocorrer algum problema na solicitação da API
    }
}

// Função para validar o CEP (Você pode implementar a validação de acordo com suas necessidades)
function validarCep(cepValue) {
    return true;
}
