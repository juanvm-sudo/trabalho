document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DO FILTRO DO CARDÁPIO ---
    const filterButtons = document.querySelectorAll(".filter-btn");
    const menuItems = document.querySelectorAll(".menu-item");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Remove classe ativa de todos e adiciona no clicado
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");

            menuItems.forEach(item => {
                const category = item.getAttribute("data-category");
                
                if (filterValue === "todos" || filterValue === category) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });

    // --- VALIDAÇÃO DO FORMULÁRIO ---
    const form = document.getElementById("contactForm");

    form.addEventListener("submit", (event) => {
        event.preventDefault(); // Evita que a página recarregue

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;

        // Exibe uma mensagem de sucesso simples
        alert(`Obrigado pelo contato, ${name}! Responderemos em breve no e-mail: ${email}`);
        
        form.reset(); // Limpa os campos do formulário
    });
});