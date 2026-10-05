let produtos = JSON.parse(localStorage.getItem('mercado_produtos')) || [
  { id: 1, codigo: "101", nome: "Arroz Integral 1kg", preco: 7.50, estoque: 15, validade: "2027-01-10" },
  { id: 2, codigo: "102", nome: "Feijão Preto 1kg", preco: 9.80, estoque: 12, validade: "2026-10-15" },
  { id: 3, codigo: "103", nome: "Café Torrado 500g", preco: 18.90, estoque: 8, validade: "2026-10-08" },
  { id: 4, codigo: "104", nome: "Leite Integral 1L", preco: 5.80, estoque: 2, validade: "2026-10-06" }
];

let carrinho = [];
let faturamentoTotal = parseFloat(localStorage.getItem('mercado_faturamento')) || 0;
let totalVendasCount = parseInt(localStorage.getItem('mercado_vendas_count')) || 0;

document.addEventListener("DOMContentLoaded", () => {
  iniciarRelogio();
  renderizarTudo();
});

function salvarDados() {
  localStorage.setItem('mercado_produtos', JSON.stringify(produtos));
  localStorage.setItem('mercado_faturamento', faturamentoTotal.toString());
  localStorage.setItem('mercado_vendas_count', totalVendasCount.toString());
}

function iniciarRelogio() {
  setInterval(() => {
    const agora = new Date();
    document.getElementById('relogio-sistema').innerText = 
      agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
  }, 1000);
}

// TOGGLE E CONTROLE DO DRAWER LATERAL DE CONFIGURAÇÕES
function toggleDrawer() {
  const drawer = document.getElementById('side-drawer');
  const overlay = document.getElementById('drawer-overlay');
  drawer.classList.toggle('open');
  overlay.classList.toggle('active');
}

function mudarAba(abaId, btn) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(abaId).classList.add('active');
  btn.classList.add('active');
}

function renderizarTudo() {
  renderizarCatalogo(produtos);
  renderizarEstoque();
  renderizarCarrinho();
  verificarAlertasValidade();
  atualizarMetricas();
  salvarDados();
}

// PDV: Catalogo
function renderizarCatalogo(lista) {
  const grid = document.getElementById('grid-catalogo');
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#94a3b8;">Nenhum produto encontrado.</p>';
    return;
  }

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
  const termo = document.getElementById('input-busca').value.toLowerCase();
  const filtrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termo) || p.codigo.includes(termo)
  );
  renderizarCatalogo(filtrados);
}

// PDV: Carrinho
function adicionarAoCarrinho(id) {
  const p = produtos.find(item => item.id === id);
  if (!p || p.estoque <= 0) return alert("Produto esgotado!");

  const itemCart = carrinho.find(item => item.id === id);
  if (itemCart) {
    if (itemCart.qtd >= p.estoque) return alert("Limite de estoque atingido!");
    itemCart.qtd++;
  } else {
    carrinho.push({ id: p.id, nome: p.nome, preco: p.preco, qtd: 1 });
  }

  renderizarCarrinho();
}

function alterarQtdCarrinho(id, delta) {
  const itemCart = carrinho.find(item => item.id === id);
  const prod = produtos.find(item => item.id === id);

  if (itemCart) {
    itemCart.qtd += delta;
    if (itemCart.qtd > prod.estoque) {
      itemCart.qtd = prod.estoque;
      alert("Estoque insuficiente.");
    }
    if (itemCart.qtd <= 0) return removerDoCarrinho(id);
  }
  renderizarCarrinho();
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  renderizarCarrinho();
}

function limparCarrinho() {
  carrinho = [];
  renderizarCarrinho();
}

function renderizarCarrinho() {
  const tbody = document.getElementById('lista-carrinho');
  const txtTotal = document.getElementById('txt-total');
  const txtSubtotal = document.getElementById('txt-subtotal');
  tbody.innerHTML = '';

  if (carrinho.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#94a3b8;">Carrinho vazio</td></tr>';
    txtTotal.innerText = '0.00';
    txtSubtotal.innerText = '0.00';
    return;
  }

  let total = 0;
  carrinho.forEach(item => {
    const sub = item.preco * item.qtd;
    total += sub;
    tbody.innerHTML += `
      <tr>
        <td>${item.nome}</td>
        <td class="text-center">
          <button class="btn btn-sm" onclick="alterarQtdCarrinho(${item.id}, -1)">-</button>
          ${item.qtd}
          <button class="btn btn-sm" onclick="alterarQtdCarrinho(${item.id}, 1)">+</button>
        </td>
        <td class="text-right">R$ ${item.preco.toFixed(2)}</td>
        <td class="text-right">R$ ${sub.toFixed(2)}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-danger" onclick="removerDoCarrinho(${item.id})">✕</button>
        </td>
      </tr>
    `;
  });

  txtSubtotal.innerText = total.toFixed(2);
  txtTotal.innerText = total.toFixed(2);
}

// DRAWER: Cadastro
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
  alert("Produto cadastrado!");
}

// DRAWER: Estoque
function renderizarEstoque() {
  const tabela = document.getElementById('tabela-estoque');
  tabela.innerHTML = '';

  produtos.forEach(p => {
    let status = '<span class="badge-status status-ok">OK</span>';
    const diffDias = calcularDiferencaDias(p.validade);

    if (p.estoque <= 3) status = '<span class="badge-status status-warn">Baixo</span>';
    if (diffDias <= 5) status = '<span class="badge-status status-danger">Vencendo</span>';

    tabela.innerHTML += `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.nome}</td>
        <td class="text-center">${p.estoque} un</td>
        <td>${p.validade.split('-').reverse().join('/')}</td>
        <td class="text-center">${status}</td>
      </tr>
    `;
  });
}

function calcularDiferencaDias(dataString) {
  const dataValidade = new Date(dataString);
  const hoje = new Date();
  return Math.ceil((dataValidade - hoje) / (1000 * 60 * 60 * 24));
}

function verificarAlertasValidade() {
  const vencendo = produtos.filter(p => calcularDiferencaDias(p.validade) <= 5);
  document.getElementById('qtd-vencimento').innerText = `${vencendo.length} itens`;
}

function gerarPromocaoRelampago() {
  let aplicados = 0;
  produtos.forEach(p => {
    if (calcularDiferencaDias(p.validade) <= 5) {
      p.preco = parseFloat((p.preco * 0.75).toFixed(2));
      aplicados++;
    }
  });

  renderizarTudo();
  alert(`Desconto de 25% aplicado em ${aplicados} produto(s)!`);
}

// Modal Checkout & Metricas
function abrirCheckout(tipo) {
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
  document.getElementById('modal-checkout').style.display = 'flex';
  document.getElementById('modal-titulo').innerText = `Pagamento via ${tipo}`;
  document.getElementById('modal-subtexto').innerText = `Total: R$ ${total.toFixed(2)}`;
  
  const display = document.getElementById('modal-conteudo-dinamico');
  if (tipo === 'Pix') display.innerHTML = '📱 <strong>Chave Pix Copia e Cola:</strong><br><small>00020126360014BR.GOV.BCB.PIX...</small>';
  else if (tipo === 'Cartão') display.innerHTML = '💳 <strong>Aproxime ou insira o cartão</strong>';
  else display.innerHTML = '💵 <strong>Receba o valor e dê o troco</strong>';
}

function fecharModal() {
  document.getElementById('modal-checkout').style.display = 'none';
}

function concluirVenda() {
  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
  
  carrinho.forEach(itemCart => {
    const p = produtos.find(p => p.id === itemCart.id);
    if (p) p.estoque -= itemCart.qtd;
  });

  faturamentoTotal += total;
  totalVendasCount++;
  carrinho = [];

  fecharModal();
  renderizarTudo();
  alert("Venda concluída com sucesso!");
}

function atualizarMetricas() {
  document.getElementById('faturamento-hoje').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;
  document.getElementById('total-vendas-count').innerText = `${totalVendasCount} transações`;
}

function enviarOfertaWhatsApp() {
  const input = document.getElementById('wa-input-custom');
  const box = document.getElementById('whatsapp-preview-box');
  const mensagem = input.value.trim() || "🔥 Promoção especial no Mercadinho! Brota!";

  box.innerHTML += `
    <div class="wa-msg outgoing">
      <span class="wa-author">Você</span>
      <p>${mensagem}</p>
    </div>
  `;
  
  input.value = '';
  box.scrollTop = box.scrollHeight;
}