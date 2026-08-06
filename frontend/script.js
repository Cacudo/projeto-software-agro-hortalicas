const API_URL = 'http://localhost:3000/api/movimentos';

async function carregarDados() {
    try {
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();

        const tabela = document.getElementById('tabelaDados');
        tabela.innerHTML = '';

        let totalColheita = 0;
        let totalVendasQtd = 0;
        let totalPerdasQtd = 0;
        let faturamentoTotal = 0;

        dados.forEach(item => {
            // Soma para os cálculos dos cards
            if (item.tipo === 'colheita') totalColheita += item.quantidade;
            if (item.tipo === 'venda') {
                totalVendasQtd += item.quantidade;
                faturamentoTotal += item.valor;
            }
            if (item.tipo === 'perda') totalPerdasQtd += item.quantidade;

            // Preenche a tabela
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.tipo.toUpperCase()}</strong></td>
                <td>${item.produto}</td>
                <td>${item.quantidade}</td>
                <td>R$ ${Number(item.valor).toFixed(2)}</td>
                <td>${item.data}</td>
            `;
            tabela.appendChild(tr);
        });

        // Atualiza os valores dos Cards
        const estoqueAtual = totalColheita - (totalVendasQtd + totalPerdasQtd);
        document.getElementById('cardEstoque').innerText = `${estoqueAtual.toFixed(1)} Kg`;
        document.getElementById('cardLucro').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;
        document.getElementById('cardPerdas').innerText = `${totalPerdasQtd.toFixed(1)} Kg`;

    } catch (erro) {
        console.error('Erro ao carregar os dados:', erro);
    }
}

document.getElementById('formAgro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const dados = {
        tipo: document.getElementById('tipo').value,
        produto: document.getElementById('produto').value,
        quantidade: parseFloat(document.getElementById('quantidade').value),
        valor: parseFloat(document.getElementById('valor').value) || 0
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        document.getElementById('formAgro').reset();
        carregarDados();
    } catch (erro) {
        console.error('Erro ao salvar o registro:', erro);
    }
});

carregarDados();