// =====================================================================
//  MERCADINHO EXPRESS - FRENTE DE CAIXA
// =====================================================================

const $ = (id) => document.getElementById(id);

function lerJSON(chave, padrao) {
  try {
    const valor = JSON.parse(localStorage.getItem(chave));
    return valor === null || valor === undefined ? padrao : valor;
  } catch (e) {
    return padrao;
  }
}

// Evita que nomes com < > & " ' quebrem o HTML das tabelas
function esc(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ---------------------------------------------------------------------
//  USUÁRIOS AUTORIZADOS (login por NOME DE USUÁRIO)
// ---------------------------------------------------------------------
const USUARIOS_PADRAO = [
  { usuario: "gustavo", senha: "6650", nome: "Gustavo" },
  { usuario: "eduardo", senha: "1570", nome: "Eduardo" },
  { usuario: "juan",    senha: "1984", nome: "Juan" }
];

function gerarNomeDeUsuario(nome) {
  return String(nome || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '.')
    .replace(/^\.+|\.+$/g, '') || 'usuario';
}

// Usuários salvos na versão antiga (com CPF) ganham um nome de usuário automaticamente
function migrarUsuarios(lista) {
  const usados = new Set();
  return lista.map((u) => {
    let usuario = String(u.usuario || gerarNomeDeUsuario(u.nome)).toLowerCase();
    let base = usuario, n = 2;
    while (usados.has(usuario)) usuario = `${base}${n++}`;
    usados.add(usuario);
    return { nome: u.nome, usuario, senha: u.senha };
  });
}

let usuariosSalvos = lerJSON('mercado_usuarios', []);
let usuariosAutorizados = migrarUsuarios(
  Array.isArray(usuariosSalvos) && usuariosSalvos.length ? usuariosSalvos : USUARIOS_PADRAO
);

// ---------------------------------------------------------------------
//  BANCO DE DADOS INICIAL E GERADOR AUTOMÁTICO DE +1000 PRODUTOS
// ---------------------------------------------------------------------
let carrinho = [];
let faturamentoTotal = parseFloat(localStorage.getItem('mercado_faturamento')) || 0;
let totalVendasCount = parseInt(localStorage.getItem('mercado_vendas_count')) || 0;
let registroVendasProdutos = lerJSON('mercado_registro_vendas', {});
let departamentoAtual = 'todos';
let sessaoAtiva = false;

let produtos = lerJSON('mercado_produtos', []);

if (!Array.isArray(produtos) || produtos.length < 1000) {
  produtos = gerarMaisDe1000Produtos();
  salvarDados();
}

document.addEventListener("DOMContentLoaded", () => {
  carregarPreferenciasEstetica();
  iniciarRelogio();
  renderizarTudo();
  verificarEstadoLogin();
  window.addEventListener('hashchange', () => { if (sessaoAtiva) mostrarTelaDoHash(); });
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
  try {
    localStorage.setItem('mercado_produtos', JSON.stringify(produtos));
    localStorage.setItem('mercado_faturamento', faturamentoTotal.toString());
    localStorage.setItem('mercado_vendas_count', totalVendasCount.toString());
    localStorage.setItem('mercado_registro_vendas', JSON.stringify(registroVendasProdutos));
    localStorage.setItem('mercado_usuarios', JSON.stringify(usuariosAutorizados));
  } catch (e) {
    console.warn('Não foi possível salvar os dados:', e);
  }
}

// ---------------------------------------------------------------------
//  AVISOS NA TELA (substituem os alert() que travavam o scanner)
// ---------------------------------------------------------------------
function mostrarToast(mensagem, tipo = 'info', acao = null, duracao = 0) {
  const area = $('toast-area');
  const el = document.createElement('div');
  el.className = `toast ${tipo}`;

  const texto = document.createElement('span');
  texto.textContent = mensagem;
  el.appendChild(texto);

  if (acao) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'btn btn-accent btn-sm';
    botao.textContent = acao.texto;
    botao.onclick = () => { acao.fn(); el.remove(); };
    el.appendChild(botao);
  }

  area.appendChild(el);
  while (area.children.length > 3) area.firstChild.remove();
  setTimeout(() => el.remove(), duracao || (acao ? 7000 : 2800));
}

// Bipe curto (agudo = sucesso, grave = erro)
let audioCtx = null;
function prepararAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { /* sem áudio, segue sem som */ }
}

function beep(sucesso = true) {
  try {
    prepararAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const ganho = audioCtx.createGain();
    osc.type = 'square';
    osc.frequency.value = sucesso ? 1500 : 280;
    ganho.gain.value = 0.07;
    osc.connect(ganho);
    ganho.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (sucesso ? 0.12 : 0.3));
  } catch (e) { /* ignora */ }
}

// ---------------------------------------------------------------------
//  AUTENTICAÇÃO E LOGIN (NOME DE USUÁRIO + SENHA)
// ---------------------------------------------------------------------
function realizarLogin(e) {
  e.preventDefault();
  const usuarioDigitado = $('login-usuario').value.trim().toLowerCase();
  const senhaDigitada = $('login-senha').value.trim();

  const usuarioEncontrado = usuariosAutorizados.find(
    u => u.usuario.toLowerCase() === usuarioDigitado && u.senha === senhaDigitada
  );

  if (usuarioEncontrado) {
    $('login-erro').style.display = 'none';
    localStorage.setItem('mercado_login_ativo', usuarioEncontrado.nome);
    localStorage.setItem('mercado_login_usuario', usuarioEncontrado.usuario);
    $('form-login').reset();
    entrarNoSistema(usuarioEncontrado.nome);
  } else {
    const elementoErro = $('login-erro');
    elementoErro.innerText = "Usuário ou senha incorretos!";
    elementoErro.style.display = 'block';
  }
}

function verificarEstadoLogin() {
  const loginAtivo = localStorage.getItem('mercado_login_ativo');
  if (loginAtivo) entrarNoSistema(loginAtivo);
}

function entrarNoSistema(nome) {
  sessaoAtiva = true;
  $('screen-login').style.display = 'none';
  $('app-container').style.display = 'flex';
  $('operador-nome').innerText = `Operador: ${nome}`;
  telaAtual = null;
  mostrarTelaDoHash();
}

function realizarLogout() {
  pararScanner();
  localStorage.removeItem('mercado_login_ativo');
  localStorage.removeItem('mercado_login_usuario');
  location.hash = '';
  location.reload();
}

// ---------------------------------------------------------------------
//  NAVEGAÇÃO ENTRE TELAS (barra de navegação, usa o # da URL)
// ---------------------------------------------------------------------
const TELAS = ['caixa', 'estoque', 'cadastro', 'usuarios', 'relatorios', 'whatsapp', 'aparencia', 'jogo'];
let telaAtual = null;
let codigoPendenteCadastro = '';

function mostrarTelaDoHash() {
  const id = location.hash.replace('#', '');
  ativarTela(TELAS.includes(id) ? id : 'caixa');
}

function ativarTela(id) {
  if (telaAtual === id) return;
  sairDaTela(telaAtual);
  telaAtual = id;

  document.querySelectorAll('.tela').forEach(t => t.classList.toggle('active', t.id === `tela-${id}`));
  document.querySelectorAll('.nav-link').forEach(a => a.classList.toggle('active', a.dataset.tela === id));
  window.scrollTo(0, 0);
  entrarNaTela(id);
}

function sairDaTela(id) {
  if (id === 'caixa' || id === 'cadastro') pararScanner();
  if (id === 'jogo') pararJogo();
}

function entrarNaTela(id) {
  if (id === 'caixa') $('input-codigo').focus();
  if (id === 'estoque') renderizarEstoque();
  if (id === 'usuarios') renderizarTabelaUsuarios();
  if (id === 'relatorios') { atualizarMetricas(); renderizarRelatoriosVendas(); }
  if (id === 'cadastro' && codigoPendenteCadastro) {
    $('cad-codigo').value = codigoPendenteCadastro;
    codigoPendenteCadastro = '';
    $('cad-nome').focus();
  }
}

function irParaCadastroComCodigo(codigo) {
  codigoPendenteCadastro = codigo;
  if (location.hash === '#cadastro') {
    telaAtual = null;
    mostrarTelaDoHash();
  } else {
    location.hash = 'cadastro';
  }
}

// ---------------------------------------------------------------------
//  GESTÃO DE USUÁRIOS
// ---------------------------------------------------------------------
function cadastrarUsuario(e) {
  e.preventDefault();
  const nome = $('cad-usr-nome').value.trim();
  const usuario = $('cad-usr-usuario').value.trim().toLowerCase();
  const senha = $('cad-usr-senha').value.trim();

  if (!/^[a-z0-9._-]+$/.test(usuario)) {
    return mostrarToast("Nome de usuário: use só letras, números, ponto, hífen ou sublinhado.", 'erro');
  }
  if (usuariosAutorizados.some(u => u.usuario.toLowerCase() === usuario)) {
    return mostrarToast("Este nome de usuário já está em uso!", 'erro');
  }

  usuariosAutorizados.push({ usuario, senha, nome });
  salvarDados();
  renderizarTabelaUsuarios();
  e.target.reset();
  mostrarToast("Usuário cadastrado com sucesso!", 'ok');
}

function removerUsuario(usuario) {
  if (usuario === localStorage.getItem('mercado_login_usuario')) {
    return mostrarToast("Você não pode remover o usuário que está logado.", 'aviso');
  }
  if (usuariosAutorizados.length <= 1) {
    return mostrarToast("Mantenha pelo menos um usuário cadastrado.", 'aviso');
  }
  if (confirm("Deseja remover este usuário?")) {
    usuariosAutorizados = usuariosAutorizados.filter(u => u.usuario !== usuario);
    salvarDados();
    renderizarTabelaUsuarios();
  }
}

function renderizarTabelaUsuarios() {
  const tbody = $('tabela-usuarios');
  if (!tbody) return;

  tbody.innerHTML = usuariosAutorizados.map(u => `
    <tr>
      <td>${esc(u.nome)}</td>
      <td><span class="tag-codigo">${esc(u.usuario)}</span></td>
      <td class="text-center">
        <button class="btn btn-sm btn-danger" data-usuario="${esc(u.usuario)}" onclick="removerUsuario(this.dataset.usuario)">✕</button>
      </td>
    </tr>
  `).join('');
}

// ---------------------------------------------------------------------
//  RELÓGIO
// ---------------------------------------------------------------------
function iniciarRelogio() {
  const atualizar = () => {
    const agora = new Date();
    $('relogio-sistema').innerText =
      agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
  };
  atualizar();
  setInterval(atualizar, 1000);
}

// ---------------------------------------------------------------------
//  PERSONALIZAÇÃO ESTÉTICA (MODO CLARO/ESCURO & FONTE)
// ---------------------------------------------------------------------
function alterarTema(tema) {
  document.documentElement.setAttribute('data-theme', tema);
  localStorage.setItem('mercado_tema', tema);

  // O botão mostra para qual modo vai trocar ao clicar
  document.querySelectorAll('.btn-tema').forEach(b => {
    b.textContent = tema === 'dark' ? '☀️' : '🌙';
  });
  const select = $('select-tema');
  if (select) select.value = tema;
}

function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme');
  alterarTema(atual === 'dark' ? 'light' : 'dark');
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
  $('select-fonte').value = fonteSalva;
}

// ---------------------------------------------------------------------
//  FILTRAGEM POR SEÇÃO/DEPARTAMENTO
// ---------------------------------------------------------------------
function filtrarDepartamento(dept, btn) {
  departamentoAtual = dept;
  document.querySelectorAll('.dept-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const tag = $('tag-categoria-atual');
  const titulo = $('titulo-secao-atual');

  if (dept === 'todos') {
    tag.innerText = "Todos os Itens";
    titulo.innerText = "Adicionar por Código";
  } else {
    tag.innerText = `Seção: ${dept.toUpperCase()}`;
    titulo.innerText = `Produtos - ${dept.charAt(0).toUpperCase() + dept.slice(1)}`;
  }

  renderizarListaCodigos($('busca-rapida-prod').value);
}

// TABELA DE CONSULTA DE CÓDIGOS
function renderizarListaCodigos(filtroNome = "") {
  const tbody = $('lista-codigos-produtos');

  let prodsFiltrados = produtos;

  if (departamentoAtual !== 'todos') {
    prodsFiltrados = prodsFiltrados.filter(p => p.categoria.toLowerCase() === departamentoAtual.toLowerCase());
  }

  if (filtroNome) {
    const f = filtroNome.toLowerCase();
    prodsFiltrados = prodsFiltrados.filter(p => p.nome.toLowerCase().includes(f) || p.codigo.includes(f));
  }

  if (prodsFiltrados.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum produto encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = prodsFiltrados.slice(0, 50).map(p => `
    <tr class="clickable-row" data-codigo="${esc(p.codigo)}" onclick="preencherEPesquisar(this.dataset.codigo)" title="Clique para adicionar">
      <td><span class="tag-codigo">${esc(p.codigo)}</span></td>
      <td>${esc(p.nome)}</td>
      <td><small>${esc(p.categoria)}</small></td>
      <td class="text-right">R$ ${p.preco.toFixed(2)}</td>
    </tr>
  `).join('');
}

function filtrarTabelaConsulta(val) {
  renderizarListaCodigos(val);
}

function preencherEPesquisar(codigo) {
  const r = adicionarPorCodigo(codigo);
  if (!r.ok) mostrarToast(r.mensagem, 'erro');
}

// ---------------------------------------------------------------------
//  ADICIONAR AO CARRINHO (digitado, clicado ou lido pela câmera)
// ---------------------------------------------------------------------
// O leitor pode devolver o mesmo código com ou sem zeros à esquerda (UPC-A x EAN-13)
function buscarProdutoPorCodigo(codigo) {
  const exato = produtos.find(p => p.codigo === codigo);
  if (exato) return exato;
  const semZeros = (c) => c.replace(/^0+/, '');
  const alvo = semZeros(codigo);
  return alvo ? produtos.find(p => semZeros(p.codigo) === alvo) : undefined;
}

// Devolve { ok, produto, motivo, mensagem } - quem chamou decide como avisar o usuário
function adicionarPorCodigo(codigo) {
  const produto = buscarProdutoPorCodigo(codigo);

  if (!produto) {
    return { ok: false, motivo: 'nao-encontrado', mensagem: `Produto ${codigo} não encontrado!` };
  }

  if (produto.estoque <= 0) {
    return { ok: false, motivo: 'esgotado', produto, mensagem: `${produto.nome}: esgotado no estoque!` };
  }

  $('info-prod-nome').innerText = produto.nome;
  $('info-prod-codigo').innerText = produto.codigo;
  $('info-prod-categoria').innerText = produto.categoria;
  $('info-prod-preco').innerText = `R$ ${produto.preco.toFixed(2)}`;

  const itemCart = carrinho.find(item => item.id === produto.id);
  if (itemCart) {
    if (itemCart.qtd >= produto.estoque) {
      return { ok: false, motivo: 'limite', produto, mensagem: "Quantidade máxima em estoque atingida!" };
    }
    itemCart.qtd++;
  } else {
    carrinho.push({ id: produto.id, codigo: produto.codigo, nome: produto.nome, preco: produto.preco, qtd: 1 });
  }

  renderizarCarrinho();
  return { ok: true, produto };
}

function adicionarPorCodigoForm(e) {
  if (e) e.preventDefault();
  const input = $('input-codigo');
  const codigoDigitado = input.value.trim();
  if (!codigoDigitado) return;

  const r = adicionarPorCodigo(codigoDigitado);

  if (r.ok) {
    input.value = '';
    input.focus();
    return;
  }

  const acao = r.motivo === 'nao-encontrado'
    ? { texto: 'Cadastrar', fn: () => irParaCadastroComCodigo(codigoDigitado) }
    : null;
  mostrarToast(r.mensagem, 'erro', acao);
  input.select();
}

function alterarQtdCarrinho(id, delta) {
  const itemCart = carrinho.find(i => i.id === id);
  const prod = produtos.find(i => i.id === id);

  if (itemCart) {
    itemCart.qtd += delta;
    if (itemCart.qtd > prod.estoque) {
      itemCart.qtd = prod.estoque;
      mostrarToast("Estoque máximo atingido.", 'aviso');
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
  const tbody = $('lista-carrinho');
  const txtTotal = $('txt-total');
  const txtSubtotal = $('txt-subtotal');

  if (carrinho.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:var(--text-muted)">Carrinho vazio</td></tr>';
    txtTotal.innerText = '0.00';
    txtSubtotal.innerText = '0.00';
    return;
  }

  let total = 0;
  tbody.innerHTML = carrinho.map(item => {
    const sub = item.preco * item.qtd;
    total += sub;
    return `
      <tr>
        <td>${esc(item.codigo)}</td>
        <td>${esc(item.nome)}</td>
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
  }).join('');

  txtSubtotal.innerText = total.toFixed(2);
  txtTotal.innerText = total.toFixed(2);
}

// ---------------------------------------------------------------------
//  CHECKOUT & CÁLCULO DE TROCO DINÂMICO
// ---------------------------------------------------------------------
function abrirCheckout(tipo) {
  if (carrinho.length === 0) return mostrarToast("Carrinho vazio!", 'aviso');

  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);
  $('modal-checkout').style.display = 'flex';
  $('modal-titulo').innerText = `Pagamento via ${tipo}`;
  $('modal-subtexto').innerText = `Total a Pagar: R$ ${total.toFixed(2)}`;

  const display = $('modal-conteudo-dinamico');

  if (tipo === 'Dinheiro') {
    display.innerHTML = `
      <div class="form-group" style="text-align:left;">
        <label for="valor-pago-dinheiro">Valor Recebido (R$):</label>
        <input type="number" step="0.01" id="valor-pago-dinheiro" placeholder="0.00" oninput="calcularTroco(${total})">
      </div>
      <div style="margin-top:10px; font-weight:bold; font-size:1.1rem;" id="box-troco">
        Troco: R$ 0.00
      </div>
    `;
    setTimeout(() => { const campo = $('valor-pago-dinheiro'); if (campo) campo.focus(); }, 50);
  } else if (tipo === 'Pix') {
    display.innerHTML = '📱 <strong>Chave Pix Copia e Cola:</strong><br><small>00020126360014BR.GOV.BCB.PIX...</small>';
  } else {
    display.innerHTML = '💳 <strong>Insira ou aproxime o cartão na maquininha</strong>';
  }
}

function calcularTroco(total) {
  const pago = parseFloat($('valor-pago-dinheiro').value) || 0;
  const troco = pago - total;
  const box = $('box-troco');

  if (troco < 0) {
    box.innerHTML = `<span style="color:var(--danger-text)">Faltam: R$ ${Math.abs(troco).toFixed(2)}</span>`;
  } else {
    box.innerHTML = `<span style="color:var(--success-text)">Troco: R$ ${troco.toFixed(2)}</span>`;
  }
}

function fecharModal() {
  $('modal-checkout').style.display = 'none';
}

function concluirVenda() {
  const total = carrinho.reduce((acc, i) => acc + (i.preco * i.qtd), 0);

  carrinho.forEach(itemCart => {
    const p = produtos.find(p => p.id === itemCart.id);
    if (p) p.estoque -= itemCart.qtd;

    registroVendasProdutos[itemCart.nome] = (registroVendasProdutos[itemCart.nome] || 0) + itemCart.qtd;
  });

  faturamentoTotal += total;
  totalVendasCount++;
  carrinho = [];

  fecharModal();
  renderizarTudo();
  mostrarToast("Venda concluída com sucesso!", 'ok');
}

// ---------------------------------------------------------------------
//  RELATÓRIOS DE VENDAS
// ---------------------------------------------------------------------
function renderizarRelatoriosVendas() {
  const tbodyMais = $('tabela-mais-vendidos');
  const tbodyMenos = $('tabela-menos-vendidos');

  const listaOrdenada = Object.keys(registroVendasProdutos).map(nome => ({
    nome,
    qtd: registroVendasProdutos[nome]
  })).sort((a, b) => b.qtd - a.qtd);

  if (listaOrdenada.length === 0) {
    tbodyMais.innerHTML = '<tr><td colspan="2" class="text-center">Nenhuma venda gravada</td></tr>';
  } else {
    tbodyMais.innerHTML = listaOrdenada.slice(0, 5)
      .map(item => `<tr><td>${esc(item.nome)}</td><td class="text-center">${item.qtd} un</td></tr>`).join('');
  }

  tbodyMenos.innerHTML = produtos.filter(p => !registroVendasProdutos[p.nome]).slice(0, 5)
    .map(item => `<tr><td>${esc(item.nome)}</td><td class="text-center">0 un</td></tr>`).join('');
}

function atualizarMetricas() {
  $('faturamento-hoje').innerText = `R$ ${faturamentoTotal.toFixed(2)}`;
  $('total-vendas-count').innerText = `${totalVendasCount} transações`;
}

// ---------------------------------------------------------------------
//  WHATSAPP
// ---------------------------------------------------------------------
function enviarWhatsAppReal() {
  const num = $('wa-numero').value.replace(/\D/g, "");
  const msg = encodeURIComponent($('wa-mensagem').value || "Confira nossas ofertas!");

  if (!num) return mostrarToast("Digite um número com DDD válido!", 'erro');

  window.open(`https://wa.me/${num}?text=${msg}`, '_blank');
}

// ---------------------------------------------------------------------
//  ESTOQUE
// ---------------------------------------------------------------------
function diasParaVencer(validade) {
  const v = new Date(`${validade}T00:00:00`);
  if (isNaN(v)) return Infinity;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((v - hoje) / 86400000);
}

function formatarData(validade) {
  const v = new Date(`${validade}T00:00:00`);
  return isNaN(v) ? '---' : v.toLocaleDateString('pt-BR');
}

function renderizarEstoque() {
  const tabela = $('tabela-estoque');
  const campoBusca = $('busca-estoque');
  const filtro = campoBusca ? campoBusca.value.trim().toLowerCase() : '';

  let lista = produtos;
  if (filtro) {
    lista = produtos.filter(p => p.nome.toLowerCase().includes(filtro) || p.codigo.includes(filtro));
  }

  tabela.innerHTML = lista.slice(0, 100).map(p => {
    const dias = diasParaVencer(p.validade);
    let status = '<span class="badge-status status-ok">OK</span>';
    if (dias < 0) status = '<span class="badge-status status-danger">Vencido</span>';
    else if (p.estoque <= 0) status = '<span class="badge-status status-danger">Esgotado</span>';
    else if (p.estoque <= 5) status = '<span class="badge-status status-warn">Baixo</span>';
    else if (dias <= 30) status = '<span class="badge-status status-warn">Vencendo</span>';

    return `
      <tr>
        <td>${esc(p.codigo)}</td>
        <td>${esc(p.nome)}${p.promocao ? ' <span class="badge-status status-ok">-25%</span>' : ''}</td>
        <td class="text-center">${p.estoque} un</td>
        <td>${formatarData(p.validade)}</td>
        <td class="text-center">${status}</td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="5" class="text-center">Nenhum produto encontrado</td></tr>';

  $('estoque-resumo').innerText = `Mostrando ${Math.min(lista.length, 100)} de ${lista.length} produtos.`;

  const vencendo = produtos.filter(p => { const d = diasParaVencer(p.validade); return d >= 0 && d <= 30; }).length;
  $('qtd-vencimento').innerText = `${vencendo} ${vencendo === 1 ? 'item' : 'itens'}`;
}

function gerarPromocaoRelampago() {
  const alvo = produtos.filter(p => {
    const d = diasParaVencer(p.validade);
    return d >= 0 && d <= 30 && !p.promocao;
  });

  if (alvo.length === 0) {
    return mostrarToast("Nenhum item próximo ao vencimento sem promoção.", 'aviso');
  }

  alvo.forEach(p => {
    p.precoOriginal = p.preco;
    p.preco = parseFloat((p.preco * 0.75).toFixed(2));
    p.promocao = true;
  });

  renderizarTudo();
  mostrarToast(`Promoção de 25% aplicada em ${alvo.length} ${alvo.length === 1 ? 'item' : 'itens'}.`, 'ok');
}

// ---------------------------------------------------------------------
//  CADASTRO DE PRODUTO
// ---------------------------------------------------------------------
function adicionarNovoProduto(e) {
  e.preventDefault();
  const codigo = $('cad-codigo').value.trim();
  const nome = $('cad-nome').value.trim();

  const existente = produtos.find(p => p.codigo === codigo);
  if (existente) {
    return mostrarToast(`O código ${codigo} já pertence a "${existente.nome}".`, 'erro');
  }

  const novo = {
    id: Date.now(),
    codigo,
    nome,
    categoria: $('cad-categoria').value,
    preco: parseFloat($('cad-preco').value),
    estoque: parseInt($('cad-estoque').value),
    validade: $('cad-validade').value
  };

  produtos.unshift(novo);
  renderizarTudo();
  e.target.reset();
  pararScanner();
  mostrarToast(`"${nome}" cadastrado com sucesso!`, 'ok');
}

function renderizarTudo() {
  renderizarListaCodigos($('busca-rapida-prod') ? $('busca-rapida-prod').value : '');
  renderizarEstoque();
  renderizarCarrinho();
  atualizarMetricas();
  renderizarRelatoriosVendas();
  renderizarTabelaUsuarios();
  salvarDados();
}

// =====================================================================
//  SCANNER DE CÓDIGO DE BARRAS PELA WEBCAM
//  - Usa o BarcodeDetector do navegador quando existe (Chrome/Edge/Android)
//  - Senão usa a biblioteca ZXing (carregada no index.html)
// =====================================================================
const FORMATOS_NATIVOS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'];
const INTERVALO_LEITURA_MS = 120;
const REARME_MESMO_CODIGO_MS = 1500; // o mesmo código só vale de novo depois de sair da frente da câmera

const Scanner = {
  contexto: null,   // 'caixa' ou 'cadastro'
  ativo: false,
  stream: null,
  video: null,
  timer: null,
  detectorNativo: null,
  zxingReader: null,
  zxingHints: null,
  canvas: null,
  ctx2d: null,
  onCodigo: null,
  ultimoCodigo: '',
  ultimaVezVisto: 0,

  async iniciar({ contexto, video, onCodigo, deviceId }) {
    this.parar();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const erro = new Error('sem-api-camera');
      erro.code = 'SEM_API_CAMERA';
      throw erro;
    }

    // Prepara o leitor ANTES de ligar a câmera (se faltar biblioteca, nem liga)
    await this._prepararDecodificador();

    const base = { width: { ideal: 1280 }, height: { ideal: 720 } };
    const tentativas = [];
    if (deviceId) tentativas.push({ video: { ...base, deviceId: { exact: deviceId } }, audio: false });
    tentativas.push({ video: { ...base, facingMode: { ideal: 'environment' } }, audio: false });

    let ultimoErro = null;
    for (const constraints of tentativas) {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (err) {
        ultimoErro = err;
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') break;
      }
    }
    if (!this.stream) throw ultimoErro;

    this.contexto = contexto;
    this.video = video;
    this.onCodigo = onCodigo;
    this.ultimoCodigo = '';
    this.ultimaVezVisto = 0;

    video.srcObject = this.stream;
    video.setAttribute('playsinline', '');
    video.muted = true;
    await video.play();

    this.ativo = true;
    this._loop();
  },

  parar() {
    this.ativo = false;
    clearTimeout(this.timer);
    this.timer = null;
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    if (this.video) this.video.srcObject = null;
    this.stream = null;
    this.video = null;
    this.contexto = null;
    this.onCodigo = null;
  },

  deviceIdAtual() {
    const track = this.stream && this.stream.getVideoTracks()[0];
    return track && track.getSettings ? track.getSettings().deviceId : undefined;
  },

  async _prepararDecodificador() {
    this.detectorNativo = null;

    if ('BarcodeDetector' in window) {
      try {
        const suportados = await window.BarcodeDetector.getSupportedFormats();
        const formatos = FORMATOS_NATIVOS.filter(f => suportados.includes(f));
        if (formatos.length) {
          this.detectorNativo = new window.BarcodeDetector({ formats: formatos });
          return;
        }
      } catch (e) { /* cai para o ZXing */ }
    }

    if (!window.ZXing) {
      const erro = new Error('sem-leitor');
      erro.code = 'SEM_LEITOR';
      throw erro;
    }
    this._prepararZXing();
  },

  _prepararZXing() {
    if (this.zxingReader) return;
    const Z = window.ZXing;
    const hints = new Map();
    hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [
      Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8,
      Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E,
      Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.CODE_39
    ]);
    hints.set(Z.DecodeHintType.TRY_HARDER, true);

    this.zxingHints = hints;
    this.zxingReader = new Z.MultiFormatReader();
    this.zxingReader.setHints(hints);
    this.canvas = document.createElement('canvas');
    this.ctx2d = this.canvas.getContext('2d', { willReadFrequently: true });
  },

  _loop() {
    const passo = async () => {
      if (!this.ativo) return;
      try {
        if (this.video && this.video.readyState >= 2 && this.video.videoWidth) {
          const codigo = await this._lerFrame();
          if (codigo && this.ativo) this._tratar(codigo);
        }
      } catch (e) { /* frame sem código: normal */ }
      if (this.ativo) this.timer = setTimeout(passo, INTERVALO_LEITURA_MS);
    };
    passo();
  },

  async _lerFrame() {
    if (this.detectorNativo) {
      try {
        const achados = await this.detectorNativo.detect(this.video);
        return achados.length ? achados[0].rawValue : null;
      } catch (e) {
        // se o nativo falhar de vez, tenta o ZXing
        if (window.ZXing) { this.detectorNativo = null; this._prepararZXing(); }
        return null;
      }
    }
    return this._lerFrameZXing();
  },

  _lerFrameZXing() {
    const Z = window.ZXing;
    const v = this.video;
    const escala = Math.min(1, 960 / v.videoWidth);
    const w = Math.round(v.videoWidth * escala);
    const h = Math.round(v.videoHeight * escala);
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;

    this.ctx2d.drawImage(v, 0, 0, w, h);
    const luminancia = new Z.HTMLCanvasElementLuminanceSource(this.canvas);
    const bitmap = new Z.BinaryBitmap(new Z.HybridBinarizer(luminancia));

    try {
      const resultado = typeof this.zxingReader.decodeWithState === 'function'
        ? this.zxingReader.decodeWithState(bitmap)
        : this.zxingReader.decode(bitmap, this.zxingHints);
      return resultado.getText();
    } catch (e) {
      return null; // NotFoundException etc.: nenhum código neste frame
    }
  },

  _tratar(codigo) {
    const agora = Date.now();
    const mesmoCodigo = codigo === this.ultimoCodigo;
    const intervalo = agora - this.ultimaVezVisto;
    this.ultimaVezVisto = agora;

    if (mesmoCodigo && intervalo < REARME_MESMO_CODIGO_MS) return; // ainda está na frente da câmera
    this.ultimoCodigo = codigo;
    if (this.onCodigo) this.onCodigo(codigo);
  }
};

function mensagemErroCamera(err) {
  switch (err && (err.code || err.name)) {
    case 'SEM_API_CAMERA':
      return 'A câmera só funciona em https:// ou http://localhost. Abra o projeto por um servidor local (veja o README).';
    case 'SEM_LEITOR':
      return 'O leitor de código de barras (ZXing) não carregou. Verifique a internet ou veja o README.';
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Permissão da câmera negada. Libere o acesso à câmera na barra de endereços do navegador.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'Nenhuma câmera encontrada neste computador.';
    case 'NotReadableError':
      return 'A câmera está sendo usada por outro programa. Feche-o e tente de novo.';
    default:
      return 'Não foi possível ligar a câmera.';
  }
}

function definirStatusScanner(contexto, texto, tipo = '') {
  const el = $(`scan-status-${contexto}`);
  el.textContent = texto;
  el.className = `scanner-status ${tipo}`;
}

function piscarScanner(contexto, ok) {
  const el = $(`scan-flash-${contexto}`);
  el.classList.remove('ok', 'erro');
  void el.offsetWidth; // reinicia a animação
  el.classList.add(ok ? 'ok' : 'erro');
}

function pararScanner() {
  const contexto = Scanner.contexto;
  Scanner.parar();
  if (contexto === 'caixa') resetarVisualScannerCaixa();
  if (contexto === 'cadastro') resetarVisualScannerCadastro();
}

// ---------- Scanner na tela do CAIXA ----------
function resetarVisualScannerCaixa() {
  $('scan-view-caixa').classList.remove('ativo');
  $('btn-scan-caixa').textContent = 'Ativar câmera';
  $('scan-camera-select').style.display = 'none';
  definirStatusScanner('caixa', 'Câmera desligada.');
}

async function alternarScannerCaixa() {
  if (Scanner.ativo && Scanner.contexto === 'caixa') return pararScanner();
  await iniciarScannerCaixa(localStorage.getItem('mercado_camera') || undefined);
}

async function trocarCameraCaixa(deviceId) {
  localStorage.setItem('mercado_camera', deviceId);
  await iniciarScannerCaixa(deviceId);
}

async function iniciarScannerCaixa(deviceId) {
  pararScanner();
  prepararAudio();
  definirStatusScanner('caixa', 'Iniciando câmera...');

  try {
    await Scanner.iniciar({
      contexto: 'caixa',
      video: $('scan-video-caixa'),
      deviceId,
      onCodigo: tratarCodigoLidoCaixa
    });
    $('scan-view-caixa').classList.add('ativo');
    $('btn-scan-caixa').textContent = 'Desligar câmera';
    definirStatusScanner('caixa', 'Câmera ativa. Aponte o código de barras para o retângulo.');
    await listarCameras();
  } catch (err) {
    console.warn('Erro ao iniciar scanner:', err);
    pararScanner();
    resetarVisualScannerCaixa();
    definirStatusScanner('caixa', mensagemErroCamera(err), 'erro');
  }
}

async function listarCameras() {
  const select = $('scan-camera-select');
  try {
    const dispositivos = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'videoinput');
    if (dispositivos.length < 2) { select.style.display = 'none'; return; }

    select.innerHTML = dispositivos
      .map((d, i) => `<option value="${esc(d.deviceId)}">${esc(d.label || `Câmera ${i + 1}`)}</option>`).join('');
    const atual = Scanner.deviceIdAtual();
    if (atual) select.value = atual;
    select.style.display = '';
  } catch (e) {
    select.style.display = 'none';
  }
}

function tratarCodigoLidoCaixa(codigo) {
  const r = adicionarPorCodigo(codigo);
  piscarScanner('caixa', r.ok);
  beep(r.ok);

  if (r.ok) {
    definirStatusScanner('caixa', `✔ ${r.produto.nome} adicionado ao carrinho`, 'ok');
    return;
  }

  definirStatusScanner('caixa', r.mensagem, 'erro');
  if (r.motivo === 'nao-encontrado') {
    mostrarToast(`Código ${codigo} não cadastrado.`, 'erro',
      { texto: 'Cadastrar', fn: () => irParaCadastroComCodigo(codigo) });
  } else {
    mostrarToast(r.mensagem, 'erro');
  }
}

// ---------- Scanner na tela de CADASTRO (preenche o campo do código) ----------
function resetarVisualScannerCadastro() {
  $('scanner-cadastro').style.display = 'none';
  $('btn-scan-cadastro').textContent = '📷 Ler com a câmera';
}

async function alternarScannerCadastro() {
  if (Scanner.ativo && Scanner.contexto === 'cadastro') return pararScanner();

  pararScanner();
  prepararAudio();
  $('scanner-cadastro').style.display = 'flex';
  $('scan-view-cadastro').classList.remove('ativo');
  $('btn-scan-cadastro').textContent = '✕ Fechar câmera';
  definirStatusScanner('cadastro', 'Iniciando câmera...');

  try {
    await Scanner.iniciar({
      contexto: 'cadastro',
      video: $('scan-video-cadastro'),
      deviceId: localStorage.getItem('mercado_camera') || undefined,
      onCodigo: tratarCodigoLidoCadastro
    });
    $('scan-view-cadastro').classList.add('ativo');
    definirStatusScanner('cadastro', 'Câmera ativa. Aponte o código de barras para o retângulo.');
  } catch (err) {
    console.warn('Erro ao iniciar scanner:', err);
    pararScanner();
    $('scanner-cadastro').style.display = 'flex';
    $('btn-scan-cadastro').textContent = '📷 Ler com a câmera';
    definirStatusScanner('cadastro', mensagemErroCamera(err), 'erro');
  }
}

function tratarCodigoLidoCadastro(codigo) {
  $('cad-codigo').value = codigo;
  piscarScanner('cadastro', true);
  beep(true);

  const existente = produtos.find(p => p.codigo === codigo);
  if (existente) {
    mostrarToast(`Código ${codigo} já cadastrado como "${existente.nome}".`, 'aviso');
  } else {
    mostrarToast(`Código lido: ${codigo}`, 'ok');
  }

  pararScanner();
  $('cad-nome').focus();
}

// =====================================================================
//  MINI JOGO 2D NO CANVAS
// =====================================================================
let canvas, ctx, gameLoop, player, items, score;

function iniciarJogo() {
  canvas = $('gameCanvas');
  ctx = canvas.getContext('2d');

  score = 0;
  player = { x: 140, y: 260, width: 60, height: 20, speed: 7 };
  items = [];

  document.removeEventListener('keydown', moverJogador);
  document.addEventListener('keydown', moverJogador);

  if (gameLoop) clearInterval(gameLoop);
  gameLoop = setInterval(atualizarJogo, 1000 / 30);
}

function pararJogo() {
  if (gameLoop) clearInterval(gameLoop);
  gameLoop = null;
  document.removeEventListener('keydown', moverJogador);
}

function moverJogador(e) {
  const esquerda = e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A';
  const direita = e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D';
  if (!esquerda && !direita) return;

  e.preventDefault();
  if (esquerda) player.x = Math.max(0, player.x - player.speed * 2);
  if (direita) player.x = Math.min(canvas.width - player.width, player.x + player.speed * 2);
}

function atualizarJogo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f766e';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  if (Math.random() < 0.1) {
    items.push({ x: Math.random() * (canvas.width - 20), y: 0, speed: Math.random() * 3 + 2 });
  }

  for (let i = 0; i < items.length; i++) {
    let item = items[i];
    item.y += item.speed;

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
    ctx.fill();

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

  $('game-score').innerText = `Pontos: ${score}`;
}
