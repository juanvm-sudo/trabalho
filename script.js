// Banco de Dados Dinâmico do Mercadinho (Persistência no localStorage)
let produtos = JSON.parse(localStorage.getItem('mercadinho_produtos')) || [
    { id: 1, codigo: "7891", nome: "Leite Integral 1L", preco: 5.50, estoque: 22, validade: "2026-04-12" },
    { id: 2, codigo: "7892", nome: "Pão Francês (kg)", preco: 18.00, estoque: 4, validade: "2026-03-24" },
    { id: 3, codigo: "7893", nome: "Café Moído 500g", preco: 14.90, estoque: 15, validade: "2026-10-10" },
    { id: 4, codigo: "7894", nome: "Refrigerante 2L", preco: 9.00, estoque: 3, validade: "2026-03-28" },
    { id: 5, codigo: "7895", nome: "Arroz Tipo 1 5kg", preco: 26.50, estoque: 10, validade: "2027-02-15" },
    { id: 6, codigo: "7896", nome: "Oleo de Soja 900ml", preco: 7.20, estoque: 8, validade: "2026-08-05" }
  ];
  
  let carrinho = [];
  let faturamentoTotalDia = parseFloat(localStorage.getItem('mercadinho_faturamento')) || 142.50;
  
  function salvarLocal() {
    localStorage.setItem('mercadinho_produtos', JSON.stringify(produtos));
    localStorage.setItem('mercadinho_faturamento', faturamentoTotalDia.toString());
  }
  
  // Relógio e data em tempo real
  function atualizarRelogio() {
    const agora = new Date();
    document.getElementById('relogio-sistema').innerText = agora.toLocaleDateString('pt-BR') + ' ' + agora.toLocaleTimeString('pt-BR');
  }
  setInterval(atualizarRelogio, 1000);
  atualizarRelogio();
  
  // Atualiza a visualização do sistema
  function renderizarTudo() {
    renderizarCatalogo(produtos);
    renderizarEstoque();
    renderizarCarrinho();
    verificarAlertasValidade();
    document.getElementById('faturamento-hoje').innerText = `R$ ${faturamentoTotalDia.toFixed(2)}`;
    salvarLocal();
  }
  
  function renderizarCatalogo(lista) {
    const grid = document.getElementById('grid-catalogo');
    grid.innerHTML = '';
    lista.forEach(p => {
      grid.innerHTML += `
        <div class="prod-card" onclick="adicionarAoCarrinho(${p.id})">
          <span class="name" title="${p.nome}">${p.nome}</span>
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
  
  // NOVA FUNCIONALIDADE 1: Adicionar novos produtos via interface
  function adicionarNovoProduto(event) {
    event.preventDefault();
    
    const nome = document.getElementById('cad-nome').value;
    const codigo = document.getElementById('cad-codigo').value;
    const preco = parseFloat(document.getElementById('cad-preco').value);
    const estoque = parseInt(document.getElementById('cad-estoque').value);
    const validade = document.getElementById('cad-validade').value;
  
    const novoProd = {
      id: Date.now(),
      codigo,
      nome,
      preco,
      estoque,
      validade
    };
  
    produtos.push(novoProd);
    renderizarTudo();
  
    // Resetar formulário
    event.target.reset();
  }
  
  function renderizarEstoque() {
    const tabela = document.getElementById('tabela-estoque');
    tabela.innerHTML = '';
  
    produtos.forEach(p => {
      let badge = '<span class="badge bg-ok">Normal</span>';
      if (p.estoque <= 3) {
        badge = '<span class="badge bg-warn">Baixo</span>';
      }
  
      let dataVal = new Date(p.validade);
      let hoje = new Date();
      let diffDias = Math.ceil((dataVal - hoje) / (1000 * 60 * 60 * 24));
  
      if (diffDias <= 5) {
        badge = '<span class="badge bg-danger">Vencendo!</span>';
      }
  
      tabela.innerHTML += `
        <tr>
          <td>${p.nome}</td>
          <td>${p.estoque} un</td>
          <td>${p.validade.split('-').reverse().join('/')}</td>
          <td>${badge}</td>
        </tr>
      `;
    });
  }
  
  function adicionarAoCarrinho(id) {
    let prod = produtos.find(p => p.id === id);
    if (prod.estoque <= 0) {
      alert("Produto esgotado no estoque!");
      return;
    }
  
    let itemCarrinho = carrinho.find(item => item.id === id);
    if (itemCarrinho) {
      itemCarrinho.qtd++;
    } else {
      carrinho.push({ id: prod.id, nome: prod.nome, preco: prod.preco, qtd: 1 });
    }
  
    prod.estoque--;
    renderizarTudo();
  }
  
  function removerDoCarrinho(id) {
    let idx = carrinho.findIndex(i => i.id === id);
    if (idx > -1) {
      let prod = produtos.find(p => p.id === id);
      prod.estoque += carrinho[idx].qtd;
      carrinho.splice(idx, 1);
    }
    renderizarTudo();
  }
  
  function limparCarrinho() {
    carrinho.forEach(item => {
      let prod = produtos.find(p => p.id === item.id);
      prod.estoque += item.qtd;
    });
    carrinho = [];
    renderizarTudo();
  }
  
  function renderizarCarrinho() {
    const tbody = document.getElementById('lista-carrinho');
    const txtTotal = document.getElementById('txt-total');
    tbody.innerHTML = '';
  
    if (carrinho.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Carrinho vazio</td></tr>';
      txtTotal.innerText = '0,00';
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
          <td><button onclick="removerDoCarrinho(${item.id})" style="background:none;border:none;color:red;cursor:pointer;">❌</button></td>
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
      if (diff <= 5) {
        p.preco = p.preco * 0.75;
      }
    });
    renderizarTudo();
    alert("Promoção relâmpago aplicada! Produtos próximos ao vencimento tiveram seus preços reduzidos em 25%.");
  }
  
  let tipoPagamentoAtual = '';
  function abrirCheckout(tipo) {
    if (carrinho.length === 0) {
      alert("O carrinho está vazio.");
      return;
    }
    tipoPagamentoAtual = tipo;
    let total = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  
    document.getElementById('modal-sucesso-banner').style.display = 'none';
    document.getElementById('modal-conteudo-dinamico').style.display = 'block';
    document.getElementById('btn-confirmar-pagamento').style.display = 'block';
  
    document.getElementById('modal-checkout').style.display = 'flex';
    document.getElementById('modal-titulo').innerText = `Pagamento via ${tipo}`;
  
    if (tipo === 'Pix') {
      document.getElementById('modal-subtexto').innerText = "Escaneie o QR Code integrado no terminal:";
      document.getElementById('modal-conteudo-dinamico').innerHTML = `[ ⬛ PIX DINÂMICO ⬛ ]<br>R$ ${total.toFixed(2)}`;
    } else {
      document.getElementById('modal-subtexto').innerText = "Insira ou aproxime o cartão na maquininha:";
      document.getElementById('modal-conteudo-dinamico').innerHTML = `[ 💳 AGUARDANDO CARTÃO 💳 ]<br>R$ ${total.toFixed(2)}`;
    }
  }
  
  function fecharModal() {
    document.getElementById('modal-checkout').style.display = 'none';
  }
  
  // NOVA FUNCIONALIDADE 2: Integração visual de recibo/agradecimento
  function concluirVenda() {
    let total = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    faturamentoTotalDia += total;
    carrinho = [];
    
    // Exibe a imagem de agradecimento antes de fechar
    document.getElementById('modal-titulo').innerText = "Venda Realizada com Sucesso!";
    document.getElementById('modal-subtexto').innerText = "Cupom Fiscal Eletrônico (NFC-e) gerado com sucesso.";
    document.getElementById('modal-conteudo-dinamico').style.display = 'none';
    document.getElementById('modal-sucesso-banner').style.display = 'block';
    document.getElementById('btn-confirmar-pagamento').style.display = 'none';
  
    renderizarTudo();
  }
  
  function enviarOfertaWhatsApp() {
    const caixaMsgs = document.getElementById('whatsapp-preview-box');
    caixaMsgs.innerHTML += `<div class="wa-msg" style="background:#dcf8c6; align-self:flex-end;">📢 Oferta enviada para lista de transmissão do bairro!</div>`;
    caixaMsgs.scrollTop = caixaMsgs.scrollHeight;
  }
  
  // Inicializa a aplicação
  renderizarTudo();