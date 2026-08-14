function showDetails(card, pageNum) {
    const modal = document.getElementById('card-modal');
    const modalBody = document.getElementById('modal-body');

    let infoHtml = `<p><strong>Expansión:</strong> ${card.expansion || '--'} (${card.code || '--'})</p>`;
    if (card.format && card.format.trim() !== "") infoHtml += `<p><strong>Regulación:</strong> ${card.format}</p>`;
    if (card.date && card.date.trim() !== "") infoHtml += `<p><strong>Fecha de obtención:</strong> ${card.date}</p>`;

    const hasLink = card['cardmarket-link'] && card['cardmarket-link'].trim() !== '';
    const cmButtonHtml = hasLink 
        ? `<a href="${card['cardmarket-link'].trim()}" target="_blank" class="cardmarket-btn">Ver en Cardmarket</a>` 
        : '';

    modalBody.innerHTML = `
        <div class="modal-img">
            <img src="${card.image || ''}" style="width:100%; border-radius:8px; box-shadow: 0 4px 15px rgba(0,0,0,0.6);" onerror="this.src='https://tcg.pokemon.com/assets/img/global/tcg-card-back.jpg'">
        </div>
        <div class="modal-info wishlist-specs">
            <h2 style="margin-top:0; color:white; margin-bottom: 15px;">${card.name || 'Sin nombre'}</h2>
            
            <div class="info-grid" style="margin-bottom: 20px;">
                ${infoHtml}
            </div>
            
            <div class="specs-details">
                <h3>Especificaciones buscadas:</h3>
                <ul>
                    <li><strong>Estado:</strong> ${card.condition || '--'}</li>
                    <li><strong>Idiomas:</strong> ${card.language || '--'}</li>
                    <li><strong>Precios:</strong> <span class="price-tag">${card.price || '--'}</span></li>
                </ul>
            </div>
            
            ${cmButtonHtml}
        </div>
    `;
    
    modal.style.display = 'flex';
}