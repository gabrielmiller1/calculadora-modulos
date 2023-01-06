const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    // searchBtn = body.querySelector(".search-box"),
    // modeSwitch = body.querySelector(".toggle-switch"),
    // modeText = body.querySelector(".mode-text"),
    brandCards = body.querySelectorAll(".brand__card"),
    navLinks = body.querySelectorAll(".nav-link");

const { ipcRenderer } = require('electron');

toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
})

// searchBtn.addEventListener("click", () => {
//     sidebar.classList.remove("close");
// })

// modeSwitch.addEventListener("click", () => {
//     if (body.classList.contains("dark")) {
//         modeText.innerText = "Dark";
//     } else {
//         modeText.innerText = "Light";
//     }
//     body.classList.toggle("dark");
// });

// Controla conteudo tela
// Efeito collapsed na lista de montadoras.
brandCards.forEach(card => {
    card.addEventListener('click', () => {
        const cardBody = card.querySelector('.card__body');
        const arrow = card.querySelector('.card__header i');

        cardBody.classList.toggle('collapsed');

        if (arrow.classList.contains('bx-chevron-right')) {
            arrow.classList.remove('bx-chevron-right');
            arrow.classList.add('bx-chevron-down');
        } else {
            arrow.classList.remove('bx-chevron-down');
            arrow.classList.add('bx-chevron-right');
        }
    });
});

// Controla item do sidebar ativo.
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remover a classe 'active' de todos os navLinks
        navLinks.forEach(otherLink => {
            const internalLink = otherLink.querySelector('a');
            internalLink.classList.remove('active');
        });
        // Adicionar a classe 'active' ao navLink clicado
        const internalLink = link.querySelector('a');
        internalLink.classList.add('active');

        // Verificar se o navLink possui o atributo data-category
        if (internalLink.hasAttribute('data-category')) {
            // Obter o valor do atributo data-category
            const category = internalLink.getAttribute('data-category');
            // Selecionar a div content correspondente
            const content = document.querySelector(`div.content.${category}`);

            const sectionName = document.querySelector('.home .text');

            // Mudar title da pagina selecionada.
            switch (category) {
                case 'init':
                    sectionName.innerHTML = 'Home';
                    break;
                case 'body-computer':
                    sectionName.innerHTML = 'Body';
                    break;
                case 'ecu':
                    sectionName.innerHTML = 'ECU';
                    break;
                case 'imobilizador':
                    sectionName.innerHTML = 'Imobilizador';
                    break;
                default:
                    break;
            }

            // Remover a classe hidden de todas as divs content
            const contentDivs = document.querySelectorAll('div.content');
            contentDivs.forEach(div => div.classList.add('hidden'));

            // Remover a classe hidden da div content selecionada
            content.classList.remove('hidden');
        }
    });
});

// Fechar aplicação.
document.querySelector('.bottom-content li a').addEventListener('click', () => {
    ipcRenderer.send('close-app');
})