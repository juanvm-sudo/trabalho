// BANCO DE DADOS INICIAL E GERADOR AUTOMÁTICO DE +1000 PRODUTOS
let produtos = JSON.parse(localStorage.getItem('mercado_produtos')) || [];

if (produtos.length < 1000) {
  produtos = gerarMaisDe1000Produtos();
  salvarDados();
}

let carrinho = [];
let faturamentoTotal = parseFloat(localStorage.getItem('mercado_faturamento')) || 0;
let totalVendasCount = parseInt(localStorage.getItem('mercado_vendas_count')) || 0;
let registroVendasProdutos = JSON.parse(localStorage.getItem('mercado_registro_vendas')) || {};
let departamentoAtual = 'todos';

document.addEventListener("DOMContentLoaded", () => {
  verificarEstadoLogin();
  carregarPreferenciasEstetica();
  iniciarRelogio();
  renderizarTudo();
});

// FUNÇÃO GERADORA DE +1000 PRODUTOS COM CATEGORIAS
function gerarMaisDe1000Produtos() {
  const categorias = ["Mercearia", "Açougue", "Padaria", "Hortifruti", "Bebidas", "Limpeza"];
  const nomesBase = {
    "Açougue": ["Carne Moída", "Picanha", "Contra Filé", "Alcatra", "Costela", "Frango Inteiro", "Linguica Toscana", "Bisteca Suína", "Coxão Mole", "Cupim"],
    "Padaria": ["Pão Francês", "Pão de Queijo", "Bolo de Fubá", "Torta de Frango", "Croissant", "Sonho de Creme", "Pão de Forma", "Broa de Milho", "Cuca de Goiabada", "Pão Doce"],
    "Hortifruti": ["Maçã Fuji", "Banana Prata", "Tomate Débora", "Cebola", "Batata Monalisa", "Alface Crespa", "Laranja Pera", "Cenoura", "Melancia", "Abacaxi"],
    "Bebidas": ["Refrigerante Cola 2L", "Suco de Laranja 1L", "Água Mineral 500ml", "Cerveja Pilsen 350ml", "Vinho Tinto 750ml", "Energético 250ml", "Chá Gelado 1.5L"],
    "Mercearia": ["Arroz 5kg", "Feijão Carioca 1kg", "Açúcar 1kg", "Café 500g", "Macarrão 500g", "Óleo 900ml", "Azeite 500ml", "Farofa Pronta", "Sal 1kg"],
    "Limpeza": ["Detergente 500ml", "Sabão em Pó 1kg", "Amaciante 2L", "Desinfetante 1L", "Papel Higiênico 12un", "Esponja de Aço"]
  };

  let prods = [];
  let idContador = 1000;

  categorias.forEach(cat => {
    const listaNomes = nomesBase[cat];
    for (let i = 1; i <= 170; i++) {
      idContador++;
      const nomeProd = `${listaNomes[i % listaNomes.length]} Premium v${i}`;
      const precoProd = parseFloat((Math.random() * 45 + 2).toFixed(2));
      const estoqueProd = Math.floor(Math.random() * 80) + 5;
      
      prods.push({
        id: idContador,
        codigo: idContador.toString(),
        nome: nomeProd,
        categoria: cat,
        preco: precoProd,
        estoque: estoqueProd,
        validade: "2027-12-31"
      });
    }
  });

  return prods;
}

// PERSISTÊNCIA NO LOCALSTORAGE
function salvarDados() {
  localStorage.setItem('mercado_produtos', JSON.stringify(produtos));
  localStorage.setItem('mercado_faturamento', faturamentoTotal.toString());
  localStorage.setItem('mercado_vendas_count', totalVendasCount.toString());
  localStorage.setItem('mercado_registro_vendas', JSON.stringify(registroVendasProdutos));
}

// AUTENTICAÇÃO E LOGIN VIA CPF
function mascaraCPF(i) {
  let v = i.value.replace(/\D/g, "");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  i.value = v;
}

function realizarLogin(e) {
  e.preventDefault();
  const cpf = document.getElementById('login-cpf').value;
  const senha = document.getElementById('login-senha').value;

  if (cpf.length >= 11 && senha) {
    localStorage.setItem('mercado_login_ativo', cpf);
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('operador-nome').innerText = `Operador CPF: ${cpf}`;
  } else {
    document.getElementById('login-erro').style.display = 'block';
  }
}

function verificarEstadoLogin() {
  const loginAtivo = localStorage.getItem('mercado_login_ativo');
  if (loginAtivo) {
    document.getElementById('screen-login').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('operador-nome').innerText = `Operador CPF: ${loginAtivo}`;
  }
}

function realizarLogout() {
  localStorage.removeItem('mercado_login_ativo');
  location.reload();
}

// RELÓGIO E TEMPO REAL
function iniciarRelogio() {
  setInterval(() => {
    const agora = new Date();
    document.getElementById('relogio-sistema').innerText = 
      agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
  }, 1000);
}

// PERSONALIZAÇÃO ESTÉTICA (MODO ESCURO & FONTE)
function alterarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  localStorage.setItem('mercado_tema', tema);
}

function alterarTamanhoFonte(tamanho) {
  document.documentElement.setAttribute('data-font', tamanho);
  localStorage.setItem('mercado_fonte', tamanho);
}

function carregarPreferenciasEstetica() {
  const temaSalvo = localStorage.getItem('mercado_tema') || 'light';
  const fonteSalva = localStorage.getItem('mercado_fonte') || 'normal';
  alterarTema(temaSalvo);
  alterarTamanhoFonte(fonteSalva);

  document.getElementById('select-tema').value = temaSalvo;
  document.getElementById('select-fonte').value = fonteSalva;
}

// FILTRAGEM POR SEÇÃO/DEPARTAMENTO
function filtrarDepartamento(dept, btn) {
  departamentoAtual = dept;
  document.querySelectorAll('.dept-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const tag = document.getElementById('tag-categoria-atual');
  const titulo = document.getElementById('titulo-secao-atual');

  if (dept === 'todos') {
    tag.innerText = "Todos os Itens";
    titulo.innerText = "Adicionar por Código";
  } else {
    tag.innerText = `Seção: ${dept.toUpperCase()}`;
    titulo.innerText = `Produtos - ${dept.charAt(0).toUpperCase() + dept.slice(1)}`;
  }

  renderizarListaCodigos();
}

// RENDERIZAÇÃO DA TABELA DE CONSULTA DE CÓDIGOS
function renderizarListaCodigos(filtroNome = "") {
  const tbody = document.getElementById('lista-codigos-produtos');
  tbody.innerHTML = '';

  let prodsFiltrados = produtos;
  
  if (departamentoAtual !== 'todos') {
    prodsFiltrados = prodsFiltrados.filter(p => p.categoria.toLowerCase() === departamentoAtual.toLowerCase());
  }

  if (filtroNome) {
    prodsFiltrados = prodsFiltrados.filter(p => p.nome.toLowerCase().includes(filtroNome.toLowerCase()));
  }

  if (prodsFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum produto encontrado</td></tr>';
    return;
  }

  // Exibe os primeiros 50 itens para rápida performance
  prodsFiltrados.slice(0, 50).forEach(p => {
    tbody.innerHTML += `
      <tr class="clickable-row" onclick="preencherEPesquisar('${p.codigo}')" title="Clique para adicionar">
        <td><span class="tag-codigo">${p.codigo}</span></td>
        <td>${p.nome}</td>
        <td><small>${p.categoria}</small></td>
        <td class="text-right">R$ ${p.preco.toFixed(2)}</td>
      </tr>
    `;
  });
}

function filtrarTabelaConsulta(val) {
  renderizarListaCodigos(val);
}

function preencherEPesquisar(codigo) {
  document.getElementById('input-codigo').value = codigo;
  adicionarPorCodigoForm(new Event('submit'));
}

// ADICIONAR AO CARRINHO
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
    return;
  }

  // Atualiza painel do último produto
  document.getElementById('info-prod-nome').innerText = produto.nome;
  document.getElementById('info-prod-codigo').innerText = produto.codigo;
  document.getElementById('info-prod-categoria').innerText = produto.categoria;
  document.getElementById('info-prod-preco').innerText = `R$ ${produto.preco.toFixed(2)}`;

  const itemCart = carrinho.find(item => item.id === produto.id);
  if (itemCart) {
    if (itemCart.qtd >= produto.estoque) {
      alert("Quantidade máxima em estoque atingida!");
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
  const itemCart = carrinho.find(i => i.id === id);
  const prod = produtos.find(i => i.id === id);

  if (itemCart) {
    itemCart.qtd += delta;
    if (itemCart.qtd > prod.estoque) {
      itemCart.qtd = prod.estoque;
      alert("Estoque máximo atingido.");
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
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:var(--text-muted)">Carrinho vazio</td></tr>';
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

// CHECKOUT & CÁLCULO DE TROCO DINÂMICO
function abrirCheckout(tipo) {
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
  document.getElementById('modal-checkout').style.display = 'flex';
  document.getElementById('modal-titulo').innerText = `Pagamento via ${tipo}`;
  document.getElementById('modal-subtexto').innerText = `Total a Pagar: R$ ${total.toFixed(2)}`;
  
  const display = document.getElementById('modal-conteudo-dinamico');

  if (tipo === 'Dinheiro') {
    display.innerHTML = `
      <div class="form-group" style="text-align:left;">
        <label>Valor Recebido (R$):</label>
        <input type="number" step="0.01" id="valor-pago-dinheiro" placeholder="0.00" oninput="calcularTroco(${total})" autofocus>
      </div>
      <div style="margin-top:10px; font-weight:bold; font-size:1.1rem;" id="box-troco">
        Troco: R$ 0.00
      </div>
    `;
  } else if (tipo === 'Pix') {
    display.innerHTML = '📱 <strong>Chave Pix Copia e Cola:</strong><br><small>00020126360014BR.GOV.BCB.PIX...</small>';
  } else {
    display.innerHTML = '💳 <strong>Insira ou aproxime o cartão na maquininha</strong>';
  }
}

function calcularTroco(total) {
  const pago = parseFloat(document.getElementById('valor-pago-dinheiro').value) || 0;
  const troco = pago - total;
  const box = document.getElementById('box-troco');

  if (troco < 0) {
    box.innerHTML = `<span style="color:var(--danger)">Faltam: R$ ${Math.abs(troco).toFixed(2)}</span>`;
  } else {
    box.innerHTML = `<span style="color:var(--success)">Troco: R$ ${troco.toFixed(2)}</span>`;
  }
}

function fecharModal() {
  document.getElementById('modal-checkout').style.display = 'none';
}

function concluirVenda() {
  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);

  carrinho.forEach(itemCart => {
    const p = produtos.find(p => p.id === itemCart.id);
    if (p) p.estoque -= itemCart.qtd;

    // Atualiza registro de saídas
    registroVendasProdutos[itemCart.nome] = (registroVendasProdutos[itemCart.nome] || 0) + itemCart.qtd;
  });

  faturamentoTotal += total;
  totalVendasCount++;
  carrinho = [];

  fecharModal();
  renderizarTudo();
  alert("Venda concluída com sucesso!");
}

// RELATÓRIOS DE VENDAS (MAIS E MENOS VENDIDOS)
function renderizarRelatoriosVendas() {
  const tbodyMais = document.getElementById('tabela-mais-vendidos');
  const tbodyMenos = document.getElementById('tabela-menos-vendidos');

  tbodyMais.innerHTML = '';
  tbodyMenos.innerHTML = '';

  const listaOrdenada = Object.keys(registroVendasProdutos).map(nome => ({
    nome,
    qtd: registroVendasProdutos[nome]
  })).sort((a, b) => b.qtd - a.qtd);

  if (listaOrdenada.length === 0) {
    tbodyMais.innerHTML = '<tr><td colspan="2" class="text-center">Nenhuma venda gravada</td></tr>';
  } else {
    listaOrdenada.slice(0, 5).forEach(item => {
      tbodyMais.innerHTML += `<tr><td>${item.nome}</td><td class="text-center">${item.qtd} un</td></tr>`;
    });
  }

  const produtosSemSaida = produtos.filter(p => !registroVendasProdutos[p.nome]).slice(0, 5);
  produtosSemSaida.forEach(item => {
    tbodyMenos.innerHTML += `<tr><td>${item.nome}</td><td class="text-center">0 un</td></tr>`;
  });
}

// INTEGRALIZAÇÃO REAL DE WHATSAPP
function enviarWhatsAppReal() {
  const num = document.getElementById('wa-numero').value.replace(/\D/g, "");
  const msg = encodeURIComponent(document.getElementById('wa-mensagem').value || "Confira nossas ofertas!");

  if (!num) return alert("Digite um número com DDD válido!");

  window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
}

// DRAWER & TAB NAVIGATION
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

function renderizarEstoque() {
  const tabela = document.getElementById('tabela-estoque');
  tabela.innerHTML = '';

  produtos.slice(0, 50).forEach(p => {
    let status = '<span class="badge-status status-ok">OK</span>';
    if (p.estoque <= 5) status = '<span class="badge-status status-warn">Baixo</span>';

    tabela.innerHTML += `
      <tr>
        <td>${p.codigo}</td>
        <td>${p.nome}</td>
        <td class="text-center">${p.estoque} un</td>
        <td>31/12/2027</td>
        <td class="text-center">${status}</td>
      </tr>
    `;
  });
}

function adicionarNovoProduto(e) {
  e.preventDefault();
  const novo = {
    id: Date.now(),
    codigo: document.getElementById('cad-codigo').value,
    nome: document.getElementById('cad-nome').value,
    categoria: document.getElementById('cad-categoria').value,
    preco: parseFloat(document.getElementById('cad-preco').value),
    estoque: parseInt(document.getElementById('cad-estoque').value),
    validade: document.getElementById('cad-validade').value
  };

  produtos.unshift(novo);
  renderizarTudo();
  e.target.reset();
  alert("Produto adicionado com sucesso!");
}

function renderizarTudo() {
  renderizarListaCodigos();
  renderizarEstoque();
  renderizarCarrinho();
  atualizarMetricas();
  renderizarRelatoriosVendas();
  salvarDados();
}

function atualizarMetricas() {
  document.getElementById('faturamento-hoje').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;
  document.getElementById('total-vendas-count').innerText = `${totalVendasCount} transações`;
}

// MINI JOGO 2D NO CANVAS
let canvas, ctx, gameLoop, player, items, score;

function iniciarJogo() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  score = 0;
  player = { x: 140, y: 260, width: 60, height: 20, speed: 7 };
  items = [];

  document.removeEventListener('keydown', moverJogador);
  document.addEventListener('keydown', moverJogador);

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(atualizarJogo, 1000 / 30);
}

function moverJogador(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') player.x = Math.max(0, player.x - player.speed * 2);
  if (e.key === 'ArrowRight' || e.key === 'd') player.x = Math.min(canvas.width - player.width, player.x + player.speed * 2);
}

function atualizarJogo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Desenha Jogador (Carrinho)
  ctx.fillStyle = '#0f766e';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Spawna itens
  if (Math.random() < 0.1) {
    items.push({ x: Math.random() * (canvas.width - 20), y: 0, speed: Math.random() * 3 + 2 });
  }

  // Atualiza e desenha itens
  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    item.y += item.speed;

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Colisão
    if (
      item.y >= player.y &&
      item.x >= player.x &&
      item.x <= player.x + player.width
    ) {
      score += 10;
      items.splice(i, 1);
      i--;
    } else if (item.y > canvas.height) {
      items.splice(i, 1);
      i--;
    }
  }

  document.getElementById('game-score').innerText = `Pontos: ${score}`;
}