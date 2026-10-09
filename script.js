let produtos = JSON.parse(localStorage.getItem('mercado_produtos')) || [
  { id: 1, codigo: "98765432", nome: "Arroz Integral 1kg", preco: 7.50, estoque: 15, validade: "2027-01-10" },
  { id: 2, codigo: "98765433", nome: "Feijão Preto 1kg", preco: 9.80, estoque: 12, validade: "2026-10-15" },
  { id: 3, codigo: "98765434", nome: "Café Torrado 500g", preco: 18.90, estoque: 8, validade: "2026-10-08" },
  { id: 4, codigo: "98765435", nome: "Leite Integral 1L", preco: 5.80, estoque: 2, validade: "2026-10-06" },
  { id: 5, codigo: "98765436", nome: "Pão de Forma 500g", preco: 6.50, estoque: 20, validade: "2026-10-12" },
  { id: 6, codigo: "98765437", nome: "Manteiga 200g", preco: 12.00, estoque: 5, validade: "2026-10-20" },
  { id: 7, codigo: "98765438", nome: "Queijo Mussarela 500g", preco: 22.50, estoque: 10, validade: "2026-10-18" },
  { id: 8, codigo: "98765439", nome: "Presunto Fatiado 200g", preco: 14.00, estoque: 7, validade: "2026-10-14" },
  { id: 9, codigo: "98765440", nome: "Macarrão Espaguete 500g", preco: 4.50, estoque: 25, validade: "2027-02-01" },
  { id: 10, codigo: "98765441", nome: "Molho de Tomate 340g", preco: 3.80, estoque: 30, validade: "2027-01-25" },
  { id: 11, codigo: "98765442", nome: "Azeite de Oliva 500ml", preco: 25.00, estoque: 6, validade: "2027-03-10" },
  { id: 12, codigo: "98765443", nome: "Sal Refinado 1kg", preco: 2.50, estoque: 18, validade: "2027-04-15" },
  { id: 13, codigo: "98765444", nome: "Açúcar Cristal 1kg", preco: 3.20, estoque: 22, validade: "2027-05-20" },
  { id: 14, codigo: "98765445", nome: "Farinha de Trigo 1kg", preco: 4.00, estoque: 16, validade: "2027-06-30" },
  { id: 15, codigo: "98765446", nome: "Óleo de Soja 900ml", preco: 6.00, estoque: 14, validade: "2027-07-25" }
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

// TOGGLE DRAWER
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
  renderizarListaCodigos();
  renderizarEstoque();
  renderizarCarrinho();
  verificarAlertasValidade();
  atualizarMetricas();
  salvarDados();
}

// RENDERIZA A LISTA VISÍVEL DE CÓDIGOS E PRODUTOS NA FRENTE DO CAIXA
function renderizarListaCodigos() {
  const tbody = document.getElementById('lista-codigos-produtos');
  tbody.innerHTML = '';

  if (produtos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum produto cadastrado</td></tr>';
    return;
  }

  produtos.forEach(p => {
    tbody.innerHTML += `
      <tr class="clickable-row" onclick="preencherEPesquisar('${p.codigo}')" title="Clique para adicionar">
        <td><span class="tag-codigo">${p.codigo}</span></td>
        <td>${p.nome}</td>
        <td class="text-right">R$ ${p.preco.toFixed(2)}</td>
      </tr>
    `;
  });
}

function preencherEPesquisar(codigo) {
  const input = document.getElementById('input-codigo');
  input.value = codigo;
  adicionarPorCodigoForm(new Event('submit'));
}

// ADICIONAR PRODUTO PELO CÓDIGO (LEITOR / ENTER)
function adicionarPorCodigoForm(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('input-codigo');
  const codigoBipado = input.value.trim();

  if (!codigoBipado) return;

  const produto = produtos.find(p => p.codigo === codigoBipado);

  if (!produto) {
    alert("Produto não encontrado!");
    input.select();
    return;
  }

  if (produto.estoque <= 0) {
    alert("Produto esgotado no estoque!");
    input.select();
    return;
  }

  // Atualiza card visual do último produto
  document.getElementById('info-prod-nome').innerText = produto.nome;
  document.getElementById('info-prod-codigo').innerText = produto.codigo;
  document.getElementById('info-prod-preco').innerText = `R$ ${produto.preco.toFixed(2)}`;

  // Adiciona ao carrinho
  const itemCart = carrinho.find(item => item.id === produto.id);
  if (itemCart) {
    if (itemCart.qtd >= produto.estoque) {
      alert("Quantidade máxima disponível em estoque atingida!");
      input.select();
      return;
    }
    itemCart.qtd++;
  } else {
    carrinho.push({ id: produto.id, codigo: produto.codigo, nome: produto.nome, preco: produto.preco, qtd: 1 });
  }

  renderizarCarrinho();
  input.value = '';
  input.focus();
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
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">Carrinho vazio</td></tr>';
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
        <td>${item.codigo}</td>
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
  alert("Produto cadastrado com sucesso!");
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

// Modal Checkout & Métricas
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
  const mensagem = input.value.trim() || "🔥 Promoção especial no Mercadinho!";

  box.innerHTML += `
    <div class="wa-msg outgoing">
      <span class="wa-author">Você</span>
      <p>${mensagem}</p>
    </div>
  `;
  
  input.value = '';
  box.scrollTop = box.scrollHeight;
}