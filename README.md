# Mercadinho Express

Frente de caixa (PDV) feita em HTML, CSS e JavaScript puros. Os dados ficam no `localStorage` do navegador.

## Como rodar

A câmera do navegador **só funciona em `http://localhost` ou `https://`** (não funciona abrindo o `index.html` com duplo clique).
Escolha uma das opções dentro da pasta do projeto:

- **VS Code:** extensão *Live Server* → botão direito no `index.html` → *Open with Live Server*
- **Python:** `python -m http.server 8000` e abra `http://localhost:8000`
- **Node:** `npx serve`

Na primeira vez, o navegador pede permissão para usar a câmera. Clique em *Permitir*.

## Usuários de teste

| Usuário  | Senha |
|----------|-------|
| gustavo  | 6650  |
| eduardo  | 1570  |
| juan     | 1984  |

O login usa **nome de usuário** (não diferencia maiúsculas de minúsculas). Novos usuários são criados na tela *Usuários*.
Quem já tinha usuários salvos com CPF não perde nada: o nome de usuário é gerado a partir do nome (ex.: "João Pedro" vira `joao.pedro`).

## Telas (barra de navegação)

Caixa · Estoque · Novo Produto · Usuários · Relatórios · WhatsApp · Aparência · Jogo 2D

O botão ☀️/🌙 no topo alterna entre modo claro e escuro em qualquer tela (a escolha fica salva).

## Scanner de código de barras

1. Na tela **Caixa**, clique em *Ativar câmera* e aponte o código de barras para o retângulo.
2. Ao ler, o produto entra no carrinho com um bipe. O mesmo código só é lido de novo depois de sair da frente da câmera.
3. O código lido precisa estar **cadastrado** no sistema. Se não estiver, aparece o aviso *Cadastrar*, que leva para a tela *Novo Produto* já com o código preenchido.
4. Na tela **Novo Produto**, o botão *Ler com a câmera* preenche o campo do código automaticamente.

Formatos lidos: EAN-13, EAN-8, UPC-A, UPC-E, Code 128 e Code 39.

Os produtos gerados automaticamente têm códigos curtos (1001, 1002...). Para a demonstração com produtos reais, cadastre cada produto usando o código de barras impresso na embalagem.

### Funcionar sem internet (feira de ciências)

O leitor usa o `BarcodeDetector` do navegador quando ele existe (Chrome/Edge no Android e no Mac). Nos demais casos usa a biblioteca ZXing, carregada pela internet. Para não depender de internet:

1. Baixe https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js e salve como `zxing.min.js` na pasta do projeto.
2. No `index.html`, troque o endereço do `<script>` do ZXing por `zxing.min.js`.
