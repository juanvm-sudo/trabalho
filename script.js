const botoes = document.querySelectorAll('.btn-proximo');
const passos = document.querySelectorAll('.passo');

function navegarParaProximo(event) {
    const botaoAtual = event.target;
    const proximoId = botaoAtual.dataset.proximo;

    // Remove a classe ativo de todos os passos para garantir
    passos.forEach(passo => passo.classList.remove('ativo'));

    // Lógica de destino
    let destino;
    if (proximoId === "fim") {
        destino = document.getElementById('fim');
    } else if (proximoId === "0") {
        destino = document.getElementById('passo-0');
    } else {
        destino = document.getElementById(`passo-${proximoId}`);
    }

    // Adiciona o efeito de entrada
    if (destino) {
        destino.classList.add('ativo');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

botoes.forEach(btn => {
    btn.addEventListener('click', navegarParaProximo);
});