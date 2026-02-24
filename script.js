const botoes = document.querySelectorAll('.btn-proximo');

botoes.forEach(btn => {
    btn.addEventListener('click', () => {
        const atual = document.querySelector('.ativo');
        atual.classList.remove('ativo');

        const id = btn.dataset.proximo;

        if(id === "0"){
            document.getElementById('passo-0').classList.add('ativo');
        }else if(id === "fim"){
            document.getElementById('fim').classList.add('ativo');
        }else{
            document.getElementById('passo-' + id).classList.add('ativo');
        }
    });
});