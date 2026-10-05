let produtos = JSON.parse(localStorage.getItem('mercado_produtos')) || [
  { id: 1, codigo: "101", nome: "Arroz 1kg", preco: 7.50, estoque: 15, validade: "2027-01-10" },
  { id: 2, codigo: "102", nome: "Feijão 1kg", preco: 9.80, estoque: 12, validade: "2026-10-15" },
  { id: 3, codigo: "103", nome: "Café 500g", preco: 18.90, estoque: 8, validade: "2026-10-08" },
  { id: 4, codigo: "104", nome: "Leite 1L", preco: 5.80, estoque: 2, validade: "2026-10-06" }
];

let carrinho = [];
let faturamentoTotal = parseFloat(localStorage.getItem('mercado_faturamento')) || 0;

function salvarDados() {
  localStorage.setItem('mercado_produtos', JSON.stringify(produtos));
  localStorage.setItem('mercado_faturamento', faturamentoTotal.toString());
}


setInterval(() => {
  const agora = new Date();
  document.getElementById('relogio-sistema').innerText = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
}, 1000);

function renderizarTudo() {
  renderizarCatalogo(produtos);
  renderizarEstoque();
  renderizarCarrinho();
  verificarAlertasValidade();
  document.getElementById('faturamento-hoje').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;
  salvarDados();
}

function renderizarCatalogo(lista) {
  const grid = document.getElementById('grid-catalogo');
  grid.innerHTML = '';
  lista.forEach(p => {
    grid.innerHTML += `
      <div class="prod-card" onclick="adicionarAoCarrinho(${p.id})">
        <span class="name">${p.nome}</span>
        <span class="price">R$ ${p.preco.toFixed(2)}</span>
      </div>
    `;
  });
}

function filtrarCatalogo() {
  let termo = document.getElementById('input-busca').value.toLowerCase();
  let filtrados = produtos.filter(p => p.nome.toLowerCase().includes(termo) || p.codigo.includes(termo));
  renderizarCatalogo(filtrados);
}

function adicionarNovoProduto(e) {
  e.preventDefault();
  const novo = {
    id: Date.now(),
    codigo: document.getElementById('cad-codigo').value,
    nome: document.getElementById('cad-nome').value,
    preco: parseFloat(document.getElementById('cad-preco').value),
    estoque: parseInt(document.getElementById('cad-estoque').value),
    validade: document.getElementById('cad-validade').value
  };

  produtos.push(novo);
  renderizarTudo();
  e.target.reset();
}

function renderizarEstoque() {
  const tabela = document.getElementById('tabela-estoque');
  tabela.innerHTML = '';

  produtos.forEach(p => {
    let status = '<span class="badge bg-ok">OK</span>';
    let diff = (new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24);

    if (p.estoque <= 3) status = '<span class="badge bg-warn">Baixo</span>';
    if (diff <= 5) status = '<span class="badge bg-danger">Vencendo</span>';

    tabela.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.estoque} un</td>
        <td>${p.validade.split('-').reverse().join('/')}</td>
        <td>${status}</td>
      </tr>
    `;
  });
}

function adicionarAoCarrinho(id) {
  let p = produtos.find(item => item.id === id);
  if (p.estoque <= 0) return alert("Esgotado mano!");

  let itemCart = carrinho.find(item => item.id === id);
  if (itemCart) {
    itemCart.qtd++;
  } else {
    carrinho.push({ id: p.id, nome: p.nome, preco: p.preco, qtd: 1 });
  }

  p.estoque--;
  renderizarTudo();
}

function removerDoCarrinho(id) {
  let idx = carrinho.findIndex(i => i.id === id);
  if (idx > -1) {
    let p = produtos.find(item => item.id === id);
    p.estoque += carrinho[idx].qtd;
    carrinho.splice(idx, 1);
  }
  renderizarTudo();
}

function limparCarrinho() {
  carrinho.forEach(item => {
    let p = produtos.find(prod => prod.id === item.id);
    p.estoque += item.qtd;
  });
  carrinho = [];
  renderizarTudo();
}

function renderizarCarrinho() {
  const tbody = document.getElementById('lista-carrinho');
  const txtTotal = document.getElementById('txt-total');
  tbody.innerHTML = '';

  if (carrinho.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Carrinho tá vazio mano</td></tr>';
    txtTotal.innerText = '0.00';
    return;
  }

  let total = 0;
  carrinho.forEach(item => {
    let sub = item.preco * item.qtd;
    total += sub;
    tbody.innerHTML += `
      <tr>
        <td>${item.nome}</td>
        <td>${item.qtd}</td>
        <td>R$ ${sub.toFixed(2)}</td>
        <td><button onclick="removerDoCarrinho(${item.id})" style="background:none;border:none;cursor:pointer;">❌</button></td>
      </tr>
    `;
  });
  txtTotal.innerText = total.toFixed(2);
}

function verificarAlertasValidade() {
  let vencendo = produtos.filter(p => {
    let diff = (new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24);
    return diff <= 5;
  });
  document.getElementById('qtd-vencimento').innerText = `${vencendo.length} itens`;
}

function gerarPromocaoRelampago() {
  produtos.forEach(p => {
    let diff = (new Date(p.validade) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff <= 5) p.preco *= 0.75;
  });
  renderizarTudo();
  alert("Preços reduzidos em 25% pros itens perto do vencimento!");
}

function abrirCheckout(tipo) {
  if (carrinho.length === 0) return alert("Coloca algo no carrinho primeiro!");
  
  let total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
  document.getElementById('modal-checkout').style.display = 'flex';
  document.getElementById('modal-titulo').innerText = `Pagamento no ${tipo}`;
  document.getElementById('modal-subtexto').innerText = `Total a receber: R$ ${total.toFixed(2)}`;
  document.getElementById('modal-conteudo-dinamico').innerText = tipo === 'Pix' ? '[ QR CODE PIX SIMULADO ]' : '[ COBRAR NO CAIXA ]';
}

function fecharModal() {
  document.getElementById('modal-checkout').style.display = 'none';
}

function concluirVenda() {
  let total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
  faturamentoTotal += total;
  carrinho = [];
  fecharModal();
  renderizarTudo();
  alert("Venda realizada com sucesso!");
}

function enviarOfertaWhatsApp() {
  const box = document.getElementById('whatsapp-preview-box');
  box.innerHTML += `<div class="wa-msg" style="background:#dcf8c6; align-self:flex-end;">🚀 Oferta disparada com sucesso!</div>`;
  box.scrollTop = box.scrollHeight;
}

renderizarTudo();