// Lógica do Chatbot Integrado
const btnChat = document.getElementById('btn-chat');
const inputChat = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

function responder(texto) {
    const msg = texto.toLowerCase();
    let resposta = "Hum, não entendi. Tente perguntar sobre 'HTTP', 'Segurança', 'HTML', 'CSS' ou 'GET'!";

    if(msg.includes("http")) resposta = "O HTTP é como o carteiro da web: ele leva e traz mensagens!";
    if(msg.includes("html")) resposta = "O HTML é o esqueleto do site. Sem ele, nada existe!";
    if(msg.includes("css")) resposta = "O CSS é a maquiagem e a roupa do site. Ele deixa tudo bonito.";
    if(msg.includes("get")) resposta = "É um método fundamental do protocolo HTTP usado para solicitar e recuperar dados de um servidor, como páginas web, imagens ou respostas de APIs, sem alterar o estado do recurso.";
    if(msg.includes("post")) resposta = "É utilizado para enviar dados a um servidor, geralmente criando um novo recurso ou processando informações, como formulários HTML.";
    if(msg.includes("put")) resposta = "É um método de requisição utilizado para criar um novo recurso ou substituir completamente a representação de um recurso existente em uma URL específica.";
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

if (btnChat && inputChat && chatMessages) {
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
}