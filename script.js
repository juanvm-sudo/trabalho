// Navegação entre passos
const botoes = document.querySelectorAll('.btn-proximo');
const passos = document.querySelectorAll('.passo');

botoes.forEach(btn => {
    btn.addEventListener('click', () => {
        const proximoId = btn.getAttribute('data-proximo');
        passos.forEach(p => p.classList.remove('ativo'));
        document.getElementById(`passo-${proximoId}`).classList.add('ativo');
    });
});

// Lógica do Chatbot
const btnChat = document.getElementById('btn-chat');
const inputChat = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

function responder(texto) {
    const msg = texto.toLowerCase();
    let resposta = "Hum, não entendi. Tente perguntar sobre 'HTTP', 'Segurança' ou 'Frontend'!";

    if(msg.includes("http")) resposta = "O HTTP é como o carteiro da web: ele leva e traz mensagens!";
    if(msg.includes("html")) resposta = "O HTML é o esqueleto do site. Sem ele, nada existe!";
    if(msg.includes("css")) resposta = "O CSS é a maquiagem e a roupa do site. Ele deixa tudo bonito.";
    if(msg.includes("segurança") || msg.includes("https")) resposta = "O HTTPS protege seus dados com criptografia. É o cadeado verde no navegador!";

    adicionarMensagem(resposta, 'bot-msg');
}

function adicionarMensagem(texto, classe) {
    const div = document.createElement('div');
    div.className = classe;
    div.innerText = texto;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

btnChat.addEventListener('click', () => {
    if(inputChat.value.trim() !== "") {
        adicionarMensagem(inputChat.value, 'user-msg');
        const pergunta = inputChat.value;
        inputChat.value = "";
        setTimeout(() => responder(pergunta), 600);
    }
});

// Enviar com a tecla Enter
inputChat.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') btnChat.click();
});