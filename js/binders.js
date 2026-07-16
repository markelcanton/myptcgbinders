let jsonFile = '';
let gridType = '2x2'; 

let allPagesData = []; 
let currentView = 0;   

async function loadAllBinders() {
    try {
        const response = await fetch(jsonFile);
        if (!response.ok) throw new Error(`No se pudo cargar ${jsonFile}`);
        
        const data = await response.json();
        allPagesData = data.pages.sort((a, b) => a.number - b.number);

        initNavigation();
        renderCurrentView();
    } catch (error) {
        console.error("Error cargando el archivo de álbum:", error);
        const bookContainer = document.getElementById('binder-book');
        if (bookContainer) bookContainer.innerHTML = '<div style="color:white; padding:20px;">Este álbum aún no tiene datos configurados.</div>';
        const select = document.getElementById('page-select');
        if (select) select.innerHTML = '';
    }
}

function isMobile() {
    return window.innerWidth <= 600;
}

function initNavigation() {
    const input = document.getElementById('page-input');
    const totalLabel = document.getElementById('total-pages-label');
    if (!input) return;

    const totalPages = allPagesData.length;
    totalLabel.textContent = `/ ${totalPages}`;
    input.max = totalPages;
    input.value = 1;
}

function goToPage(inputVal) {
    let target = inputVal.toString().replace('Portada', '1').split('-')[0].trim();
    let targetPage = parseInt(target);

    if (isNaN(targetPage)) targetPage = 1;

    const totalPages = allPagesData.length;
    if (targetPage > totalPages) targetPage = totalPages;
    if (targetPage < 1) targetPage = 1;

    if (isMobile()) {
        currentView = targetPage - 1;
    } else {
        if (targetPage === 1) {
            currentView = 0;
        } else {
            currentView = Math.floor((targetPage - 2) / 2) + 1;
        }
    }
    
    document.getElementById('page-input').value = getPageLabelForView(currentView);
    renderCurrentView();
}

function getPageLabelForView(view) {
    if (isMobile()) {
        return (view + 1).toString();
    }
    
    if (view === 0) return "1";

    const p1 = (view * 2);
    const p2 = (view * 2) + 1;
    
    return p2 > allPagesData.length ? `${p1}` : `${p1}-${p2}`;
}

function renderCurrentView() {
    const bookContainer = document.getElementById('binder-book');
    if (!bookContainer) return;
    bookContainer.innerHTML = ''; 

    if (isMobile()) {
        const pageNum = currentView + 1;
        const mobileSide = document.createElement('div');
        mobileSide.className = 'page-side right-side';
        
        const existePagina = allPagesData.some(p => p.number === pageNum);
        if (existePagina) {
            buildPageHTML(mobileSide, pageNum);
        } else {
            mobileSide.classList.add('cover-page');
            mobileSide.innerHTML = '<div class="cover-title"></div>';
        }
        bookContainer.appendChild(mobileSide);
    } else {
        if (currentView === 0) {
            const coverSide = document.createElement('div');
            coverSide.className = 'page-side left-side cover-page';
            coverSide.innerHTML = '<div class="cover-title"></div>';
            bookContainer.appendChild(coverSide);

            const rightSide = document.createElement('div');
            rightSide.className = 'page-side right-side';
            buildPageHTML(rightSide, 1);
            bookContainer.appendChild(rightSide);
        } else {
            const leftPageNum = currentView * 2;
            const rightPageNum = (currentView * 2) + 1;

            const leftSide = document.createElement('div');
            leftSide.className = 'page-side left-side';
            buildPageHTML(leftSide, leftPageNum);
            bookContainer.appendChild(leftSide);

            const rightSide = document.createElement('div');
            rightSide.className = 'page-side right-side';
            
            const existePaginaDerecha = allPagesData.some(p => p.number === rightPageNum);
            
            if (existePaginaDerecha) {
                buildPageHTML(rightSide, rightPageNum);
            } else {
                rightSide.classList.add('cover-page'); 
                rightSide.innerHTML = '<div class="cover-title"></div>';
            }
            bookContainer.appendChild(rightSide);
        }
    }

    const select = document.getElementById('page-select');
    if (select) select.value = currentView;
}

function buildPageHTML(sideContainer, pageNumber) {
    sideContainer.innerHTML = `<div class="page-number-indicator">Pág. ${pageNumber}</div>`;

    const gridDiv = document.createElement('div');
    const jsonDataPage = allPagesData.find(p => p.number === pageNumber);
    
    const esPaginaJumbo = jsonDataPage && jsonDataPage.jumbo === true;

    if (esPaginaJumbo) {
        gridDiv.className = 'cards-grid-jumbo';
    } else {
        gridDiv.className = `cards-grid-${gridType}`;
    }
    
    const cardsMap = {};
    if (jsonDataPage && jsonDataPage.cards) {
        jsonDataPage.cards.forEach(card => {
            cardsMap[card.slot.toString()] = card;
        });
    }

    const totalSlots = esPaginaJumbo ? 1 : (gridType === '3x3' ? 9 : 4);

    for (let slot = 1; slot <= totalSlots; slot++) {
        const cardItem = document.createElement('div');
        cardItem.className = 'card-item';
        if (esPaginaJumbo) cardItem.classList.add('jumbo-item');

        const cardData = cardsMap[slot.toString()];
        if (cardData) {
            const imgSrc = cardData.image ? cardData.image.trim() : '';
            if (imgSrc) {
                cardItem.innerHTML = `<img src="${imgSrc}" alt="Pokémon Card" onerror="this.onerror=null; this.src='https://tcg.pokemon.com/assets/img/global/tcg-card-back.jpg';">`;
            } else {
                cardItem.innerHTML = `<div class="empty-slot"></div>`;
            }
            cardItem.addEventListener('click', () => showDetails(cardData, pageNumber));
        } else {
            cardItem.classList.add('slot-vacio');
            cardItem.innerHTML = `<div class="empty-slot"></div>`;
        }
        gridDiv.appendChild(cardItem);
    }
    
    sideContainer.appendChild(gridDiv);
}

function showDetails(card, pageNum) {
    const modal = document.getElementById('card-modal');
    const modalBody = document.getElementById('modal-body');

    const tieneEnlace = card["cardmarket-link"] && card["cardmarket-link"].trim() !== "";
    const botonCardmarket = tieneEnlace 
        ? `<a href="${card["cardmarket-link"].trim()}" target="_blank" class="cm-link-btn" style="display: inline-block; margin-top: 15px; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center;">Ver en Cardmarket</a>`
        : '';

    modalBody.innerHTML = `
        <div class="modal-img">
            <img src="${card.image || ''}" style="width:100%; border-radius:8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);" onerror="this.src='https://tcg.pokemon.com/assets/img/global/tcg-card-back.jpg'">
        </div>
        <div class="modal-info">
            <h2 style="margin-top:0; color:white;">${card.name || 'Sin nombre'}</h2>
            <div class="info-grid">
                <p><strong>Expansión:</strong> ${card.expansion || '--'} (${card.code || '--'})</p>\
                <p><strong>Regulación:</strong> ${card.format || '--'}</p>\
                <p><strong>Fecha obtención:</strong> ${card.date || '--'}</p>\
                <p><strong>Estado:</strong> ${card.condition || '--'}</p>\
                <p><strong>Precio (CM):</strong> <span class="price-tag">${card.price || '--'}</span></p>\
                <p><strong>Tipo de carta:</strong> ${card.type || '--'}</p>\
                <p><strong>Idioma:</strong> ${card.language || '--'}</p>\
            </div>
            ${botonCardmarket}
        </div>
    `;
    modal.style.display = 'flex';
}

document.addEventListener("DOMContentLoaded", () => {
    const albumSelect = document.getElementById('album-select');
    
    function handleAlbumChange() {
        if (albumSelect) {
            jsonFile = albumSelect.value;
            gridType = albumSelect.options[albumSelect.selectedIndex].getAttribute('data-grid') || '2x2';
            currentView = 0;
            loadAllBinders();
        }
    }

    if (albumSelect) {
        albumSelect.addEventListener('change', handleAlbumChange);
    }

    handleAlbumChange();

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('card-modal').style.display = 'none';
        });
    }

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('card-modal');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    const pageInput = document.getElementById('page-input');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    prevBtn.addEventListener('click', () => {
        let currentPage = parseInt(pageInput.value);
        let step = isMobile() ? 1 : 2;
        goToPage(currentPage - step); 
    });

    nextBtn.addEventListener('click', () => {
        let currentPage = parseInt(pageInput.value);
        let step = isMobile() ? 1 : 2;
        goToPage(currentPage + step);
    });

    pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            goToPage(e.target.value);
        }
    });

    pageInput.addEventListener('blur', (e) => {
        e.target.value = getPageLabelForView(currentView);
    });

    loadAllBinders();

    window.addEventListener('resize', () => {
        goToPage(parseInt(pageInput.value));
    });
});
